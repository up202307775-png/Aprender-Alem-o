"use client"

import { useState } from "react"

interface Props {
  texto: string
  className?: string
}

export default function BotaoAudio({ texto, className = "" }: Props) {
  const [estado, setEstado] = useState<"idle" | "a_carregar" | "a_tocar">("idle")
  const [aviso, setAviso] = useState<string | null>(null)

  async function tocar() {
    if (estado !== "idle") return
    setEstado("a_carregar")
    setAviso(null)

    try {
      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      })

      if (resp.status === 503) {
        // Sem chave API configurada → fallback para Web Speech API
        const ok = await usarWebSpeech(texto)
        if (!ok) setAviso("Nenhuma voz alemã encontrada no browser.")
        setEstado("idle")
        return
      }

      if (!resp.ok) throw new Error("Falha no servidor TTS")

      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      setEstado("a_tocar")

      audio.onended = () => {
        URL.revokeObjectURL(url)
        setEstado("idle")
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        setEstado("idle")
      }
      audio.play()
    } catch {
      const ok = await usarWebSpeech(texto)
      if (!ok) setAviso("Nenhuma voz alemã encontrada no browser.")
      setEstado("idle")
    }
  }

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <button
        onClick={tocar}
        disabled={estado !== "idle"}
        title="Ouvir pronúncia alemã"
        className={`text-lg leading-none transition-opacity disabled:opacity-40 ${className}`}
      >
        {estado === "a_carregar" ? "⏳" : estado === "a_tocar" ? "🔈" : "🔊"}
      </button>
      {aviso && (
        <span className="text-xs text-orange-600 whitespace-nowrap">{aviso}</span>
      )}
    </span>
  )
}

// Fallback: usa a Web Speech API do browser, seleciona explicitamente voz alemã
async function usarWebSpeech(texto: string): Promise<boolean> {
  if (typeof window === "undefined" || !window.speechSynthesis) return false

  // Em alguns browsers as vozes carregam de forma assíncrona
  let vozes = window.speechSynthesis.getVoices()
  if (vozes.length === 0) {
    await new Promise<void>(resolve => {
      window.speechSynthesis.onvoiceschanged = () => resolve()
      setTimeout(resolve, 500) // timeout de segurança
    })
    vozes = window.speechSynthesis.getVoices()
  }

  const vozAlema = vozes.find(v => v.lang.startsWith("de"))
  if (!vozAlema) return false

  const utterance = new SpeechSynthesisUtterance(texto)
  utterance.voice = vozAlema
  utterance.lang = vozAlema.lang
  window.speechSynthesis.speak(utterance)
  return true
}
