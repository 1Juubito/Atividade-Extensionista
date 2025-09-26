// api/chat.js
import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('A chave GEMINI_API_KEY não está configurada no ambiente.');
}

// Preferência de modelos (ordem)
const MODEL_PREFS = [
  'gemini-2.5-flash',      // se tiver no seu projeto, use
  'gemini-2.0-flash',      // estável e rápido
  'gemini-1.5-flash'       // legacy / fallback
];

const MODELS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models';
const GENERATE_ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1/models';

// cache em memória (evita chamada a cada request)
let inMemoryModelCache = { model: null, expiresAt: 0 };
const MODEL_CACHE_TTL_SECONDS = 60 * 30; // 30 min

async function listAvailableModels() {
  const url = `${MODELS_ENDPOINT}?key=${GEMINI_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Falha ao listar modelos: ${res.status} - ${body}`);
  }
  const data = await res.json();
  // data.models é um array com { name: 'models/gemini-2.0-flash', ... }
  const names = (data.models || [])
    .map(m => (m.name || '').replace(/^models\//, ''))
    .filter(Boolean);
  return new Set(names);
}

function selectBestModel(availableSet) {
  for (const pref of MODEL_PREFS) {
    if (availableSet.has(pref)) return pref;
  }
  // como último recurso, tente qualquer gemini-2.*-flash ou gemini-1.5-flash-like
  const any20 = [...availableSet].find(n => /^gemini-2\.[\w-]*flash/i.test(n));
  if (any20) return any20;
  const any15 = [...availableSet].find(n => /^gemini-1\.5.*flash/i.test(n));
  if (any15) return any15;

  throw new Error(`Nenhum modelo compatível encontrado. Disponíveis: ${[...availableSet].join(', ') || '(vazio)'}`);
}

async function resolveModelWithCache() {
  const now = Date.now();
  if (inMemoryModelCache.model && inMemoryModelCache.expiresAt > now) {
    return inMemoryModelCache.model;
  }

  // tenta cache no Redis
  const cached = await kv.get('gemini:model:best');
  if (cached && cached.model && cached.expiresAt && cached.expiresAt > now) {
    inMemoryModelCache = cached;
    return cached.model;
  }

  // descobre de verdade
  const available = await listAvailableModels();
  const chosen = selectBestModel(available);
  const expiresAt = now + MODEL_CACHE_TTL_SECONDS * 1000;

  inMemoryModelCache = { model: chosen, expiresAt };
  await kv.set('gemini:model:best', inMemoryModelCache, { ex: MODEL_CACHE_TTL_SECONDS });

  return chosen;
}

async function callGeminiWithRetry(url, payload, maxRetries = 5) {
  let attempt = 0;
  while (attempt < maxRetries) {
    const res = await fetch(url, payload);
    if (res.ok) return res.json();

    // 404: modelo pode ter sido aposentado → deixe o caller lidar com isso
    if (res.status === 404) {
      const body = await res.text();
      const err = new Error(`404_NOT_FOUND: ${body}`);
      err.status = 404;
      throw err;
    }

    if (res.status === 429 && attempt < maxRetries - 1) {
      attempt++;
      const delay = Math.pow(2, attempt) * 200 + Math.random() * 200;
      console.warn(`Rate limit da API do Gemini. Retentando em ${delay.toFixed(0)}ms... (Tentativa ${attempt})`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }

    const errorBody = await res.text();
    throw new Error(`Erro na API do Gemini: Status ${res.status}. Resposta: ${errorBody}`);
  }
  throw new Error('Falha ao se comunicar com a API do Gemini após múltiplas tentativas.');
}

export default async function handler(request, response) {
  try {
    const { userMessage } = request.body || {};
    if (!userMessage) {
      return response.status(400).json({ error: 'Nenhuma mensagem do usuário foi fornecida.' });
    }

    const cacheKey = `chat:${userMessage.toLowerCase().trim()}`;
    const cachedResponse = await kv.get(cacheKey);
    if (cachedResponse) {
      console.log(`CACHE HIT para a chave: ${cacheKey}`);
      return response.status(200).json({ reply: cachedResponse, fromCache: true });
    }

    console.log(`CACHE MISS para a chave: ${cacheKey}`);

    // 1) Resolve modelo com cache
    let model = await resolveModelWithCache();

    const prompt = `
Você é um assistente virtual de uma loja em Paranaguá. Seu nome é GeminiBot.
As perguntas sobre horário, entrega, pagamento, localização e estacionamento já foram respondidas.
Responda à seguinte pergunta do usuário de forma amigável, curta e útil.
Não invente informações de contato ou preços. Se não souber a resposta, diga para enviar uma mensagem através do formulário de contato.
Pergunta do usuário: "${userMessage}"
`.trim();

    const payload = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Estrutura da v1: generateContent com contents/parts
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    };

    let url = `${GENERATE_ENDPOINT_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;

    let data;
    try {
      data = await callGeminiWithRetry(url, payload);
    } catch (err) {
      // Se o modelo “sumiu” (404), refaça a descoberta e tente de novo com o próximo
      if (err.status === 404) {
        console.warn(`Modelo ${model} indisponível (404). Redescobrindo...`);
        // limpa caches para forçar nova resolução
        inMemoryModelCache = { model: null, expiresAt: 0 };
        await kv.del('gemini:model:best');

        model = await resolveModelWithCache();
        url = `${GENERATE_ENDPOINT_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;
        data = await callGeminiWithRetry(url, payload);
      } else {
        throw err;
      }
    }

    // Validação de retorno
    const candidates = data?.candidates;
    const botText =
      candidates?.[0]?.content?.parts?.[0]?.text ??
      candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('\n');

    if (!botText) {
      throw new Error('Resposta da API do Gemini em formato inesperado.');
    }

    await kv.set(cacheKey, botText, { ex: 86400 }); // 24h
    console.log(`Nova resposta salva no cache com TTL de 24 horas. Modelo: ${model}`);

    return response.status(200).json({ reply: botText, model, fromCache: false });

  } catch (error) {
    console.error('Erro na função serverless:', error);
    const msg = String(error?.message || '');
    if (msg.includes('429')) {
      return response.status(429).json({ error: 'Serviço sobrecarregado. Tente novamente em alguns instantes.' });
    }
    if (msg.includes('404_NOT_FOUND')) {
      return response.status(502).json({
        error: 'Modelo indisponível no momento. Tente novamente em instantes.'
      });
    }
    return response.status(500).json({ error: 'Falha ao contatar a IA.' });
  }
}
