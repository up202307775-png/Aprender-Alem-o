import { prisma } from "@/lib/prisma"
import VocabClient from "./VocabClient"

export const dynamic = "force-dynamic";

export default async function VocabularioPage() {
  const [palavras, estados] = await Promise.all([
    prisma.word.findMany({ orderBy: [{ tema: "asc" }, { alemao: "asc" }] }),
    prisma.reviewState.findMany({
      where: { itemType: "word" },
      select: { itemId: true, id: true, repeticoes: true },
    }),
  ])

  const mapaEstados = new Map(estados.map(e => [e.itemId, e]))

  const dados = palavras.map(p => ({
    id: p.id,
    alemao: p.alemao,
    artigo: p.artigo,
    genero: p.genero,
    raiz: p.raiz,
    traducaoPt: p.traducaoPt,
    plural: p.plural,
    exemplo: p.exemplo,
    tema: p.tema,
    tipo: p.tipo,
    revisao: mapaEstados.has(p.id)
      ? { id: mapaEstados.get(p.id)!.id, repeticoes: mapaEstados.get(p.id)!.repeticoes }
      : null,
  }))

  return <VocabClient palavras={dados} />
}
