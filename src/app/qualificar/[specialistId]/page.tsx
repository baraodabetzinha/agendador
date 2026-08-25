import { notFound } from "next/navigation"
import Link from "next/link"
import { listSpecialists } from "@/lib/specialists"
import { QualifierFlow } from "@/components/qualifier-flow"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Liberando seu Golden Ticket — Turbo Partners",
}

export default async function QualificarPage({
  params,
}: {
  params: Promise<{ specialistId: string }>
}) {
  const { specialistId } = await params
  const all = await listSpecialists()
  const isAny = specialistId === "any"
  const target = isAny ? null : all.find((s) => s.id === specialistId)
  if (!isAny && !target) notFound()

  if (target?.isFull) return <SoldOut name={target.name} />

  return (
    <QualifierFlow
      specialistId={specialistId}
      specialistName={isAny ? "qualquer um" : target!.name}
      specialistTitle={isAny ? "Sorteio aleatório" : target!.title}
    />
  )
}

function SoldOut({ name }: { name: string }) {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-4 bg-[#080510] px-6 text-center text-white">
      <h1 className="font-mono text-lg font-extrabold tracking-[0.18em] uppercase">
        Vagas esgotadas
      </h1>
      <p className="text-white/70 max-w-sm text-sm">
        {name} já preencheu as consultorias disponíveis. Escolha outro
        especialista ou deixe o sorteio encaixar você com quem estiver livre.
      </p>
      <Link
        href="/selecionar"
        className="mt-2 border-2 border-white/40 px-5 py-3 font-mono text-[13px] font-bold tracking-[0.18em] uppercase transition-colors hover:border-white"
      >
        Ver quem está disponível
      </Link>
    </main>
  )
}
