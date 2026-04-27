"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { addDays, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatTime } from "@/lib/time"

type Slot = {
  start: string
  end: string
  availableSpecialistIds: string[]
}

export function SlotPicker({ specialistId }: { specialistId: string }) {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(() => startOfDay(new Date()))
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPickedDay, setUserPickedDay] = useState(false)
  const slotsRef = useRef<HTMLDivElement>(null)

  const { from, to } = useMemo(() => {
    if (!date) return { from: null, to: null }
    return { from: startOfDay(date), to: endOfDay(date) }
  }, [date])

  useEffect(() => {
    if (!from || !to) return
    let cancelled = false
    setLoading(true)
    setError(null)
    const qs = new URLSearchParams({
      specialistId,
      from: from.toISOString(),
      to: to.toISOString(),
    })
    fetch(`/api/availability?${qs}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setSlots(data.slots ?? [])
      })
      .catch((e) => {
        if (cancelled) return
        console.error(e)
        setError("Não conseguimos carregar os horários. Tente de novo.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [from, to, specialistId])

  // Auto-scroll to slot section after user picks a day
  useEffect(() => {
    if (!userPickedDay || !slotsRef.current) return
    const t = window.setTimeout(() => {
      slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)
    return () => window.clearTimeout(t)
  }, [date, userPickedDay])

  function pickSlot(slot: Slot) {
    const params = new URLSearchParams({ slot: slot.start })
    if (specialistId === "any" && slot.availableSpecialistIds.length > 0) {
      params.set("candidates", slot.availableSpecialistIds.join(","))
    }
    router.push(`/agendar/${specialistId}/confirmar?${params}`)
  }

  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-8">
      <Card className="h-fit">
        <CardContent className="flex justify-center p-2 sm:p-4">
          <Calendar
            mode="single"
            locale={ptBR}
            weekStartsOn={1}
            selected={date}
            onSelect={(d) => {
              setDate(d)
              if (d) setUserPickedDay(true)
            }}
            disabled={(d) => {
              const today = startOfDay(new Date())
              if (d < today) return true
              if (d > addDays(today, 60)) return true
              const day = d.getDay()
              return day === 0 || day === 6
            }}
            initialFocus
          />
        </CardContent>
      </Card>

      <div ref={slotsRef} className="scroll-mt-4">
        <h2 className="mb-4 text-lg font-medium">
          {date ? formatDate(date) : "Escolha uma data"}
        </h2>
        {loading && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full sm:h-10" />
            ))}
          </div>
        )}
        {!loading && error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
        {!loading && !error && slots.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhum horário disponível neste dia. Tente outra data.
          </p>
        )}
        {!loading && !error && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <Button
                key={s.start}
                variant="outline"
                onClick={() => pickSlot(s)}
                className="h-12 text-base font-medium sm:h-10 sm:text-sm"
              >
                {formatTime(s.start)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
