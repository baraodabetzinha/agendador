import { notFound } from "next/navigation"
import Link from "next/link"
import { listSpecialists, type SpecialistSummary } from "@/lib/specialists"
import { SlotPicker } from "@/components/slot-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
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
  size?: "lg" | "md"
}) {
  const classes = size === "lg" ? "size-16 md:size-20" : "size-12"
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
        <main className="mx-auto max-w-3xl px-6 py-16">
          <BackLink />
          <h1 className="mt-4 text-3xl font-semibold">Nenhum especialista conectado ainda</h1>
          <p className="text-muted-foreground mt-2">
            Peça para um admin conectar o Google Calendar em <code>/admin</code>.
          </p>
        </main>
      )
    }
    return (
      <main className="mx-auto w-full max-w-[1280px] px-6 py-10 md:py-16">
        <BackLink />
        <header className="mt-6 mb-10 flex items-center gap-5">
          <div className="flex -space-x-3">
            {connected.slice(0, 4).map((s) => (
              <div key={s.id} className="ring-background ring-2 rounded-full">
                <SpecialistAvatar specialist={s} size="md" />
              </div>
            ))}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Agendar com qualquer especialista
            </h1>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg">
              Mostrando horários livres de {connected.map((s) => s.name).join(", ")}
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
      <main className="mx-auto max-w-3xl px-6 py-16">
        <BackLink />
        <h1 className="mt-4 text-3xl font-semibold">
          {target.name} ainda não conectou o Google
        </h1>
        <p className="text-muted-foreground mt-2">
          Peça para conectar em <code>/admin</code> e tente de novo.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-10 md:py-16">
      <BackLink />
      <header className="mt-6 mb-10 flex items-center gap-5">
        <SpecialistAvatar specialist={target} size="lg" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Agendar com {target.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-base sm:text-lg">
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
    <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1" })}>
      <ChevronLeft className="size-4" /> Voltar
    </Link>
  )
}
