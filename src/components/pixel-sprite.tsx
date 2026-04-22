import * as React from "react"

type Variant = "victor" | "musso" | "rodrigo" | "mystery"

type Sprite = {
  palette: string[]
  rows: string[]
}

// Sprites 16x16. Cada char é índice da paleta; '.' = transparente.
// Design bust-style (cabeça + ombros) estilo portrait de fighting game.
const SPRITES: Record<Variant, Sprite> = {
  victor: {
    palette: [
      "transparent",
      "#1A0B3E", // 1 outline
      "#6B3FA0", // 2 roxo principal
      "#FFD700", // 3 estrela dourada
      "#FFDBAC", // 4 pele
      "#2C1A00", // 5 olho/boca
      "#8A5FC7", // 6 highlight roxo
    ],
    rows: [
      "................",
      ".......111......",
      "......12221.....",
      ".....1222221....",
      "....122232221...",
      "...12223322221..",
      "..1222222222221.",
      "..1111111111111.",
      "....44444444....",
      "....44544544....",
      "....44444444....",
      "....44455444....",
      "....44444444....",
      "...2222222222...",
      "..222226662222..",
      ".11222222222211.",
    ],
  },
  musso: {
    palette: [
      "transparent",
      "#3D0F0A", // 1 outline
      "#A8272A", // 2 vermelho camisa
      "#C49A6C", // 3 bandana tan
      "#FFDBAC", // 4 pele
      "#2C1A00", // 5 olho/bigode
      "#8B4513", // 6 chapéu marrom
      "#5A2914", // 7 sombra chapéu
    ],
    rows: [
      "................",
      "................",
      ".....666666.....",
      ".....666666.....",
      "....66666666....",
      ".16666666666661.",
      ".11111111111111.",
      "....44444444....",
      "....44544544....",
      "....44444444....",
      "....44555544....",
      "....44444444....",
      "....22333322....",
      "...2233333322...",
      "..222222222222..",
      ".11111111111111.",
    ],
  },
  rodrigo: {
    palette: [
      "transparent",
      "#0A1628", // 1 outline escuro
      "#1E3A5F", // 2 capuz azul escuro
      "#00D4FF", // 3 cristal cyan
      "#FFDBAC", // 4 pele
      "#2C1A00", // 5 olho
      "#3A6B9E", // 6 highlight capuz
      "#7BC9E8", // 7 brilho cristal
    ],
    rows: [
      "................",
      "................",
      ".....222222.....",
      "....22666622....",
      "...2266666622...",
      "..22266666622...",
      "..22644446622...",
      "..22644446622...",
      "..22654456622...",
      "..22644446622...",
      "..22644446622...",
      "...2266666622...",
      "....22222222....",
      "...2222332222...",
      "..222233332222..",
      ".11111111111111.",
    ],
  },
  mystery: {
    palette: [
      "transparent",
      "#050208", // 1 silhueta quase preta
      "#1a1428", // 2 outline
      "#FFD700", // 3 dourado (???)
    ],
    rows: [
      "................",
      ".......221......",
      "......21112.....",
      ".....2111112....",
      "....211111112...",
      "...21111111112..",
      "..2111111111112.",
      "..2222222222222.",
      "....11111111....",
      "....11311311....",
      "....11111111....",
      "....11133111....",
      "....11111111....",
      "...1111311111...",
      "..111111111111..",
      ".22111111111122.",
    ],
  },
}

export function PixelSprite({
  variant,
  className,
}: {
  variant: Variant
  className?: string
}) {
  const sprite = SPRITES[variant]
  const rects: React.ReactNode[] = []
  for (let y = 0; y < sprite.rows.length; y++) {
    const row = sprite.rows[y]
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === ".") continue
      const idx = parseInt(ch, 10)
      const color = sprite.palette[idx]
      if (!color || color === "transparent") continue
      rects.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
      )
    }
  }
  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: "pixelated" }}
      aria-hidden
    >
      {rects}
    </svg>
  )
}

export type PixelVariant = Variant
