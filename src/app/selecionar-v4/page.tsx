import { listSpecialists } from "@/lib/specialists"
import { FighterSelectV4 } from "@/components/fighter-select-v4"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Selecione seu especialista — Turbo Partners",
}

export default async function SelecionarV4Page() {
  const specialists = await listSpecialists()
  return <FighterSelectV4 specialists={specialists} />
}
