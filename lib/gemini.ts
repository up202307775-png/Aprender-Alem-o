import { GoogleGenAI } from "@google/genai";

// Cliente inicializado uma vez — lê a chave do servidor, nunca do client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

const MODEL = "gemini-2.5-flash";

// Chamada genérica — devolve o texto da resposta
export async function askGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text ?? "";
}

export interface Exercise {
  pergunta: string;
  opcoes: string[];
  resposta: string;
  explicacao?: string;
}

// Gera um exercício de alemão em JSON estruturado
export async function generateExercise(
  level: string,
  topic: string
): Promise<Exercise> {
  const prompt = `Cria um exercício de alemão de nível ${level} sobre o tema "${topic}".
Devolve APENAS JSON válido, sem markdown, sem texto extra, neste formato exato:
{
  "pergunta": "texto da pergunta",
  "opcoes": ["opção A", "opção B", "opção C", "opção D"],
  "resposta": "opção correta (deve ser igual a uma das opcoes)",
  "explicacao": "breve explicação em português"
}`;

  const raw = await askGemini(prompt);

  // Parse seguro — tenta extrair JSON mesmo que venha com texto extra
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Sem JSON na resposta");
    return JSON.parse(match[0]) as Exercise;
  } catch {
    // Fallback legível em vez de crash
    return {
      pergunta: "Erro ao gerar exercício. Tenta novamente.",
      opcoes: [],
      resposta: "",
      explicacao: `Resposta bruta do modelo: ${raw.slice(0, 200)}`,
    };
  }
}
