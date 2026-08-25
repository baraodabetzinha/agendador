import { prisma } from "@/lib/db"
import { MAX_DIRECT_BOOKINGS } from "@/lib/limits"

export { MAX_DIRECT_BOOKINGS } from "@/lib/limits"

export type SpecialistStat = { label: string; value: number }

export type SpecialistSummary = {
  id: string
  name: string
  title: string
  bio: string | null
  photoUrl: string | null
  spriteFrames: number | null
  spriteWidth: number | null
  rotationUrl: string | null
  rotationFrames: number | null
  rotationWidth: number | null
  googlePicture: string | null
  phone: string | null
  skills: string[]
  stats: SpecialistStat[]
  isConnected: boolean
  directBookings: number
  isFull: boolean
}

function parseSkills(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string")
  } catch {}
  return []
}

function parseStats(raw: string): SpecialistStat[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (s) =>
          s &&
          typeof s === "object" &&
          typeof s.label === "string" &&
          typeof s.value === "number"
      )
      .map((s) => ({
        label: String(s.label),
        value: Math.max(0, Math.min(100, Math.round(s.value))),
      }))
  } catch {}
  return []
}

export async function countDirectBookings(): Promise<Map<string, number>> {
  const grouped = await prisma.booking.groupBy({
    by: ["specialistId"],
    where: { wasAnyRequest: false, status: "CONFIRMED" },
    _count: { _all: true },
  })
  return new Map(grouped.map((g) => [g.specialistId, g._count._all]))
}

export async function listSpecialists(): Promise<SpecialistSummary[]> {
  const [rows, directCounts] = await Promise.all([
    prisma.specialist.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    countDirectBookings(),
  ])
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    bio: s.bio,
    photoUrl: s.photoUrl,
    spriteFrames: s.spriteFrames,
    spriteWidth: s.spriteWidth,
    rotationUrl: s.rotationUrl,
    rotationFrames: s.rotationFrames,
    rotationWidth: s.rotationWidth,
    googlePicture: s.googlePicture,
    phone: s.phone,
    skills: parseSkills(s.skills),
    stats: parseStats(s.stats),
    isConnected: Boolean(s.googleRefreshToken),
    directBookings: directCounts.get(s.id) ?? 0,
    isFull: (directCounts.get(s.id) ?? 0) >= MAX_DIRECT_BOOKINGS,
  }))
}

/** Especialistas que ainda podem receber agendamento direto — usado nas telas de seleção. */
export async function listBookableSpecialists(): Promise<SpecialistSummary[]> {
  const all = await listSpecialists()
  return all.filter((s) => !s.isFull)
}

export async function getSpecialist(id: string) {
  const s = await prisma.specialist.findUnique({ where: { id } })
  if (!s) return null
  return {
    ...s,
    skillsArray: parseSkills(s.skills),
    statsArray: parseStats(s.stats),
  }
}
