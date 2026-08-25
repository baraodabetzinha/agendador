import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { listBookableSpecialists, type SpecialistSummary } from "@/lib/specialists"
import { AnimatedSprite } from "@/components/animated-sprite"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Selecione seu especialista — Turbo Partners",
}

export default async function SelecionarV2Page() {
  const specialists = await listBookableSpecialists()

  return (
    <main className="bg-background min-h-[calc(100vh-4rem)]">
      {/* Top nav */}
      <div className="border-border/60 border-b">
        <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-6">
          <Image
            src="/turbo-logo.svg"
            alt="Turbo Partners"
            width={129}
            height={48}
            priority
            className="h-8 w-auto md:h-9"
          />
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[var(--color-surface-alt)]">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-primary mb-4 text-sm font-semibold tracking-wide uppercase">
              Agendamento
            </p>
            <h1 className="text-foreground text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
              Selecione o seu especialista
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed md:text-xl">
              Escolha com quem deseja conversar e encontre um horário que se encaixe
              na sua agenda. Se preferir, deixamos o sistema sortear o primeiro
              disponível.
            </p>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {specialists.map((s) => (
            <SpecialistCardV2 key={s.id} specialist={s} />
          ))}
        </div>

        {/* Any specialist */}
        {specialists.length > 0 && (
          <div className="mt-8 lg:mt-10">
            <AnyCard count={specialists.length} />
          </div>
        )}
      </section>
    </main>
  )
}

function SpecialistCardV2({ specialist }: { specialist: SpecialistSummary }) {
  const hasSprite =
    specialist.photoUrl &&
    specialist.spriteFrames &&
    specialist.spriteWidth &&
    specialist.spriteFrames > 1

  return (
    <Card className="hover:border-primary/40 flex flex-col overflow-hidden p-0 transition-colors">
      {/* Sprite area */}
      <div className="bg-[var(--color-surface-alt)] flex h-56 items-end justify-center overflow-hidden">
        {hasSprite ? (
          <AnimatedSprite
            src={specialist.photoUrl!}
            frames={specialist.spriteFrames!}
            frameWidth={specialist.spriteWidth!}
            size={192}
            fps={5}
          />
        ) : (
          <div className="text-muted-foreground flex size-32 items-center justify-center rounded-full bg-white text-3xl font-bold">
            {specialist.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="text-foreground text-2xl font-bold tracking-tight">
            {specialist.name}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">{specialist.title}</p>
        </div>

        {specialist.bio && (
          <p className="text-foreground/80 text-[15px] leading-relaxed">
            {specialist.bio}
          </p>
        )}

        {specialist.stats.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {specialist.stats.map((stat) => (
              <StatRow key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}

        {specialist.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specialist.skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="font-normal"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link
          href={`/agendar/${specialist.id}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "group shadow-primary/30 h-12 w-full justify-between text-base font-bold shadow-lg"
          )}
        >
          <span>Agendar com {specialist.name.split(" ")[0]}</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardFooter>
    </Card>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground w-24 shrink-0 text-xs font-semibold tracking-wide uppercase">
        {label}
      </span>
      <div className="bg-[var(--color-surface-alt)] relative h-1.5 flex-1 overflow-hidden rounded-full">
        <div
          className="bg-primary absolute inset-y-0 left-0 rounded-full transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-foreground w-8 shrink-0 text-right text-xs font-bold tabular-nums">
        {pct}
      </span>
    </div>
  )
}

function AnyCard({ count }: { count: number }) {
  return (
    <Card className="border-primary/30 from-secondary/40 overflow-hidden bg-gradient-to-br to-transparent p-0">
      <div className="flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
            <Sparkles className="size-6" />
          </div>
          <div>
            <h3 className="text-foreground text-xl font-bold tracking-tight md:text-2xl">
              Sem preferência? Agende com qualquer um
            </h3>
            <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed">
              O sistema mostra todos os horários livres entre os {count}{" "}
              especialistas e sorteia quem atende.
            </p>
          </div>
        </div>
        <Link
          href="/agendar/any"
          className={cn(
            buttonVariants({ size: "lg", variant: "default" }),
            "group w-full gap-2 md:w-auto"
          )}
        >
          <span>Escolher primeiro disponível</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  )
}
