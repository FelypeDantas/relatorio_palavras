
/* ==========================================
   RELATÓRIO DE PALAVRAS REPETIDAS
========================================== */


/**
 * Identifica palavras que aparecem mais de uma vez
 * em determinado parágrafo.
 *
 * @param {Object} paragrafo - Contagem de palavras.
 * @returns {Array} Lista de palavras repetidas.
 */

function filtraOcorrencias(paragrafo) {

    if (
        !paragrafo ||
        typeof paragrafo !== "object" ||
        Array.isArray(paragrafo)
    ) {
        return [];
    }

    return Object.entries(paragrafo)
        .filter(([palavra, quantidade]) => {

            return (
                typeof palavra === "string" &&
                typeof quantidade === "number" &&
                Number.isFinite(quantidade) &&
                quantidade > 1
            );

        })
        .sort((a, b) => b[1] - a[1])
        .map(([palavra]) => palavra);

}


/**
 * Gera um relatório com as palavras repetidas
 * em cada parágrafo.
 *
 * @param {Array} listaPalavras - Lista de parágrafos.
 * @returns {string} Relatório textual.
 */

function montaSaidaArquivo(listaPalavras) {

    if (!Array.isArray(listaPalavras)) {
        throw new TypeError(
            "A lista de palavras deve ser um array."
        );
    }

    if (listaPalavras.length === 0) {
        return "Nenhum parágrafo foi encontrado.";
    }

    const relatorio = listaPalavras.map(
        (paragrafo, indice) => {

            const duplicadas = filtraOcorrencias(paragrafo);

            const titulo = `Parágrafo ${indice + 1}`;

            if (duplicadas.length === 0) {

                return `${titulo}: Nenhuma palavra repetida.`;

            }

            const palavras = duplicadas.join(", ");

            return `${titulo}: ${palavras}.`;

        }
    );

    return [
        "================================",
        "RELATÓRIO DE PALAVRAS REPETIDAS",
        "================================",
        "",
        ...relatorio,
        "",
        "================================",
        "FIM DO RELATÓRIO",
        "================================"
    ].join("\n");

}


/* ==========================================
   EXPORTAÇÕES
========================================== */

export {
    filtraOcorrencias,
    montaSaidaArquivo
};
