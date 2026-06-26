"use client"

import { useState } from "react"
import Link from "next/link"
import BotaoAudio from "@/components/BotaoAudio"
import NivelBadge from "@/components/NivelBadge"

type PalavraData = {
  id: number
  alemao: string
  artigo: string
  genero: string
  raiz: string
  traducaoPt: string
  plural: string
  exemplo: string
  tema: string
  tipo: string
  nivel: string
  revisao: { id: number; repeticoes: number } | null
}

type Resultado = "errei" | "difícil" | "bom" | "fácil"

// ─── Cores por género ─────────────────────────────────────────────────────────

function coresPorArtigo(artigo: string) {
  if (artigo === "der")
    return { fundo: "bg-blue-50", borda: "border-blue-200", artigoCor: "text-blue-600", badge: "bg-blue-100 text-blue-700" }
  if (artigo === "die")
    return { fundo: "bg-red-50", borda: "border-red-200", artigoCor: "text-red-600", badge: "bg-red-100 text-red-700" }
  if (artigo === "das")
    return { fundo: "bg-green-50", borda: "border-green-200", artigoCor: "text-green-600", badge: "bg-green-100 text-green-700" }
  return { fundo: "bg-gray-50", borda: "border-gray-200", artigoCor: "text-gray-500", badge: "bg-gray-100 text-gray-600" }
}

// ─── Card de vocabulário ──────────────────────────────────────────────────────

function CartaoVocab({
  palavra,
  expandido,
  revisto,
  onToggle,
  onRevisao,
}: {
  palavra: PalavraData
  expandido: boolean
  revisto: boolean
  onToggle: () => void
  onRevisao: (resultado: Resultado) => void
}) {
  const cores = coresPorArtigo(palavra.artigo)

  return (
    <div
      className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${cores.borda} ${
        revisto ? "opacity-60 scale-95" : ""
      }`}
    >
      {/* Cabeçalho — sempre visível */}
      <div
        className={`${cores.fundo} px-4 pt-4 pb-3 cursor-pointer select-none`}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Artigo + palavra */}
            <p className={`text-sm font-semibold ${cores.artigoCor}`}>
              {palavra.artigo || " "}
            </p>
            <p className="text-xl font-bold text-gray-800 leading-tight break-words">
              {palavra.artigo ? palavra.alemao.replace(palavra.artigo + " ", "") : palavra.alemao}
            </p>

            {/* Género e raiz — SEMPRE visíveis */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {palavra.genero && palavra.genero !== "—" && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cores.badge}`}>
                  {palavra.genero}
                </span>
              )}
              {palavra.tipo === "chunk" && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
                  expressão
                </span>
              )}
              {palavra.raiz && (
                <span className="text-xs text-gray-500 italic truncate max-w-full" title={palavra.raiz}>
                  🌱 {palavra.raiz.length > 45 ? palavra.raiz.slice(0, 45) + "…" : palavra.raiz}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {palavra.nivel && <NivelBadge nivel={palavra.nivel} />}
            <BotaoAudio texto={palavra.alemao} />
            <span className="text-gray-400 text-sm">{expandido ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>

      {/* Corpo — visível ao expandir */}
      {expandido && (
        <div className="px-4 py-3 bg-white border-t border-gray-100 space-y-2">
          {/* Tradução */}
          <p className="text-base font-medium text-gray-800">{palavra.traducaoPt}</p>

          {/* Plural */}
          {palavra.plural && (
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-600">Pl:</span> {palavra.plural}
            </p>
          )}

          {/* Exemplo */}
          {palavra.exemplo && (
            <div className="flex items-start gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
              <BotaoAudio texto={palavra.exemplo} className="mt-0.5 shrink-0" />
              <p className="text-sm text-gray-600 italic">{palavra.exemplo}</p>
            </div>
          )}

          {/* Botões SR */}
          {!revisto && (
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(
                [
                  { r: "errei", label: "Errei", cls: "bg-red-100 text-red-700 hover:bg-red-200" },
                  { r: "difícil", label: "Difícil", cls: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
                  { r: "bom", label: "Bom", cls: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
                  { r: "fácil", label: "Fácil", cls: "bg-green-100 text-green-700 hover:bg-green-200" },
                ] as { r: Resultado; label: string; cls: string }[]
              ).map(({ r, label, cls }) => (
                <button
                  key={r}
                  onClick={() => onRevisao(r)}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-colors ${cls}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {revisto && (
            <p className="text-center text-sm text-green-600 font-medium pt-1">✓ Revisto</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

// Nível dominante (mais frequente) de cada tema
function nivelDominantePorTema(palavras: PalavraData[]): Map<string, string> {
  const contagens = new Map<string, Map<string, number>>()
  for (const p of palavras) {
    if (!p.tema || !p.nivel) continue
    if (!contagens.has(p.tema)) contagens.set(p.tema, new Map())
    const m = contagens.get(p.tema)!
    m.set(p.nivel, (m.get(p.nivel) ?? 0) + 1)
  }
  const resultado = new Map<string, string>()
  for (const [tema, niveis] of contagens) {
    let melhor = ""
    let max = 0
    for (const [nivel, count] of niveis) {
      if (count > max) { max = count; melhor = nivel }
    }
    resultado.set(tema, melhor)
  }
  return resultado
}

export default function VocabClient({ palavras }: { palavras: PalavraData[] }) {
  const [filtroTema, setFiltroTema] = useState("todos")
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set())
  const [revistos, setRevistos] = useState<Set<number>>(new Set())

  // Lista de temas únicos ordenada; nível dominante por tema
  const temas = ["todos", ...Array.from(new Set(palavras.map(p => p.tema).filter(Boolean))).sort()]
  const nivelPorTema = nivelDominantePorTema(palavras)

  const palavrasFiltradas =
    filtroTema === "todos" ? palavras : palavras.filter(p => p.tema === filtroTema)

  function toggleExpandido(id: number) {
    setExpandidos(prev => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  async function registarRevisao(palavra: PalavraData, resultado: Resultado) {
    setRevistos(prev => new Set(prev).add(palavra.id))
    setExpandidos(prev => {
      const novo = new Set(prev)
      novo.delete(palavra.id)
      return novo
    })

    await fetch("/api/revisao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType: "word", itemId: palavra.id, resultado }),
    })
  }

  const revistosFiltrados = palavrasFiltradas.filter(p => revistos.has(p.id)).length
  const revistosTotais = palavras.filter(p => revistos.has(p.id)).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Início</Link>
          <h1 className="text-2xl font-bold text-gray-800">Vocabulário</h1>
        </div>

        {/* Filtros por tema com badge de nível */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {temas.map(tema => {
            const nivel = tema !== "todos" ? nivelPorTema.get(tema) : undefined
            const ativo = filtroTema === tema
            return (
              <button
                key={tema}
                onClick={() => setFiltroTema(tema)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {nivel && !ativo && <NivelBadge nivel={nivel} />}
                {tema}
              </button>
            )
          })}
        </div>

        {/* Contador */}
        <p className="text-sm text-gray-500 mb-4">
          {palavrasFiltradas.length} palavras
          {revistosFiltrados > 0 && ` · ${revistosFiltrados} revistas`}
        </p>

        {/* Grid de cartões */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {palavrasFiltradas.map(palavra => (
            <CartaoVocab
              key={palavra.id}
              palavra={palavra}
              expandido={expandidos.has(palavra.id)}
              revisto={revistos.has(palavra.id)}
              onToggle={() => toggleExpandido(palavra.id)}
              onRevisao={resultado => registarRevisao(palavra, resultado)}
            />
          ))}
        </div>

        {palavrasFiltradas.length === 0 && (
          <p className="text-center text-gray-400 py-16">Nenhuma palavra neste tema.</p>
        )}

        {/* Botão Quiz do Dia — aparece quando há palavras revistas nesta sessão */}
        {revistosTotais > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/quiz-diario"
              className="block w-full text-center py-4 px-4 rounded-2xl font-semibold text-base bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm"
            >
              🎯 Fazer Quiz do Dia &rarr; {revistosTotais} palavras revistas
            </Link>
            <p className="text-center text-xs text-gray-400 mt-2">
              Testa o que aprendeste hoje — PT → alemão
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
