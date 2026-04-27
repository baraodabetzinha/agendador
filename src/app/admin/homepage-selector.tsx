"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ExternalLink, Home } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  type HomepageOption,
  homepagePath,
} from "@/lib/settings-types"

type Option = {
  id: HomepageOption
  label: string
  description: string
  previewPath: string
}

const OPTIONS: Option[] = [
  {
    id: "selecionar",
    label: "Select your fighter (v4)",
    description:
      "Modo arcade mobile-first: 1 especialista por vez, sprite em destaque, navegação por setas/swipe. Caminho oficial.",
    previewPath: "/selecionar",
  },
  {
    id: "default",
    label: "Grid clássico",
    description:
      "Lista todos os especialistas em cards, layout marketing tradicional com hero textual. Visual mais institucional.",
    previewPath: "/?preview=1",
  },
  {
    id: "selecionar-v2",
    label: "Cards verticais",
    description:
      "Grid de cards no estilo SaaS, com sprite no topo, stats como barras finas e botão por especialista.",
    previewPath: "/selecionar-v2",
  },
  {
    id: "selecionar-v3",
    label: "Carrossel imersivo",
    description:
      "Carrossel horizontal com animação cinematográfica, especialistas em destaque em sequência.",
    previewPath: "/selecionar-v3",
  },
]

export function HomepageSelector({ current }: { current: HomepageOption }) {
  const router = useRouter()
  const [selected, setSelected] = useState<HomepageOption>(current)
  const [saving, setSaving] = useState(false)

  const dirty = selected !== current

  async function save() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepage: selected }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success(
        `Página inicial: ${OPTIONS.find((o) => o.id === selected)?.label ?? selected}`
      )
      router.refresh()
    } catch (e) {
      console.error(e)
      toast.error("Não conseguimos salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Home className="size-4" />
              Página inicial pública
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Escolha o que aparece em <code className="bg-muted rounded px-1.5 py-0.5 text-xs">agendador.turbopartners.com.br</code>.
              Visitantes do domínio raiz vão direto pra página marcada.
            </p>
          </div>
          <Badge variant="outline" className="self-start font-mono text-[10px] uppercase">
            Atual: {OPTIONS.find((o) => o.id === current)?.label ?? current}
          </Badge>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {OPTIONS.map((opt) => (
            <PreviewCard
              key={opt.id}
              option={opt}
              isSelected={selected === opt.id}
              isCurrent={current === opt.id}
              onSelect={() => setSelected(opt.id)}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {dirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(current)}
              disabled={saving}
            >
              Cancelar
            </Button>
          )}
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? "Salvando…" : "Salvar página inicial"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PreviewCard({
  option,
  isSelected,
  isCurrent,
  onSelect,
}: {
  option: Option
  isSelected: boolean
  isCurrent: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-all ${
        isSelected
          ? "border-primary ring-primary/20 ring-4"
          : "border-border hover:border-primary/40"
      }`}
    >
      {/* Preview iframe */}
      <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden">
        <div
          className="pointer-events-none absolute top-0 left-0 origin-top-left"
          style={{
            width: "1280px",
            height: "960px",
            transform: "scale(0.32)",
          }}
        >
          <iframe
            src={option.previewPath}
            title={`Preview de ${option.label}`}
            className="size-full border-0"
            sandbox="allow-same-origin allow-scripts"
            loading="lazy"
          />
        </div>

        {/* Selected check overlay */}
        {isSelected && (
          <div className="bg-primary absolute top-2 right-2 flex size-7 items-center justify-center rounded-full">
            <Check className="text-primary-foreground size-4" strokeWidth={3} />
          </div>
        )}
        {isCurrent && !isSelected && (
          <Badge className="absolute top-2 right-2 text-[10px]" variant="secondary">
            Em uso
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{option.label}</h3>
          <a
            href={homepagePath(option.id)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-xs"
            aria-label="Abrir em nova aba"
          >
            <ExternalLink className="size-3" />
          </a>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {option.description}
        </p>
      </div>
    </button>
  )
}
