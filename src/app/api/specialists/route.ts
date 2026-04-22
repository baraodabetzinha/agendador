import { NextResponse } from "next/server"
import { listSpecialists } from "@/lib/specialists"

export async function GET() {
  const specialists = await listSpecialists()
  return NextResponse.json({ specialists })
}
