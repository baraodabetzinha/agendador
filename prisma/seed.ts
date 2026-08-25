import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const specialists = [
  {
    id: "victor",
    name: "Victor",
    title: "Especialista em Growth & Aquisição",
    bio: "Ajuda empresas a escalar canais de aquisição pagos e orgânicos com foco em ROI.",
    skills: [
      "Growth Marketing",
      "Mídia paga",
      "SEO",
      "Funis de aquisição",
      "Analytics",
    ],
    stats: [
      { label: "GESTÃO", value: 95 },
      { label: "MIDIA", value: 92 },
      { label: "AQUISIÇÃO", value: 82 },
      { label: "ANALYTICS", value: 85 },
    ],
    sortOrder: 1,
  },
  {
    id: "musso",
    name: "Musso",
    title: "Especialista em Vendas B2B",
    bio: "Consultor de operações de vendas com foco em outbound, pipeline e previsibilidade.",
    skills: [
      "Sales Ops",
      "Outbound",
      "Cold calling",
      "Previsibilidade de receita",
      "CRM",
    ],
    stats: [
      { label: "OUTBOUND", value: 94 },
      { label: "CLOSE", value: 90 },
      { label: "FORECAST", value: 85 },
      { label: "CRM", value: 78 },
    ],
    sortOrder: 2,
  },
  {
    id: "rodrigo",
    name: "Rodrigo",
    title: "Especialista em Produto & UX",
    bio: "Desenha produtos digitais orientados a dados, com foco em discovery e ativação.",
    skills: ["Product Discovery", "UX Research", "Design de produto", "Analytics de produto", "A/B testing"],
    stats: [
      { label: "CRO", value: 92 },
      { label: "UX", value: 95 },
      { label: "A/B TEST", value: 83 },
      { label: "DATA", value: 80 },
    ],
    sortOrder: 3,
  },
]

async function main() {
  for (const s of specialists) {
    await prisma.specialist.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        title: s.title,
        bio: s.bio,
        skills: JSON.stringify(s.skills),
        stats: JSON.stringify(s.stats),
        sortOrder: s.sortOrder,
      },
      create: {
        id: s.id,
        name: s.name,
        title: s.title,
        bio: s.bio,
        skills: JSON.stringify(s.skills),
        stats: JSON.stringify(s.stats),
        sortOrder: s.sortOrder,
      },
    })
    console.log(`✓ ${s.name}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
