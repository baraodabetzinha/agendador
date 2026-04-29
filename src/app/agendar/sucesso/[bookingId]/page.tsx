import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { formatDateTime } from "@/lib/time"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Video } from "lucide-react"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zm-7.01 15.24h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01s-.43.06-.66.31c-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.28z" />
    </svg>
  )
}

function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "")
  const normalized = digits.startsWith("55") ? digits : `55${digits}`
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export const dynamic = "force-dynamic"

export default async function SucessoPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { specialist: true },
  })
  if (!booking) notFound()

  const initials = booking.specialist.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const firstName = booking.clientName.split(" ")[0]
  const whatsappLink = booking.specialist.phone
    ? buildWhatsAppLink(
        booking.specialist.phone,
        `Olá, ${booking.specialist.name.split(" ")[0]}! Aqui é ${firstName}. Acabei de agendar nossa reunião pra ${formatDateTime(booking.startsAt)}. Qualquer coisa antes do nosso papo, me chama por aqui!`
      )
    : null

  return (
    <main className="mx-auto w-full max-w-lg px-5 pt-3 pb-8 sm:px-6 md:py-12">
      <div className="mb-2 flex items-center gap-2.5 md:mb-3">
        <div className="bg-primary text-primary-foreground rounded-full p-1.5">
          <Check className="size-4 md:size-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
          Agendado!
        </h1>
      </div>
      <p className="text-muted-foreground mb-4 text-sm sm:text-base md:mb-6">
        Enviamos o convite por email e uma confirmação no seu WhatsApp.
      </p>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 md:gap-5 md:p-6">
          <div className="flex items-center gap-3">
            <Avatar className="size-11 md:size-14">
              {booking.specialist.googlePicture ? (
                <AvatarImage
                  src={booking.specialist.googlePicture}
                  alt={booking.specialist.name}
                />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{booking.specialist.name}</p>
              <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
                {booking.specialist.title}
              </p>
            </div>
            {booking.wasAnyRequest && (
              <Badge variant="outline" className="ml-auto text-[10px]">
                Qualquer 1
              </Badge>
            )}
          </div>

          <Separator />

          <div className="grid gap-2.5 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Data e hora</p>
              <p className="font-medium">{formatDateTime(booking.startsAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Assunto</p>
              <p className="line-clamp-2 font-medium">{booking.subject}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Convidado</p>
              <p className="truncate font-medium">
                {booking.clientName} · {booking.clientEmail}
              </p>
            </div>
          </div>

          {booking.meetLink && (
            <a
              href={booking.meetLink}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                size: "default",
                className: "h-11 w-full gap-2 text-sm",
              })}
            >
              <Video className="size-4" /> Abrir Google Meet
            </a>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="ring-offset-background focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1ebe5b] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <WhatsAppIcon className="size-5" />
              Falar com {booking.specialist.name.split(" ")[0]} no WhatsApp
            </a>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-center md:mt-6">
        <Link href="/" className={buttonVariants({ variant: "link", size: "sm" })}>
          Voltar para início
        </Link>
      </div>
    </main>
  )
}
