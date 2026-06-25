import { prisma } from "@/lib/prisma"
import VerbosClient from "./VerbosClient"
export const dynamic = "force-dynamic";

type ConjugacoesTipo = {
  prasens: Record<string, string>
  prateritum: Record<string, string>
  perfekt: string
}

export default async function VerbosPage() {
  const verbos = await prisma.verb.findMany({ orderBy: { infinitivo: "asc" } })

  const dados = verbos.map(v => ({
    id: v.id,
    infinitivo: v.infinitivo,
    traducaoPt: v.traducaoPt,
    raiz: v.raiz,
    separavel: v.separavel,
    irregular: v.irregular,
    conjugacoes: JSON.parse(v.conjugacoes) as ConjugacoesTipo,
  }))

  return <VerbosClient verbos={dados} />
}
