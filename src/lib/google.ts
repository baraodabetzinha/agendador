import { google } from "googleapis"
import type { calendar_v3 } from "googleapis"
import { prisma } from "@/lib/db"

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
]

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    requireEnv("GOOGLE_CLIENT_ID"),
    requireEnv("GOOGLE_CLIENT_SECRET"),
    requireEnv("GOOGLE_REDIRECT_URI")
  )
}

export function getAuthUrl(specialistId: string) {
  const client = getOAuth2Client()
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: specialistId,
    include_granted_scopes: true,
  })
}

export async function exchangeCode(code: string) {
  const client = getOAuth2Client()
  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)

  const oauth2 = google.oauth2({ version: "v2", auth: client })
  const { data } = await oauth2.userinfo.get()

  return {
    refreshToken: tokens.refresh_token ?? null,
    email: data.email ?? null,
    picture: data.picture ?? null,
  }
}

async function getAuthedClientForSpecialist(specialistId: string) {
  const specialist = await prisma.specialist.findUnique({
    where: { id: specialistId },
  })
  if (!specialist?.googleRefreshToken) {
    throw new Error(`Specialist ${specialistId} has no Google connection`)
  }
  const client = getOAuth2Client()
  client.setCredentials({ refresh_token: specialist.googleRefreshToken })
  return { client, specialist }
}

export async function getCalendarForSpecialist(specialistId: string) {
  const { client, specialist } = await getAuthedClientForSpecialist(specialistId)
  const calendar = google.calendar({ version: "v3", auth: client })
  return { calendar, specialist }
}

export type BusyInterval = { start: Date; end: Date }

export async function getBusyIntervals(
  specialistId: string,
  from: Date,
  to: Date
): Promise<BusyInterval[]> {
  const { calendar } = await getCalendarForSpecialist(specialistId)
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      items: [{ id: "primary" }],
    },
  })
  const busy = res.data.calendars?.primary?.busy ?? []
  return busy
    .filter((b) => b.start && b.end)
    .map((b) => ({ start: new Date(b.start!), end: new Date(b.end!) }))
}

export type CreatedEvent = {
  eventId: string
  meetLink: string | null
  htmlLink: string | null
}

export async function createMeetingEvent(params: {
  specialistId: string
  summary: string
  description: string
  start: Date
  end: Date
  clientEmail: string
  clientName: string
}): Promise<CreatedEvent> {
  const { calendar, specialist } = await getCalendarForSpecialist(
    params.specialistId
  )
  const res = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.start.toISOString() },
      end: { dateTime: params.end.toISOString() },
      attendees: [
        { email: params.clientEmail, displayName: params.clientName },
        ...(specialist.googleEmail
          ? [{ email: specialist.googleEmail, displayName: specialist.name }]
          : []),
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  })

  const event = res.data as calendar_v3.Schema$Event
  return {
    eventId: event.id ?? "",
    meetLink: event.hangoutLink ?? null,
    htmlLink: event.htmlLink ?? null,
  }
}
