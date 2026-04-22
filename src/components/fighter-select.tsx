"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PixelSprite, type PixelVariant } from "@/components/pixel-sprite"
import { AnimatedSprite } from "@/components/animated-sprite"
import { RotatingSprite } from "@/components/rotating-sprite"
import type { SpecialistSummary } from "@/lib/specialists"
import { cn } from "@/lib/utils"

type FighterMeta = {
  variant: PixelVariant
  glow: string
  accent: string
}

const FIGHTERS: Record<string, FighterMeta> = {
  victor: { variant: "victor", glow: "#4C6AE0", accent: "#BDCAF5" },
  musso: { variant: "musso", glow: "#FF6B3D", accent: "#FFD700" },
  rodrigo: { variant: "rodrigo", glow: "#00D4FF", accent: "#7BC9E8" },
}

const MYSTERY_META: FighterMeta = {
  variant: "mystery",
  glow: "#FFD700",
  accent: "#FFD700",
}

const MYSTERY_STATS = [
  { label: "ENCAIXE", value: 99 },
  { label: "ROTACAO", value: 99 },
  { label: "MYSTERY", value: 99 },
  { label: "CHAOS", value: 99 },
]

type Slot = {
  id: string
  name: string
  title: string
  bio: string | null
  meta: FighterMeta
  stats: Array<{ label: string; value: number }>
  spriteUrl: string | null
  spriteFrames: number | null
  spriteWidth: number | null
  rotationUrl: string | null
  rotationFrames: number | null
  rotationWidth: number | null
  isMystery: boolean
}

export function FighterSelect({ specialists }: { specialists: SpecialistSummary[] }) {
  const slots: Slot[] = React.useMemo(() => {
    const s: Slot[] = specialists
      .filter((sp) => FIGHTERS[sp.id])
      .map((sp) => ({
        id: sp.id,
        name: sp.name.toUpperCase(),
        title: sp.title.toUpperCase(),
        bio: sp.bio,
        meta: FIGHTERS[sp.id],
        stats: sp.stats,
        spriteUrl: sp.photoUrl,
        spriteFrames: sp.spriteFrames,
        spriteWidth: sp.spriteWidth,
        rotationUrl: sp.rotationUrl,
        rotationFrames: sp.rotationFrames,
        rotationWidth: sp.rotationWidth,
        isMystery: false,
      }))
    s.push({
      id: "any",
      name: "???",
      title: "RANDOM DRAW",
      bio: "O sistema sorteia um especialista disponível no horário escolhido.",
      meta: MYSTERY_META,
      stats: MYSTERY_STATS,
      spriteUrl: null,
      spriteFrames: null,
      spriteWidth: null,
      rotationUrl: null,
      rotationFrames: null,
      rotationWidth: null,
      isMystery: true,
    })
    return s
  }, [specialists])

  const [selectedIdx, setSelectedIdx] = React.useState(0)
  const [direction, setDirection] = React.useState<"next" | "prev">("next")
  const [flashing, setFlashing] = React.useState(false)
  const router = useRouter()

  const go = React.useCallback(
    (delta: number) => {
      setDirection(delta > 0 ? "next" : "prev")
      setSelectedIdx((i) => (i + delta + slots.length) % slots.length)
    },
    [slots.length]
  )

  const confirm = React.useCallback(() => {
    if (flashing) return
    const chosen = slots[selectedIdx]
    setFlashing(true)
    window.setTimeout(() => router.push(`/agendar/${chosen.id}`), 440)
  }, [flashing, router, selectedIdx, slots])

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        go(1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        go(-1)
      } else if (e.key === "Enter" || e.key === " ") {
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
    <div
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden text-white"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${current.meta.glow}15 0%, #1E2C7C 25%, #080510 75%)`,
        transition: "background 400ms ease-out",
      }}
    >
      {/* Scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 3px)",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1280px] flex-col px-6 py-8 md:py-12">
        {/* Top HUD */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-white/60 hover:text-white font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
          >
            ← voltar
          </Link>
          <Image
            src="/turbo-logo.svg"
            alt="Turbo Partners"
            width={129}
            height={48}
            priority
            className="h-8 w-auto brightness-0 invert opacity-90 md:h-10"
          />
        </div>

        {/* Título */}
        <header className="mt-6 text-center md:mt-8">
          <h1
            className="fighter-title font-mono text-2xl font-extrabold tracking-[0.18em] uppercase sm:text-3xl md:text-4xl"
            style={{
              textShadow: `0 0 28px ${current.meta.glow}80, 0 0 4px ${current.meta.glow}`,
              transition: "text-shadow 400ms ease-out",
            }}
          >
            Selecione o seu especialista
          </h1>
          <p className="text-white/50 mt-2 font-mono text-[10px] tracking-[0.3em] uppercase sm:text-xs">
            [ ← → ] navegar · [ enter ] confirmar
          </p>
        </header>

        {/* Stage: arrow ← ghost prev / HERO sprite / ghost next arrow → */}
        <div className="relative mt-4 flex flex-1 items-center justify-center md:mt-8">
          <ArrowButton direction="left" onClick={() => go(-1)} color={current.meta.glow} />
          <GhostPreview slot={prevSlot} side="left" />

          <HeroStage
            key={current.id}
            slot={current}
            slideClass={direction === "next" ? "fighter-slide-right" : "fighter-slide-left"}
          />

          <GhostPreview slot={nextSlot} side="right" />
          <ArrowButton direction="right" onClick={() => go(1)} color={current.meta.glow} />
        </div>

        {/* Info + confirm */}
        <FighterInfo slot={current} onConfirm={confirm} />

        {/* Pagination dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {slots.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Selecionar ${s.name}`}
              onClick={() => {
                setDirection(i > selectedIdx ? "next" : "prev")
                setSelectedIdx(i)
              }}
              className="relative size-2.5 border"
              style={{
                borderColor: i === selectedIdx ? current.meta.glow : "rgba(255,255,255,0.3)",
                background: i === selectedIdx ? current.meta.glow : "transparent",
                boxShadow: i === selectedIdx ? `0 0 12px ${current.meta.glow}` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Flash overlay on confirm */}
      {flashing && (
        <div
          aria-hidden
          className="fighter-flash pointer-events-none fixed inset-0 z-50"
          style={{ background: "white" }}
        />
      )}
    </div>
  )
}

/* ---------- sub components ---------- */

function ArrowButton({
  direction,
  onClick,
  color,
}: {
  direction: "left" | "right"
  onClick: () => void
  color: string
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Anterior" : "Próximo"}
      className={cn(
        "group absolute top-1/2 z-30 -translate-y-1/2 flex size-12 items-center justify-center border-2 transition-all duration-200 hover:scale-110 md:size-14",
        direction === "left" ? "left-2 md:left-4" : "right-2 md:right-4"
      )}
      style={{
        borderColor: color,
        background: `linear-gradient(135deg, ${color}30, ${color}08)`,
        boxShadow: `0 0 20px ${color}60, inset 0 0 12px ${color}30`,
        color,
      }}
    >
      <Icon className="size-6 md:size-7" strokeWidth={3} />
    </button>
  )
}

function GhostPreview({ slot, side }: { slot: Slot; side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 -translate-y-1/2 opacity-25 blur-[0.5px] grayscale hidden lg:block",
        side === "left" ? "left-24 xl:left-32" : "right-24 xl:right-32"
      )}
      style={{ filter: "grayscale(0.7) brightness(0.6)" }}
    >
      <div className="fighter-float">
        {slot.spriteUrl && slot.spriteFrames && slot.spriteWidth ? (
          <AnimatedSprite
            src={slot.spriteUrl}
            frames={slot.spriteFrames}
            frameWidth={slot.spriteWidth}
            size={112}
            fps={6}
          />
        ) : (
          <PixelSprite variant={slot.meta.variant} className="size-28 xl:size-32" />
        )}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
        {slot.name}
      </p>
    </div>
  )
}

function HeroStage({ slot, slideClass }: { slot: Slot; slideClass: string }) {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        left: `${10 + i * 11}%`,
        delay: `${(i * 0.4).toFixed(2)}s`,
        dur: `${(2.6 + (i % 3) * 0.6).toFixed(2)}s`,
        drift: i % 2 === 0 ? "4px" : "-4px",
      })),
    []
  )

  return (
    <div className={cn("relative flex flex-col items-center", slideClass)}>
      {/* Sprite + spotlight */}
      <div className="relative flex h-64 w-64 items-end justify-center sm:h-80 sm:w-80">
        {/* Spotlight beam de cima */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[110%] fighter-spotlight"
          style={{
            background: `radial-gradient(ellipse 60% 90% at 50% 100%, ${slot.meta.glow}55 0%, ${slot.meta.glow}20 30%, transparent 70%)`,
            maskImage: "linear-gradient(to top, black, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          }}
        />

        {/* Partículas */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p, i) => (
            <span
              key={i}
              className="fighter-particle absolute bottom-12 size-1"
              style={{
                left: p.left,
                background: slot.meta.glow,
                boxShadow: `0 0 6px ${slot.meta.glow}`,
                ["--dur" as string]: p.dur,
                ["--drift" as string]: p.drift,
                animationDelay: p.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Sprite animado */}
        <div className="relative z-10 pb-10">
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
              size={256}
            />
          ) : (
            <div className="fighter-breathe">
              <PixelSprite
                variant={slot.meta.variant}
                className="h-56 w-56 sm:h-64 sm:w-64"
              />
            </div>
          )}
        </div>

        {/* Pedestal */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 h-6 w-56 -translate-x-1/2"
        >
          {/* plataforma */}
          <div
            className="absolute inset-x-0 top-3 h-3 border-t-2 border-b-2"
            style={{
              borderColor: slot.meta.glow,
              background: `linear-gradient(to bottom, ${slot.meta.glow}50, ${slot.meta.glow}10)`,
              boxShadow: `0 0 18px ${slot.meta.glow}80`,
            }}
          />
          {/* sombra projetada */}
          <div
            className="absolute inset-x-4 -bottom-2 h-2 rounded-full blur-md"
            style={{ background: `${slot.meta.glow}80` }}
          />
        </div>
      </div>

      {/* Nome + classe */}
      <div className="mt-2 text-center">
        <h2
          className="font-mono text-4xl font-extrabold tracking-[0.08em] uppercase sm:text-5xl"
          style={{ textShadow: `0 0 16px ${slot.meta.glow}, 0 0 2px ${slot.meta.glow}` }}
        >
          {slot.name}
        </h2>
        <p
          className="mt-1 max-w-md font-mono text-[10px] tracking-[0.22em] uppercase sm:text-xs"
          style={{ color: slot.meta.glow }}
        >
          {slot.title}
        </p>
      </div>
    </div>
  )
}

function FighterInfo({
  slot,
  onConfirm,
}: {
  slot: Slot
  onConfirm: () => void
}) {
  return (
    <div className="mx-auto mt-6 w-full max-w-3xl md:mt-8">
      <div
        className="relative border-2 p-4 sm:p-6"
        style={{
          borderColor: `${slot.meta.glow}50`,
          background: `linear-gradient(135deg, ${slot.meta.glow}12, rgba(8, 5, 16, 0.6))`,
          boxShadow: `inset 0 0 30px ${slot.meta.glow}15`,
        }}
      >
        {slot.bio && (
          <p className="text-white/75 mb-4 text-center text-sm leading-relaxed sm:text-base">
            {slot.bio}
          </p>
        )}

        <div className="grid gap-1.5 sm:grid-cols-2">
          {slot.stats.map((s) => (
            <StatBar key={s.label} label={s.label} value={s.value} color={slot.meta.glow} />
          ))}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="group mt-5 flex w-full items-center justify-center gap-3 border-2 px-6 py-4 font-mono text-base font-bold tracking-[0.22em] uppercase transition-all hover:scale-[1.01]"
          style={{
            borderColor: slot.meta.glow,
            background: `linear-gradient(135deg, ${slot.meta.glow}35, ${slot.meta.glow}15)`,
            boxShadow: `0 0 28px ${slot.meta.glow}70`,
            color: "white",
            textShadow: `0 0 8px ${slot.meta.glow}`,
          }}
        >
          <span>Agendar com especialista</span>
          <ChevronRight className="size-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

function StatBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const segments = 10
  const filled = Math.round((value / 100) * segments)
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase">
      <span className="text-white/60 w-20 shrink-0 truncate">{label}</span>
      <span className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-3 w-2"
            style={{
              background: i < filled ? color : "rgba(255,255,255,0.08)",
              boxShadow: i < filled ? `0 0 4px ${color}90` : "none",
            }}
          />
        ))}
      </span>
      <span className="text-white/80 w-6 shrink-0 text-right font-bold">{value}</span>
    </div>
  )
}
