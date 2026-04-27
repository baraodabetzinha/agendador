import { notFound } from "next/navigation"
import Link from "next/link"
import { listSpecialists, type SpecialistSummary } from "@/lib/specialists"
import { SlotPicker } from "@/components/slot-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft } from "lucide-react"

export const dynamic = "force-dynamic"

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function SpecialistAvatar({
  specialist,
  size = "lg",
}: {
  specialist: SpecialistSummary
  size?: "lg" | "md" | "sm"
}) {
  const classes =
    size === "lg"
      ? "size-12 md:size-16"
      : size === "md"
        ? "size-10"
        : "size-9"
  return (
    <Avatar className={classes}>
      {specialist.googlePicture ? (
        <AvatarImage src={specialist.googlePicture} alt={specialist.name} />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {initials(specialist.name)}
      </AvatarFallback>
    </Avatar>
  )
}

export default async function AgendarPage({
  params,
}: {
  params: Promise<{ specialistId: string }>
}) {
  const { specialistId } = await params
  const all = await listSpecialists()

  if (specialistId === "any") {
    const connected = all.filter((s) => s.isConnected)
    if (connected.length === 0) {
      return (
        <main className="mx-auto max-w-3xl px-5 py-10">
          <BackLink />
          <h1 className="mt-4 text-2xl font-semibold">
            Nenhum especialista conectado ainda
          </h1>
          <p className="text-muted-foreground mt-2">
            Peça para um admin conectar o Google Calendar em <code>/admin</code>.
          </p>
        </main>
      )
    }
    return (
      <main className="mx-auto w-full max-w-[1280px] px-5 pt-3 pb-8 sm:px-6 md:py-10">
        <BackLink />
        <header className="mt-3 mb-5 flex items-center gap-3 md:mt-6 md:mb-8 md:gap-4">
          <div className="flex -space-x-2">
            {connected.slice(0, 3).map((s) => (
              <div key={s.id} className="ring-background ring-2 rounded-full">
                <SpecialistAvatar specialist={s} size="sm" />
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight sm:text-2xl md:text-3xl">
              Escolha um horário
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Mostrando horários de {connected.map((s) => s.name).join(", ")}
            </p>
          </div>
        </header>
        <SlotPicker specialistId={specialistId} />
      </main>
    )
  }

  const target = all.find((s) => s.id === specialistId)
  if (!target) notFound()
  if (!target.isConnected) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <BackLink />
        <h1 className="mt-4 text-2xl font-semibold">
          {target.name} ainda não conectou o Google
        </h1>
        <p className="text-muted-foreground mt-2">
          Peça para conectar em <code>/admin</code> e tente de novo.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pt-3 pb-8 sm:px-6 md:py-10">
      <BackLink />
      <header className="mt-3 mb-5 flex items-center gap-3 md:mt-6 md:mb-8 md:gap-4">
        <SpecialistAvatar specialist={target} size="md" />
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight sm:text-2xl md:text-3xl">
            Escolha um horário com {target.name}
          </h1>
          <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
            {target.title}
          </p>
        </div>
      </header>

      <SlotPicker specialistId={specialistId} />
    </main>
  )
}

function BackLink() {
  return (
    <Link
      href="/selecionar"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
    >
      <ChevronLeft className="size-4" /> Voltar
    </Link>
  )
}
