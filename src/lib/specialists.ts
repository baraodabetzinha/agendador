import { prisma } from "@/lib/db"

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
  skills: string[]
  stats: SpecialistStat[]
  isConnected: boolean
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

export async function listSpecialists(): Promise<SpecialistSummary[]> {
  const rows = await prisma.specialist.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
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
    skills: parseSkills(s.skills),
    stats: parseStats(s.stats),
    isConnected: Boolean(s.googleRefreshToken),
  }))
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
