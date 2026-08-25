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
  { label: "PERFORMANCE", value: 99 },
  { label: "UGC", value: 99 },
  { label: "MARKETING", value: 99 },
  { label: "VENDAS", value: 99 },
]

const LABEL_PT: Record<string, string> = {
  GROWTH: "CRESCIMENTO",
  MIDIA: "MÍDIA",
  ANALYTICS: "ANÁLISE",
  OUTBOUND: "PROSPECÇÃO",
  CLOSE: "FECHAMENTO",
  FORECAST: "PREVISÃO",
  "A/B TEST": "TESTE A/B",
  DATA: "DADOS",
  ROTACAO: "ROTAÇÃO",
  MYSTERY: "MISTÉRIO",
  CHAOS: "CAOS",
}

function translateLabel(raw: string) {
  const upper = raw.toUpperCase()
  return LABEL_PT[upper] ?? upper
}

function translateTitle(raw: string) {
  return raw
    .replace(/\bGrowth\b/gi, "Crescimento")
    .replace(/\bUX\b/g, "UX")
}

type Slot = {
  id: string
  name: string
  firstName: string
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

export function FighterSelectV4({ specialists }: { specialists: SpecialistSummary[] }) {
  const slots: Slot[] = React.useMemo(() => {
    const s: Slot[] = specialists
      .filter((sp) => FIGHTERS[sp.id])
      .map((sp) => ({
        id: sp.id,
        name: sp.name.toUpperCase(),
        firstName: sp.name.split(" ")[0],
        title: translateTitle(sp.title).toUpperCase(),
        bio: sp.bio,
        meta: FIGHTERS[sp.id],
        stats: sp.stats.map((st) => ({ ...st, label: translateLabel(st.label) })),
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
      firstName: "qualquer um",
      title: "SORTEIO ALEATÓRIO",
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
    window.setTimeout(() => router.push(`/qualificar/${chosen.id}`), 440)
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

  // Swipe handling for mobile
  const touchStartX = React.useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    touchStartX.current = null
  }

  const current = slots[selectedIdx]

  return (
    <div
      className="relative h-[100svh] overflow-hidden text-white"
      style={{
        background: `radial-gradient(ellipse at 50% 28%, ${current.meta.glow}1A 0%, #1E2C7C 30%, #080510 80%)`,
        transition: "background 400ms ease-out",
      }}
    >
      {/* Scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-30"
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
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div
        className="relative z-20 mx-auto flex h-full w-full max-w-[480px] flex-col px-4 pt-3 pb-3 sm:max-w-[520px]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between">
          <Link
            href="/"
            aria-label="Voltar"
            className="text-white/70 hover:text-white inline-flex size-8 items-center justify-center border border-white/20 transition-colors"
          >
            <ChevronLeft className="size-4" strokeWidth={3} />
          </Link>
          <Image
            src="/turbo-logo.svg"
            alt="Turbo Partners"
            width={129}
            height={48}
            priority
            className="h-6 w-auto brightness-0 invert opacity-90"
          />
          <span className="size-8" aria-hidden />
        </div>

        {/* Título */}
        <header className="mt-2 shrink-0 text-center">
          <h1
            className="fighter-title font-mono text-[15px] font-extrabold tracking-[0.18em] uppercase"
            style={{
              textShadow: `0 0 22px ${current.meta.glow}80, 0 0 4px ${current.meta.glow}`,
              transition: "text-shadow 400ms ease-out",
            }}
          >
            Selecione o seu especialista
          </h1>
        </header>

        {/* Stage: arrows + sprite */}
        <div className="relative mt-1 flex flex-1 items-center justify-center min-h-0">
          <ArrowButton direction="left" onClick={() => go(-1)} color={current.meta.glow} />
          {/* Wrapper só para escalar o palco em telas baixas (o HeroStage usa transform na animação de slide). */}
          <div className="fighter-stage-scale">
            <HeroStage
              key={current.id}
              slot={current}
              slideClass={direction === "next" ? "fighter-slide-right" : "fighter-slide-left"}
            />
          </div>
          <ArrowButton direction="right" onClick={() => go(1)} color={current.meta.glow} />
        </div>

        {/* Info card */}
        <FighterInfo slot={current} onConfirm={confirm} />

        {/* Pagination dots */}
        <div className="mt-2 flex shrink-0 items-center justify-center gap-1.5">
          {slots.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Selecionar ${s.name}`}
              onClick={() => {
                setDirection(i > selectedIdx ? "next" : "prev")
                setSelectedIdx(i)
              }}
              className="relative size-2 border"
              style={{
                borderColor: i === selectedIdx ? current.meta.glow : "rgba(255,255,255,0.3)",
                background: i === selectedIdx ? current.meta.glow : "transparent",
                boxShadow: i === selectedIdx ? `0 0 10px ${current.meta.glow}` : "none",
              }}
            />
          ))}
        </div>
      </div>

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
        "group absolute top-1/2 z-30 -translate-y-1/2 flex size-10 items-center justify-center border-2 transition-all duration-200 active:scale-95",
        direction === "left" ? "left-0" : "right-0"
      )}
      style={{
        borderColor: color,
        background: `linear-gradient(135deg, ${color}30, ${color}08)`,
        boxShadow: `0 0 16px ${color}60, inset 0 0 10px ${color}30`,
        color,
      }}
    >
      <Icon className="size-5" strokeWidth={3} />
    </button>
  )
}

function HeroStage({ slot, slideClass }: { slot: Slot; slideClass: string }) {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        left: `${15 + i * 14}%`,
        delay: `${(i * 0.4).toFixed(2)}s`,
        dur: `${(2.6 + (i % 3) * 0.6).toFixed(2)}s`,
        drift: i % 2 === 0 ? "4px" : "-4px",
      })),
    []
  )

  return (
    <div className={cn("relative flex flex-col items-center", slideClass)}>
      {/* Sprite + spotlight */}
      <div className="relative flex h-64 w-64 items-end justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[110%] fighter-spotlight"
          style={{
            background: `radial-gradient(ellipse 60% 90% at 50% 100%, ${slot.meta.glow}55 0%, ${slot.meta.glow}20 30%, transparent 70%)`,
            maskImage: "linear-gradient(to top, black, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          }}
        />

        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p, i) => (
            <span
              key={i}
              className="fighter-particle absolute bottom-8 size-1"
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

        <div className="relative z-10 pb-6">
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
            <div className="fighter-breathe">
              <PixelSprite variant={slot.meta.variant} className="size-52" />
            </div>
          )}
        </div>

        {/* Pedestal */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 h-4 w-60 -translate-x-1/2"
        >
          <div
            className="absolute inset-x-0 top-2 h-2 border-t-2 border-b-2"
            style={{
              borderColor: slot.meta.glow,
              background: `linear-gradient(to bottom, ${slot.meta.glow}50, ${slot.meta.glow}10)`,
              boxShadow: `0 0 14px ${slot.meta.glow}80`,
            }}
          />
          <div
            className="absolute inset-x-3 -bottom-1 h-1.5 rounded-full blur-md"
            style={{ background: `${slot.meta.glow}80` }}
          />
        </div>
      </div>

      {/* Nome + classe */}
      <div className="mt-1 text-center">
        <h2
          className="font-mono text-3xl font-extrabold leading-none tracking-[0.08em] uppercase"
          style={{ textShadow: `0 0 14px ${slot.meta.glow}, 0 0 2px ${slot.meta.glow}` }}
        >
          {slot.name}
        </h2>
        <p
          className="mt-1 font-mono text-[10px] tracking-[0.22em] uppercase"
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
  const ctaLabel = slot.isMystery
    ? "Agendar com qualquer um"
    : `Agendar com ${slot.firstName}`

  return (
    <div className="mt-2 w-full shrink-0">
      <div
        className="relative border-2 px-3 py-2.5"
        style={{
          borderColor: `${slot.meta.glow}50`,
          background: `linear-gradient(135deg, ${slot.meta.glow}12, rgba(8, 5, 16, 0.6))`,
          boxShadow: `inset 0 0 24px ${slot.meta.glow}15`,
        }}
      >
        {slot.bio && (
          <p className="text-white/75 mb-2 line-clamp-2 text-center text-[12px] leading-snug">
            {slot.bio}
          </p>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {slot.stats.slice(0, 4).map((s) => (
            <StatBar key={s.label} label={s.label} value={s.value} color={slot.meta.glow} />
          ))}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="cta-pulse cta-sheen group relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden border-2 px-4 py-3.5 font-mono text-[15px] font-extrabold tracking-[0.16em] uppercase transition-transform active:scale-[0.98]"
          style={
            {
              borderColor: slot.meta.glow,
              background: `linear-gradient(135deg, ${slot.meta.glow}60, ${slot.meta.glow}25)`,
              color: "white",
              textShadow: `0 0 10px ${slot.meta.glow}`,
              "--cta-glow": `${slot.meta.glow}99`,
              "--cta-glow-soft": `${slot.meta.glow}45`,
            } as React.CSSProperties
          }
        >
          <span>{ctaLabel}</span>
          <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
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
  const segments = 8
  const filled = Math.round((value / 100) * segments)
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase">
      <span className="text-white/60 w-[86px] shrink-0 truncate">{label}</span>
      <span className="flex flex-1 gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-2.5 flex-1"
            style={{
              background: i < filled ? color : "rgba(255,255,255,0.08)",
              boxShadow: i < filled ? `0 0 3px ${color}90` : "none",
            }}
          />
        ))}
      </span>
    </div>
  )
}
