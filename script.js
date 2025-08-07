document.addEventListener('DOMContentLoaded', () => {
    verificarHorarioFuncionamento();
    animarAoScroll();

    const header = document.querySelector('header');
    const imagensFundo = [
        'img/Background1.webp', 'img/Background2.webp', 'img/Background3.webp',
        'img/Background4.webp', 'img/Background5.webp',
    ];
    let imagensCarregadas = 0;
    imagensFundo.forEach(url => {
        const img = new Image();
        img.onload = () => {
            imagensCarregadas++;
            if (imagensCarregadas === imagensFundo.length) {
                header.classList.add('animacao-pronta');
            }
        };
        img.src = url;
    });
});

function verificarHorarioFuncionamento() {
    const statusLoja = document.getElementById('status-loja');
    if (!statusLoja) return; 
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
    localStorage.setItem('modoEscuro', body.classList.contains('tema-escuro') ? 'ativado' : 'desativado');
});


const faq = {
    "horario": ["qual o horario de funcionamento", "horario de funcionamento", "funcionamento", "horario", "abrem que horas", "horario de atendimento", "estao abertos agora", "que horas abre"],
    "entrega": ["voces fazem entrega", "tem entrega", "entrega em casa", "delivery", "entrega", "fazem delivery", "entregam na regiao"],
    "pagamento": ["formas de pagamento", "como posso pagar", "aceitam cartao", "aceitam pix", "pagamento", "quais as formas de pagamento"],
    "localizacao": ["onde estao localizados", "endereco", "onde fica a loja", "localizacao", "estao em qual bairro"],
    "estacionamento": ["tem estacionamento", "estacionamento", "estacionamento para clientes", "onde posso estacionar"]
};

const respostas = {
    "horario": "Nosso horário de funcionamento é segunda a sábado 8h às 13h, voltamos 14:30h até 19h e no domingo 9h às 13h.",
    "entrega": "Infelizmente não fazemos entrega.",
    "pagamento": "Aceitamos dinheiro, cartão de crédito/débito e Pix.",
    "localizacao": "Estamos localizados no bairro Cominese, Rua Nelson Pereira Neves, 203 em Paranaguá.",
    "estacionamento": "Infelizmente não temos estacionamento."
};

const messages = document.getElementById('chat-messages');
const input = document.getElementById('user-input');
const button = document.getElementById('send-btn');

function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.innerHTML = text.replace(/\n/g, '<br>');
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

async function getAiResponse(userMessage) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: userMessage })
        });
        if (!response.ok) throw new Error('Erro na resposta do servidor');
        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Erro ao chamar o backend:", error);
        return "Ops! Tive um problema para me conectar à minha inteligência. Tente novamente.";
    }
}

async function botResponse(userText) {
    const cleanedUserText = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    let localResponse = null;
    for (const key in faq) {
        if (localResponse) break;
        for (const synonym of faq[key]) {
            if (cleanedUserText.includes(synonym)) {
                localResponse = respostas[key];
                break;
            }
        }
    }

    let finalResponse;
    if (localResponse) {
        finalResponse = localResponse;
    } else {
        addMessage("Pensando...", "bot-thinking");
        finalResponse = await getAiResponse(cleanedUserText);
        const thinkingMsg = messages.querySelector('.bot-thinking');
        if (thinkingMsg) thinkingMsg.remove();
    }
    setTimeout(() => addMessage(finalResponse, 'bot'), 200);
}

// --- Event Listeners (Ouvintes de Ação) ---
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

window.addEventListener('pageshow', (event) => {
    const formulario = document.querySelector('.contato-form');
    if (formulario) {
        formulario.reset();
    }
});