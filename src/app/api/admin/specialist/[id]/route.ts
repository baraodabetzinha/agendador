import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  title: z.string().min(1).max(120).optional(),
  bio: z.string().max(500).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  skills: z.array(z.string().min(1).max(40)).max(12).optional(),
  stats: z
    .array(
      z.object({
        label: z.string().min(1).max(20),
        value: z.number().min(0).max(100),
      })
    )
    .max(8)
    .optional(),
})

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data
  const updated = await prisma.specialist.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.skills !== undefined && { skills: JSON.stringify(data.skills) }),
      ...(data.stats !== undefined && { stats: JSON.stringify(data.stats) }),
    },
  })
  return NextResponse.json({ ok: true, specialist: updated })
}
