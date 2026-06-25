"use client"

import { useState } from "react"
import Link from "next/link"

const PROMPTS_ESCRITA = [
  "Escreve 4–5 frases sobre o teu fim de semana passado usando o Pretérito Perfeito (Perfekt). Inclui o que fizeste, com quem e como te sentiste.",
  "Descreve a tua rotina diária usando pelo menos 3 verbos separáveis (z.B. aufstehen, anziehen, aufräumen).",
  "Escreve um email informal a um amigo alemão a convidá-lo para visitar a tua cidade. Apresenta 2 ou 3 atrações.",
  "Descreve uma pessoa importante na tua vida: aspeto físico, personalidade e uma memória que tens com ela.",
  "Apresenta a tua cidade ou bairro: o que há para fazer, o que gostas e o que mudarias.",
  "Escreve sobre os teus planos para as próximas férias usando o futuro (werden + Infinitiv ou Präsens com marcador temporal).",
  "Conta um momento engraçado ou embaraçoso que viveste. Usa o Perfekt para narrar os acontecimentos.",
  "Descreve a tua casa ou quarto ideal: divisões, decoração e porquê esse espaço seria perfeito para ti.",
]

type Erro = {
  original: string
  correto: string
  explicacao: string
}

type Avaliacao = {
  erros: Erro[]
  correcao: string
  explicacao: string
  versaoMelhorada: string
}

const MIN = 20
const MAX = 1000

export default function EscritaClient() {
  const [promptIdx, setPromptIdx] = useState(0)
  const [texto, setTexto] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const chars = texto.length
  const podeAvaliar = chars >= MIN && chars <= MAX && !carregando

  function novoPrompt() {
    setPromptIdx(i => (i + 1) % PROMPTS_ESCRITA.length)
    setTexto("")
    setAvaliacao(null)
    setErro(null)
  }

  function reiniciar() {
    setTexto("")
    setAvaliacao(null)
    setErro(null)
  }

  async function avaliar() {
    setCarregando(true)
    setErro(null)
    setAvaliacao(null)

    try {
      const res = await fetch("/api/avaliar-escrita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? "Erro inesperado. Tenta de novo.")
      } else {
        setAvaliacao(data as Avaliacao)
      }
    } catch {
      setErro("Erro de rede. Verifica a tua ligação.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Início
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Zona de Escrita</h1>
        </div>

        {/* Prompt de escrita */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-1">
                Tema
              </p>
              <p className="text-gray-800 text-sm leading-relaxed">
                {PROMPTS_ESCRITA[promptIdx]}
              </p>
            </div>
            <button
              onClick={novoPrompt}
              className="shrink-0 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              🎲 Outro
            </button>
          </div>
        </div>

        {/* Área de escrita (oculta quando há avaliação) */}
        {!avaliacao && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Escreve aqui em alemão…"
              rows={8}
              maxLength={MAX}
              className="w-full resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span
                className={`text-xs ${
                  chars < MIN
                    ? "text-gray-400"
                    : chars > MAX
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                {chars}/{MAX} caracteres
                {chars < MIN && chars > 0 && ` (mínimo ${MIN})`}
              </span>
              <button
                onClick={avaliar}
                disabled={!podeAvaliar}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {carregando ? "A avaliar…" : "Avaliar"}
              </button>
            </div>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        {/* Resultados */}
        {avaliacao && (
          <div className="space-y-4">
            {/* Erros */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                Erros encontrados
                <span className="ml-auto text-xs font-normal bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {avaliacao.erros.length}
                </span>
              </h2>
              {avaliacao.erros.length === 0 ? (
                <p className="text-sm text-green-600 font-medium">
                  Parabéns! Nenhum erro encontrado.
                </p>
              ) : (
                <div className="space-y-3">
                  {avaliacao.erros.map((e, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="line-through text-red-500">
                          {e.original}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-green-700">
                          {e.correto}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{e.explicacao}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Texto corrigido */}
            <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                <span>✓</span> Texto corrigido
              </h2>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {avaliacao.correcao}
              </p>
            </div>

            {/* Análise */}
            <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                <span>📝</span> Análise
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {avaliacao.explicacao}
              </p>
            </div>

            {/* Versão melhorada */}
            <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-2">
                <span>✨</span> Versão melhorada
              </h2>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {avaliacao.versaoMelhorada}
              </p>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <button
                onClick={reiniciar}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Escrever de novo
              </button>
              <button
                onClick={novoPrompt}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
              >
                Novo tema
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
