const CORES: Record<string, string> = {
  A1: "bg-green-100 text-green-800",
  A2: "bg-teal-100 text-teal-800",
  B1: "bg-blue-100 text-blue-800",
  B2: "bg-indigo-100 text-indigo-800",
  C1: "bg-purple-100 text-purple-800",
  C2: "bg-red-100 text-red-800",
}

export default function NivelBadge({ nivel, className = "" }: { nivel: string; className?: string }) {
  const cor = CORES[nivel] ?? "bg-gray-100 text-gray-600"
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${cor} ${className}`}>
      {nivel}
    </span>
  )
}
