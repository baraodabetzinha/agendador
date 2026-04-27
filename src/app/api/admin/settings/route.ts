import { NextResponse } from "next/server"
import { z } from "zod"
import { HOMEPAGE_OPTIONS, saveSettings } from "@/lib/settings"

const schema = z.object({
  homepage: z.enum(HOMEPAGE_OPTIONS),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }
  const next = await saveSettings(parsed.data)
  return NextResponse.json({ ok: true, settings: next })
}
