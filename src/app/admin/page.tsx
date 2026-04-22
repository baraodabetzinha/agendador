import { listSpecialists } from "@/lib/specialists"
import { AdminList } from "./admin-list"

export const dynamic = "force-dynamic"

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const params = await searchParams
  const specialists = await listSpecialists()

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10 md:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Admin</h1>
        <p className="text-muted-foreground mt-2 text-base sm:text-lg">
          Conecte o Google Calendar de cada especialista e edite skills e bio.
        </p>
      </header>

      {params.connected && (
        <div className="mb-6 rounded-md border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm">
          Conectado: <strong>{params.connected}</strong>
        </div>
      )}
      {params.error && (
        <div className="mb-6 rounded-md border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm">
          Erro: {params.error}
        </div>
      )}

      <AdminList specialists={specialists} />
    </div>
  )
}
