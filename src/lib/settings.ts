import "server-only"
import fs from "node:fs/promises"
import path from "node:path"
import {
  HOMEPAGE_OPTIONS,
  type HomepageOption,
  type Settings,
} from "./settings-types"

export {
  HOMEPAGE_OPTIONS,
  homepagePath,
  type HomepageOption,
  type Settings,
} from "./settings-types"

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json")

const DEFAULTS: Settings = {
  homepage: "selecionar",
}

function isHomepageOption(v: unknown): v is HomepageOption {
  return typeof v === "string" && (HOMEPAGE_OPTIONS as readonly string[]).includes(v)
}

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8")
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      homepage: isHomepageOption(parsed.homepage) ? parsed.homepage : DEFAULTS.homepage,
    }
  } catch {
    return DEFAULTS
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings()
  const next: Settings = { ...current, ...patch }
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true })
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), "utf-8")
  return next
}
