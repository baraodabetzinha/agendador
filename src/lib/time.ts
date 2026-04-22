import { formatInTimeZone } from "date-fns-tz"
import { ptBR } from "date-fns/locale"

export const APP_TIMEZONE = "America/Sao_Paulo"

export function formatDateTime(date: Date | string) {
  return formatInTimeZone(
    typeof date === "string" ? new Date(date) : date,
    APP_TIMEZONE,
    "EEEE, d 'de' MMMM 'às' HH:mm",
    { locale: ptBR }
  )
}

export function formatDate(date: Date | string) {
  return formatInTimeZone(
    typeof date === "string" ? new Date(date) : date,
    APP_TIMEZONE,
    "d 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  )
}

export function formatTime(date: Date | string) {
  return formatInTimeZone(
    typeof date === "string" ? new Date(date) : date,
    APP_TIMEZONE,
    "HH:mm"
  )
}
