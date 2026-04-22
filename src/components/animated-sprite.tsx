"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Props = {
  src: string
  frames: number
  frameWidth: number
  frameHeight?: number // defaults to frameWidth (assumes square)
  fps?: number // default 6
  size?: number // rendered square size in px, default 256
  className?: string
}

export function AnimatedSprite({
  src,
  frames,
  frameWidth,
  frameHeight,
  fps = 6,
  size = 256,
  className,
}: Props) {
  const fh = frameHeight ?? frameWidth
  const aspect = fh / frameWidth
  const renderedHeight = size * aspect
  const sheetWidth = frameWidth * frames
  const scale = size / frameWidth
  const animationDuration = frames / fps
  const uid = React.useId().replace(/[^a-z0-9]/gi, "") // unique per instance

  // Each frame at rendered size is `size` px wide. Total bg width scaled = size * frames.
  const bgWidth = size * frames
  const keyframesRule = `@keyframes sprite-${uid} { from { background-position: 0 0; } to { background-position: -${bgWidth}px 0; } }`

  return (
    <>
      <style>{keyframesRule}</style>
      <div
        aria-label="Animated sprite"
        className={cn("inline-block", className)}
        style={{
          width: size,
          height: renderedHeight,
          backgroundImage: `url("${src}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${sheetWidth * scale}px ${fh * scale}px`,
          imageRendering: "pixelated",
          animation: `sprite-${uid} ${animationDuration}s steps(${frames}) infinite`,
        }}
      />
    </>
  )
}
