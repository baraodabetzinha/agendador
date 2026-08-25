"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { AnimatedSprite } from "@/components/animated-sprite"
import { RotatingSprite } from "@/components/rotating-sprite"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SpecialistSummary } from "@/lib/specialists"

type Slot = {
  id: string
  name: string
  title: string
  bio: string | null
  stats: Array<{ label: string; value: number }>
  skills: string[]
  spriteUrl: string | null
  spriteFrames: number | null
  spriteWidth: number | null
  rotationUrl: string | null
  rotationFrames: number | null
  rotationWidth: number | null
  isMystery: boolean
}

export function SpecialistCarousel({
  specialists,
}: {
  specialists: SpecialistSummary[]
}) {
  const slots: Slot[] = React.useMemo(() => {
    const list: Slot[] = specialists.map((sp) => ({
      id: sp.id,
      name: sp.name,
      title: sp.title,
      bio: sp.bio,
      stats: sp.stats,
      skills: sp.skills,
      spriteUrl: sp.photoUrl,
      spriteFrames: sp.spriteFrames,
      spriteWidth: sp.spriteWidth,
      rotationUrl: sp.rotationUrl,
      rotationFrames: sp.rotationFrames,
      rotationWidth: sp.rotationWidth,
      isMystery: false,
    }))
    list.push({
      id: "any",
      name: "Qualquer um",
      title: "Primeiro especialista disponível",
      bio: "O sistema mostra todos os horários livres entre os especialistas e sorteia quem atende.",
      stats: [
        { label: "ENCAIXE", value: 99 },
        { label: "AGILIDADE", value: 95 },
        { label: "ROTAÇÃO", value: 92 },
        { label: "FLEX", value: 90 },
      ],
      skills: ["Encaixe rápido", "Rotação justa"],
      spriteUrl: null,
      spriteFrames: null,
      spriteWidth: null,
      rotationUrl: null,
      rotationFrames: null,
      rotationWidth: null,
      isMystery: true,
    })
    return list
  }, [specialists])

  const [selectedIdx, setSelectedIdx] = React.useState(0)
  const router = useRouter()

  const go = React.useCallback(
    (delta: number) => {
      setSelectedIdx((i) => (i + delta + slots.length) % slots.length)
    },
    [slots.length]
  )

  const confirm = React.useCallback(() => {
    const chosen = slots[selectedIdx]
    router.push(`/agendar/${chosen.id}`)
  }, [router, selectedIdx, slots])

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        go(1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        go(-1)
      } else if (e.key === "Enter") {
        e.preventDefault()
        confirm()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go, confirm])

  const prevSlot = slots[(selectedIdx - 1 + slots.length) % slots.length]
  const nextSlot = slots[(selectedIdx + 1) % slots.length]
  const current = slots[selectedIdx]

  return (
    <main className="bg-background min-h-[calc(100vh-4rem)]">
      {/* Top nav */}
      <div className="border-border/60 border-b">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between px-6">
          <Image
            src="/turbo-logo.svg"
            alt="Turbo Partners"
            width={129}
            height={48}
            priority
            className="h-7 w-auto"
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

      {/* Header */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pt-5 pb-4 md:pt-6 md:pb-5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-primary mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
            Agendamento
          </p>
          <h1 className="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-3xl lg:text-4xl">
            Selecione o seu especialista
          </h1>
          <p className="text-muted-foreground mt-1.5 text-xs md:text-sm">
            <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">←</kbd>{" "}
            <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">→</kbd>{" "}
            navegar ·{" "}
            <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">enter</kbd>{" "}
            confirmar
          </p>
        </div>
      </section>

      {/* Stage */}
      <section className="mx-auto w-full max-w-[1280px] px-6">
        <div className="relative">
          <ArrowButton direction="left" onClick={() => go(-1)} />

          <GhostSlot slot={prevSlot} side="left" onClick={() => go(-1)} />

          <HeroStage slot={current} />

          <GhostSlot slot={nextSlot} side="right" onClick={() => go(1)} />

          <ArrowButton direction="right" onClick={() => go(1)} />
        </div>
      </section>

      {/* Info panel */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pt-4 pb-8 md:pb-10">
        <InfoPanel slot={current} onConfirm={confirm} />

        {/* Pagination dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {slots.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Selecionar ${s.name}`}
              onClick={() => setSelectedIdx(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === selectedIdx
                  ? "bg-primary w-8"
                  : "bg-border hover:bg-muted-foreground/50 w-2"
              )}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

/* ---------- Stage ---------- */

function HeroStage({ slot }: { slot: Slot }) {
  return (
    <div className="bg-[var(--color-surface-alt)] relative mx-auto flex h-[320px] w-full max-w-xl items-end justify-center overflow-hidden rounded-2xl md:h-[360px]">
      {/* Top-down light cone */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
        style={{
          background:
            "radial-gradient(ellipse 55% 85% at 50% 110%, color-mix(in oklab, var(--primary) 14%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* Back halo */}
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute left-1/2 top-[42%] size-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      />

      {/* Sprite */}
      <div
        key={slot.id}
        className="carousel-enter relative z-10 mb-16 flex flex-col items-center"
      >
        {slot.spriteUrl && slot.spriteFrames && slot.spriteWidth ? (
          <RotatingSprite
            idle={{
              src: slot.spriteUrl,
              frames: slot.spriteFrames,
              frameWidth: slot.spriteWidth,
              fps: 5,
            }}
            rotate={
              slot.rotationUrl && slot.rotationFrames && slot.rotationWidth
                ? {
                    src: slot.rotationUrl,
                    frames: slot.rotationFrames,
                    frameWidth: slot.rotationWidth,
                    fps: 8,
                  }
                : null
            }
            size={224}
          />
        ) : (
          <MysteryBlock size={224} />
        )}
      </div>

      {/* Altar/pedestal */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-11 left-1/2 h-6 w-56 -translate-x-1/2"
      >
        {/* Hologram ellipse */}
        <div
          className="border-primary/60 absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-[50%] border"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--primary) 35%, transparent) 0%, transparent 75%)",
            boxShadow: "0 0 24px color-mix(in oklab, var(--primary) 45%, transparent)",
          }}
        />
        {/* Soft shadow glow */}
        <div className="bg-primary/40 absolute inset-x-8 -bottom-1 h-2 rounded-full blur-md" />
      </div>

      {/* Name plate */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <div
          key={`name-${slot.id}`}
          className="carousel-enter text-center"
        >
          <p className="text-foreground text-lg font-bold tracking-tight md:text-xl">
            {slot.name}
          </p>
          <p className="text-muted-foreground mt-0.5 text-[11px] font-medium">
            {slot.title}
          </p>
        </div>
      </div>

      <style>{`
        .carousel-enter {
          animation: carousel-enter 340ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @keyframes carousel-enter {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

function MysteryBlock({ size }: { size: number }) {
  return (
    <div
      className="border-primary/40 bg-primary/5 flex items-center justify-center rounded-2xl border-2 border-dashed"
      style={{ width: size * 0.55, height: size * 0.8 }}
    >
      <Sparkles className="text-primary/70 size-16" />
    </div>
  )
}

/* ---------- Ghosts ---------- */

function GhostSlot({
  slot,
  side,
  onClick,
}: {
  slot: Slot
  side: "left" | "right"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Selecionar ${slot.name}`}
      className={cn(
        "absolute top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 opacity-30 transition-all duration-300 hover:opacity-55 lg:flex",
        side === "left" ? "left-0 xl:left-4" : "right-0 xl:right-4"
      )}
      style={{ filter: "grayscale(0.6)" }}
    >
      {slot.spriteUrl && slot.spriteFrames && slot.spriteWidth ? (
        <AnimatedSprite
          src={slot.spriteUrl}
          frames={slot.spriteFrames}
          frameWidth={slot.spriteWidth}
          size={120}
          fps={5}
        />
      ) : (
        <div className="border-primary/20 bg-primary/5 flex size-24 items-center justify-center rounded-xl border-2 border-dashed">
          <Sparkles className="text-primary/50 size-7" />
        </div>
      )}
      <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
        {slot.name}
      </span>
    </button>
  )
}

/* ---------- Arrow buttons ---------- */

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "left" | "right"
  onClick: () => void
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Anterior" : "Próximo"}
      className={cn(
        "absolute top-1/2 z-20 -translate-y-1/2",
        "bg-background hover:bg-primary hover:text-primary-foreground",
        "border-border hover:border-primary border",
        "flex size-11 items-center justify-center rounded-full shadow-sm transition-colors md:size-12",
        direction === "left" ? "left-2 md:left-4" : "right-2 md:right-4"
      )}
    >
      <Icon className="size-5" strokeWidth={2.5} />
    </button>
  )
}

/* ---------- Info panel ---------- */

function InfoPanel({
  slot,
  onConfirm,
}: {
  slot: Slot
  onConfirm: () => void
}) {
  return (
    <div
      key={slot.id}
      className="bg-background border-border mx-auto w-full max-w-2xl overflow-hidden rounded-xl border p-4 md:p-5"
    >
      {slot.bio && (
        <p className="text-foreground/85 text-center text-sm leading-snug md:text-[15px]">
          {slot.bio}
        </p>
      )}

      {slot.stats.length > 0 && (
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 md:gap-x-6">
          {slot.stats.map((s) => (
            <StatRow key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onConfirm}
        className={cn(
          buttonVariants({ size: "lg" }),
          "group shadow-primary/30 mt-4 flex h-12 w-full items-center justify-center gap-2 text-base font-bold shadow-lg"
        )}
      >
        <span>Agendar com {slot.isMystery ? "qualquer especialista" : slot.name.split(" ")[0]}</span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
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
          className="bg-primary absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-foreground w-8 shrink-0 text-right text-xs font-bold tabular-nums">
        {pct}
      </span>
    </div>
  )
}
