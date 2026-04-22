import { notFound } from "next/navigation"
import { listSpecialists } from "@/lib/specialists"
import { BookingForm } from "@/components/booking-form"
import { formatDateTime } from "@/lib/time"

export const dynamic = "force-dynamic"

export default async function ConfirmarPage({
  params,
  searchParams,
}: {
  params: Promise<{ specialistId: string }>
  searchParams: Promise<{ slot?: string; candidates?: string }>
}) {
  const { specialistId } = await params
  const { slot, candidates } = await searchParams

  if (!slot) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="text-2xl font-semibold">Sessão inválida</h1>
        <p className="text-muted-foreground mt-2">Volte e escolha um horário novamente.</p>
      </main>
    )
  }
  const slotDate = new Date(slot)
  if (isNaN(slotDate.getTime())) notFound()

  const all = await listSpecialists()
  const isAny = specialistId === "any"
  const target = isAny ? null : all.find((s) => s.id === specialistId)
  if (!isAny && !target) notFound()

  const heading = isAny ? "Qualquer especialista" : target!.name
  const subheading = isAny
    ? "Vamos escolher entre os disponíveis quando confirmar."
    : target!.title

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-10 md:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Confirmar agendamento</h1>
        <p className="text-muted-foreground mt-2">
          {heading} · {subheading}
        </p>
        <div className="border-primary/20 bg-primary/5 mt-5 rounded-xl border px-4 py-3 text-sm">
          <span className="mr-1">📅</span>
          {formatDateTime(slotDate)}
        </div>
      </header>

      <BookingForm
        specialistId={specialistId}
        slot={slot}
        candidates={candidates ? candidates.split(",").filter(Boolean) : undefined}
      />
    </main>
  )
}
