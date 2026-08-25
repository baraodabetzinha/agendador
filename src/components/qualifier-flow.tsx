"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { GoldenTicket } from "@/components/golden-ticket"

const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/

const schema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  company: z.string().min(2, "Informe sua empresa"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .regex(phoneRegex, "Telefone inválido. Ex: (11) 98765-4321"),
})

type FormValues = z.infer<typeof schema>

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

type Phase = "form" | "consulting" | "reveal" | "settled"

const STAGES = [
  "Validando seus dados",
  "Consultando informações da empresa",
  "Cruzando dados de mercado",
  "Liberando acesso à sessão",
]

export function QualifierFlow({
  specialistId,
  specialistName,
  specialistTitle,
}: {
  specialistId: string
  specialistName: string
  specialistTitle: string
}) {
  const router = useRouter()
  const [phase, setPhase] = React.useState<Phase>("form")
  const [stageIdx, setStageIdx] = React.useState(0)
  const [data, setData] = React.useState<FormValues | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", company: "", email: "", phone: "" },
  })

  function onSubmit(values: FormValues) {
    setData(values)
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("qualifier", JSON.stringify(values))
    }
    setPhase("consulting")
  }

  // Stage progression during consulting
  React.useEffect(() => {
    if (phase !== "consulting") return
    setStageIdx(0)
    const stageDuration = 900
    const t1 = window.setTimeout(() => setStageIdx(1), stageDuration)
    const t2 = window.setTimeout(() => setStageIdx(2), stageDuration * 2)
    const t3 = window.setTimeout(() => setStageIdx(3), stageDuration * 3)
    const t4 = window.setTimeout(() => setPhase("reveal"), stageDuration * 4)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [phase])

  // After ticket slam, settle
  React.useEffect(() => {
    if (phase !== "reveal") return
    const t = window.setTimeout(() => setPhase("settled"), 1700)
    return () => clearTimeout(t)
  }, [phase])

  function resgatar() {
    router.push(`/agendar/${specialistId}`)
  }

  return (
    <div className="relative h-[100svh] overflow-hidden bg-[#080510] text-white">
      {/* Subtle background ambience for all phases */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(255,200,80,0.08) 0%, rgba(30,44,124,0.4) 35%, #080510 80%)",
        }}
      />

      {phase === "form" && (
        <FormView
          form={form}
          onSubmit={onSubmit}
          specialistName={specialistName}
          specialistTitle={specialistTitle}
        />
      )}

      {phase === "consulting" && (
        <ConsultingView stageIdx={stageIdx} stages={STAGES} />
      )}

      {(phase === "reveal" || phase === "settled") && data && (
        <RevealView
          name={data.name}
          company={data.company}
          showCta={phase === "settled"}
          onResgatar={resgatar}
          specialistName={specialistName}
        />
      )}
    </div>
  )
}

/* ---------- Form ---------- */

function FormView({
  form,
  onSubmit,
  specialistName,
  specialistTitle,
}: {
  form: ReturnType<typeof useForm<FormValues>>
  onSubmit: (v: FormValues) => void
  specialistName: string
  specialistTitle: string
}) {
  const inputCls =
    "border-white/20 bg-white/5 text-white placeholder:text-white/30 h-9"
  const labelCls =
    "text-white/70 text-[10px] tracking-[0.15em] uppercase mb-0.5"

  return (
    <main className="relative z-10 mx-auto flex h-[100svh] w-full max-w-md flex-col px-4 pt-3 pb-3">
      <div className="flex shrink-0 items-center justify-between">
        <Link
          href="/selecionar"
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
          className="h-5 w-auto brightness-0 invert opacity-90"
        />
        <span className="size-8" aria-hidden />
      </div>

      <header className="mt-3 shrink-0 text-center">
        <p className="text-amber-300/90 font-mono text-[10px] tracking-[0.3em] uppercase">
          Última etapa
        </p>
        <h1 className="mt-1.5 text-[20px] font-extrabold leading-tight tracking-tight">
          Antes de liberar sua sessão com{" "}
          <span className="text-amber-300">{specialistName}</span>
        </h1>
        <p className="text-white/60 mt-1 text-xs">
          {specialistTitle} · 30 minutos · 100% gratuito
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-3 flex flex-col gap-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className={labelCls}>Nome completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Como você se chama?"
                    autoComplete="name"
                    className={inputCls}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className={labelCls}>Empresa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome da sua empresa"
                    autoComplete="organization"
                    className={inputCls}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className={labelCls}>E-mail corporativo</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="voce@empresa.com"
                    autoComplete="email"
                    className={inputCls}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className={labelCls}>WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 98765-4321"
                    autoComplete="tel"
                    inputMode="tel"
                    className={inputCls}
                    value={field.value}
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <div className="mt-3">
            <button
              type="submit"
              className="cta-pulse cta-sheen group relative flex w-full items-center justify-center gap-2 overflow-hidden border-2 border-amber-400 px-5 py-4 font-mono text-[15px] font-extrabold tracking-[0.16em] uppercase text-white transition-transform active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,200,80,0.55), rgba(255,200,80,0.2))",
                textShadow: "0 0 10px rgba(255,200,80,0.9)",
              }}
            >
              <span>Liberar minha sessão</span>
              <ChevronRight
                className="size-5 transition-transform group-hover:translate-x-1"
                strokeWidth={3}
              />
            </button>
            <p className="text-white/40 mt-1.5 flex items-center justify-center gap-1 text-[10px]">
              <ShieldCheck className="size-3" />
              Seus dados ficam só com a Turbo Partners
            </p>
          </div>
        </form>
      </Form>
    </main>
  )
}

/* ---------- Consulting ---------- */

function ConsultingView({
  stageIdx,
  stages,
}: {
  stageIdx: number
  stages: string[]
}) {
  return (
    <main className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-md flex-col items-center justify-center px-6">
      {/* Animated orb */}
      <div className="relative flex size-32 items-center justify-center">
        <div
          className="consulting-orb absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(255,200,80,0.85) 90deg, transparent 180deg)",
            filter: "blur(2px)",
          }}
        />
        <div
          className="absolute inset-2 rounded-full border-2 border-amber-300/40"
          style={{ boxShadow: "0 0 30px rgba(255,200,80,0.4)" }}
        />
        <div
          className="consulting-orb-inner absolute inset-6 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7), rgba(255,200,80,0.2) 60%, rgba(255,200,80,0) 80%)",
          }}
        />
      </div>

      <p className="text-amber-300/90 mt-10 font-mono text-[11px] tracking-[0.3em] uppercase">
        Análise em andamento
      </p>

      {/* Stage list */}
      <ul className="mt-5 flex flex-col gap-3 text-center">
        {stages.map((s, i) => {
          const state =
            i < stageIdx ? "done" : i === stageIdx ? "active" : "pending"
          return (
            <li
              key={s}
              className="flex items-center justify-center gap-2.5 font-mono text-[13px] tracking-wide transition-all"
              style={{
                opacity: state === "pending" ? 0.3 : 1,
                color:
                  state === "done"
                    ? "rgba(255,200,80,0.85)"
                    : state === "active"
                      ? "white"
                      : "rgba(255,255,255,0.5)",
              }}
            >
              <span
                className="inline-flex size-4 items-center justify-center rounded-full border-2"
                style={{
                  borderColor:
                    state === "done"
                      ? "rgb(252,211,77)"
                      : state === "active"
                        ? "white"
                        : "rgba(255,255,255,0.3)",
                  background:
                    state === "done" ? "rgb(252,211,77)" : "transparent",
                }}
              >
                {state === "done" && (
                  <svg viewBox="0 0 16 16" className="size-2.5 text-black">
                    <path
                      d="M3 8l3 3 7-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {state === "active" && (
                  <span className="size-1.5 animate-pulse rounded-full bg-white" />
                )}
              </span>
              <span>
                {s}
                {state === "active" && <span className="dots">…</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

/* ---------- Reveal ---------- */

function RevealView({
  name,
  company,
  showCta,
  onResgatar,
  specialistName,
}: {
  name: string
  company: string
  showCta: boolean
  onResgatar: () => void
  specialistName: string
}) {
  return (
    <main className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-xl flex-col items-center justify-center px-5 py-8">
      {/* Gold flash on impact */}
      <div className="ticket-flash pointer-events-none fixed inset-0 z-30 bg-amber-200" />

      {/* Headline above ticket */}
      <div className="ticket-headline text-center">
        <p className="text-amber-300 font-mono text-[11px] tracking-[0.3em] uppercase">
          Acesso liberado
        </p>
        <h1
          className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
          style={{
            textShadow: "0 0 24px rgba(255,200,80,0.6)",
          }}
        >
          Você tem o{" "}
          <span className="text-amber-300">Golden Ticket Turbo</span>
        </h1>
      </div>

      {/* Ticket stage with perspective */}
      <div
        className="mt-8 w-full"
        style={{ perspective: "1500px", perspectiveOrigin: "50% 30%" }}
      >
        <div className="ticket-slam ticket-shake-host">
          <div className="ticket-float">
            <GoldenTicket name={name} company={company} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="mt-8 w-full max-w-sm transition-all duration-500"
        style={{
          opacity: showCta ? 1 : 0,
          transform: showCta ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <p className="text-white/70 mb-4 text-center text-sm">
          Agora é só escolher quando você quer falar com{" "}
          <span className="text-white font-semibold">{specialistName}</span>.
        </p>
        <button
          type="button"
          onClick={onResgatar}
          className="cta-pulse cta-sheen group relative flex w-full items-center justify-center gap-2 overflow-hidden border-2 border-amber-400 px-5 py-4 font-mono text-base font-extrabold tracking-[0.16em] uppercase text-white transition-transform active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,200,80,0.6), rgba(255,200,80,0.22))",
            textShadow: "0 0 10px rgba(255,200,80,0.9)",
          }}
        >
          <span>Resgatar agora</span>
          <ChevronRight
            className="size-5 transition-transform group-hover:translate-x-1"
            strokeWidth={3}
          />
        </button>
      </div>
    </main>
  )
}
