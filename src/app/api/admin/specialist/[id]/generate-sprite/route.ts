import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { buildAnimatedSprite } from "@/lib/pixellab"

export const runtime = "nodejs"
export const maxDuration = 300

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const specialist = await prisma.specialist.findUnique({ where: { id } })
  if (!specialist) {
    return NextResponse.json({ error: "specialist not found" }, { status: 404 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 })
  }

  const photo = formData.get("photo")
  const description = String(formData.get("description") ?? "").trim()
  const initStrengthRaw = formData.get("initStrength")
  const frameCountRaw = formData.get("frameCount")
  const seedRaw = formData.get("seed")

  if (!(photo instanceof Blob)) {
    return NextResponse.json({ error: "photo file is required" }, { status: 400 })
  }
  if (photo.size === 0) {
    return NextResponse.json({ error: "photo is empty" }, { status: 400 })
  }
  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "photo too large (max 10MB)" }, { status: 413 })
  }
  if (!description || description.length < 5) {
    return NextResponse.json({ error: "description required (min 5 chars)" }, { status: 400 })
  }

  const initStrength = initStrengthRaw ? Number(initStrengthRaw) : undefined
  const frameCount = frameCountRaw ? Number(frameCountRaw) : 8
  const seed = seedRaw ? Number(seedRaw) : undefined

  if (initStrength !== undefined && (isNaN(initStrength) || initStrength < 1 || initStrength > 999)) {
    return NextResponse.json({ error: "initStrength must be 1-999" }, { status: 400 })
  }
  if (![4, 6, 8, 10, 12, 14, 16].includes(frameCount)) {
    return NextResponse.json({ error: "frameCount must be 4/6/8/10/12/14/16" }, { status: 400 })
  }

  const referenceBuffer = Buffer.from(await photo.arrayBuffer())

  let result
  try {
    result = await buildAnimatedSprite({
      referenceImage: referenceBuffer,
      description,
      initStrength,
      frameCount: frameCount as 4 | 6 | 8 | 10 | 12 | 14 | 16,
      seed,
    })
  } catch (e) {
    console.error("[generate-sprite] failed", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "generation failed" },
      { status: 502 }
    )
  }

  await prisma.specialist.update({
    where: { id },
    data: {
      photoUrl: result.spriteDataUrl,
      spriteFrames: result.frames,
      spriteWidth: result.frameWidth,
    },
  })

  return NextResponse.json({
    ok: true,
    frames: result.frames,
    frameWidth: result.frameWidth,
    frameHeight: result.frameHeight,
    portraitPreview: result.portraitDataUrl,
  })
}
