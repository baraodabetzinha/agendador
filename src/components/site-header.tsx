"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  const pathname = usePathname()
  // Rota arcade é full-bleed, sem header
  if (pathname?.startsWith("/selecionar")) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
        <Link href="/" aria-label="Turbo Partners" className="flex items-center">
          <Image
            src="/turbo-logo.svg"
            alt="Turbo Partners"
            width={129}
            height={48}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
