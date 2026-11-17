
export function contaPalavras(texto) {
    if (typeof texto !== "string") {
        throw new TypeError("O texto precisa ser uma string.");
    }

    const paragrafos = extraiParagrafos(texto);

    return paragrafos.flatMap((paragrafo) => {
        if (!paragrafo.trim()) return [];

        const resultado = verificaPalavrasDuplicadas(paragrafo);

        return Object.keys(resultado).length > 0
            ? [resultado]
            : [];
    });
}

function extraiParagrafos(texto) {
    return texto.normalize("NFC").split(/\r\n?|\n/);
}

function limpaPalavras(palavra) {
    return palavra
        .normalize("NFC")
        .toLocaleLowerCase("pt-BR")
        .replace(/[^\p{L}\p{M}\p{N}'’]/gu, "");
}

function verificaPalavrasDuplicadas(texto) {
    const resultado = {};

    const listaPalavras = texto.match(
        /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu
    ) || [];

    listaPalavras.forEach((palavra) => {
        const palavraLimpa = limpaPalavras(palavra);

        // Ignora palavras com menos de três caracteres.
        if ([...palavraLimpa].length < 3) return;

        resultado[palavraLimpa] = (
            Object.hasOwn(resultado, palavraLimpa)
                ? resultado[palavraLimpa]
                : 0
        ) + 1;
    });

    return resultado;
}
