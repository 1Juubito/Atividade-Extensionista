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
        'img/Background1.jpg',
        'img/Background2.jpg',
        'img/Background3.jpg',
        'img/Background4.jpg',
        'img/Background5.jpg',
        'img/Background6.jpg',
        'img/Background7.jpg',
        'img/Background8.jpg',
        'img/Background9.jpg',
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
    const btnVoltarAoTopo = document.getElementById('btnVoltarAoTopo');
    window.onscroll = function() {
        if (document.body.scrollTop > 3500 || document.documentElement.scrollTop > 3500) {
            btnVoltarAoTopo.style.display = "block";
        } else {
            btnVoltarAoTopo.style.display = "none";
        }
    };
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
    "qual o horario de funcionamento",
    "horario de funcionamento",
    "funcionamento",
    "horario",
    "abrem que horas",
    "horario de atendimento",
    "estao abertos agora",
    "que horas abre"
  ],
  "entrega": [
    "voces fazem entrega",
    "tem entrega",
    "entrega em casa",
    "delivery",
    "fazem delivery",
    "entregam na regiao"
  ],
  "pagamento": [
    "formas de pagamento",
    "como posso pagar",
    "aceitam cartao",
    "aceitam pix",
    "pagamento",
    "quais as formas de pagamento"
  ],
  "localizacao": [
    "onde estao localizados",
    "endereco",
    "onde fica a loja",
    "localizacao",
    "estao em qual bairro"
  ],
  "estacionamento": [
    "tem estacionamento",
    "estacionamento",
    "estacionamento para clientes",
    "onde posso estacionar"
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

function botResponse(userText) {
  const cleanedUserText = userText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  let response = "Desculpe, não entendi sua pergunta. 😕";
  for (const key in faq) {
    for (const synonym of faq[key]) {
      if (cleanedUserText.includes(synonym)) {
        response = respostas[key];
        break;
      }
    }
    if (response !== "Desculpe, não entendi sua pergunta. 😕") {
      break;
    }
  }

  setTimeout(() => addMessage(response, 'bot'), 500);
}

button.addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  botResponse(text);
  input.value = '';
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') button.click();
});

const toggleBtn = document.getElementById('chat-toggle');
const chatbotDiv = document.getElementById('chatbot');
let isOpen = false;

toggleBtn.addEventListener('click', () => {
  isOpen = !isOpen;
  chatbotDiv.style.display = isOpen ? 'block' : 'none';
  toggleBtn.textContent = isOpen ? '❌' : '💬';
});