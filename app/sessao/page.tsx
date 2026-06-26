import { prisma } from "@/lib/prisma"
import SessaoClient from "./SessaoClient"

export const dynamic = "force-dynamic"

const NOVOS_POR_DIA = 20

type ConjugacoesTipo = {
  prasens: Record<string, string>
  perfekt: string
}

type ItemSessao = {
  id: number
  tipo: "word" | "verb"
  alemao?: string
  artigo?: string
  genero?: string
  plural?: string
  exemplo?: string
  raiz?: string
  infinitivo?: string
  separavel?: boolean
  irregular?: boolean
  conjugacoes?: ConjugacoesTipo
  traducaoPt: string
  nivel: string
  eNovo: boolean
}

export default async function SessaoPage() {
  const userState = await prisma.userState.findUnique({ where: { id: 1 } })
  const currentLevelId = userState?.currentLevelId

  const hoje = new Date()
  const inicioDia = new Date(hoje); inicioDia.setHours(0, 0, 0, 0)
  const fimDia   = new Date(hoje); fimDia.setHours(23, 59, 59, 999)

  const whereLevel = currentLevelId
    ? { module: { levelId: currentLevelId } }
    : {}

  // Buscar palavras e verbos ordenados por module.ordem → id
  const [todasPalavras, todosVerbos] = await Promise.all([
    prisma.word.findMany({
      where: whereLevel,
      orderBy: [{ module: { ordem: "asc" } }, { id: "asc" }],
      include: { module: { include: { level: true } } },
    }),
    prisma.verb.findMany({
      where: whereLevel,
      orderBy: [{ module: { ordem: "asc" } }, { id: "asc" }],
      include: { module: { include: { level: true } } },
    }),
  ])

  const wordIds = todasPalavras.map(w => w.id)
  const verbIds = todosVerbos.map(v => v.id)

  const reviewStates = await prisma.reviewState.findMany({
    where: {
      OR: [
        { itemType: "word", itemId: { in: wordIds } },
        { itemType: "verb", itemId: { in: verbIds } },
      ],
    },
  })

  const rsMapWord = new Map(reviewStates.filter(r => r.itemType === "word").map(r => [r.itemId, r]))
  const rsMapVerb = new Map(reviewStates.filter(r => r.itemType === "verb").map(r => [r.itemId, r]))

  // Revisões devidas hoje
  const palavrasRevisao = todasPalavras.filter(p => {
    const rs = rsMapWord.get(p.id)
    return rs && rs.proximaRevisao <= fimDia
  })
  const verbosRevisao = todosVerbos.filter(v => {
    const rs = rsMapVerb.get(v.id)
    return rs && rs.proximaRevisao <= fimDia
  })

  // Quantos novos já foram introduzidos hoje
  const novosHoje = reviewStates.filter(
    r => r.introduzidoEm >= inicioDia && r.introduzidoEm <= fimDia
  ).length
  const vagasParaNovos = Math.max(0, NOVOS_POR_DIA - novosHoje)

  // Primeiros N novos (sem ReviewState), por ordem de módulo
  const palavrasNovas = todasPalavras
    .filter(p => !rsMapWord.has(p.id))
    .slice(0, vagasParaNovos)
  const vagasVerbosNovos = Math.max(0, vagasParaNovos - palavrasNovas.length)
  const verbosNovos = todosVerbos
    .filter(v => !rsMapVerb.has(v.id))
    .slice(0, vagasVerbosNovos)

  // Intercalar revisões e novos: revisões primeiro, depois novos
  function intercalar<A, B>(a: A[], b: B[]): (A | B)[] {
    const out: (A | B)[] = []
    const n = Math.max(a.length, b.length)
    for (let i = 0; i < n; i++) {
      if (i < a.length) out.push(a[i])
      if (i < b.length) out.push(b[i])
    }
    return out
  }

  const revisoesMistas = intercalar(palavrasRevisao, verbosRevisao)
  const novosMistos    = intercalar(palavrasNovas,   verbosNovos)
  const itensBrutos    = [...revisoesMistas, ...novosMistos]

  // Mapear para ItemSessao
  const itens: ItemSessao[] = itensBrutos.map(item => {
    if ("alemao" in item) {
      // Word
      const rs = rsMapWord.get(item.id)
      return {
        id: item.id,
        tipo: "word",
        alemao: item.alemao,
        artigo: item.artigo ?? undefined,
        genero: item.genero ?? undefined,
        plural: item.plural ?? undefined,
        exemplo: item.exemplo || undefined,
        raiz: item.raiz || undefined,
        traducaoPt: item.traducaoPt,
        nivel: (item as { module?: { level?: { codigo?: string } } }).module?.level?.codigo ?? "",
        eNovo: !rs,
      }
    } else {
      // Verb
      const rs = rsMapVerb.get(item.id)
      const conj = JSON.parse(item.conjugacoes || "{}") as { prasens?: Record<string, string>; perfekt?: string }
      return {
        id: item.id,
        tipo: "verb",
        infinitivo: item.infinitivo,
        separavel: item.separavel,
        irregular: item.irregular,
        conjugacoes: {
          prasens: conj.prasens ?? {},
          perfekt: conj.perfekt ?? "",
        },
        traducaoPt: item.traducaoPt,
        nivel: (item as { module?: { level?: { codigo?: string } } }).module?.level?.codigo ?? "",
        eNovo: !rs,
      }
    }
  })

  return <SessaoClient itens={itens} />
}
