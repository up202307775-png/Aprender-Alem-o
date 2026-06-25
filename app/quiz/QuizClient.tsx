"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type PalavraData = {
  id: number; alemao: string; artigo: string; genero: string
  raiz: string; traducaoPt: string; exemplo: string; tema: string
}
type VerbData = {
  id: number; infinitivo: string; traducaoPt: string; raiz: string
  irregular: boolean
  conjugacoes: { prasens: Record<string, string>; prateritum: Record<string, string>; perfekt: string }
}
type ExercicioMC = { id: number; pergunta: string; opcoes: string[]; resposta: string; explicacao: string }

type Questao = {
  id: string
  enunciado: string
  resposta: string      // lowercase, trimmed — usado para comparar
  explicacao: string    // pode conter **negrito**
  tipo: "texto" | "multipla"
  categoria: "producao" | "ditado" | "conjugacao" | "gramatica"
  audioTexto?: string
  opcoes?: string[]
}

type ModoQuiz = "producao" | "ditado" | "intercalado"

// ─── Auxiliares ───────────────────────────────────────────────────────────────

function embaralhar<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function normalizar(s: string): string {
  return s.trim().toLowerCase()
}

function renderInline(texto: string): React.ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

async function tocarTTS(texto: string) {
  try {
    const resp = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    })
    if (resp.status === 503) {
      const vozes = window.speechSynthesis.getVoices()
      const voz = vozes.find(v => v.lang.startsWith("de"))
      if (voz) {
        const u = new SpeechSynthesisUtterance(texto)
        u.voice = voz
        window.speechSynthesis.speak(u)
      }
      return
    }
    if (!resp.ok) return
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => URL.revokeObjectURL(url)
    audio.play()
  } catch { /* sem áudio não quebra o quiz */ }
}

// ─── Geradores de questões ────────────────────────────────────────────────────

function gerarQuestoes(
  modo: ModoQuiz,
  palavras: PalavraData[],
  verbos: VerbData[],
  exerciciosMC: ExercicioMC[]
): Questao[] {
  const qPalavras = (n: number): Questao[] =>
    embaralhar(
      palavras.map(p => ({
        id: `p-${p.id}`,
        categoria: "producao" as const,
        tipo: "texto" as const,
        enunciado: `Como se diz em alemão: "${p.traducaoPt}"?`,
        resposta: normalizar(p.alemao),
        explicacao: [
          `**${p.alemao}**`,
          p.artigo ? `artigo ${p.artigo}` : "",
          p.genero && p.genero !== "—" ? `género ${p.genero}` : "",
          p.raiz ? `raiz: ${p.raiz.split(",")[0].slice(0, 60)}` : "",
        ].filter(Boolean).join(" — "),
        audioTexto: p.alemao,
      }))
    ).slice(0, n)

  const qDitado = (n: number): Questao[] =>
    embaralhar([
      ...palavras.map(p => ({
        id: `d-${p.id}`,
        categoria: "ditado" as const,
        tipo: "texto" as const,
        enunciado: "Escreve o que ouves:",
        resposta: normalizar(p.alemao),
        explicacao: `**${p.alemao}** — ${p.traducaoPt}`,
        audioTexto: p.alemao,
      })),
      ...verbos.map(v => ({
        id: `dv-${v.id}`,
        categoria: "ditado" as const,
        tipo: "texto" as const,
        enunciado: "Escreve o infinitivo que ouves:",
        resposta: normalizar(v.infinitivo),
        explicacao: `**${v.infinitivo}** — ${v.traducaoPt}`,
        audioTexto: v.infinitivo,
      })),
    ]).slice(0, n)

  const qConjugacao = (n: number): Questao[] =>
    embaralhar(
      verbos.flatMap(v =>
        ["ich", "er"].map(p => ({
          id: `c-${v.id}-${p}`,
          categoria: "conjugacao" as const,
          tipo: "texto" as const,
          enunciado: `Conjuga **${v.infinitivo}** no Präsens — ${p === "er" ? "er/sie/es" : p}:`,
          resposta: normalizar(v.conjugacoes.prasens[p] ?? ""),
          explicacao: `${p === "er" ? "er/sie/es" : p} **${v.conjugacoes.prasens[p] ?? "—"}** (${v.irregular ? "irregular" : "regular"}, raiz: ${v.raiz})`,
          audioTexto: v.conjugacoes.prasens[p],
        }))
      )
    ).slice(0, n)

  const qGramatica = (n: number): Questao[] =>
    embaralhar(
      exerciciosMC.map(e => ({
        id: `g-${e.id}`,
        categoria: "gramatica" as const,
        tipo: "multipla" as const,
        enunciado: e.pergunta,
        resposta: normalizar(e.resposta),
        explicacao: e.explicacao,
        opcoes: e.opcoes,
      }))
    ).slice(0, n)

  switch (modo) {
    case "producao":   return qPalavras(10)
    case "ditado":     return qDitado(10)
    case "intercalado": return embaralhar([...qPalavras(5), ...qConjugacao(3), ...qGramatica(2)])
  }
}

// ─── Ecrã de seleção de modo ──────────────────────────────────────────────────

const MODOS: { id: ModoQuiz; emoji: string; titulo: string; desc: string }[] = [
  { id: "producao",    emoji: "✍️",  titulo: "Produção Escrita",
    desc: "Traduz para alemão e escreve com artigo" },
  { id: "ditado",      emoji: "🎧",  titulo: "Ditado",
    desc: "Ouve o áudio e escreve o que ouves" },
  { id: "intercalado", emoji: "🔀",  titulo: "Intercalado",
    desc: "Mix de vocabulário, verbos e gramática" },
]

function EcraSelecao({ onSelect }: { onSelect: (m: ModoQuiz) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Início</Link>
        <h1 className="text-2xl font-bold text-gray-800">Quizzes</h1>
      </div>
      {MODOS.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className="w-full text-left bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 p-5 transition-all hover:shadow-md"
        >
          <span className="text-3xl block mb-2">{m.emoji}</span>
          <p className="font-semibold text-gray-800">{m.titulo}</p>
          <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
        </button>
      ))}
    </div>
  )
}

// ─── Ecrã de resultados ───────────────────────────────────────────────────────

function EcraResultados({
  acertos, total, tipoQuiz, onReset,
}: { acertos: number; total: number; tipoQuiz: string; onReset: () => void }) {
  const pct = Math.round((acertos / total) * 100)
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"

  return (
    <div className="text-center py-8">
      <p className="text-6xl mb-4">{emoji}</p>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{acertos}/{total} corretos</h2>
      <p className="text-gray-500 mb-2">{pct}% de acerto · Quiz: {tipoQuiz}</p>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden w-48 mx-auto mb-8">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Jogar de novo
        </button>
        <Link href="/" className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Início
        </Link>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function QuizClient({
  palavras, verbos, exerciciosMC,
}: { palavras: PalavraData[]; verbos: VerbData[]; exerciciosMC: ExercicioMC[] }) {
  const [modo, setModo] = useState<ModoQuiz | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [indice, setIndice] = useState(0)
  const [input, setInput] = useState("")
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null)
  const [resultado, setResultado] = useState<"correto" | "errado" | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [terminado, setTerminado] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const questaoAtual = questoes[indice]

  // Auto-toca no modo ditado quando a questão muda e ainda não foi respondida
  useEffect(() => {
    if (modo !== "ditado" || !questaoAtual?.audioTexto || resultado !== null) return
    const t = setTimeout(() => tocarTTS(questaoAtual.audioTexto!), 300)
    return () => clearTimeout(t)
  }, [indice, modo]) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus no input quando surge nova questão
  useEffect(() => {
    if (questaoAtual?.tipo === "texto" && resultado === null) {
      inputRef.current?.focus()
    }
  }, [indice, resultado])

  async function salvarPontuacao(acertosFinais: number, totalQs: number) {
    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoQuiz: modo ?? "quiz",
        pontuacao: Math.round((acertosFinais / totalQs) * 100),
      }),
    })
  }

  function iniciar(m: ModoQuiz) {
    const qs = gerarQuestoes(m, palavras, verbos, exerciciosMC)
    setModo(m)
    setQuestoes(qs)
    setIndice(0)
    setInput("")
    setOpcaoSelecionada(null)
    setResultado(null)
    setAcertos(0)
    setTerminado(false)
  }

  function confirmar(resposta: string) {
    const acertou = normalizar(resposta) === questaoAtual.resposta
    if (acertou) setAcertos(a => a + 1)
    setResultado(acertou ? "correto" : "errado")
    setOpcaoSelecionada(resposta)
  }

  async function proxima() {
    const isUltima = indice === questoes.length - 1
    if (isUltima) {
      const totalAcertos = acertos + (resultado === "correto" ? 0 : 0) // already incremented
      await salvarPontuacao(acertos, questoes.length)
      setTerminado(true)
    } else {
      setIndice(i => i + 1)
      setInput("")
      setOpcaoSelecionada(null)
      setResultado(null)
    }
  }

  function resetar() {
    setModo(null)
    setTerminado(false)
  }

  // ── Render ──

  if (!modo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-8">
          <EcraSelecao onSelect={iniciar} />
        </div>
      </div>
    )
  }

  if (terminado) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-8">
          <EcraResultados acertos={acertos} total={questoes.length} tipoQuiz={modo} onReset={resetar} />
        </div>
      </div>
    )
  }

  const modoLabel = MODOS.find(m => m.id === modo)?.titulo ?? modo

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={resetar} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Modos
          </button>
          <span className="text-sm text-gray-500 font-medium">{modoLabel}</span>
          <span className="text-sm text-gray-400">{indice + 1}/{questoes.length}</span>
        </div>

        {/* Barra de progresso */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((indice + (resultado !== null ? 1 : 0)) / questoes.length) * 100}%` }}
          />
        </div>

        {/* Cartão da questão */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">

          {/* Badge de categoria */}
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-3 ${
            questaoAtual.categoria === "producao" ? "bg-blue-100 text-blue-700" :
            questaoAtual.categoria === "ditado" ? "bg-purple-100 text-purple-700" :
            questaoAtual.categoria === "conjugacao" ? "bg-orange-100 text-orange-700" :
            "bg-green-100 text-green-700"
          }`}>
            {questaoAtual.categoria}
          </span>

          {/* Enunciado */}
          <p className="text-base font-medium text-gray-800 mb-4">
            {renderInline(questaoAtual.enunciado)}
          </p>

          {/* Botão de repetir áudio (ditado) */}
          {questaoAtual.audioTexto && modo === "ditado" && (
            <button
              onClick={() => tocarTTS(questaoAtual.audioTexto!)}
              className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              🔊 Ouvir de novo
            </button>
          )}

          {/* Input de texto */}
          {questaoAtual.tipo === "texto" && resultado === null && (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && input.trim() && confirmar(input)}
                placeholder="Escreve a tua resposta…"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={() => input.trim() && confirmar(input)}
                disabled={!input.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                OK
              </button>
            </div>
          )}

          {/* Opções de múltipla escolha */}
          {questaoAtual.tipo === "multipla" && resultado === null && (
            <div className="space-y-2">
              {questaoAtual.opcoes?.map(op => (
                <button
                  key={op}
                  onClick={() => confirmar(op)}
                  className="w-full text-left px-4 py-2.5 rounded-xl border border-gray-200 text-sm hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {op}
                </button>
              ))}
            </div>
          )}

          {/* Feedback */}
          {resultado !== null && (
            <div className={`rounded-xl p-3.5 mt-2 ${resultado === "correto" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`font-semibold text-sm ${resultado === "correto" ? "text-green-700" : "text-red-700"}`}>
                  {resultado === "correto" ? "✓ Correto!" : "✗ Errado"}
                </span>
                {resultado === "errado" && (
                  <span className="text-sm text-gray-700">
                    Resposta: <span className="font-semibold">{questaoAtual.opcoes
                      ? questaoAtual.opcoes.find(o => normalizar(o) === questaoAtual.resposta) ?? questaoAtual.resposta
                      : questaoAtual.resposta}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">{renderInline(questaoAtual.explicacao)}</p>
            </div>
          )}
        </div>

        {/* Botão Próxima */}
        {resultado !== null && (
          <button
            onClick={proxima}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {indice === questoes.length - 1 ? "Ver resultados →" : "Próxima →"}
          </button>
        )}
      </div>
    </div>
  )
}
