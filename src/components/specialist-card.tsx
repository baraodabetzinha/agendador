import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { SpecialistSummary } from "@/lib/specialists"

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function SpecialistCard({ specialist }: { specialist: SpecialistSummary }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            {specialist.googlePicture ? (
              <AvatarImage src={specialist.googlePicture} alt={specialist.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials(specialist.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold">{specialist.name}</h3>
            <p className="text-muted-foreground text-sm">{specialist.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {specialist.bio && (
          <p className="text-muted-foreground text-sm leading-relaxed">{specialist.bio}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {specialist.skills.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={`/agendar/${specialist.id}`}
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Agendar com {specialist.name.split(" ")[0]}
        </Link>
      </CardFooter>
    </Card>
  )
}

export function AnySpecialistCard({ specialists }: { specialists: SpecialistSummary[] }) {
  const first3 = specialists.slice(0, 3)
  return (
    <Card className="flex h-full flex-col border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {first3.map((s) => (
              <Avatar key={s.id} className="size-12 border-background border-2">
                {s.googlePicture ? (
                  <AvatarImage src={s.googlePicture} alt={s.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials(s.name)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div>
            <h3 className="text-xl font-semibold">Qualquer 1</h3>
            <p className="text-muted-foreground text-sm">
              Agende com o primeiro disponível
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Se não importa com quem, escolha essa opção. Mostramos todos os horários livres entre os especialistas e balanceamos quem atende.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">Encaixe rápido</Badge>
          <Badge variant="outline">Rotação justa</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={`/agendar/any`}
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Agendar com qualquer especialista
        </Link>
      </CardFooter>
    </Card>
  )
}
