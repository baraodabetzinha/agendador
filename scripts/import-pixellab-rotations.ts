import { readFile } from "node:fs/promises"
import path from "node:path"
import { PrismaClient } from "@prisma/client"
import { composeSpriteSheet } from "../src/lib/pixellab"

const prisma = new PrismaClient()

type Args = { id: string; rotationsDir: string }

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
  if (!map["rotations-dir"]) throw new Error("--rotations-dir required")
  return { id: map.id, rotationsDir: map["rotations-dir"] }
}

async function main() {
  const { id, rotationsDir } = parseArgs()
  const specialist = await prisma.specialist.findUnique({ where: { id } })
  if (!specialist) throw new Error(`Specialist ${id} not found`)

  // Clockwise from viewer: south (front) → east (right) → north (back) → west (left) → south
  const order = ["south", "east", "north", "west"]
  const buffers = await Promise.all(
    order.map((dir) => readFile(path.join(rotationsDir, `${dir}.png`)))
  )

  const sheet = await composeSpriteSheet(buffers)
  const dataUrl = `data:image/png;base64,${sheet.buffer.toString("base64")}`
  console.log(
    `→ ${specialist.name}: rotation ${sheet.frames}×${sheet.frameWidth}×${sheet.frameHeight} (${Math.round(sheet.buffer.length / 1024)} KB)`
  )

  await prisma.specialist.update({
    where: { id },
    data: {
      rotationUrl: dataUrl,
      rotationFrames: sheet.frames,
      rotationWidth: sheet.frameWidth,
    },
  })
  console.log(`✓ Saved rotation for ${specialist.name}`)
}

main()
  .catch((e) => {
    console.error("✗", e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
