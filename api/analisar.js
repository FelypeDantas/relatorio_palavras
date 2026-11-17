
import { contaPalavras } from "../index.js";

export default async function handler(req, res) {

    // ======================================
    // 1. VALIDAR MÉTODO HTTP
    // ======================================

    if (req.method !== "POST") {

        res.setHeader("Allow", ["POST"]);

        return res.status(405).json({
            erro: "Método não permitido."
        });

    }


    // ======================================
    // 2. VALIDAR CORPO DA REQUISIÇÃO
    // ======================================

    if (!req.body || typeof req.body !== "object") {

        return res.status(400).json({
            erro: "Corpo da requisição inválido."
        });

    }


    // ======================================
    // 3. VALIDAR TEXTO
    // ======================================

    const { texto } = req.body;

    if (typeof texto !== "string" || !texto.trim()) {

        return res.status(400).json({
            erro: "Envie um texto válido para análise."
        });

    }


    // ======================================
    // 4. PROCESSAR ANÁLISE
    // ======================================

    try {

        const resultado = await contaPalavras(texto);

        if (!Array.isArray(resultado)) {

            throw new Error(
                "A função contaPalavras retornou um formato inválido."
            );

        }

        return res.status(200).json(resultado);

    } catch (erro) {

        // Registra o erro para diagnóstico.
        console.error("Erro ao analisar texto:", erro);

        return res.status(500).json({
            erro: "Não foi possível analisar o texto."
        });

    }

}
