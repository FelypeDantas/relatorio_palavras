
/* ==========================================
   ANALISADOR DE TEXTO
   Versão aprimorada
========================================== */


/* ==========================================
   CONFIGURAÇÕES
========================================== */

const CONFIG = {
    API_URL: "/api/analisar",
    MAX_RANKING: 10,
    MAX_NUVEM: 50,

    CORES_NUVEM: [
        "#e58aa4",
        "#c54c70",
        "#f1b4c5",
        "#a93b5e",
        "#d77b98",
        "#f3d0dc",
        "#9d4565"
    ]
};

let analisando = false;


/* ==========================================
   NORMALIZAÇÃO
========================================== */

function normalizarPalavra(palavra) {
    return palavra
        .normalize("NFC")
        .toLocaleLowerCase("pt-BR");
}


/* ==========================================
   ANÁLISE PRINCIPAL
========================================== */

async function analisar() {

    if (analisando) return;

    const campoTexto = document.getElementById("texto");
    const texto = campoTexto.value.trim();

    if (!texto) {
        alert("Insira um texto para analisar.");
        campoTexto.focus();
        return;
    }

    analisando = true;

    const botao = document.querySelector(
        'button[onclick="analisar()"]'
    );

    const textoOriginalBotao = botao?.textContent;

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Analisando...";
    }

    try {

        const resposta = await fetch(CONFIG.API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ texto })
        });

        if (!resposta.ok) {
            throw new Error(
                `Erro na API: ${resposta.status}`
            );
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error(
                "Formato de resposta inválido."
            );
        }

        const contagem = consolidarContagem(dados);

        if (Object.keys(contagem).length === 0) {
            throw new Error(
                "Nenhuma palavra foi encontrada na análise."
            );
        }

        destacarTexto(texto, contagem);
        gerarRanking(contagem);
        gerarNuvem(contagem);

    } catch (erro) {

        console.error("Erro na análise:", erro);

        alert(
            "Não foi possível analisar o texto.\n\n" +
            erro.message
        );

    } finally {

        analisando = false;

        if (botao) {
            botao.disabled = false;
            botao.textContent = textoOriginalBotao;
        }

    }

}


/* ==========================================
   CONSOLIDAR CONTAGEM
========================================== */

function consolidarContagem(lista) {

    const resultado = Object.create(null);

    lista.forEach(paragrafo => {

        if (
            !paragrafo ||
            typeof paragrafo !== "object" ||
            Array.isArray(paragrafo)
        ) {
            return;
        }

        Object.entries(paragrafo).forEach(
            ([palavra, qtd]) => {

                if (
                    typeof palavra !== "string" ||
                    typeof qtd !== "number" ||
                    !Number.isFinite(qtd) ||
                    qtd <= 0
                ) {
                    return;
                }

                const chave = normalizarPalavra(palavra);

                resultado[chave] =
                    (resultado[chave] || 0) + qtd;

            }
        );

    });

    return resultado;

}


/* ==========================================
   DESTACAR PALAVRAS REPETIDAS
========================================== */

function destacarTexto(texto, contagem) {

    const container = document.getElementById(
        "textoDestacado"
    );

    container.replaceChildren();

    const palavrasRepetidas = new Set(
        Object.entries(contagem)
            .filter(([palavra, qtd]) => qtd > 1)
            .map(([palavra]) => palavra)
    );

    /*
       Identifica palavras preservando:
       - Pontuação
       - Espaços
       - Quebras de linha
       - Acentos
       - Caracteres Unicode
    */

    const regex = /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu;

    let ultimaPosicao = 0;

    for (const correspondencia of texto.matchAll(regex)) {

        const palavra = correspondencia[0];
        const inicio = correspondencia.index;
        const fim = inicio + palavra.length;

        // Preserva o conteúdo anterior à palavra.
        container.appendChild(
            document.createTextNode(
                texto.slice(ultimaPosicao, inicio)
            )
        );

        if (
            palavrasRepetidas.has(
                normalizarPalavra(palavra)
            )
        ) {

            const destaque = document.createElement("span");

            destaque.className = "highlight";
            destaque.textContent = palavra;

            container.appendChild(destaque);

        } else {

            container.appendChild(
                document.createTextNode(palavra)
            );

        }

        ultimaPosicao = fim;

    }

    // Preserva o restante do texto.
    container.appendChild(
        document.createTextNode(
            texto.slice(ultimaPosicao)
        )
    );

}


/* ==========================================
   RANKING DE PALAVRAS
========================================== */

function gerarRanking(dados) {

    const container = document.getElementById("ranking");

    container.replaceChildren();

    const listaOrdenada = Object.entries(dados)
        .sort((a, b) => {
            return b[1] - a[1] ||
                a[0].localeCompare(b[0], "pt-BR");
        })
        .slice(0, CONFIG.MAX_RANKING);

    const lista = document.createElement("ol");

    listaOrdenada.forEach(([palavra, qtd]) => {

        const item = document.createElement("li");

        const nome = document.createElement("strong");
        nome.textContent = palavra;

        const quantidade = document.createElement("span");
        quantidade.textContent = ` (${qtd} ocorrências)`;

        item.appendChild(nome);
        item.appendChild(quantidade);

        lista.appendChild(item);

    });

    container.appendChild(lista);

}


/* ==========================================
   NUVEM DE PALAVRAS
========================================== */

function gerarNuvem(dados) {

    const canvas = document.getElementById("nuvem");

    if (!canvas) {
        console.warn("Canvas da nuvem não encontrado.");
        return;
    }

    if (typeof WordCloud !== "function") {
        console.error("Biblioteca WordCloud não carregada.");
        return;
    }

    const lista = Object.entries(dados)
        .sort((a, b) => b[1] - a[1])
        .slice(0, CONFIG.MAX_NUVEM);

    if (lista.length === 0) return;

    // Limpa a nuvem anterior.
    const contexto = canvas.getContext("2d");

    contexto.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const maiorFrequencia = lista[0][1];

    WordCloud(canvas, {

        list: lista,

        gridSize: 9,

        weightFactor: function(peso) {

            const proporcao = peso / maiorFrequencia;

            return Math.min(
                54,
                Math.max(13, 13 + proporcao * 38)
            );

        },

        fontFamily: "DM Sans, Arial, sans-serif",

        fontWeight: "bold",

        color: function(palavra, peso) {

            const indice = Math.floor(
                (peso / maiorFrequencia) *
                (CONFIG.CORES_NUVEM.length - 1)
            );

            return CONFIG.CORES_NUVEM[
                Math.min(
                    indice,
                    CONFIG.CORES_NUVEM.length - 1
                )
            ];

        },

        backgroundColor: "#211921",

        rotateRatio: 0.15,

        rotationSteps: 2,

        shuffle: false,

        drawOutOfBound: false,

        shrinkToFit: true,

        minSize: 8

    });

}


/* ==========================================
   CARREGAR ARQUIVOS
========================================== */

function lerArquivo() {

    const input = document.getElementById("arquivo");

    const arquivo = input.files[0];

    if (!arquivo) {
        alert("Selecione um arquivo.");
        return;
    }

    if (!arquivo.name.toLowerCase().endsWith(".txt")) {
        alert("Apenas arquivos .txt são suportados.");
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function(event) {

        const texto = event.target.result;

        if (typeof texto !== "string") {
            alert("Não foi possível interpretar o arquivo.");
            return;
        }

        document.getElementById("texto").value = texto;

        atualizarContadores();

    };

    leitor.onerror = function() {

        alert("Erro ao ler o arquivo.");

    };

    leitor.readAsText(arquivo, "UTF-8");

}


/* ==========================================
   CONTADORES
========================================== */

function atualizarContadores() {

    const texto = document.getElementById("texto").value;

    const palavras = texto.trim()
        ? texto.trim().split(/\s+/u).length
        : 0;

    const caracteres = texto.length;

    const contadorPalavras = document.getElementById(
        "contadorPalavras"
    );

    const contadorCaracteres = document.getElementById(
        "contadorCaracteres"
    );

    if (contadorPalavras) {
        contadorPalavras.textContent =
            `${palavras} ${palavras === 1 ? "palavra" : "palavras"}`;
    }

    if (contadorCaracteres) {
        contadorCaracteres.textContent =
            `${caracteres} ${caracteres === 1 ? "caractere" : "caracteres"}`;
    }

}


/* ==========================================
   LIMPAR TEXTO E RESULTADOS
========================================== */

function limparTexto() {

    if (analisando) return;

    document.getElementById("texto").value = "";

    const arquivo = document.getElementById("arquivo");

    if (arquivo) {
        arquivo.value = "";
    }

    document.getElementById("textoDestacado").replaceChildren();

    document.getElementById("ranking").replaceChildren();

    const canvas = document.getElementById("nuvem");

    if (canvas) {
        canvas.getContext("2d").clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    atualizarContadores();

    document.getElementById("texto").focus();

}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", function() {

    const campoTexto = document.getElementById("texto");

    if (campoTexto) {
        campoTexto.addEventListener(
            "input",
            atualizarContadores
        );
    }

    atualizarContadores();

});
