import { readFile } from "node:fs/promises"
import { PrismaClient } from "@prisma/client"
import { buildAnimatedSprite } from "../src/lib/pixellab"

const prisma = new PrismaClient()

type Args = {
  id: string
  photo: string
  description: string
  initStrength?: number
  frameCount?: number
  seed?: number
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  const map: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith("--")) {
      const k = a.slice(2)
      const v = args[i + 1]
      if (v && !v.startsWith("--")) {
        map[k] = v
        i++
      } else {
        map[k] = "true"
      }
    }
  }
  if (!map.id) throw new Error("--id required")
  if (!map.photo) throw new Error("--photo required")
  if (!map.description) throw new Error("--description required")
  return {
    id: map.id,
    photo: map.photo,
    description: map.description,
    initStrength: map["init-strength"] ? Number(map["init-strength"]) : undefined,
    frameCount: map["frame-count"] ? Number(map["frame-count"]) : undefined,
    seed: map.seed ? Number(map.seed) : undefined,
  }
}

async function main() {
  const args = parseArgs()

  const specialist = await prisma.specialist.findUnique({ where: { id: args.id } })
  if (!specialist) throw new Error(`Specialist ${args.id} not found`)
  console.log(`→ Generating sprite for ${specialist.name} (${args.id})`)
  console.log(`  Photo: ${args.photo}`)
  console.log(`  Description: ${args.description}`)
  console.log(`  initStrength=${args.initStrength ?? 500}, frameCount=${args.frameCount ?? 8}, seed=${args.seed ?? "random"}`)

  const photoBuf = await readFile(args.photo)
  console.log(`  Photo loaded: ${Math.round(photoBuf.length / 1024)} KB\n`)

  const t0 = Date.now()
  console.log("[1/2] Generating portrait via /create-image-pixflux (~2 min)…")
  console.log("[2/2] Animating breathing via /animate-with-text-v3 (~1-2 min)…\n")

  const result = await buildAnimatedSprite({
    referenceImage: photoBuf,
    description: args.description,
    initStrength: args.initStrength,
    frameCount: args.frameCount as 4 | 6 | 8 | 10 | 12 | 14 | 16 | undefined,
    seed: args.seed,
  })

  const elapsed = Math.round((Date.now() - t0) / 1000)
  console.log(`✓ Pipeline finished in ${elapsed}s`)
  console.log(`  Frames: ${result.frames}`)
  console.log(`  Frame size: ${result.frameWidth}×${result.frameHeight}`)
  console.log(`  Sprite sheet data URL length: ${result.spriteDataUrl.length} chars`)

  await prisma.specialist.update({
    where: { id: args.id },
    data: {
      photoUrl: result.spriteDataUrl,
      spriteFrames: result.frames,
      spriteWidth: result.frameWidth,
    },
  })
  console.log(`✓ Saved to DB\n`)
  console.log(`Abra /selecionar ou /admin pra ver o resultado.`)
}

main()
  .catch((e) => {
    console.error("✗", e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
