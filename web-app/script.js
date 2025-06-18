// Variáveis globais
let graficoVelocidade;
let animacaoId;
let posicaoCarro = 0;
let estaAnimando = false;
let dadosSimulacao = [];
let usandoKmh = false;

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    configurarEventos();
    inicializarGrafico();
});

function configurarEventos() {
    // Botões de cálculo
    document.getElementById('calc-accel').addEventListener('click', calcularAceleracao);
    document.getElementById('calc-velocity').addEventListener('click', calcularVelocidadeFinal);
    document.getElementById('calc-time').addEventListener('click', calcularTempo);
    document.getElementById('calc-displacement').addEventListener('click', calcularDeslocamento);
    document.getElementById('simulate-btn').addEventListener('click', simularMovimento);
    
    // Botões de controle
    document.getElementById('reset-btn').addEventListener('click', resetarCalculadora);
    document.getElementById('show-formula-btn').addEventListener('click', alternarFormula);
    document.getElementById('theme-toggle').addEventListener('click', alternarModoNoturno);
    document.getElementById('unit-toggle').addEventListener('change', alternarUnidades);
    
    // Controles do gráfico
    document.getElementById('zoom-in').addEventListener('click', zoomGrafico);
    document.getElementById('zoom-out').addEventListener('click', zoomGrafico);
    document.getElementById('export-chart').addEventListener('click', exportarGrafico);
    
    // Sistema de ajuda
    document.getElementById('help-icon').addEventListener('click', alternarAjuda);
    document.getElementById('close-help').addEventListener('click', alternarAjuda);
    
    // Seleção de tipo de movimento
    document.getElementById('motion-type').addEventListener('change', function() {
        const tipo = this.value;
        document.getElementById('a-input').style.display = tipo === 'mruv' ? 'block' : 'none';
        if (tipo === 'mru') document.getElementById('a').value = '0';
    });
    document.getElementById('examples-btn').addEventListener('click', mostrarExemplos);
    document.getElementById('export-pdf').addEventListener('click', exportarParaPDF);
}
const exemplosPraticos = [
    {
        titulo: "Carro acelerando",
        descricao: "Um carro parte do repouso e atinge 30 m/s em 5 segundos",
        valores: { v0: 0, v: 30, t: 5, a: '', s: '' }
    },
    {
        titulo: "Frenagem de emergência",
        descricao: "Um carro a 72 km/h (20 m/s) freia e para em 4 segundos",
        valores: { v0: 20, v: 0, t: 4, a: '', s: '' }
    },
    {
        titulo: "Lançamento vertical",
        descricao: "Objeto lançado para cima a 20 m/s (gravidade = -9.8 m/s²)",
        valores: { v0: 20, a: -9.8, t: '', v: 0, s: '' }
    }
];

function inicializarGrafico() {
    const ctx = document.getElementById('velocity-chart').getContext('2d');
    graficoVelocidade = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Velocidade (m/s)',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Velocidade (m/s)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tempo (s)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} m/s`;
                        }
                    }
                }
            }
        }
    });
}

function calcularAceleracao() {
    const v0 = parseFloat(document.getElementById('v0').value);
    const v = parseFloat(document.getElementById('v').value);
    const t = parseFloat(document.getElementById('t').value);
    
    if (isNaN(v0) || isNaN(v) || isNaN(t)) {
        mostrarErro("Preencha os campos v₀, v e t para calcular a aceleração");
        return;
    }
    
    if (t === 0) {
        mostrarErro("O tempo não pode ser zero");
        return;
    }
    
    const a = (v - v0) / t;
    document.getElementById('a').value = a.toFixed(2);
    
    mostrarResultado(`a = (v - v₀) / t = (${v} - ${v0}) / ${t} = ${a.toFixed(2)} m/s²`);
    mostrarFormula(`a = (v - v₀) / t`);
    
    atualizarTabelaSimulacao(v0, a, t);
}

function calcularVelocidadeFinal() {
    const v0 = parseFloat(document.getElementById('v0').value);
    const a = parseFloat(document.getElementById('a').value);
    const t = parseFloat(document.getElementById('t').value);
    
    if (isNaN(v0) || isNaN(a) || isNaN(t)) {
        mostrarErro("Preencha os campos v₀, a e t para calcular a velocidade final");
        return;
    }
    
    const v = v0 + a * t;
    document.getElementById('v').value = v.toFixed(2);
    
    mostrarResultado(`v = v₀ + a × t = ${v0} + ${a} × ${t} = ${v.toFixed(2)} m/s`);
    mostrarFormula(`v = v₀ + a × t`);
    
    atualizarTabelaSimulacao(v0, a, t);
}

function calcularTempo() {
    const v0 = parseFloat(document.getElementById('v0').value);
    const v = parseFloat(document.getElementById('v').value);
    const a = parseFloat(document.getElementById('a').value);
    
    if (isNaN(v0) || isNaN(v) || isNaN(a)) {
        mostrarErro("Preencha os campos v₀, v e a para calcular o tempo");
        return;
    }
    
    if (a === 0) {
        mostrarErro("A aceleração não pode ser zero");
        return;
    }
    
    const t = (v - v0) / a;
    document.getElementById('t').value = t.toFixed(2);
    
    mostrarResultado(`t = (v - v₀) / a = (${v} - ${v0}) / ${a} = ${t.toFixed(2)} s`);
    mostrarFormula(`t = (v - v₀) / a`);
    
    atualizarTabelaSimulacao(v0, a, t);
}

function calcularDeslocamento() {
    const v0 = parseFloat(document.getElementById('v0').value);
    const a = parseFloat(document.getElementById('a').value);
    const t = parseFloat(document.getElementById('t').value);
    
    if (isNaN(v0) || isNaN(a) || isNaN(t)) {
        mostrarErro("Preencha os campos v₀, a e t para calcular o deslocamento");
        return;
    }
    
    const s = v0 * t + 0.5 * a * t * t;
    document.getElementById('s').value = s.toFixed(2);
    
    mostrarResultado(`s = v₀ × t + ½ × a × t² = ${v0} × ${t} + 0.5 × ${a} × ${t}² = ${s.toFixed(2)} m`);
    mostrarFormula(`s = v₀ × t + ½ × a × t²`);
    
    atualizarTabelaSimulacao(v0, a, t);
}

function simularMovimento() {
    const v0 = parseFloat(document.getElementById('v0').value);
    const a = parseFloat(document.getElementById('a').value);
    const t = parseFloat(document.getElementById('t').value);
    
    if (isNaN(v0) || isNaN(a) || isNaN(t)) {
        mostrarErro("Preencha v₀, a e t para simular o movimento");
        return;
    }
    
    atualizarGrafico(v0, a, t);
    animarCarro(v0, a, t);
    atualizarTabelaSimulacao(v0, a, t);
}

function atualizarGrafico(v0, a, t) {
    const pontosTempo = [];
    const pontosVelocidade = [];
    const passos = 20;
    
    for (let i = 0; i <= passos; i++) {
        const tempoAtual = (i / passos) * t;
        pontosTempo.push(tempoAtual.toFixed(1));
        pontosVelocidade.push(v0 + a * tempoAtual);
    }
    
    graficoVelocidade.data.labels = pontosTempo;
    graficoVelocidade.data.datasets[0].data = pontosVelocidade;
    graficoVelocidade.update();
}

function animarCarro(v0, a, t) {
    if (estaAnimando) {
        cancelAnimationFrame(animacaoId);
        estaAnimando = false;
    }
    
    const carro = document.getElementById('car');
    const pista = document.getElementById('track');
    const indicadorPosicao = document.getElementById('position-indicator');
    const larguraPista = pista.offsetWidth - carro.offsetWidth;
    const deslocamentoTotal = v0 * t + 0.5 * a * t * t;
    
    // Resetar posição e classes
    carro.style.left = '0px';
    posicaoCarro = 0;
    carro.className = '';
    
    // Aplicar classes de estado
    if (a > 0) {
        carro.classList.add('acelerando');
    } else if (a < 0) {
        carro.classList.add('freiando');
    }
    if (v0 < 0) {
        carro.classList.add('invertido');
    }
    
    const tempoInicio = Date.now();
    const duracao = t * 1000; // Converter para milissegundos
    
    function atualizarAnimacao() {
        const tempoDecorrido = Date.now() - tempoInicio;
        const progresso = Math.min(tempoDecorrido / duracao, 1);
        
        // Calcular posição atual (MRUV)
        const deslocamento = v0 * t * progresso + 0.5 * a * t * t * progresso * progresso;
        const posicao = (deslocamento / deslocamentoTotal) * larguraPista;
        
        // Atualizar posição do carro
        carro.style.left = `${posicao}px`;
        posicaoCarro = posicao;
        
        // Atualizar indicador de posição
        indicadorPosicao.textContent = `Posição: ${deslocamento.toFixed(2)}m`;
        
        if (progresso < 1) {
            animacaoId = requestAnimationFrame(atualizarAnimacao);
        } else {
            estaAnimando = false;
        }
    }
    
    estaAnimando = true;
    atualizarAnimacao();
}

function atualizarTabelaSimulacao(v0, a, t) {
    const tabela = document.querySelector('#simulation-data tbody');
    tabela.innerHTML = '';
    
    const passos = 10;
    dadosSimulacao = [];
    
    for (let i = 0; i <= passos; i++) {
        const tempoAtual = (i / passos) * t;
        const velocidade = v0 + a * tempoAtual;
        const deslocamento = v0 * tempoAtual + 0.5 * a * tempoAtual * tempoAtual;
        
        dadosSimulacao.push({
            tempo: tempoAtual,
            velocidade: velocidade,
            deslocamento: deslocamento
        });
        
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${tempoAtual.toFixed(2)}</td>
            <td>${deslocamento.toFixed(2)}</td>
            <td>${velocidade.toFixed(2)}</td>
            <td>${a.toFixed(2)}</td>
        `;
        tabela.appendChild(linha);
    }
}

function mostrarResultado(texto) {
    const divResultado = document.getElementById('result');
    divResultado.innerHTML = texto;
    
    const divPassos = document.getElementById('calculation-steps');
    divPassos.innerHTML = `<div class="passo-calculo">${texto}</div>`;
    
    document.querySelector('.results').style.display = 'block';
}

function mostrarFormula(formula) {
    const divFormula = document.getElementById('formula');
    divFormula.innerHTML = formula;
}

function mostrarErro(mensagem) {
    const divResultado = document.getElementById('result');
    divResultado.innerHTML = `<span style="color: var(--perigo)">${mensagem}</span>`;
}

function alternarFormula() {
    const divFormula = document.getElementById('formula-display');
    divFormula.classList.toggle('oculto');
}

function alternarModoNoturno() {
    document.body.classList.toggle('modo-noturno');
    const botaoTema = document.getElementById('theme-toggle');
    botaoTema.textContent = document.body.classList.contains('modo-noturno') ? '☀️ Modo Claro' : '🌙 Modo Noturno';
    
    // Atualizar cores do gráfico
    if (graficoVelocidade) {
        graficoVelocidade.update();
    }
}

function alternarUnidades() {
    usandoKmh = this.checked;
    const fator = usandoKmh ? 3.6 : 1/3.6;
    
    // Converter valores existentes
    const campos = ['v0', 'v', 'a'];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo.value) {
            campo.value = (parseFloat(campo.value) * fator).toFixed(2);
        }
    });
    
    // Atualizar rótulos
    const sufixo = usandoKmh ? 'km/h' : 'm/s';
    document.querySelector('label[for="v0"]').textContent = `v₀ (Veloc. Inicial): (${sufixo})`;
    document.querySelector('label[for="v"]').textContent = `v (Veloc. Final): (${sufixo})`;
    document.querySelector('label[for="a"]').textContent = `a (Aceleração): (${usandoKmh ? 'km/h²' : 'm/s²'})`;
}

function zoomGrafico(e) {
    const fator = this.id === 'zoom-in' ? 1.2 : 0.8;
    
    if (graficoVelocidade.options.scales.x.min === undefined) {
        graficoVelocidade.options.scales.x.min = 0;
        graficoVelocidade.options.scales.x.max = graficoVelocidade.data.labels[graficoVelocidade.data.labels.length - 1];
    }
    
    const range = graficoVelocidade.options.scales.x.max - graficoVelocidade.options.scales.x.min;
    const center = graficoVelocidade.options.scales.x.min + range / 2;
    const newRange = range * fator;
    
    graficoVelocidade.options.scales.x.min = Math.max(0, center - newRange / 2);
    graficoVelocidade.options.scales.x.max = center + newRange / 2;
    graficoVelocidade.update();
}

function exportarGrafico() {
    const link = document.createElement('a');
    link.download = 'grafico-velocidade.png';
    link.href = document.getElementById('velocity-chart').toDataURL('image/png');
    link.click();
}

function resetarCalculadora() {
    // Limpar inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
    });
    
    // Limpar resultados
    document.getElementById('result').innerHTML = '';
    document.getElementById('calculation-steps').innerHTML = '';
    document.getElementById('formula').innerHTML = '';
    document.getElementById('formula-display').classList.add('oculto');
    
    // Resetar animação
    const carro = document.getElementById('car');
    carro.style.left = '0px';
    carro.className = '';
    document.getElementById('position-indicator').textContent = 'Posição: 0m';
    
    if (estaAnimando) {
        cancelAnimationFrame(animacaoId);
        estaAnimando = false;
    }
    
    // Resetar gráfico
    graficoVelocidade.data.labels = [];
    graficoVelocidade.data.datasets[0].data = [];
    graficoVelocidade.update();
    
    // Resetar tabela
    document.querySelector('#simulation-data tbody').innerHTML = '';
}

function alternarAjuda() {
    document.getElementById('help-modal').classList.toggle('mostrar');
}
function mostrarExemplos() {
    const exemplo = exemplosPraticos[Math.floor(Math.random() * exemplosPraticos.length)];
    
    // Preencher os campos com os valores do exemplo
    for (const [key, value] of Object.entries(exemplo.valores)) {
        const campo = document.getElementById(key);
        if (campo) campo.value = value !== '' ? value : '';
    }
    
    // Mostrar detalhes do exemplo
    mostrarResultado(`Exemplo: ${exemplo.titulo}<br>${exemplo.descricao}`);
    mostrarFormula('Preenchi os campos com valores de exemplo. Agora clique em calcular ou simular!');
}

async function exportarParaPDF() {
    try {
        // Carregar a biblioteca jsPDF dinamicamente
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Adicionar título
        doc.setFontSize(20);
        doc.text('Relatório de Simulação MRUV', 105, 15, { align: 'center' });
        
        // Adicionar dados básicos
        doc.setFontSize(12);
        doc.text(`Velocidade Inicial (v₀): ${document.getElementById('v0').value || '---'} m/s`, 20, 30);
        doc.text(`Aceleração (a): ${document.getElementById('a').value || '---'} m/s²`, 20, 40);
        doc.text(`Velocidade Final (v): ${document.getElementById('v').value || '---'} m/s`, 20, 50);
        doc.text(`Tempo (t): ${document.getElementById('t').value || '---'} s`, 20, 60);
        doc.text(`Deslocamento (s): ${document.getElementById('s').value || '---'} m`, 20, 70);
        
        // Adicionar resultado se existir
        const resultado = document.getElementById('result').innerText;
        if (resultado) {
            doc.text('Resultado:', 20, 90);
            doc.text(resultado, 30, 100);
        }
        
        // Adicionar gráfico como imagem
        const canvas = document.getElementById('velocity-chart');
        if (canvas) {
            const chartImage = await getChartAsImage(canvas);
            if (chartImage) {
                doc.addImage(chartImage, 'PNG', 40, 110, 130, 80);
            }
        }
        
        // Salvar o PDF
        doc.save('simulacao_mruv.pdf');
    } catch (error) {
        mostrarErro("Erro ao gerar PDF. Recarregue a página e tente novamente.");
        console.error("Erro ao gerar PDF:", error);
    }
}

function getChartAsImage(canvas) {
    return new Promise((resolve) => {
        if (!canvas) return resolve(null);
        
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        }, 'image/png');
    });
}