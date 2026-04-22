import fs from "node:fs"

const QR_SVG = "/Users/macbook/agendador/public/qr-agendador.svg"
const LOGO = "/tmp/turbo-logo.png"
const OUT = "/Users/macbook/agendador/public/qr-agendador-logo.svg"

const qr = fs.readFileSync(QR_SVG, "utf8")
const logo = fs.readFileSync(LOGO)
const logoB64 = logo.toString("base64")

// viewBox do QR é 0 0 45 45 (cada módulo = 1 unidade, margin 4, QR 33)
// Logo original 1021x712 → ratio 1.4340
const ratio = 1021 / 712

const VIEW = 45
const LOGO_W = 10        // 22% do QR — dentro da margem de correção H (30%)
const LOGO_H = LOGO_W / ratio
const BG_SIZE = 11.5     // ~25% do QR pro fundo branco
const RX = 1.2           // raio dos cantos arredondados

const bgX = (VIEW - BG_SIZE) / 2
const bgY = (VIEW - BG_SIZE) / 2
const logoX = (VIEW - LOGO_W) / 2
const logoY = (VIEW - LOGO_H) / 2

const injection =
  `<rect x="${bgX}" y="${bgY}" width="${BG_SIZE}" height="${BG_SIZE}" rx="${RX}" ry="${RX}" fill="#ffffff"/>` +
  `<image x="${logoX.toFixed(3)}" y="${logoY.toFixed(3)}" width="${LOGO_W}" height="${LOGO_H.toFixed(3)}" href="data:image/png;base64,${logoB64}"/>`

// Injeta logo antes do </svg>
const out = qr.replace("</svg>", injection + "</svg>")

fs.writeFileSync(OUT, out)
const sizeKb = Math.round(fs.statSync(OUT).size / 1024)
console.log(`✓ Gerado: ${OUT} (${sizeKb} KB)`)
console.log(`  Logo: ${LOGO_W} × ${LOGO_H.toFixed(2)} units (viewBox ${VIEW}×${VIEW})`)
console.log(`  Posição: (${logoX.toFixed(2)}, ${logoY.toFixed(2)})`)
