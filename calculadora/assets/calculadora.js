/**Abrindo função de calculo da v */
function calcularVelocidadeFinal(){
    event.preventDefault(); /**Não deixa a página recarregar automaticamente */
    /**Atributos e variáveis */
    let velocidadeInicial = Number(document.getElementById("v0").value);
    let aceleracao = Number(document.getElementById("a").value);
    let tempo = Number(document.getElementById("t").value);
    if (velocidadeInicial > 0 && aceleracao > 0 && tempo > 0){
        /**Velocidade final fórmula */
    let velocidadeFinal = velocidadeInicial + (aceleracao * tempo);

    /**OutPut (Inserindo resultado no html) */
    document.getElementById("v").innerHTML = "A velocidade final é igual a " + velocidadeFinal + "m/s²"
    }
    else{
        document.getElementById("v").innerHTML = "Os valores devem ser maior que 0"
    }

}