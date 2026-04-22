import { NextResponse } from "next/server"
import { listSpecialists } from "@/lib/specialists"
import { getAvailableSlots } from "@/lib/availability"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const specialistId = url.searchParams.get("specialistId")
  const fromStr = url.searchParams.get("from")
  const toStr = url.searchParams.get("to")

  if (!specialistId || !fromStr || !toStr) {
    return NextResponse.json(
      { error: "specialistId, from and to are required" },
      { status: 400 }
    )
  }

  const from = new Date(fromStr)
  const to = new Date(toStr)
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: "invalid dates" }, { status: 400 })
  }

  const all = await listSpecialists()
  const connected = all.filter((s) => s.isConnected)

  let targetIds: string[]
  if (specialistId === "any") {
    targetIds = connected.map((s) => s.id)
  } else {
    const found = connected.find((s) => s.id === specialistId)
    if (!found) {
      return NextResponse.json(
        { error: "specialist not connected or not found" },
        { status: 404 }
      )
    }
    targetIds = [found.id]
  }

  if (targetIds.length === 0) {
    return NextResponse.json({ slots: [] })
  }

  const slots = await getAvailableSlots(targetIds, from, to)
  return NextResponse.json({ slots })
}
