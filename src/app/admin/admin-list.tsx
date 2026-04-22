"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sparkles, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AnimatedSprite } from "@/components/animated-sprite"
import type { SpecialistSummary } from "@/lib/specialists"

export function AdminList({ specialists }: { specialists: SpecialistSummary[] }) {
  return (
    <div className="space-y-4">
      {specialists.map((s) => (
        <SpecialistRow key={s.id} specialist={s} />
      ))}
    </div>
  )
}

function SpecialistRow({ specialist }: { specialist: SpecialistSummary }) {
  const initials = specialist.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const hasAnimatedSprite =
    specialist.photoUrl &&
    specialist.spriteFrames &&
    specialist.spriteWidth &&
    specialist.spriteFrames > 1

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {hasAnimatedSprite ? (
            <div className="bg-muted rounded-md p-1">
              <AnimatedSprite
                src={specialist.photoUrl!}
                frames={specialist.spriteFrames!}
                frameWidth={specialist.spriteWidth!}
                size={56}
                fps={6}
              />
            </div>
          ) : (
            <Avatar className="size-14">
              {specialist.photoUrl ? (
                <AvatarImage src={specialist.photoUrl} alt={specialist.name} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{specialist.name}</h2>
              {specialist.isConnected ? (
                <Badge className="bg-green-600/15 text-green-700 border-green-600/30" variant="secondary">
                  Conectado
                </Badge>
              ) : (
                <Badge variant="outline">Desconectado</Badge>
              )}
              {hasAnimatedSprite && (
                <Badge className="bg-primary/15 text-primary border-primary/30" variant="secondary">
                  Sprite IA
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{specialist.title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {specialist.skills.slice(0, 5).map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/auth/google?specialistId=${specialist.id}`}
            className={buttonVariants({
              variant: specialist.isConnected ? "outline" : "default",
            })}
          >
            {specialist.isConnected ? "Reconectar Google" : "Conectar Google"}
          </a>
          <GenerateSpriteSheet specialist={specialist} />
          <EditSheet specialist={specialist} />
        </div>
      </CardContent>
    </Card>
  )
}

function defaultDescription(specialist: SpecialistSummary): string {
  return `pixel art portrait of ${specialist.name}, front view, fighting game character select, clean background, detailed face, brazilian features`
}

function GenerateSpriteSheet({ specialist }: { specialist: SpecialistSummary }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState(defaultDescription(specialist))
  const [initStrength, setInitStrength] = useState<number>(400)
  const [frameCount, setFrameCount] = useState<number>(8)
  const [seed, setSeed] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState<string>("")
  const [preview, setPreview] = useState<string | null>(null)

  function reset() {
    setFile(null)
    setPreview(null)
    setProgress("")
    setGenerating(false)
  }

  async function generate() {
    if (!file) {
      toast.error("Escolha uma foto de referência")
      return
    }
    setGenerating(true)
    setProgress("Gerando portrait pixel art (~2min)…")
    const fd = new FormData()
    fd.append("photo", file)
    fd.append("description", description)
    fd.append("initStrength", String(initStrength))
    fd.append("frameCount", String(frameCount))
    if (seed.trim()) fd.append("seed", seed.trim())

    try {
      const res = await fetch(`/api/admin/specialist/${specialist.id}/generate-sprite`, {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Erro ao gerar")
      toast.success(`Sprite criado com ${data.frames} frames`)
      setProgress(`✓ Pronto — ${data.frames} frames`)
      router.refresh()
      // Close after a beat so user sees success
      setTimeout(() => {
        setOpen(false)
        reset()
      }, 1200)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : "Erro ao gerar")
      setProgress("✗ Falha na geração")
    } finally {
      setGenerating(false)
    }
  }

  function handleFile(f: File | null) {
    setFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <SheetTrigger
        className={buttonVariants({ variant: "default", className: "gap-1.5" })}
      >
        <Sparkles className="size-4" />
        Sprite IA
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            Gerar sprite — {specialist.name}
          </SheetTitle>
          <SheetDescription>
            Upload de foto + prompt → pixel art 128×128 animado via Pixellab.
            Leva ~2 minutos.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-6">
          <div className="grid gap-2">
            <Label htmlFor="photo">Foto de referência</Label>
            <Input
              id="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              disabled={generating}
            />
            {preview && (
              <div className="bg-muted mt-2 flex justify-center rounded-md p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="preview" className="max-h-40 rounded" />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Prompt (descrição)</Label>
            <Textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={generating}
            />
            <p className="text-muted-foreground text-xs">
              Descreva aparência. Reforce elementos que não aparecem na foto (ex: óculos,
              roupa, build).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="initStrength" className="text-xs">
                Init strength (1-999)
              </Label>
              <Input
                id="initStrength"
                type="number"
                min={1}
                max={999}
                value={initStrength}
                onChange={(e) => setInitStrength(Number(e.target.value))}
                disabled={generating}
              />
              <p className="text-muted-foreground text-[10px]">
                Alto = fiel à foto. Baixo = mais liberdade pro prompt.
              </p>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="frameCount" className="text-xs">
                Frames
              </Label>
              <Input
                id="frameCount"
                type="number"
                step={2}
                min={4}
                max={16}
                value={frameCount}
                onChange={(e) => setFrameCount(Number(e.target.value))}
                disabled={generating}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="seed" className="text-xs">
              Seed (opcional — mesmo seed = mesmo resultado)
            </Label>
            <Input
              id="seed"
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="deixe vazio pra aleatório"
              disabled={generating}
            />
          </div>

          {progress && (
            <div className="bg-muted text-muted-foreground rounded-md p-3 font-mono text-xs">
              {progress}
            </div>
          )}
        </div>

        <SheetFooter>
          <Button onClick={generate} disabled={generating || !file} className="gap-2">
            {generating ? (
              <>
                <span className="animate-pulse">●</span>
                Gerando…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Gerar sprite
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function EditSheet({ specialist }: { specialist: SpecialistSummary }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(specialist.name)
  const [title, setTitle] = useState(specialist.title)
  const [bio, setBio] = useState(specialist.bio ?? "")
  const [skillsText, setSkillsText] = useState(specialist.skills.join(", "))
  const [stats, setStats] = useState<Array<{ label: string; value: number }>>(
    specialist.stats.length > 0
      ? specialist.stats
      : [
          { label: "STAT 1", value: 80 },
          { label: "STAT 2", value: 80 },
          { label: "STAT 3", value: 80 },
          { label: "STAT 4", value: 80 },
        ]
  )

  function updateStat(i: number, patch: Partial<{ label: string; value: number }>) {
    setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }
  function addStat() {
    if (stats.length >= 8) return
    setStats((prev) => [...prev, { label: "", value: 80 }])
  }
  function removeStat(i: number) {
    setStats((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function save() {
    setSaving(true)
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const cleanStats = stats
      .map((s) => ({
        label: s.label.trim().toUpperCase(),
        value: Math.max(0, Math.min(100, Math.round(s.value))),
      }))
      .filter((s) => s.label.length > 0)
    try {
      const res = await fetch(`/api/admin/specialist/${specialist.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          bio: bio || null,
          skills,
          stats: cleanStats,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Atualizado")
      setOpen(false)
      router.refresh()
    } catch (e) {
      console.error(e)
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={buttonVariants({ variant: "secondary" })}>
        Editar
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar {specialist.name}</SheetTitle>
          <SheetDescription>
            Nome, título, bio (frase abaixo do nome no /selecionar), skills e stats.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Título (linha abaixo do nome)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio (frase dentro do card)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="skills">Skills (separadas por vírgula)</Label>
            <Textarea
              id="skills"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Stats (barras no /selecionar)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addStat}
                disabled={stats.length >= 8}
                className="h-7 gap-1 px-2 text-xs"
              >
                <Plus className="size-3" /> Add
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={s.label}
                    placeholder="LABEL"
                    onChange={(e) => updateStat(i, { label: e.target.value })}
                    className="flex-1 uppercase"
                    maxLength={20}
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={s.value}
                    onChange={(e) =>
                      updateStat(i, { value: Number(e.target.value) })
                    }
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStat(i)}
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Remover stat"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              {stats.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  Sem stats — clique em Add pra criar a primeira.
                </p>
              )}
            </div>
            <p className="text-muted-foreground text-[11px]">
              Label em caixa alta. Valor de 0 a 100 (enche a barra proporcionalmente).
            </p>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
