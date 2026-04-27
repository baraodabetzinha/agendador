export const HOMEPAGE_OPTIONS = [
  "default",
  "selecionar",
  "selecionar-v2",
  "selecionar-v3",
] as const

export type HomepageOption = (typeof HOMEPAGE_OPTIONS)[number]

export type Settings = {
  homepage: HomepageOption
}

export function homepagePath(option: HomepageOption): string {
  return option === "default" ? "/" : `/${option}`
}
