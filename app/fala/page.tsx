import { prisma } from "@/lib/prisma"
import FalaClient from "./FalaClient"

type Turno = { papel: string; texto: string; traducao: string }

export default async function FalaPage() {
  const cenarios = await prisma.scenario.findMany({ orderBy: { id: "asc" } })

  const dados = cenarios.map(c => ({
    id: c.id,
    titulo: c.titulo,
    turnos: JSON.parse(c.turnos) as Turno[],
  }))

  return <FalaClient cenarios={dados} />
}
