"use client"

import * as React from "react"
import Image from "next/image"

type Props = {
  name: string
  company: string
  className?: string
}

export function GoldenTicket({ name, company, className }: Props) {
  return (
    <div
      className={`golden-ticket-card relative aspect-[2/1] w-full overflow-hidden ${className ?? ""}`}
      style={{
        background: [
          "radial-gradient(ellipse at 50% 55%, rgba(255,241,168,0.95) 0%, rgba(255,217,90,0.0) 55%)",
          "conic-gradient(from 0deg at 50% 55%, #b07a14 0deg, #ffe28a 18deg, #c98e1c 40deg, #fff1a8 70deg, #b07a14 100deg, #ffe28a 130deg, #c98e1c 160deg, #fff1a8 200deg, #b07a14 230deg, #ffe28a 260deg, #c98e1c 290deg, #fff1a8 320deg, #b07a14 360deg)",
        ].join(", "),
        boxShadow:
          "0 30px 80px -10px rgba(255,200,40,0.55), 0 0 0 2px #2a1d05 inset, 0 0 0 4px #ffd76a inset, 0 0 80px rgba(255,210,80,0.35)",
        borderRadius: 6,
      }}
    >
      {/* Sheen sweep */}
      <div
        aria-hidden
        className="ticket-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.0) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.0) 65%, transparent 100%)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Top inner border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2 rounded-[3px] border-2 border-black/15"
      />

      {/* Content grid */}
      <div className="relative grid h-full grid-rows-[1fr_auto_auto_auto] px-[5%] pt-[4%] pb-0">
        {/* Top row: GOLDEN TICKET / logo / VALE 30 MINUTOS */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: GOLDEN TICKET */}
          <div className="font-mono leading-[0.9] text-black">
            <div className="text-[9.5%] font-extrabold tracking-tight" style={{ fontSize: "clamp(14px, 4.6cqw, 60px)" }}>
              GOLDEN
            </div>
            <div className="font-extrabold tracking-tight" style={{ fontSize: "clamp(14px, 4.6cqw, 60px)" }}>
              TICKET
            </div>
          </div>

          {/* Center: Turbo logo */}
          <div className="flex shrink-0 items-center justify-center">
            <Image
              src="/turbo-logo.svg"
              alt="Turbo"
              width={140}
              height={52}
              className="h-auto w-[clamp(40px,12cqw,140px)] [filter:brightness(0)]"
              priority
            />
          </div>

          {/* Right: VALE 30 MINUTOS */}
          <div className="font-mono font-extrabold leading-[0.95] text-black text-right">
            <div className="flex items-center justify-end gap-[0.3em]" style={{ fontSize: "clamp(10px, 3cqw, 36px)" }}>
              <span>VALE</span>
              <span
                className="inline-flex items-center justify-center rounded-full border-[0.13em] border-black px-[0.45em] py-[0.05em]"
              >
                30
              </span>
            </div>
            <div className="mt-[0.15em]" style={{ fontSize: "clamp(10px, 3cqw, 36px)" }}>
              MINUTOS
            </div>
          </div>
        </div>

        {/* Center title with side rules */}
        <div className="mt-[3%] flex items-center gap-[3%]">
          <div className="h-[2px] flex-1 bg-black" />
          <h2
            className="font-mono font-extrabold tracking-tight whitespace-nowrap text-black"
            style={{ fontSize: "clamp(11px, 3.6cqw, 44px)" }}
          >
            SESSÃO ESTRATÉGICA PARTICULAR
          </h2>
          <div className="h-[2px] flex-1 bg-black" />
        </div>

        {/* Reservado para */}
        <p
          className="mt-[2.5%] text-center font-mono font-bold tracking-[0.08em] uppercase text-black/85"
          style={{ fontSize: "clamp(8px, 1.85cqw, 18px)" }}
        >
          Reservado para <span className="font-extrabold">{name.toUpperCase()}</span>
          {company && (
            <>
              <span className="mx-[0.5em]">·</span>
              <span className="font-extrabold">{company.toUpperCase()}</span>
            </>
          )}
        </p>

        {/* Bottom dark strip */}
        <div className="mt-[3%] -mx-[5.3%] flex items-center justify-between gap-[2%] bg-[#0e0a02] px-[5.5%] py-[2.5%] text-white">
          <BarcodeMarks />
          <span
            className="font-mono tracking-[0.18em] uppercase opacity-90"
            style={{ fontSize: "clamp(7px, 1.5cqw, 14px)" }}
          >
            Convite pessoal · intransferível
          </span>
          <BarcodeMarks reverse />
        </div>
      </div>
    </div>
  )
}

function BarcodeMarks({ reverse }: { reverse?: boolean }) {
  const widths = reverse ? [1, 2, 1, 3, 1, 1, 2] : [2, 1, 1, 3, 1, 2, 1]
  return (
    <div className="flex h-[1.6em] items-center gap-[0.18em]">
      {widths.map((w, i) => (
        <span
          key={i}
          className="block h-full bg-white/95"
          style={{ width: `${w * 1.5}px` }}
        />
      ))}
    </div>
  )
}
