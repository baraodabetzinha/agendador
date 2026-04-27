import "server-only"
import { prisma } from "@/lib/db"
import { sendWhatsApp } from "@/lib/evolution"

const THROTTLE_SECONDS = 90 // tempo mínimo entre disparos
const MAX_ATTEMPTS = 3
const RETRY_BACKOFF_SECONDS = 120
const TICK_INTERVAL_MS = 30_000 // worker checa a fila a cada 30s

export async function enqueueWhatsApp(recipient: string, text: string) {
  const last = await prisma.messageQueue.findFirst({
    where: { status: { in: ["PENDING", "SENT"] } },
    orderBy: { scheduledAt: "desc" },
    select: { scheduledAt: true },
  })
  const baseline = last
    ? last.scheduledAt.getTime() + THROTTLE_SECONDS * 1000
    : 0
  const scheduledAt = new Date(Math.max(Date.now(), baseline))

  const queued = await prisma.messageQueue.create({
    data: { recipient, text, scheduledAt },
  })
  console.log(
    `[wa-queue] enqueued ${queued.id} for ${queued.recipient} at ${scheduledAt.toISOString()}`
  )
  return queued
}

export async function processQueueOnce(): Promise<boolean> {
  const next = await prisma.messageQueue.findFirst({
    where: {
      status: "PENDING",
      scheduledAt: { lte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
  })
  if (!next) return false

  try {
    const ok = await sendWhatsApp(next.recipient, next.text)
    if (!ok) throw new Error("sendWhatsApp returned false")
    await prisma.messageQueue.update({
      where: { id: next.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        attempts: { increment: 1 },
      },
    })
    console.log(`[wa-queue] sent ${next.id} → ${next.recipient}`)
    return true
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e)
    const attempts = next.attempts + 1
    if (attempts >= MAX_ATTEMPTS) {
      await prisma.messageQueue.update({
        where: { id: next.id },
        data: { status: "FAILED", attempts, lastError: err },
      })
      console.error(
        `[wa-queue] failed permanently ${next.id}: ${err} (after ${attempts} attempts)`
      )
    } else {
      const retryAt = new Date(Date.now() + RETRY_BACKOFF_SECONDS * 1000)
      await prisma.messageQueue.update({
        where: { id: next.id },
        data: { attempts, lastError: err, scheduledAt: retryAt },
      })
      console.warn(
        `[wa-queue] retry ${next.id} in ${RETRY_BACKOFF_SECONDS}s (attempt ${attempts}): ${err}`
      )
    }
    return true
  }
}

let workerStarted = false
let intervalHandle: NodeJS.Timeout | null = null

export function startQueueWorker() {
  if (workerStarted) return
  workerStarted = true
  intervalHandle = setInterval(() => {
    processQueueOnce().catch((e) =>
      console.error("[wa-queue] tick error", e)
    )
  }, TICK_INTERVAL_MS)
  // tick imediato no boot pra não esperar 30s caso haja fila
  processQueueOnce().catch(() => {})
  console.log(
    `[wa-queue] worker started (throttle=${THROTTLE_SECONDS}s, tick=${TICK_INTERVAL_MS}ms)`
  )
}

export function stopQueueWorker() {
  if (intervalHandle) clearInterval(intervalHandle)
  intervalHandle = null
  workerStarted = false
}
