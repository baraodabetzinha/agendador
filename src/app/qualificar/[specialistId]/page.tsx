import { notFound } from "next/navigation"
import { listSpecialists } from "@/lib/specialists"
import { QualifierFlow } from "@/components/qualifier-flow"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Liberando seu Golden Ticket — Turbo Partners",
}

export default async function QualificarPage({
  params,
}: {
  params: Promise<{ specialistId: string }>
}) {
  const { specialistId } = await params
  const all = await listSpecialists()
  const isAny = specialistId === "any"
  const target = isAny ? null : all.find((s) => s.id === specialistId)
  if (!isAny && !target) notFound()

  return (
    <QualifierFlow
      specialistId={specialistId}
      specialistName={isAny ? "qualquer um" : target!.name}
      specialistTitle={isAny ? "Sorteio aleatório" : target!.title}
    />
  )
}
