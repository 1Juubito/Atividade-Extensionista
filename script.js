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
        statusLoja.style.backgroundColor = '#4CAF50';
    } else {
        let proximaAbertura = 'Fechado hoje.';
        const diaHoje = horarios[diasDaSemana[diaDaSemana]];

        if (diaHoje) {
             const proximoIntervalo = diaHoje.find(intervalo => horaAtual < intervalo.abre);
             if (proximoIntervalo) {
                 proximaAbertura = `Fechado. Abre às ${proximoIntervalo.abre}h.`;
             }
        }
        
        statusLoja.textContent = proximaAbertura;
        statusLoja.style.backgroundColor = '#f44336';
    }

    statusLoja.style.color = 'white';
    statusLoja.style.padding = '8px 15px';
    statusLoja.style.borderRadius = '5px';
    statusLoja.style.marginTop = '15px';
    statusLoja.style.display = 'inline-block';
    statusLoja.style.fontWeight = 'bold';
}

document.addEventListener('DOMContentLoaded', () => {
    verificarHorarioFuncionamento();
    const btnVoltarAoTopo = document.getElementById('btnVoltarAoTopo');
    window.onscroll = function() {
        if (document.body.scrollTop > 2000 || document.documentElement.scrollTop > 2000) {
            btnVoltarAoTopo.style.display = "block";
        } else {
            btnVoltarAoTopo.style.display = "none";
        }
    };
});