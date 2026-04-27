import { NextResponse } from "next/server"
import { z } from "zod"
import { addMinutes, subDays } from "date-fns"
import { prisma } from "@/lib/db"
import { listSpecialists } from "@/lib/specialists"
import { getBusyIntervals, createMeetingEvent } from "@/lib/google"
import { enqueueWhatsApp } from "@/lib/wa-queue"
import { MEETING_DURATION_MINUTES } from "@/lib/availability"
import { formatDateTime } from "@/lib/time"

const schema = z.object({
  specialistId: z.string().min(1),
  slot: z.string().datetime({ offset: true }).or(z.string().datetime()),
  candidates: z.array(z.string()).optional(),
  clientName: z.string().min(2).max(120),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(8).max(30),
  subject: z.string().min(3).max(500),
})

function slotOverlapsBusy(start: Date, end: Date, busy: { start: Date; end: Date }[]) {
  return busy.some((b) => start < b.end && end > b.start)
}

async function pickSpecialistForAny(candidateIds: string[]): Promise<string> {
  const since = subDays(new Date(), 30)
  const counts = await Promise.all(
    candidateIds.map(async (id) => {
      const count = await prisma.booking.count({
        where: {
          specialistId: id,
          wasAnyRequest: true,
          createdAt: { gte: since },
          status: "CONFIRMED",
        },
      })
      return { id, count }
    })
  )
  const min = Math.min(...counts.map((c) => c.count))
  const tied = counts.filter((c) => c.count === min).map((c) => c.id)
  return tied[Math.floor(Math.random() * tied.length)]
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const data = parsed.data

  const start = new Date(data.slot)
  const end = addMinutes(start, MEETING_DURATION_MINUTES)
  if (start < new Date()) {
    return NextResponse.json(
      { error: "Este horário já passou" },
      { status: 400 }
    )
  }

  const all = await listSpecialists()
  const connected = all.filter((s) => s.isConnected)

  let targetIds: string[]
  if (data.specialistId === "any") {
    targetIds = (data.candidates && data.candidates.length > 0
      ? connected.filter((s) => data.candidates!.includes(s.id))
      : connected
    ).map((s) => s.id)
  } else {
    const found = connected.find((s) => s.id === data.specialistId)
    if (!found) {
      return NextResponse.json(
        { error: "Especialista não conectado" },
        { status: 400 }
      )
    }
    targetIds = [found.id]
  }

  if (targetIds.length === 0) {
    return NextResponse.json(
      { error: "Nenhum especialista disponível" },
      { status: 409 }
    )
  }

  const freeIds: string[] = []
  await Promise.all(
    targetIds.map(async (id) => {
      try {
        const busy = await getBusyIntervals(id, start, end)
        if (!slotOverlapsBusy(start, end, busy)) freeIds.push(id)
      } catch (e) {
        console.error(`[bookings] freebusy failed for ${id}`, e)
      }
    })
  )

  if (freeIds.length === 0) {
    return NextResponse.json(
      { error: "Este horário já foi preenchido. Escolha outro." },
      { status: 409 }
    )
  }

  const wasAny = data.specialistId === "any"
  const chosenId = wasAny
    ? await pickSpecialistForAny(freeIds)
    : freeIds[0]

  const chosen = all.find((s) => s.id === chosenId)!

  const summary = `Reunião com ${chosen.name} — ${data.clientName}`
  const description = [
    `Cliente: ${data.clientName}`,
    `Email: ${data.clientEmail}`,
    `WhatsApp: ${data.clientPhone}`,
    "",
    "Assunto:",
    data.subject,
  ].join("\n")

  let eventId: string | null = null
  let meetLink: string | null = null
  try {
    const event = await createMeetingEvent({
      specialistId: chosenId,
      summary,
      description,
      start,
      end,
      clientEmail: data.clientEmail,
      clientName: data.clientName,
    })
    eventId = event.eventId || null
    meetLink = event.meetLink
  } catch (e) {
    console.error("[bookings] calendar insert failed", e)
    return NextResponse.json(
      { error: "Não conseguimos criar a reunião no Google Calendar" },
      { status: 502 }
    )
  }

  const booking = await prisma.booking.create({
    data: {
      specialistId: chosenId,
      wasAnyRequest: wasAny,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      subject: data.subject,
      startsAt: start,
      endsAt: end,
      googleEventId: eventId,
      meetLink,
    },
  })

  const clientMessage = [
    `Oi, ${data.clientName.split(" ")[0]}! 👋`,
    ``,
    `Seu agendamento com *${chosen.name}* está confirmado:`,
    `📅 ${formatDateTime(start)}`,
    meetLink ? `🎥 Meet: ${meetLink}` : `🎥 O link do Meet está no seu email.`,
    ``,
    `Até lá!`,
  ].join("\n")

  await enqueueWhatsApp(data.clientPhone, clientMessage).catch((e) =>
    console.error("[bookings] enqueue client whatsapp failed", e)
  )

  // Specialist notification
  const specialistRecord = await prisma.specialist.findUnique({
    where: { id: chosenId },
    select: { phone: true },
  })
  if (specialistRecord?.phone) {
    const specialistMessage = [
      `🆕 *Novo agendamento*`,
      ``,
      `Cliente: *${data.clientName}*`,
      `📅 ${formatDateTime(start)}`,
      meetLink ? `🎥 Meet: ${meetLink}` : null,
      ``,
      `📞 WhatsApp: ${data.clientPhone}`,
      `✉️ E-mail: ${data.clientEmail}`,
      ``,
      `*Assunto:*`,
      data.subject,
    ]
      .filter(Boolean)
      .join("\n")

    await enqueueWhatsApp(specialistRecord.phone, specialistMessage).catch(
      (e) => console.error("[bookings] enqueue specialist whatsapp failed", e)
    )
  } else {
    console.warn(
      `[bookings] specialist ${chosenId} has no phone — skipping notification`
    )
  }

  return NextResponse.json({ ok: true, bookingId: booking.id })
}
