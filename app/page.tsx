import Link from "next/link"

const ZONAS = [
  {
    href: "/dashboard",
    emoji: "📊",
    titulo: "Dashboard",
    desc: "Revisão de hoje, streak e progresso",
    cor: "border-blue-200 hover:border-blue-400",
  },
  {
    href: "/vocabulario",
    emoji: "📖",
    titulo: "Vocabulário",
    desc: "Flashcards der/die/das com revisão espaçada",
    cor: "border-blue-200 hover:border-blue-400",
  },
  {
    href: "/verbos",
    emoji: "🔤",
    titulo: "Verbos",
    desc: "Conjugações com raiz e prefixos destacados",
    cor: "border-purple-200 hover:border-purple-400",
  },
  {
    href: "/gramatica",
    emoji: "📐",
    titulo: "Gramática",
    desc: "Módulos com mini-exercícios interativos",
    cor: "border-yellow-200 hover:border-yellow-400",
  },
  {
    href: "/quiz",
    emoji: "🎯",
    titulo: "Quizzes",
    desc: "Produção escrita, ditado e modo intercalado",
    cor: "border-red-200 hover:border-red-400",
  },
  {
    href: "/escrita",
    emoji: "✍️",
    titulo: "Escrita",
    desc: "Escreve em alemão e recebe correção com IA",
    cor: "border-amber-200 hover:border-amber-400",
  },
  {
    href: "/fala",
    emoji: "🎙️",
    titulo: "Fala",
    desc: "Pratica pronúncia com reconhecimento de voz",
    cor: "border-teal-200 hover:border-teal-400",
  },
] as const

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-4xl font-bold text-blue-700 mb-2">Aprender Alemão 🇩🇪</h1>
      <p className="text-gray-500 mb-10 text-center">
        Revisão espaçada · Vocabulário · Verbos · Gramática · Quizzes · Áudio nativo
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl">
        {ZONAS.map(zona => (
          <Link
            key={zona.href}
            href={zona.href}
            className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all hover:shadow-md ${zona.cor}`}
          >
            <span className="text-3xl block mb-2">{zona.emoji}</span>
            <p className="font-semibold text-gray-800">{zona.titulo}</p>
            <p className="text-xs text-gray-500 mt-1">{zona.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
