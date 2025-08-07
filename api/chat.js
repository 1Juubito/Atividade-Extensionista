export default async function handler(request, response) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const { userMessage } = request.body;

    if (!userMessage) {
        return response.status(400).json({ error: 'Nenhuma mensagem do usuário foi fornecida.' });
    }

    if (!GEMINI_API_KEY) {
        return response.status(500).json({ error: 'A chave de API não está configurada no servidor.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
        Você é um assistente virtual de uma loja em Paranaguá. Seu nome é GeminiBot.
        As perguntas sobre horário, entrega, pagamento, localização e estacionamento já foram respondidas.
        Responda à seguinte pergunta do usuário de forma amigável, curta e útil.
        Não invente informações de contato ou preços. Se não souber a resposta, diga para enviar uma mensagem através do formulário de contato.
        Pergunta do usuário: "${userMessage}"
    `;

    try {
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!geminiResponse.ok) {
            throw new Error(`Erro na API do Gemini: ${geminiResponse.statusText}`);
        }

        const data = await geminiResponse.json();
        const botText = data.candidates[0].content.parts[0].text;
        
        response.status(200).json({ reply: botText });

    } catch (error) {
        console.error("Erro na função serverless:", error);
        response.status(500).json({ error: 'Falha ao contatar a IA.' });
    }
}