function onlyDigits(s: string) {
  return s.replace(/\D/g, "")
}

function normalizeBrazilPhone(raw: string): string {
  const digits = onlyDigits(raw)
  if (digits.startsWith("55")) return digits
  return `55${digits}`
}

export async function sendWhatsApp(phone: string, text: string): Promise<boolean> {
  const base = process.env.EVOLUTION_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE

  if (!base || !apiKey || !instance) {
    console.warn("[evolution] env not configured, skipping WhatsApp send")
    return false
  }

  const url = `${base.replace(/\/$/, "")}/message/sendText/${instance}`
  const number = normalizeBrazilPhone(phone)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ number, text }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error("[evolution] send failed", res.status, body)
      return false
    }
    return true
  } catch (e) {
    console.error("[evolution] send error", e)
    return false
  }
}
