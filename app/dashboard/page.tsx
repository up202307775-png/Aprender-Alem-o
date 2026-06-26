import Link from "next/link"
import { prisma } from "@/lib/prisma"
import NivelBadge from "@/components/NivelBadge"
export const dynamic = "force-dynamic";

// ─── Progresso do nível atual ─────────────────────────────────────────────────

async function getProgressoNivel() {
  const userState = await prisma.userState.findUnique({
    where: { id: 1 },
    include: { currentLevel: true },
  })
  if (!userState) return null

  const currentLevelId = userState.currentLevelId

  const [words, verbs] = await Promise.all([
    prisma.word.findMany({ where: { module: { levelId: currentLevelId } }, select: { id: true } }),
    prisma.verb.findMany({ where: { module: { levelId: currentLevelId } }, select: { id: true } }),
  ])

  const wordIds = words.map(w => w.id)
  const verbIds = verbs.map(v => v.id)
  const totalItens = wordIds.length + verbIds.length

  const reviewStates = totalItens > 0
    ? await prisma.reviewState.findMany({
        where: {
          OR: [
            { itemType: "word", itemId: { in: wordIds } },
            { itemType: "verb", itemId: { in: verbIds } },
          ],
        },
        select: { repeticoes: true },
      })
    : []

  const itensCompletos = reviewStates.filter(r => r.repeticoes >= 1).length
  const percentagem = totalItens > 0 ? Math.round((itensCompletos / totalItens) * 100) : 0

  return {
    codigo: userState.currentLevel.codigo,
    nome: userState.currentLevel.nome,
    percentagem,
    itensCompletos,
    totalItens,
    podeAvancar: totalItens > 0 && itensCompletos === totalItens,
  }
}

// ─── Cálculo do streak ────────────────────────────────────────────────────────

async function calcularStreak(): Promise<number> {
  const sessoes = await prisma.studySession.findMany({
    select: { data: true },
    orderBy: { data: "desc" },
  })

  if (sessoes.length === 0) return 0

  // Conjunto de dias com estudo, no formato "AAAA-MM-DD"
  const diasEstudo = new Set(
    sessoes.map(s => {
      const d = new Date(s.data)
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    })
  )

  const hoje = new Date()
  let streak = 0

  for (let i = 0; i <= 365; i++) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    const chave = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

    if (diasEstudo.has(chave)) {
      streak++
    } else if (i === 0) {
      // Ainda não estudei hoje — a sequência mantém-se se estudei ontem
      continue
    } else {
      break
    }
  }

  return streak
}

// ─── Progresso por área ───────────────────────────────────────────────────────

async function getProgresso() {
  const [palavras, verbos, estadosPalavras, estadosVerbos] = await Promise.all([
    prisma.word.findMany({ select: { id: true, tema: true } }),
    prisma.verb.findMany({ select: { id: true } }),
    prisma.reviewState.findMany({
      where: { itemType: "word" },
      select: { itemId: true, repeticoes: true },
    }),
    prisma.reviewState.findMany({
      where: { itemType: "verb" },
      select: { itemId: true, repeticoes: true },
    }),
  ])

  // Palavras: agrupa por tema e conta quantas já foram revistas (repeticoes > 0)
  const mapaWords = new Map(estadosPalavras.map(e => [e.itemId, e.repeticoes]))
  const porTema = new Map<string, { total: number; revistos: number }>()

  for (const palavra of palavras) {
    const tema = palavra.tema || "outros"
    const entrada = porTema.get(tema) ?? { total: 0, revistos: 0 }
    entrada.total++
    if ((mapaWords.get(palavra.id) ?? 0) > 0) entrada.revistos++
    porTema.set(tema, entrada)
  }

  const areasVocab = Array.from(porTema.entries())
    .map(([tema, dados]) => ({ tema, ...dados }))
    .sort((a, b) => b.total - a.total)

  // Verbos: secção única
  const mapaVerbs = new Map(estadosVerbos.map(e => [e.itemId, e.repeticoes]))
  const verbosRevistos = verbos.filter(v => (mapaVerbs.get(v.id) ?? 0) > 0).length

  return {
    areasVocab,
    verbos: { total: verbos.length, revistos: verbosRevistos },
  }
}

// ─── Componente de barra de progresso ────────────────────────────────────────

function BarraProgresso({
  label,
  revistos,
  total,
}: {
  label: string
  revistos: number
  total: number
}) {
  const pct = total > 0 ? Math.round((revistos / total) * 100) : 0

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="capitalize text-gray-700">{label}</span>
        <span className="text-gray-400 tabular-nums">
          {revistos}/{total}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const fimDoDia = new Date()
  fimDoDia.setHours(23, 59, 59, 999)

  const [itensHoje, totalWords, totalVerbs, totalEstados, streak, progresso, nivelInfo] =
    await Promise.all([
      prisma.reviewState.count({
        where: {
          itemType: { in: ["word", "verb"] },
          proximaRevisao: { lte: fimDoDia },
        },
      }),
      prisma.word.count(),
      prisma.verb.count(),
      prisma.reviewState.count({
        where: { itemType: { in: ["word", "verb"] } },
      }),
      calcularStreak(),
      getProgresso(),
      getProgressoNivel(),
    ])

  // Itens sem ReviewState ainda são "novos" e também precisam de revisão
  const itensNovos = Math.max(0, totalWords + totalVerbs - totalEstados)
  const totalParaHoje = itensHoje + itensNovos

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-blue-700">Aprender Alemão</h1>
          {nivelInfo && <NivelBadge nivel={nivelInfo.codigo} className="text-sm px-3 py-1" />}
        </div>
        <p className="text-gray-500 text-sm mb-5">Dashboard de revisão espaçada</p>

        {/* Progresso do nível atual */}
        {nivelInfo && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Nível {nivelInfo.codigo} — {nivelInfo.nome}
              </p>
              <span className="text-sm font-bold text-blue-600">{nivelInfo.percentagem}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${nivelInfo.percentagem}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {nivelInfo.itensCompletos} de {nivelInfo.totalItens} itens revistos
              {nivelInfo.podeAvancar && (
                <span className="ml-2 text-yellow-600 font-semibold">· Pronto para avançar!</span>
              )}
            </p>
          </div>
        )}

        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 gap-3 mb-6">

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              A rever hoje
            </p>
            <p className="text-4xl font-bold text-blue-600 leading-none">
              {totalParaHoje}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              de {totalWords + totalVerbs} itens totais
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Dias seguidos
            </p>
            <p className="text-4xl font-bold text-orange-500 leading-none">
              {streak}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {streak === 0
                ? "Começa hoje!"
                : streak === 1
                ? "1 dia de sequência"
                : `${streak} dias de sequência`}
            </p>
          </div>

        </div>

        {/* Botão principal */}
        {totalParaHoje > 0 ? (
          <Link
            href="/revisao"
            className="block w-full text-center py-4 px-6 rounded-2xl font-semibold text-base bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md transition-colors mb-8"
          >
            Começar revisão de hoje &rarr; {totalParaHoje} itens
          </Link>
        ) : (
          <div className="w-full text-center py-4 px-6 rounded-2xl font-semibold text-base bg-gray-100 text-gray-400 mb-8">
            Tudo revisto por hoje! Volta amanhã.
          </div>
        )}

        {/* Progresso por área */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Progresso por área</h2>

          <div className="space-y-4">
            {progresso.areasVocab.map(({ tema, total, revistos }) => (
              <BarraProgresso
                key={tema}
                label={tema}
                revistos={revistos}
                total={total}
              />
            ))}

            <div className="pt-2 border-t border-gray-100">
              <BarraProgresso
                label="Verbos"
                revistos={progresso.verbos.revistos}
                total={progresso.verbos.total}
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
