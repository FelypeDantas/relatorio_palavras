async function analisar(){

  const texto = document.getElementById("texto").value.trim();

  if(!texto){
    alert("Insira um texto.");
    return;
  }

  const resposta = await fetch("/api/analisar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ texto })
  });

  const dados = await resposta.json();

  const contagem = consolidarContagem(dados);

  destacarTexto(texto, contagem);
  gerarRanking(contagem);
  gerarNuvem(contagem);

}

function escaparRegex(texto){
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function destacarTexto(texto, contagem){

  let resultado = texto;

  Object.entries(contagem).forEach(([palavra, qtd]) => {

    if(qtd > 1){

      const palavraEscapada = escaparRegex(palavra);

      const regex = new RegExp(`\\b${palavraEscapada}\\b`, "gi");

      resultado = resultado.replace(
        regex,
        `<span class="highlight">$&</span>`
      );

    }

  });

  document.getElementById("textoDestacado").innerHTML = resultado;

}

function gerarRanking(dados){

  const listaOrdenada = Object.entries(dados)
    .sort((a,b) => b[1] - a[1])
    .slice(0,10);

  const rankingHTML = listaOrdenada
    .map(([palavra, qtd]) => `<li>${palavra} (${qtd})</li>`)
    .join("");

  document.getElementById("ranking").innerHTML = `
    <ol>${rankingHTML}</ol>
  `;

}

function gerarNuvem(dados){

  const lista = Object.entries(dados)
  .sort((a,b) => b[1] - a[1])
  .slice(0,50);

  const canvas = document.getElementById("nuvem");

  if(!canvas){
    console.warn("Canvas da nuvem não encontrado");
    return;
  }

  const listaNormalizada = lista.map(([palavra, qtd]) => [
    palavra,
    Math.min(qtd, 50) // limita tamanho
  ]);

  WordCloud(canvas,{
    list: listaNormalizada,
    gridSize: 10,
    weightFactor: 5,
    fontFamily: "Arial",
    color: "random-dark",
    backgroundColor: "#ffffff"
  });

}

function lerArquivo(){

  const input = document.getElementById("arquivo");
  const file = input.files[0];

  if(!file){
    alert("Selecione um arquivo.");
    return;
  }

  if(!file.name.endsWith(".txt")){
    alert("Apenas arquivos .txt são suportados.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event){

    const texto = event.target.result;

    document.getElementById("texto").value = texto;

  };

  reader.onerror = function(){
    alert("Erro ao ler o arquivo.");
  };

  reader.readAsText(file);

}

function consolidarContagem(lista){

  const resultado = {};

  lista.forEach(paragrafo => {

    Object.entries(paragrafo).forEach(([palavra, qtd]) => {

      resultado[palavra] = (resultado[palavra] || 0) + qtd;

    });

  });

  return resultado;

}