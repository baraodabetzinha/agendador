import { NextResponse } from "next/server"
import { exchangeCode } from "@/lib/google"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const specialistId = url.searchParams.get("state")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin

  if (!code || !specialistId) {
    return NextResponse.redirect(`${appUrl}/admin?error=missing_code_or_state`)
  }

  try {
    const { refreshToken, email, picture } = await exchangeCode(code)
    if (!refreshToken) {
      return NextResponse.redirect(`${appUrl}/admin?error=no_refresh_token`)
    }
    await prisma.specialist.update({
      where: { id: specialistId },
      data: {
        googleRefreshToken: refreshToken,
        googleEmail: email,
        googlePicture: picture,
      },
    })
    return NextResponse.redirect(`${appUrl}/admin?connected=${specialistId}`)
  } catch (e) {
    console.error("[oauth callback]", e)
    return NextResponse.redirect(`${appUrl}/admin?error=oauth_failed`)
  }
}
