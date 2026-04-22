import sharp from "sharp"
import fs from "node:fs"

const QR = "/Users/macbook/agendador/public/qr-agendador.png"
const LOGO = "/tmp/turbo-logo.png"
const OUT = "/Users/macbook/agendador/public/qr-agendador-logo.png"

const qrSize = 1200
const whiteSize = 300       // 25% do QR — fundo branco pra logo
const logoMax = 220         // 18% — logo dentro desse box mantendo aspect ratio

// Redimensiona logo mantendo proporção
const logo = await sharp(LOGO)
  .resize(logoMax, logoMax, { fit: "inside", withoutEnlargement: false })
  .png()
  .toBuffer()

const meta = await sharp(logo).metadata()
console.log("Logo redimensionada:", meta.width + "x" + meta.height)

// Fundo branco arredondado (SVG)
const roundedBg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${whiteSize}" height="${whiteSize}">
     <rect x="0" y="0" width="${whiteSize}" height="${whiteSize}" rx="32" ry="32" fill="white"/>
   </svg>`
)

const offsetBg = Math.round((qrSize - whiteSize) / 2)
const offsetLogo = Math.round((qrSize - (meta.width ?? logoMax)) / 2)
const offsetLogoY = Math.round((qrSize - (meta.height ?? logoMax)) / 2)

await sharp(QR)
  .composite([
    { input: roundedBg, top: offsetBg, left: offsetBg },
    { input: logo, top: offsetLogoY, left: offsetLogo },
  ])
  .png()
  .toFile(OUT)

const finalSize = fs.statSync(OUT).size
console.log("Gerado:", OUT, "(" + Math.round(finalSize / 1024) + " KB)")
