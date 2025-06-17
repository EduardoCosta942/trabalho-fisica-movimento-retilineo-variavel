// Elementos DOM
const v0Input = document.getElementById('v0');
const vInput = document.getElementById('v');
const tInput = document.getElementById('t');
const sInput = document.getElementById('s');
const formulaDisplay = document.getElementById('formula');
const resultDisplay = document.getElementById('result');
const car = document.getElementById('car');
const themeToggle = document.getElementById('theme-toggle');

// Gráfico
const ctx = document.getElementById('velocity-chart').getContext('2d');
const velocityChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'Velocidade (m/s)',
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Tempo (s)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Velocidade (m/s)'
                }
            }
        }
    }
});

// Estado da simulação
let currentSimulation = null;

// Fórmulas MRUV
const formulas = {
    acceleration: {
        calc: (v0, v, t) => (v - v0) / t,
        text: "a = (v - v₀) / t"
    },
    finalVelocity: {
        calc: (v0, a, t) => v0 + a * t,
        text: "v = v₀ + a·t"
    },
    time: {
        calc: (v0, v, a) => (v - v0) / a,
        text: "t = (v - v₀) / a"
    },
    displacement: {
        calc: (v0, a, t) => v0 * t + 0.5 * a * t ** 2,
        text: "s = v₀·t + ½·a·t²"
    }
};

// Event Listeners
document.getElementById('calc-accel').addEventListener('click', () => calculate('acceleration'));
document.getElementById('calc-velocity').addEventListener('click', () => calculate('finalVelocity'));
document.getElementById('calc-time').addEventListener('click', () => calculate('time'));
document.getElementById('calc-displacement').addEventListener('click', () => calculate('displacement'));
document.getElementById('reset-btn').addEventListener('click', resetSimulation);
themeToggle.addEventListener('click', toggleTheme);

// Inicializar quiz
initQuiz();

// Função principal de cálculo
function calculate(type) {
    // Obter valores dos inputs
    const v0 = parseFloat(v0Input.value) || 0;
    const v = parseFloat(vInput.value);
    const t = parseFloat(tInput.value);
    const s = parseFloat(sInput.value);
    
    let result, a;
    
    try {
        switch(type) {
            case 'acceleration':
                if (t === 0) throw new Error("Tempo não pode ser zero!");
                a = formulas.acceleration.calc(v0, v, t);
                result = `Aceleração (a) = ${a.toFixed(2)} m/s²`;
                formulaDisplay.textContent = formulas.acceleration.text;
                break;
                
            case 'finalVelocity':
                a = (v0 && t && s) ? (2*(s - v0*t))/t**2 : 
                    parseFloat(prompt("Informe a aceleração (m/s²):"));
                if (isNaN(a)) throw new Error("Aceleração inválida!");
                const velocity = formulas.finalVelocity.calc(v0, a, t);
                result = `Veloc. Final (v) = ${velocity.toFixed(2)} m/s`;
                formulaDisplay.textContent = formulas.finalVelocity.text;
                break;
                
            case 'time':
                a = parseFloat(prompt("Informe a aceleração (m/s²):"));
                if (isNaN(a)) throw new Error("Aceleração inválida!");
                const time = formulas.time.calc(v0, v, a);
                result = `Tempo (t) = ${time.toFixed(2)} s`;
                formulaDisplay.textContent = formulas.time.text;
                break;
                
            case 'displacement':
                a = parseFloat(prompt("Informe a aceleração (m/s²):"));
                if (isNaN(a)) throw new Error("Aceleração inválida!");
                const displacement = formulas.displacement.calc(v0, a, t);
                result = `Deslocamento (s) = ${displacement.toFixed(2)} m`;
                formulaDisplay.textContent = formulas.displacement.text;
                break;
        }
        
        resultDisplay.innerHTML = result;
        resultDisplay.style.color = '#2ecc71';
        
        // Iniciar simulação
        if (type === 'acceleration') {
            startSimulation(v0, a, t);
        }
        
    } catch (error) {
        resultDisplay.textContent = `Erro: ${error.message}`;
        resultDisplay.style.color = '#e74c3c';
    }
}

// Função para iniciar a simulação
function startSimulation(v0, a, t) {
    resetSimulation();
    
    currentSimulation = {
        v0,
        a,
        t,
        startTime: Date.now()
    };
    
    // Atualizar gráfico
    updateChart(v0, a, t);
    
    // Iniciar animação
    animateCar(v0, a, t);
}

// Animação do carro
function animateCar(v0, a, t) {
    const trackWidth = document.getElementById('track').offsetWidth - car.offsetWidth;
    let start = null;
    
    function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = (timestamp - start) / 1000;
        
        if (elapsed > t) {
            car.style.left = `${trackWidth}px`;
            return;
        }
        
        // Calcular deslocamento atual
        const s = v0 * elapsed + 0.5 * a * elapsed ** 2;
        
        // Mapear para posição na tela
        const progress = Math.min(s / (v0 * t + 0.5 * a * t ** 2), 1);
        car.style.left = `${progress * trackWidth}px`;
        
        requestAnimationFrame(step);
    }
    
    requestAnimationFrame(step);
}

// Atualizar gráfico
function updateChart(v0, a, t) {
    const data = [];
    const labels = [];
    
    for (let i = 0; i <= 10; i++) {
        const time = (i * t) / 10;
        labels.push(time.toFixed(1));
        data.push(v0 + a * time);
    }
    
    velocityChart.data.labels = labels;
    velocityChart.data.datasets[0].data = data;
    velocityChart.update();
}

// Resetar simulação
function resetSimulation() {
    if (currentSimulation) {
        currentSimulation = null;
    }
    car.style.left = '0';
    v0Input.value = '';
    vInput.value = '';
    tInput.value = '';
    sInput.value = '';
    formulaDisplay.textContent = '';
    resultDisplay.textContent = '';
    velocityChart.data.labels = [];
    velocityChart.data.datasets[0].data = [];
    velocityChart.update();
}

// Alternar modo noturno
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️ Modo Claro' : '🌙 Modo Noturno';
}

// Sistema de Quiz
function initQuiz() {
    const questions = [
        {
            question: "Qual fórmula representa o cálculo da velocidade final no MRUV?",
            options: [
                "v = v₀ + a·t",
                "s = v₀·t + ½·a·t²",
                "a = Δv / Δt",
                "v² = v₀² + 2·a·Δs"
            ],
            correct: 0
        },
        {
            question: "Em um MRUV com aceleração negativa:",
            options: [
                "A velocidade aumenta constantemente",
                "O movimento é sempre progressivo",
                "A velocidade diminui com o tempo",
                "O deslocamento é sempre positivo"
            ],
            correct: 2
        }
    ];
    
    let currentQuestion = 0;
    
    function showQuestion() {
        const quizQuestion = document.getElementById('quiz-question');
        const quizOptions = document.getElementById('quiz-options');
        const quizFeedback = document.getElementById('quiz-feedback');
        
        quizQuestion.textContent = questions[currentQuestion].question;
        quizOptions.innerHTML = '';
        quizFeedback.innerHTML = '';
        
        questions[currentQuestion].options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.addEventListener('click', () => checkAnswer(index));
            quizOptions.appendChild(button);
        });
    }
    
    function checkAnswer(selected) {
        const quizFeedback = document.getElementById('quiz-feedback');
        const isCorrect = selected === questions[currentQuestion].correct;
        
        if (isCorrect) {
            quizFeedback.textContent = "✅ Resposta correta!";
            quizFeedback.style.color = '#2ecc71';
            
            setTimeout(() => {
                currentQuestion = (currentQuestion + 1) % questions.length;
                showQuestion();
            }, 1500);
        } else {
            quizFeedback.textContent = "❌ Tente novamente!";
            quizFeedback.style.color = '#e74c3c';
        }
    }
    
    showQuestion();
}
// Adicionar ao script.js
const history = [];

function addToHistory(calculation) {
    history.push(calculation);
    if (history.length > 5) history.shift();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.createElement('div');
    historyList.className = 'history-list';
    
    history.forEach(item => {
        const entry = document.createElement('div');
        entry.className = 'history-entry';
        entry.textContent = `${item.type}: ${item.result}`;
        historyList.appendChild(entry);
    });
    
    const existingHistory = document.querySelector('.history-list');
    if (existingHistory) {
        document.querySelector('.results').replaceChild(historyList, existingHistory);
    } else {
        document.querySelector('.results').appendChild(historyList);
    }
}

// Adicionar ao script.js
document.getElementById('export-pdf').addEventListener('click', exportPDF);

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text("Relatório de Simulação - MRUV", 105, 15, null, null, 'center');
    
    // Parâmetros
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleString()}`, 15, 25);
    
    if (currentSimulation) {
        doc.text(`- Velocidade inicial: ${currentSimulation.v0} m/s`, 15, 35);
        doc.text(`- Aceleração: ${currentSimulation.a} m/s²`, 15, 40);
        doc.text(`- Tempo: ${currentSimulation.t} s`, 15, 45);
        doc.text(`- Deslocamento: ${(currentSimulation.v0 * currentSimulation.t + 0.5 * currentSimulation.a * Math.pow(currentSimulation.t, 2)).toFixed(2)} m`, 15, 50);
    }
    
    // Fórmulas
    doc.setFontSize(14);
    doc.text("Fórmulas Utilizadas:", 15, 65);
    doc.setFontSize(12);
    doc.text("v = v₀ + a·t", 20, 75);
    doc.text("s = v₀·t + ½·a·t²", 20, 80);
    doc.text("a = (v - v₀)/t", 20, 85);
    doc.text("v² = v₀² + 2·a·Δs", 20, 90);
    
    // Gráfico
    const chartCanvas = document.getElementById('velocity-chart');
    const chartImage = chartCanvas.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 30, 100, 150, 75);
    
    // Salvar PDF
    doc.save('simulacao_mruv.pdf');
}

// Adicionar ao script.js
document.getElementById('examples-btn').addEventListener('click', showExamples);

function showExamples() {
    const examples = [
        {name: "Aceleração Positiva", v0: 0, v: 20, t: 5, s: 50},
        {name: "Desaceleração", v0: 30, v: 0, t: 6, s: 90},
        {name: "Queda Livre", v0: 0, a: 9.8, t: 3, s: 44.1}
    ];
    
    const examplesDiv = document.createElement('div');
    examplesDiv.className = 'examples-modal';
    
    examplesDiv.innerHTML = `
        <h3>Exemplos Pré-Definidos</h3>
        <div class="examples-list">
            ${examples.map(ex => `
                <div class="example" data-v0="${ex.v0}" data-v="${ex.v}" data-t="${ex.t}" data-s="${ex.s || ''}" data-a="${ex.a || ''}">
                    <strong>${ex.name}</strong>
                    <div>v₀: ${ex.v0} m/s, v: ${ex.v} m/s, t: ${ex.t} s</div>
                </div>
            `).join('')}
        </div>
        <button id="close-examples">Fechar</button>
    `;
    
    document.body.appendChild(examplesDiv);
    
    // Event listeners
    document.querySelectorAll('.example').forEach(example => {
        example.addEventListener('click', function() {
            const data = this.dataset;
            v0Input.value = data.v0;
            vInput.value = data.v;
            tInput.value = data.t;
            sInput.value = data.s || '';
            
            if (data.a) {
                startSimulation(parseFloat(data.v0), parseFloat(data.a), parseFloat(data.t));
            }
            
            examplesDiv.remove();
        });
    });
    
    document.getElementById('close-examples').addEventListener('click', () => {
        examplesDiv.remove();
    });
}

// Adicionar ao script.js
document.getElementById('unit-toggle').addEventListener('change', convertUnits);

function convertUnits() {
    const isKmh = document.getElementById('unit-toggle').checked;
    const factor = isKmh ? 3.6 : 1/3.6;
    const unit = isKmh ? 'km/h' : 'm/s';
    
    // Atualizar inputs
    const velocityInputs = [v0Input, vInput];
    velocityInputs.forEach(input => {
        if (input.value) {
            input.value = (parseFloat(input.value) * factor).toFixed(2);
        }
    });
    
    // Atualizar labels
    document.querySelectorAll('label[for="v0"], label[for="v"]').forEach(label => {
        label.textContent = label.textContent.replace(/\(.*\)/, `(${unit})`);
    });
    
    // Atualizar resultados
    if (resultDisplay.textContent.includes('m/s')) {
        resultDisplay.textContent = resultDisplay.textContent.replace('m/s', unit);
    }
}

// Adicionar ao script.js
function saveSimulation() {
    if (!currentSimulation) return;
    
    const simulations = JSON.parse(localStorage.getItem('mruv_simulations') || []);
    simulations.push({
        ...currentSimulation,
        timestamp: new Date().toISOString(),
        displacement: currentSimulation.v0 * currentSimulation.t + 0.5 * currentSimulation.a * Math.pow(currentSimulation.t, 2)
    });
    
    localStorage.setItem('mruv_simulations', JSON.stringify(simulations));
    alert('Simulação salva com sucesso!');
}

function loadSimulations() {
    const simulations = JSON.parse(localStorage.getItem('mruv_simulations') || [])
    if (simulations.length === 0) {
        alert('Nenhuma simulação salva encontrada!');
        return;
    }}
    
    const simulationList = document.createElement('div');
    simulationList.className = 'simulations-modal';
    
    simulationList.innerHTML = `
        <h3>Simulações Salvas</h3>
        <div class="simulations-list">
            ${simulations.map((sim, i) => `
                <div class="simulation" data-index="${i}">
                    <strong>Simulação ${i+1}</strong>
                    <div>${new Date(sim.timestamp).toLocaleString()}</div>
                    <div>v₀: ${sim.v0} m/s, a: ${sim.a} m/s², t: ${sim.t} s</div>
                </div>
            `).join('')}
        </div>
        <button id="close-simulations">Fechar</button>
    `;
    
    function calculate(type) {
    // Limpar resultados anteriores
    document.getElementById('calculation-steps').innerHTML = '';
    document.getElementById('result').textContent = '';

    document.body.appendChild(simulationList);
    
    // Event listeners
    document.querySelectorAll('.simulation').forEach(sim => {
        sim.addEventListener('click', function() {
            const index = this.dataset.index;
            const simulation = simulations[index];
            
            v0Input.value = simulation.v0;
            document.getElementById('a').value = simulation.a;
            tInput.value = simulation.t;
            
            startSimulation(simulation.v0, simulation.a, simulation.t);
            simulationList.remove();
        });
    });
    
    document.getElementById('show-formula-btn').addEventListener('click', () => {
    document.getElementById('formula-display').classList.toggle('hidden');
});

    document.getElementById('close-simulations').addEventListener('click', () => {
        simulationList.remove();
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
showNotification('Cálculo realizado com sucesso!', 'success')
showNotification('Erro: tempo não pode ser zero', 'error')

function addCalculationStep(text) {
    const step = document.createElement('div');
    step.className = 'step';
    step.textContent = text;
    document.getElementById('calculation-steps').appendChild(step);
}