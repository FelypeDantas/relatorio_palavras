import { contaPalavras } from "../index.js";

export default function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { texto } = req.body;

  if (!texto) {
    return res.status(400).json({ erro: "Texto não enviado" });
  }

  const resultado = contaPalavras(texto);

  res.status(200).json(resultado);
}