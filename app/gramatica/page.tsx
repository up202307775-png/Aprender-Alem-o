import { prisma } from "@/lib/prisma"
import GramaticaClient from "./GramaticaClient"

type Exercicio = {
  id: number
  tipo: "escolha-multipla" | "preenchimento" | "ordenacao"
  pergunta: string
  opcoes?: string[]
  resposta: string
  explicacao: string
}

export default async function GramaticaPage() {
  const modulos = await prisma.grammarModule.findMany({
    orderBy: { id: "asc" },
  })

  const dados = modulos.map(m => ({
    id: m.id,
    titulo: m.titulo,
    conteudo: m.conteudo,
    exercicios: JSON.parse(m.exercicios) as Exercicio[],
  }))

  return <GramaticaClient modulos={dados} />
}
