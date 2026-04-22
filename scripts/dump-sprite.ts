import { PrismaClient } from "@prisma/client"
import { writeFile } from "node:fs/promises"
import sharp from "sharp"

async function main() {
  const prisma = new PrismaClient()
  const id = process.argv[2] ?? "victor"
  const s = await prisma.specialist.findUnique({ where: { id } })
  if (!s?.photoUrl) {
    console.error("No sprite")
    process.exit(1)
  }
  const base64 = s.photoUrl.replace(/^data:image\/png;base64,/, "")
  const buf = Buffer.from(base64, "base64")
  await writeFile(`/tmp/${s.id}-sheet.png`, buf)
  console.log(
    `Saved /tmp/${s.id}-sheet.png | ${buf.length} bytes | ${s.spriteFrames} frames | ${s.spriteWidth}px/frame`
  )
  if (s.spriteFrames && s.spriteWidth) {
    for (let i = 0; i < s.spriteFrames; i++) {
      const frame = await sharp(buf)
        .extract({
          left: i * s.spriteWidth,
          top: 0,
          width: s.spriteWidth,
          height: s.spriteWidth,
        })
        .png()
        .toBuffer()
      await writeFile(`/tmp/${s.id}-f${i}.png`, frame)
    }
    console.log(`Saved /tmp/${s.id}-f0..${s.spriteFrames - 1}.png`)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
