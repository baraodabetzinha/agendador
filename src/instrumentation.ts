export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startQueueWorker } = await import("@/lib/wa-queue")
    startQueueWorker()
  }
}
