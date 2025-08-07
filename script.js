function verificarHorarioFuncionamento() {
    const statusLoja = document.getElementById('status-loja');
    const agora = new Date();
    const diaDaSemana = agora.getDay();
    const horaAtual = agora.getHours() + agora.getMinutes() / 60;

    const horarios = {
        domingo: [{ abre: 9, fecha: 13 }],
        segunda: [{ abre: 8, fecha: 13 }, { abre: 14.5, fecha: 19 }],
        terca: [{ abre: 8, fecha: 13 }, { abre: 14.5, fecha: 19 }],
        quarta: [{ abre: 8, fecha: 13 }, { abre: 14.5, fecha: 19 }],
        quinta: [{ abre: 8, fecha: 13 }, { abre: 14.5, fecha: 19 }],
        sexta: [{ abre: 8, fecha: 13 }, { abre: 14.5, fecha: 19 }],
        sabado: [{ abre: 8, fecha: 13 }, { abre: 14.5, fecha: 19 }],
    };

    let estaAberto = false;
    const diasDaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaAtual = diasDaSemana[diaDaSemana];
    const horarioDoDia = horarios[diaAtual];

    if (horarioDoDia) {
        for (const intervalo of horarioDoDia) {
            if (horaAtual >= intervalo.abre && horaAtual < intervalo.fecha) {
                estaAberto = true;
                break;
            }
        }
    }

    if (estaAberto) {
        statusLoja.textContent = 'Aberto agora!';
        statusLoja.classList.add('aberto');
        statusLoja.classList.remove('fechado');
    } else {
        let proximaAbertura = 'Fechado hoje.';
        const diaHoje = horarios[diasDaSemana[diaDaSemana]];

        if (diaHoje) {
             const proximoIntervalo = diaHoje.find(intervalo => horaAtual < intervalo.abre);
             if (proximoIntervalo) {
                 const hora = Math.floor(proximoIntervalo.abre);
                 const minutos = (proximoIntervalo.abre - hora) * 60;
                 const minutosFormatados = minutos > 0 ? `h${minutos}min` : `h`;
                 proximaAbertura = `Fechado. Abre às ${hora}${minutosFormatados}.`;
             }
        }
        
        statusLoja.textContent = proximaAbertura;
        statusLoja.classList.add('fechado');
        statusLoja.classList.remove('aberto');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const imagensFundo = [
        'img/Background1.webp',
        'img/Background2.webp',
        'img/Background3.webp',
        'img/Background4.webp',
        'img/Background5.webp',
    ];

    let imagensCarregadas = 0;
    const totalImagens = imagensFundo.length;

    imagensFundo.forEach(url => {
        const img = new Image();
        img.onload = () => {
            imagensCarregadas++;
            if (imagensCarregadas === totalImagens) {
                header.classList.add('animacao-pronta');
            }
        };
        img.src = url;
    });

    verificarHorarioFuncionamento();
});

function animarAoScroll() {
    const elementos = document.querySelectorAll('.animar-scroll');
    const alturaTela = window.innerHeight * 0.85;

    elementos.forEach(el => {
        const topoElemento = el.getBoundingClientRect().top;
        if (topoElemento < alturaTela) {
            el.classList.add('ativo');
        }
    });
}

window.addEventListener('scroll', animarAoScroll);
window.addEventListener('load', animarAoScroll);

const toggle = document.getElementById('modoEscuroToggle');
const body = document.body;

if (localStorage.getItem('modoEscuro') === 'ativado') {
    body.classList.add('tema-escuro');
    toggle.checked = true;
}

toggle.addEventListener('change', () => {
    body.classList.toggle('tema-escuro');
    
    if (body.classList.contains('tema-escuro')) {
        localStorage.setItem('modoEscuro', 'ativado');
    } else {
        localStorage.setItem('modoEscuro', 'desativado');
    }
});

const faq = {
  "horario": [
    "qual o horario de funcionamento", "horario de funcionamento", "funcionamento", "horario", "abrem que horas", "horario de atendimento", "estao abertos agora", "que horas abre"
  ],
  "entrega": [
    "voces fazem entrega", "tem entrega", "entrega em casa", "delivery", "entrega", "fazem delivery", "entregam na regiao"
  ],
  "pagamento": [
    "formas de pagamento", "como posso pagar", "aceitam cartao", "aceitam pix", "pagamento", "quais as formas de pagamento"
  ],
  "localizacao": [
    "onde estao localizados", "endereco", "onde fica a loja", "localizacao", "estao em qual bairro"
  ],
  "estacionamento": [
    "tem estacionamento", "estacionamento", "estacionamento para clientes", "onde posso estacionar"
  ]
};

const respostas = {
  "horario": "Nosso horário de funcionamento é das 8h às 18h, de segunda a sábado.",
  "entrega": "Sim, fazemos entregas na região! Entre em contato pelo WhatsApp para saber mais.",
  "pagamento": "Aceitamos dinheiro, cartão de crédito/débito e Pix.",
  "localizacao": "Estamos localizados no bairro Cominese, em Paranaguá!",
  "estacionamento": "Sim, temos estacionamento gratuito para clientes."
};

const messages = document.getElementById('chat-messages');
const input = document.getElementById('user-input');
const button = document.getElementById('send-btn');

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

async function getAiResponse(userMessage) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
        return "A integração com a IA parece estar desativada. Configure a chave de API.";
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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Erro ao chamar a API do Gemini:", error);
        return "Ops! Tive um problema para me conectar à minha inteligência. Tente novamente.";
    }
}

async function botResponse(userText) {
  const cleanedUserText = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
  let localResponse = null;

  for (const key in faq) {
    for (const synonym of faq[key]) {
      if (cleanedUserText.includes(synonym)) {
        localResponse = respostas[key];
        break;
      }
    }
    if (localResponse) break;
  }

  let finalResponse;
  
  if (localResponse) {
      finalResponse = localResponse;
  } else {
      addMessage("Pensando...", "bot-thinking");
      finalResponse = await getAiResponse(cleanedUserText);
      const thinkingMsg = messages.querySelector('.bot-thinking');
      if(thinkingMsg) messages.removeChild(thinkingMsg);
  }

  setTimeout(() => addMessage(finalResponse, 'bot'), 200);
}

button.addEventListener('click', async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  await botResponse(text);
  input.value = '';
});

input.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    await button.click();
  }
});

const toggleBtn = document.getElementById('chat-toggle');
const chatbotDiv = document.getElementById('chatbot');
let isOpen = false;

toggleBtn.addEventListener('click', () => {
  isOpen = !isOpen;
  chatbotDiv.style.display = isOpen ? 'flex' : 'none';
  toggleBtn.textContent = isOpen ? '❌' : '💬';
});