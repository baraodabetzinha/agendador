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
