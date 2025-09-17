import {kv} from '@vercel/kv';

async function callGeminiWithRetry(url, payload, maxRetries = 5) {
    let attempt = 0;
    while (attempt < maxRetries) {
        const geminiResponse = await fetch(url, payload);
        if (geminiResponse.ok) {
            return geminiResponse.json();
        }

        if (geminiResponse.status === 429 && attempt < maxRetries - 1) {
            attempt++;
            const delay = Math.pow(2, attempt) * 200 + Math.random() * 200;
            console.warn(`Rate limit da API do Gemini atingido. Tentando novamente em ${delay.toFixed(0)}ms... (Tentativa ${attempt})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else {
            const errorBody = await geminiResponse.text();
            throw new Error(`Erro na API do Gemini: Status ${geminiResponse.status}. Resposta: ${errorBody}`);
        }
    }
    throw new Error("Falha ao se comunicar com a API do Gemini após múltiplas tentativas.");
}

export default async function handler(request, response) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const { userMessage } = request.body;

    if (!userMessage) {
        return response.status(400).json({ error: 'Nenhuma mensagem do usuário foi fornecida.' });
    }
    if (!GEMINI_API_KEY) {
        return response.status(500).json({ error: 'A chave de API não está configurada no servidor.' });
    }
    
    const cacheKey = `chat:${userMessage.toLowerCase().trim()}`;

    try {
        const cachedResponse = await kv.get(cacheKey);
        if (cachedResponse) {
            console.log(`CACHE HIT para a chave: ${cacheKey}`);
            return response.status(200).json({ reply: cachedResponse, fromCache: true });
        }

        console.log(`CACHE MISS para a chave: ${cacheKey}`);
    
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const prompt = `
            Você é um assistente virtual de uma loja em Paranaguá. Seu nome é GeminiBot.
            As perguntas sobre horário, entrega, pagamento, localização e estacionamento já foram respondidas.
            Responda à seguinte pergunta do usuário de forma amigável, curta e útil.
            Não invente informações de contato ou preços. Se não souber a resposta, diga para enviar uma mensagem através do formulário de contato.
            Pergunta do usuário: "${userMessage}"
        `;

        const fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        };

        const data = await callGeminiWithRetry(API_URL, fetchOptions);

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            throw new Error('Resposta da API do Gemini em formato inesperado.');
        }

        const botText = data.candidates[0].content.parts[0].text;

        await kv.set(cacheKey, botText, { ex: 86400 });
        console.log(`Nova resposta salva no cache com TTL de 1 hora.`);
        
        return response.status(200).json({ reply: botText, fromCache: false });

    } catch (error) {
        console.error("Erro na função serverless:", error.message);
        if (error.message.includes("429")) {
             return response.status(429).json({ error: 'Serviço sobrecarregado. Tente novamente em alguns instantes.' });
        }
        return response.status(500).json({ error: 'Falha ao contatar a IA.' });
    }
}