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

imagensFundo.forEach(url => {
    new Image().src = url;
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
