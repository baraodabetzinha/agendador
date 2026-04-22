"use client"

import * as React from "react"
import { AnimatedSprite } from "@/components/animated-sprite"

type Config = {
  src: string
  frames: number
  frameWidth: number
  fps?: number
}

type Props = {
  idle: Config
  rotate?: Config | null
  size?: number
  className?: string
}

export function RotatingSprite({ idle, rotate, size = 256, className }: Props) {
  const [hover, setHover] = React.useState(false)
  const active = hover && rotate ? rotate : idle

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={className}
    >
      <AnimatedSprite
        key={hover && rotate ? "rotate" : "idle"}
        src={active.src}
        frames={active.frames}
        frameWidth={active.frameWidth}
        fps={active.fps ?? 6}
        size={size}
      />
    </div>
  )
}
