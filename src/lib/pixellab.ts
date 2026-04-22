import sharp from "sharp"

const BASE_URL = process.env.PIXELLAB_API_URL ?? "https://api.pixellab.ai/v2"
const TOKEN = process.env.PIXELLAB_API_TOKEN

function authHeaders() {
  if (!TOKEN) throw new Error("Missing PIXELLAB_API_TOKEN")
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  }
}

type Base64Image = { type: "base64"; base64: string; format: "png" | "jpeg" }

async function pixellabPOST<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Pixellab ${path} ${res.status}: ${text.slice(0, 500)}`)
  }
  return JSON.parse(text) as T
}

/* -------- Portrait (synchronous) -------- */

type PixfluxResponse = {
  image: Base64Image
  usage?: unknown
}

export type PortraitStyle = {
  outline?:
    | "single color black outline"
    | "single color outline"
    | "selective outline"
    | "lineless"
  shading?:
    | "flat shading"
    | "basic shading"
    | "medium shading"
    | "detailed shading"
    | "highly detailed shading"
  detail?: "low detail" | "medium detail" | "highly detailed"
  view?: "side" | "low top-down" | "high top-down" | "perspective"
}

export type GeneratePortraitInput = {
  description: string
  referenceImage: Buffer // raw image buffer (png/jpeg)
  size?: number // square, default 128
  initStrength?: number // 1-999, default 500
  seed?: number
  style?: PortraitStyle
}

export async function generatePortrait(input: GeneratePortraitInput): Promise<Buffer> {
  const size = input.size ?? 128
  const resized = await sharp(input.referenceImage)
    .resize(size, size, { fit: "cover", position: "attention" })
    .png()
    .toBuffer()

  const style: Required<PortraitStyle> = {
    outline: input.style?.outline ?? "single color black outline",
    shading: input.style?.shading ?? "detailed shading",
    detail: input.style?.detail ?? "highly detailed",
    view: input.style?.view ?? "side",
  }

  const body = {
    description: input.description,
    image_size: { width: size, height: size },
    text_guidance_scale: 8,
    outline: style.outline,
    shading: style.shading,
    detail: style.detail,
    view: style.view,
    no_background: true,
    init_image: {
      type: "base64",
      base64: resized.toString("base64"),
      format: "png",
    },
    init_image_strength: input.initStrength ?? 500,
    seed: input.seed,
  }
  const data = await pixellabPOST<PixfluxResponse>("/create-image-pixflux", body)
  return Buffer.from(data.image.base64, "base64")
}

/* -------- Animate idle (async with polling) -------- */

type AnimateStartResponse = {
  background_job_id: string
  status: string
  usage?: unknown
}

type JobStatusResponse = {
  id: string
  status: "pending" | "processing" | "completed" | "failed" | string
  last_response?: {
    images?: Base64Image[]
    status?: string
    progress?: number
  }
  error?: unknown
}

export type AnimateIdleInput = {
  firstFramePng: Buffer
  action?: string
  frameCount?: 4 | 6 | 8 | 10 | 12 | 14 | 16
  seed?: number
  pollIntervalMs?: number
  timeoutMs?: number
}

export async function animateIdle(input: AnimateIdleInput): Promise<Buffer[]> {
  const startBody = {
    first_frame: {
      type: "base64",
      base64: input.firstFramePng.toString("base64"),
      format: "png",
    },
    action:
      input.action ??
      "standing idle breathing slowly, subtle chest rise and fall, minimal motion",
    frame_count: input.frameCount ?? 8,
    no_background: true,
    seed: input.seed,
  }
  const start = await pixellabPOST<AnimateStartResponse>(
    "/animate-with-text-v3",
    startBody
  )
  const jobId = start.background_job_id
  if (!jobId) throw new Error("animate-v3 did not return background_job_id")

  const interval = input.pollIntervalMs ?? 2000
  const timeout = input.timeoutMs ?? 5 * 60_000
  const started = Date.now()

  while (Date.now() - started < timeout) {
    await new Promise((r) => setTimeout(r, interval))
    const res = await fetch(`${BASE_URL}/background-jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    if (!res.ok) {
      throw new Error(`Poll ${jobId} ${res.status}: ${(await res.text()).slice(0, 300)}`)
    }
    const job = (await res.json()) as JobStatusResponse
    if (job.status === "completed" || job.status === "success") {
      const frames = job.last_response?.images
      if (!frames || frames.length === 0) {
        throw new Error("Job completed but returned no frames")
      }
      return frames.map((f) => Buffer.from(f.base64, "base64"))
    }
    if (job.status === "failed" || job.status === "error") {
      throw new Error(`animate-v3 job ${jobId} failed: ${JSON.stringify(job.error ?? job)}`)
    }
  }
  throw new Error(`animate-v3 job ${jobId} timed out`)
}

/* -------- Sprite sheet composition -------- */

export async function composeSpriteSheet(
  framesPng: Buffer[]
): Promise<{ buffer: Buffer; frameWidth: number; frameHeight: number; frames: number }> {
  if (framesPng.length === 0) throw new Error("no frames to compose")
  const firstMeta = await sharp(framesPng[0]).metadata()
  const frameWidth = firstMeta.width ?? 128
  const frameHeight = firstMeta.height ?? 128

  const normalized = await Promise.all(
    framesPng.map((f) =>
      sharp(f).resize(frameWidth, frameHeight, { fit: "cover" }).png().toBuffer()
    )
  )

  const composites = normalized.map((input, i) => ({
    input,
    left: i * frameWidth,
    top: 0,
  }))

  const buffer = await sharp({
    create: {
      width: frameWidth * framesPng.length,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer()

  return {
    buffer,
    frameWidth,
    frameHeight,
    frames: framesPng.length,
  }
}

/* -------- High-level pipeline -------- */

export type BuildSpriteInput = {
  referenceImage: Buffer
  description: string
  size?: number
  initStrength?: number
  frameCount?: 4 | 6 | 8 | 10 | 12 | 14 | 16
  seed?: number
  action?: string
  style?: PortraitStyle
}

export type BuildSpriteResult = {
  spriteDataUrl: string
  portraitDataUrl: string
  frameWidth: number
  frameHeight: number
  frames: number
}

export async function buildAnimatedSprite(
  input: BuildSpriteInput
): Promise<BuildSpriteResult> {
  const portrait = await generatePortrait({
    description: input.description,
    referenceImage: input.referenceImage,
    size: input.size,
    initStrength: input.initStrength,
    seed: input.seed,
    style: input.style,
  })
  const frames = await animateIdle({
    firstFramePng: portrait,
    frameCount: input.frameCount,
    action: input.action,
    seed: input.seed,
  })
  const sheet = await composeSpriteSheet(frames)
  return {
    spriteDataUrl: `data:image/png;base64,${sheet.buffer.toString("base64")}`,
    portraitDataUrl: `data:image/png;base64,${portrait.toString("base64")}`,
    frameWidth: sheet.frameWidth,
    frameHeight: sheet.frameHeight,
    frames: sheet.frames,
  }
}

/* -------- Account -------- */

export async function getBalance() {
  const res = await fetch(`${BASE_URL}/balance`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (!res.ok) throw new Error(`Balance ${res.status}`)
  return res.json()
}
