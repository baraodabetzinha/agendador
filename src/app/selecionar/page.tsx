import { listSpecialists } from "@/lib/specialists"
import { FighterSelect } from "@/components/fighter-select"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Select your fighter — Agendador",
}

export default async function SelecionarPage() {
  const specialists = await listSpecialists()
  return <FighterSelect specialists={specialists} />
}
