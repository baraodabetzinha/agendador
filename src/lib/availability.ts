import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { addHours, addMinutes, isAfter, isBefore, isSameDay, startOfDay } from "date-fns"
import { APP_TIMEZONE } from "@/lib/time"
import { getBusyIntervals, type BusyInterval } from "@/lib/google"

export const SLOT_MINUTES = 30
export const WORK_START_HOUR = 9
export const WORK_END_HOUR = 18
const MEETING_DURATION_MINUTES = 30
export const MIN_BOOKING_LEAD_HOURS = 12

export type Slot = {
  start: string
  end: string
  availableSpecialistIds: string[]
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function generateCandidateSlots(from: Date, to: Date): { start: Date; end: Date }[] {
  const slots: { start: Date; end: Date }[] = []
  const fromZoned = toZonedTime(from, APP_TIMEZONE)
  const toZoned = toZonedTime(to, APP_TIMEZONE)
  const earliest = addHours(new Date(), MIN_BOOKING_LEAD_HOURS)

  const cursor = new Date(fromZoned)
  cursor.setHours(0, 0, 0, 0)

  while (cursor <= toZoned) {
    const day = cursor.getDay()
    if (day === 0 || day === 6) {
      cursor.setDate(cursor.getDate() + 1)
      continue
    }

    for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        const y = cursor.getFullYear()
        const mo = cursor.getMonth()
        const d = cursor.getDate()

        const zonedStart = new Date(y, mo, d, h, m, 0, 0)
        if (zonedStart.getHours() + MEETING_DURATION_MINUTES / 60 > WORK_END_HOUR) continue

        const isoLike = `${y}-${pad(mo + 1)}-${pad(d)}T${pad(h)}:${pad(m)}:00`
        const start = fromZonedTime(isoLike, APP_TIMEZONE)
        const end = addMinutes(start, MEETING_DURATION_MINUTES)

        if (isBefore(start, earliest)) continue
        if (isBefore(start, from) || isAfter(end, to)) continue

        slots.push({ start, end })
      }
    }

    cursor.setDate(cursor.getDate() + 1)
  }

  return slots
}

function slotOverlaps(
  slotStart: Date,
  slotEnd: Date,
  busy: BusyInterval[]
): boolean {
  for (const b of busy) {
    if (slotStart < b.end && slotEnd > b.start) return true
  }
  return false
}

export async function getAvailableSlots(
  specialistIds: string[],
  from: Date,
  to: Date
): Promise<Slot[]> {
  const candidates = generateCandidateSlots(from, to)
  if (candidates.length === 0) return []

  const busyByspecialist = new Map<string, BusyInterval[]>()
  await Promise.all(
    specialistIds.map(async (id) => {
      try {
        const busy = await getBusyIntervals(id, from, to)
        busyByspecialist.set(id, busy)
      } catch (e) {
        console.error(`[availability] freebusy failed for ${id}`, e)
        busyByspecialist.set(id, [])
      }
    })
  )

  return candidates.map((slot) => {
    const available = specialistIds.filter((id) => {
      const busy = busyByspecialist.get(id) ?? []
      return !slotOverlaps(slot.start, slot.end, busy)
    })
    return {
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      availableSpecialistIds: available,
    }
  }).filter((s) => s.availableSpecialistIds.length > 0)
}

export function filterSlotsByDay(slots: Slot[], day: Date): Slot[] {
  return slots.filter((s) => {
    const zoned = toZonedTime(new Date(s.start), APP_TIMEZONE)
    const dayZoned = toZonedTime(day, APP_TIMEZONE)
    return isSameDay(startOfDay(zoned), startOfDay(dayZoned))
  })
}

export { MEETING_DURATION_MINUTES }
