let nivelTrafego = 2;
let tempoVerdeIA = 5; // Tempo dinâmico que mudará a cada ciclo no modelo inteligente

// ESTADOS PARALELOS DA SIMULAÇÃO (Tradicional vs Inteligente)
let simFixo = { filaP: 0, filaS: 0, sinalP: 'vermelho', elFilaP: 'fila-p-fixa', elFilaS: 'fila-s-fixa', elStatus: 'status-fixa', semP: 'semaforo-p-fixa', semS: 'semaforo-s-fixa', arenaId: 'arena-fixa' };
let simIA = { filaP: 0, filaS: 0, sinalP: 'vermelho', elFilaP: 'fila-p-ia', elFilaS: 'fila-s-ia', elStatus: 'status-ia', semP: 'semaforo-p-ia', semS: 'semaforo-s-ia', arenaId: 'arena-inteligente' };

const sliderTrafego = document.getElementById('slider-trafego');
const txtTrafego = document.getElementById('val-trafego');
const txtTempoVerde = document.getElementById('val-tempo-verde');

sliderTrafego.addEventListener('input', (e) => {
    nivelTrafego = parseInt(e.target.value);
    const textos = ["Baixo", "Médio", "Alto (Pico!)"];
    txtTrafego.innerText = textos[nivelTrafego - 1];
    configurarGeradoresParalelos();
});

// --- MUNDO 1: SEMÁFORO TRADICIONAL (ALTERADO PARA 12 SEGUNDOS FIXOS) ---
function cicloSemaforoTradicional() {
    simFixo.sinalP = (simFixo.sinalP === 'verde') ? 'vermelho' : 'verde';
    
    let semP = document.getElementById(simFixo.semP);
    let semS = document.getElementById(simFixo.semS);
    
    if (simFixo.sinalP === 'verde') {
        semP.className = "semaforo verde semaforo-p";
        semS.className = "semaforo vermelho semaforo-s";
        setTimeout(cicloSemaforoTradicional, 12000); // MODIFICADO: Agora fica rigorosamente 12 segundos verde
    } else {
        semP.className = "semaforo vermelho semaforo-p";
        semS.className = "semaforo verde semaforo-s";
        setTimeout(cicloSemaforoTradicional, 4000);  // Mantém 4 segundos na via secundária
    }
}
cicloSemaforoTradicional();


// --- MUNDO 2: SEMÁFORO INTELIGENTE (ADAPTATIVO) ---
function cicloSemaforoInteligente() {
    simIA.sinalP = (simIA.sinalP === 'verde') ? 'vermelho' : 'verde';
    
    let semP = document.getElementById(simIA.semP);
    let semS = document.getElementById(simIA.semS);
    
    let tempoAlocado = 4; // Mínimo de segurança

    if (simIA.sinalP === 'verde') {
        if (simIA.filaP > simIA.filaS && simIA.filaP > 4) {
            let diferenca = simIA.filaP - simIA.filaS;
            tempoAlocado = Math.min(4 + diferenca, 16); // Teto estendido para aguentar as novas ondas de carros
        }
        txtTempoVerde.innerText = tempoAlocado + "s (Foco: Agamenon)";
        semP.className = "semaforo verde semaforo-p";
        semS.className = "semaforo vermelho semaforo-s";
        setTimeout(cicloSemaforoInteligente, tempoAlocado * 1000);
    } else {
        if (simIA.filaS > simIA.filaP && simIA.filaS > 4) {
            let diferenca = simIA.filaS - simIA.filaP;
            tempoAlocado = Math.min(4 + diferenca, 14);
        }
        txtTempoVerde.innerText = tempoAlocado + "s (Foco: Rui Barbosa)";
        semP.className = "semaforo vermelho semaforo-p";
        semS.className = "semaforo verde semaforo-s";
        setTimeout(cicloSemaforoInteligente, tempoAlocado * 1000);
    }
}
cicloSemaforoInteligente();


// --- GERADOR DE TRÁFEGO CONTÍNUO ---
let loopGerador;

function instanciarCarroFisico(direcao, configuracaoSimulacao) {
    const arenaTarget = document.getElementById(configuracaoSimulacao.arenaId);
    const carro = document.createElement('div');
    carro.className = direcao === 'horizontal' ? 'carro carro-horizontal' : 'carro carro-vertical';
    
    const cores = ['#ff6b6b', '#4fa7ff', '#e5c07b', '#98c379', '#c678dd'];
    carro.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
    arenaTarget.appendChild(carro);

    let loopDeFrenagem = setInterval(() => {
        if (!carro.parentElement) { clearInterval(loopDeFrenagem); return; }
        
        if (direcao === 'horizontal') {
            let leftPos = carro.offsetLeft;
            if (configuracaoSimulacao.sinalP === 'vermelho' && leftPos >= 160 && leftPos < 175) {
                carro.style.animationPlayState = 'paused';
            } else {
                carro.style.animationPlayState = 'running';
            }
        } else {
            let topPos = carro.offsetTop;
            if (configuracaoSimulacao.sinalP === 'verde' && topPos >= 40 && topPos < 55) {
                carro.style.animationPlayState = 'paused';
            } else {
                carro.style.animationPlayState = 'running';
            }
        }
    }, 40);

    setTimeout(() => { carro.remove(); clearInterval(loopDeFrenagem); }, 2500);
}

function configurarGeradoresParalelos() {
    clearInterval(loopGerador);
    let taxa = nivelTrafego === 1 ? 1800 : nivelTrafego === 2 ? 800 : 400;

    loopGerador = setInterval(() => {
        let chanceP = Math.random() > 0.3;
        let chanceS = Math.random() > 0.4;

        if (chanceP) {
            simFixo.filaP++; instanciarCarroFisico('horizontal', simFixo);
            simIA.filaP++;    instanciarCarroFisico('horizontal', simIA);
        }
        if (chanceS) {
            simFixo.filaS++; instanciarCarroFisico('vertical', simFixo);
            simIA.filaS++;    instanciarCarroFisico('vertical', simIA);
        }
        atualizarContadoresGerais();
    }, taxa);
}
configurarGeradoresParalelos();


// --- NOVO EVENTO: ONDA DE PICO REPENTINA A CADA 15 SEGUNDOS ---
setInterval(() => {
    // Escolhe aleatoriamente qual avenida vai receber a onda (0 = Agamenon, 1 = Rui Barbosa)
    const avenidaSorteada = Math.floor(Math.random() * 2);
    
    // Quantidade de carros que vão surgir de uma vez (entre 5 e 8 carros simultâneos)
    const intensidadeOnda = Math.floor(Math.random() * 4) + 5;

    if (avenidaSorteada === 0) {
        // Onda atinge a Av. Agamenon Magalhães
        for (let i = 0; i < intensidadeOnda; i++) {
            // Pequeno atraso (delay) entre os carros da onda para não nascerem colados
            setTimeout(() => {
                simFixo.filaP++; instanciarCarroFisico('horizontal', simFixo);
                simIA.filaP++;    instanciarCarroFisico('horizontal', simIA);
                atualizarContadoresGerais();
            }, i * 150);
        }
    } else {
        // Onda atinge a Av. Rui Barbosa
        for (let i = 0; i < intensidadeOnda; i++) {
            setTimeout(() => {
                simFixo.filaS++; instanciarCarroFisico('vertical', simFixo);
                simIA.filaS++;    instanciarCarroFisico('vertical', simIA);
                atualizarContadoresGerais();
            }, i * 150);
        }
    }
}, 15000); // Loop exato de 15 segundos


// --- LOOP DE VAZÃO (ESCOAMENTO) ---
setInterval(() => {
    if (simFixo.sinalP === 'verde' && simFixo.filaP > 0) simFixo.filaP--;
    if (simFixo.sinalP === 'vermelho' && simFixo.filaS > 0) simFixo.filaS--;
    
    if (simIA.sinalP === 'verde' && simIA.filaP > 0) simIA.filaP--;
    if (simIA.sinalP === 'vermelho' && simIA.filaS > 0) simIA.filaS--;

    atualizarContadoresGerais();
}, 600);

function atualizarContadoresGerais() {
    renderizarDados(simFixo);
    renderizarDados(simIA);
}

function renderizarDados(sim) {
    document.getElementById(sim.elFilaP).innerText = sim.filaP;
    document.getElementById(sim.elFilaS).innerText = sim.filaS;
    
    let elStatus = document.getElementById(sim.elStatus);
    let total = sim.filaP + sim.filaS;
    
    if (total < 7) { elStatus.innerText = "Fluido ✅"; elStatus.className = "status-ok"; }
    else if (total < 16) { elStatus.innerText = "Lento ⚠️"; elStatus.className = "status-alerta"; }
    else { elStatus.innerText = "RETENÇÃO! 🚨"; elStatus.className = "status-caos"; }
}