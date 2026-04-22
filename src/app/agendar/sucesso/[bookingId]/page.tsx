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
    <main className="mx-auto w-full max-w-lg px-6 py-10 md:py-16">
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground rounded-full p-2">
          <Check className="size-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Agendado!</h1>
      </div>
      <p className="text-muted-foreground mb-8 text-base sm:text-lg">
        Enviamos o convite por email e uma confirmação no seu WhatsApp.
      </p>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              {booking.specialist.photoUrl ? (
                <AvatarImage src={booking.specialist.photoUrl} alt={booking.specialist.name} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{booking.specialist.name}</p>
              <p className="text-muted-foreground text-sm">{booking.specialist.title}</p>
            </div>
            {booking.wasAnyRequest && (
              <Badge variant="outline" className="ml-auto">
                Qualquer 1
              </Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Data e hora</p>
              <p className="font-medium">{formatDateTime(booking.startsAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assunto</p>
              <p className="font-medium">{booking.subject}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Convidado</p>
              <p className="font-medium">{booking.clientName} · {booking.clientEmail}</p>
            </div>
          </div>

          {booking.meetLink && (
            <a
              href={booking.meetLink}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg", className: "w-full gap-2" })}
            >
              <Video className="size-4" /> Abrir Google Meet
            </a>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link href="/" className={buttonVariants({ variant: "link" })}>
          Voltar para início
        </Link>
      </div>
    </main>
  )
}
