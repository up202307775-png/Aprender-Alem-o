"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type Turno = { papel: string; texto: string; traducao: string }
type Cenario = { id: number; titulo: string; turnos: Turno[] }
type AvaliacaoFala = { precisao: number; sugestoes: string[]; explicacao: string }
type HistoricoTurno = { transcricao: string; avaliacao: AvaliacaoFala | null }
type Fase = "aguardar" | "gravar" | "avaliar" | "mostrar"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizarPalavras(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[.,!?;:»«„""']/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function compararPalavras(alvo: string, transcricao: string) {
  const palavrasAlvo = alvo.split(/\s+/).filter(Boolean)
  const normAlvo = normalizarPalavras(alvo)
  const normTransc = normalizarPalavras(transcricao)
  return palavrasAlvo.map((palavra, i) => ({
    palavra,
    correto: normTransc[i] === normAlvo[i],
  }))
}

// ─── Selecção de cenários ─────────────────────────────────────────────────────

function SelecaoCenarios({
  cenarios,
  onSelecionar,
}: {
  cenarios: Cenario[]
  onSelecionar: (c: Cenario) => void
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Início
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Zona de Fala</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Escolhe um cenário para praticar a pronúncia com reconhecimento de voz (🎙️).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cenarios.map(c => {
            const tuCount = c.turnos.filter(t => t.papel === "Tu").length
            return (
              <button
                key={c.id}
                onClick={() => onSelecionar(c)}
                className="bg-white rounded-2xl border-2 border-gray-200 hover:border-teal-400 p-5 text-left shadow-sm hover:shadow-md transition-all"
              >
                <p className="font-semibold text-gray-800 mb-1">{c.titulo}</p>
                <p className="text-xs text-gray-400">
                  {c.turnos.length} turnos · {tuCount} para praticar
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Bolha de histórico ───────────────────────────────────────────────────────

function BolhaHistorico({
  turno,
  resultado,
}: {
  turno: Turno
  resultado: HistoricoTurno | undefined
}) {
  const ehTu = turno.papel === "Tu"
  return (
    <div className={`flex ${ehTu ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          ehTu
            ? "bg-teal-600 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
        }`}
      >
        {!ehTu && (
          <p className="text-xs font-semibold mb-1 text-gray-400 uppercase tracking-wide">
            {turno.papel}
          </p>
        )}
        <p className="font-medium leading-snug">{turno.texto}</p>
        <p className={`text-xs mt-1 ${ehTu ? "text-teal-100" : "text-gray-400"}`}>
          {turno.traducao}
        </p>
        {ehTu && resultado?.transcricao && (
          <p className="text-xs mt-1.5 text-teal-200 italic">
            🎙 &ldquo;{resultado.transcricao}&rdquo;
            {resultado.avaliacao ? ` · ${resultado.avaliacao.precisao}%` : ""}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Turno de contexto (não é "Tu") ──────────────────────────────────────────

function TurnoContexto({
  turno,
  onOuvir,
  onProximo,
}: {
  turno: Turno
  onOuvir: () => void
  onProximo: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
        {turno.papel} diz:
      </p>
      <p className="text-lg font-semibold text-gray-800 leading-snug">{turno.texto}</p>
      <p className="text-sm text-gray-500 mt-1 mb-4">{turno.traducao}</p>
      <div className="flex gap-2">
        <button
          onClick={onOuvir}
          className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          🔊 Ouvir
        </button>
        <button
          onClick={onProximo}
          className="ml-auto px-4 py-2 rounded-xl bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}

// ─── Diff palavra a palavra ───────────────────────────────────────────────────

function DiffPalavras({ alvo, transcricao }: { alvo: string; transcricao: string }) {
  const diff = compararPalavras(alvo, transcricao)
  return (
    <div className="flex flex-wrap gap-1.5">
      {diff.map((d, i) => (
        <span
          key={i}
          className={`px-2 py-0.5 rounded-lg text-sm font-medium ${
            d.correto
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600 line-through"
          }`}
        >
          {d.palavra}
        </span>
      ))}
    </div>
  )
}

// ─── Turno de prática ("Tu") ──────────────────────────────────────────────────

function TurnoPratica({
  turno,
  fase,
  transcricao,
  avaliacao,
  erroApi,
  suporte,
  onOuvir,
  onGravar,
  onParar,
  onProximo,
}: {
  turno: Turno
  fase: Fase
  transcricao: string
  avaliacao: AvaliacaoFala | null
  erroApi: string | null
  suporte: boolean | null
  onOuvir: () => void
  onGravar: () => void
  onParar: () => void
  onProximo: () => void
}) {
  return (
    <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-5 space-y-4">
      {/* Frase alvo */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-teal-600 mb-1.5">
          A tua vez — diz em voz alta:
        </p>
        <p className="text-xl font-semibold text-gray-800 leading-snug">{turno.texto}</p>
        <p className="text-sm text-teal-700 mt-1">{turno.traducao}</p>
      </div>

      {/* Controlos — fase aguardar */}
      {fase === "aguardar" && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onOuvir}
            className="px-4 py-2 rounded-xl bg-white border border-teal-200 text-teal-700 text-sm font-medium hover:bg-teal-50 transition-colors"
          >
            🔊 Ouvir
          </button>
          {suporte === true && (
            <button
              onClick={onGravar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              🎙️ Falar
            </button>
          )}
          {suporte === false && (
            <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
              Reconhecimento de voz não disponível neste navegador
            </span>
          )}
          {erroApi && fase === "aguardar" && (
            <p className="w-full text-xs text-red-500 mt-1">{erroApi}</p>
          )}
        </div>
      )}

      {/* Gravação em curso */}
      {fase === "gravar" && (
        <div className="flex items-center gap-3">
          <span className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-red-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
          <span className="text-sm text-red-600 font-medium">A gravar…</span>
          <button
            onClick={onParar}
            className="ml-auto px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors"
          >
            Parar
          </button>
        </div>
      )}

      {/* A processar */}
      {fase === "avaliar" && (
        <p className="text-sm text-teal-600 animate-pulse">A analisar pronúncia…</p>
      )}

      {/* Resultados */}
      {fase === "mostrar" && (
        <div className="space-y-3">
          {/* Transcrição + diff */}
          <div className="bg-white rounded-xl p-3 border border-teal-100">
            <p className="text-xs text-gray-500 mb-2">
              Transcrição:{" "}
              <span className="italic text-gray-700">&ldquo;{transcricao}&rdquo;</span>
            </p>
            <DiffPalavras alvo={turno.texto} transcricao={transcricao} />
          </div>

          {/* Erro API */}
          {erroApi && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {erroApi}
            </p>
          )}

          {/* Feedback Claude */}
          {avaliacao && (
            <div className="bg-white rounded-xl p-4 border border-teal-100 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-teal-700">Precisão:</span>
                <span
                  className={`text-sm font-semibold ${
                    avaliacao.precisao >= 80
                      ? "text-green-600"
                      : avaliacao.precisao >= 55
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {avaliacao.precisao}%
                </span>
              </div>
              {avaliacao.sugestoes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Sugestões
                  </p>
                  <ul className="space-y-1">
                    {avaliacao.sugestoes.map((s, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                        <span className="text-teal-500 shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-gray-600 italic leading-relaxed">
                {avaliacao.explicacao}
              </p>
            </div>
          )}

          <button
            onClick={onProximo}
            className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Próximo →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Ecrã final ───────────────────────────────────────────────────────────────

function Fim({
  cenario,
  historico,
  onReiniciar,
}: {
  cenario: Cenario
  historico: Record<number, HistoricoTurno>
  onReiniciar: () => void
}) {
  const tuTurnos = cenario.turnos
    .map((t, i) => ({ ...t, idx: i }))
    .filter(t => t.papel === "Tu")

  const precisoes = tuTurnos
    .map(t => historico[t.idx]?.avaliacao?.precisao)
    .filter((p): p is number => p !== undefined)

  const media =
    precisoes.length > 0
      ? Math.round(precisoes.reduce((a, b) => a + b, 0) / precisoes.length)
      : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center space-y-4">
        <p className="text-4xl">🎉</p>
        <h2 className="text-xl font-bold text-gray-800">Cenário concluído!</h2>
        <p className="text-sm text-gray-500">{cenario.titulo}</p>
        {media !== null && (
          <p
            className={`text-3xl font-bold ${
              media >= 80
                ? "text-green-600"
                : media >= 55
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {media}% média
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onReiniciar}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Outros cenários
          </button>
          <Link
            href="/"
            className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors text-center"
          >
            Início
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FalaClient({ cenarios }: { cenarios: Cenario[] }) {
  const [cenario, setCenario] = useState<Cenario | null>(null)
  const [turnoIdx, setTurnoIdx] = useState(0)
  const [fase, setFase] = useState<Fase>("aguardar")
  const [transcricao, setTranscricao] = useState("")
  const [avaliacao, setAvaliacao] = useState<AvaliacaoFala | null>(null)
  const [historico, setHistorico] = useState<Record<number, HistoricoTurno>>({})
  const [suporte, setSuporte] = useState<boolean | null>(null)
  const [erroApi, setErroApi] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const faseRef = useRef<Fase>("aguardar")

  useEffect(() => {
    setSuporte(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    )
  }, [])

  useEffect(() => {
    faseRef.current = fase
  }, [fase])

  function iniciarCenario(c: Cenario) {
    setCenario(c)
    setTurnoIdx(0)
    setFase("aguardar")
    setTranscricao("")
    setAvaliacao(null)
    setHistorico({})
    setErroApi(null)
  }

  function avancar() {
    if (!cenario) return
    const turnoAtual = cenario.turnos[turnoIdx]
    if (turnoAtual.papel === "Tu") {
      setHistorico(prev => ({
        ...prev,
        [turnoIdx]: { transcricao, avaliacao },
      }))
    }
    setFase("aguardar")
    setTranscricao("")
    setAvaliacao(null)
    setErroApi(null)
    setTurnoIdx(i => i + 1)
  }

  async function ouvirTTS(texto: string) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      })
      if (!res.ok) throw new Error("sem_audio")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => URL.revokeObjectURL(url)
      audio.play()
    } catch {
      const utt = new SpeechSynthesisUtterance(texto)
      utt.lang = "de-DE"
      window.speechSynthesis.speak(utt)
    }
  }

  async function gravarVoz(alvo: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR()
    recognition.lang = "de-DE"
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition

    setFase("gravar")
    setErroApi(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = async (e: any) => {
      const texto: string = e.results[0][0].transcript
      setTranscricao(texto)
      setFase("avaliar")

      try {
        const res = await fetch("/api/avaliar-fala", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alvo, transcricao: texto }),
        })
        const data = await res.json()
        if (!res.ok) {
          setErroApi(data.error ?? "Erro ao avaliar pronúncia.")
        } else {
          setAvaliacao(data as AvaliacaoFala)
        }
      } catch {
        setErroApi("Erro de rede ao avaliar.")
      }
      setFase("mostrar")
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      setFase("aguardar")
      const msgs: Record<string, string> = {
        "no-speech": "Não detetei voz. Fala mais perto do microfone e tenta de novo.",
        "not-allowed": "Acesso ao microfone bloqueado. Autoriza nas definições do navegador.",
        "network": "Erro de rede no reconhecimento de voz.",
      }
      setErroApi(msgs[e.error as string] ?? `Erro: ${String(e.error)}`)
    }

    recognition.onend = () => {
      if (faseRef.current === "gravar") setFase("aguardar")
    }

    recognition.start()
  }

  function pararGravacao() {
    recognitionRef.current?.stop()
    setFase("aguardar")
  }

  // ── Ecrã de selecção ────────────────────────────────────────────────────────
  if (!cenario) {
    return <SelecaoCenarios cenarios={cenarios} onSelecionar={iniciarCenario} />
  }

  const turnos = cenario.turnos

  // ── Ecrã final ──────────────────────────────────────────────────────────────
  if (turnoIdx >= turnos.length) {
    return (
      <Fim cenario={cenario} historico={historico} onReiniciar={() => setCenario(null)} />
    )
  }

  const turnoAtual = turnos[turnoIdx]
  const ehTu = turnoAtual.papel === "Tu"

  // ── Ecrã de prática ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCenario(null)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Cenários
          </button>
          <h1 className="text-xl font-bold text-gray-800">{cenario.titulo}</h1>
          <span className="ml-auto text-xs text-gray-400">
            {turnoIdx + 1}/{turnos.length}
          </span>
        </div>

        {/* Aviso de suporte */}
        {suporte === false && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
            O teu navegador não suporta reconhecimento de voz. Para funcionalidade completa, usa o Chrome ou o Edge.
          </div>
        )}

        {/* Histórico de turnos já feitos */}
        {turnoIdx > 0 && (
          <div className="space-y-3 mb-4">
            {turnos.slice(0, turnoIdx).map((t, i) => (
              <BolhaHistorico key={i} turno={t} resultado={historico[i]} />
            ))}
          </div>
        )}

        {/* Turno activo */}
        {ehTu ? (
          <TurnoPratica
            turno={turnoAtual}
            fase={fase}
            transcricao={transcricao}
            avaliacao={avaliacao}
            erroApi={erroApi}
            suporte={suporte}
            onOuvir={() => ouvirTTS(turnoAtual.texto)}
            onGravar={() => gravarVoz(turnoAtual.texto)}
            onParar={pararGravacao}
            onProximo={avancar}
          />
        ) : (
          <TurnoContexto
            turno={turnoAtual}
            onOuvir={() => ouvirTTS(turnoAtual.texto)}
            onProximo={avancar}
          />
        )}
      </div>
    </div>
  )
}
