import { listBookableSpecialists } from "@/lib/specialists"
import { SpecialistCarousel } from "@/components/specialist-carousel"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Selecione seu especialista — Turbo Partners",
}

export default async function SelecionarV3Page() {
  const specialists = await listBookableSpecialists()
  return <SpecialistCarousel specialists={specialists} />
}
