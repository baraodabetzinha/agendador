import Link from "next/link"
import { Gamepad2 } from "lucide-react"
import { listSpecialists } from "@/lib/specialists"
import { SpecialistCard, AnySpecialistCard } from "@/components/specialist-card"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const specialists = await listSpecialists()

  return (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-10 md:py-16">
      <header className="mb-12 md:mb-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-primary border-primary/20 bg-primary/5 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase">
            <span className="bg-primary size-1.5 rounded-full" />
            Reuniões 1:1
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Agende uma conversa
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base sm:text-lg">
            Escolha um especialista pelas skills ou deixe que a gente encaixa com quem estiver disponível primeiro.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/selecionar"
              className="group text-primary hover:text-primary/80 inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.25em] uppercase transition-colors"
            >
              <Gamepad2 className="size-4" />
              <span className="underline-offset-4 group-hover:underline">
                Modo arcade · select your fighter
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {specialists.map((s) => (
          <SpecialistCard key={s.id} specialist={s} />
        ))}
        <AnySpecialistCard specialists={specialists} />
      </div>
    </main>
  )
}
