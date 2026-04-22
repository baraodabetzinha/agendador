import { NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/google"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const specialistId = url.searchParams.get("specialistId")
  if (!specialistId) {
    return NextResponse.json({ error: "specialistId required" }, { status: 400 })
  }
  const specialist = await prisma.specialist.findUnique({
    where: { id: specialistId },
  })
  if (!specialist) {
    return NextResponse.json({ error: "specialist not found" }, { status: 404 })
  }
  return NextResponse.redirect(getAuthUrl(specialistId))
}
