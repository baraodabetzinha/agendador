"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/

const schema = z.object({
  clientName: z.string().min(2, "Informe seu nome"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z
    .string()
    .regex(phoneRegex, "Telefone inválido. Ex: (11) 98765-4321"),
  subject: z.string().min(3, "Conte em poucas palavras o assunto"),
})

type FormValues = z.infer<typeof schema>

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function BookingForm({
  specialistId,
  slot,
  candidates,
}: {
  specialistId: string
  slot: string
  candidates?: string[]
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      subject: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialistId,
          slot,
          candidates,
          ...values,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error ?? "Erro ao agendar")
      }
      router.push(`/agendar/sucesso/${data.bookingId}`)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : "Erro ao agendar")
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Como você se chama?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="voce@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <Input
                  placeholder="(11) 98765-4321"
                  value={field.value}
                  onChange={(e) => field.onChange(maskPhone(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assunto da reunião</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Sobre o que você quer conversar?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Confirmando..." : "Confirmar agendamento"}
        </Button>
      </form>
    </Form>
  )
}
