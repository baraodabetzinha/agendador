import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { PrismaClient } from "@prisma/client"
import { composeSpriteSheet } from "../src/lib/pixellab"

const prisma = new PrismaClient()

type Args = { id: string; framesDir: string }

function parseArgs(): Args {
  const args = process.argv.slice(2)
  const map: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (!a.startsWith("--")) continue
    const k = a.slice(2)
    const v = args[i + 1]
    if (v && !v.startsWith("--")) {
      map[k] = v
      i++
    }
  }
  if (!map.id) throw new Error("--id required")
  if (!map["frames-dir"]) throw new Error("--frames-dir required")
  return { id: map.id, framesDir: map["frames-dir"] }
}

async function main() {
  const { id, framesDir } = parseArgs()

  const specialist = await prisma.specialist.findUnique({ where: { id } })
  if (!specialist) throw new Error(`Specialist ${id} not found`)

  const entries = await readdir(framesDir)
  const frameFiles = entries
    .filter((f) => /^frame_\d+\.png$/.test(f))
    .sort()
  if (frameFiles.length === 0) throw new Error(`No frame_###.png files in ${framesDir}`)

  console.log(`→ ${specialist.name}: loading ${frameFiles.length} frames from ${framesDir}`)
  const buffers = await Promise.all(
    frameFiles.map((f) => readFile(path.join(framesDir, f)))
  )

  const sheet = await composeSpriteSheet(buffers)
  const dataUrl = `data:image/png;base64,${sheet.buffer.toString("base64")}`
  console.log(
    `  Sheet: ${sheet.frames} frames × ${sheet.frameWidth}×${sheet.frameHeight}  (${Math.round(sheet.buffer.length / 1024)} KB)`
  )

  await prisma.specialist.update({
    where: { id },
    data: {
      photoUrl: dataUrl,
      spriteFrames: sheet.frames,
      spriteWidth: sheet.frameWidth,
    },
  })
  console.log(`✓ Saved to DB`)
}

main()
  .catch((e) => {
    console.error("✗", e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
