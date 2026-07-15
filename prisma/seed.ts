import { PrismaClient, OrderType } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

const SERVICES = [
  { name: "First Appointment", defaultDurationMin: 30, color: "#3b82f6" },
  { name: "First Fitting", defaultDurationMin: 45, color: "#f59e0b" },
  { name: "Second Fitting", defaultDurationMin: 45, color: "#8b5cf6" },
  { name: "Pickup", defaultDurationMin: 20, color: "#10b981" },
  { name: "Rental", defaultDurationMin: 30, color: "#ec4899" },
] as const

type PaymentPlan = "fully_paid" | "owes" | "partial" | "none"

type GownSeed = {
  memberName: string
  orderType: OrderType
  price: number
  isPickedUp: boolean
  expenses?: { type: string; amount: number }[]
  measurements?: {
    Bust: number
    waist: number
    Hips: number
    ShirtLength: number
    SkirtLength: number
    SleeveLength: number
    SleeveWidth: number
    ShoulderToBust: number
    notes?: string
  }
}

type ClientSeed = {
  name: string
  email?: string
  phone: string
  WeddingDate: Date
  dueDate: Date
  Recommended?: string
  notes?: string
  paymentPlan: PaymentPlan
  paymentMethod?: string
  gowns: GownSeed[]
  appointments: {
    serviceName: (typeof SERVICES)[number]["name"]
    daysFromToday: number
    hour: number
    minute?: number
    notes?: string
    status?: string
  }[]
}

function daysFromNow(days: number, hour = 10, minute = 0): Date {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  d.setDate(d.getDate() + days)
  return d
}

const CLIENTS: ClientSeed[] = [
  {
    name: "Sarah Cohen",
    email: "sarah.cohen@email.com",
    phone: "052-441-2290",
    WeddingDate: daysFromNow(45),
    dueDate: daysFromNow(40),
    Recommended: "Instagram",
    notes: "Prefers ivory over pure white. Mother will join second fitting.",
    paymentPlan: "fully_paid",
    paymentMethod: "bit",
    gowns: [
      {
        memberName: "Bride",
        orderType: "CUSTOM_MAKE_RENTAL",
        price: 4500,
        isPickedUp: false,
        expenses: [
          { type: "Beading", amount: 350 },
          { type: "Alterations", amount: 200 },
        ],
        measurements: {
          Bust: 92,
          waist: 70,
          Hips: 98,
          ShirtLength: 42,
          SkirtLength: 110,
          SleeveLength: 58,
          SleeveWidth: 14,
          ShoulderToBust: 26,
          notes: "Slightly longer train requested",
        },
      },
      {
        memberName: "Mother of Bride",
        orderType: "RENTAL",
        price: 1800,
        isPickedUp: false,
      },
    ],
    appointments: [
      { serviceName: "First Fitting", daysFromToday: 5, hour: 10, notes: "Bring shoes" },
      { serviceName: "Second Fitting", daysFromToday: 18, hour: 11 },
    ],
  },
  {
    name: "Yael Levi",
    email: "yael.levi@email.com",
    phone: "054-778-3312",
    WeddingDate: daysFromNow(28),
    dueDate: daysFromNow(25),
    Recommended: "Friend referral",
    notes: "Rental only — needs soft A-line silhouette.",
    paymentPlan: "owes",
    paymentMethod: "cash",
    gowns: [
      {
        memberName: "Bride",
        orderType: "RENTAL",
        price: 2200,
        isPickedUp: true,
        expenses: [{ type: "Steam & Press", amount: 80 }],
      },
    ],
    appointments: [
      { serviceName: "Pickup", daysFromToday: 2, hour: 16, notes: "Balance due at pickup" },
    ],
  },
  {
    name: "Michal Mizrahi",
    email: "michal.m@email.com",
    phone: "050-912-4455",
    WeddingDate: daysFromNow(70),
    dueDate: daysFromNow(65),
    Recommended: "Google",
    paymentPlan: "partial",
    paymentMethod: "credit_card",
    gowns: [
      {
        memberName: "Bride",
        orderType: "CUSTOM_MAKE_RENTAL",
        price: 6800,
        isPickedUp: false,
        expenses: [
          { type: "Fabric", amount: 900 },
          { type: "Lace overlay", amount: 450 },
        ],
        measurements: {
          Bust: 88,
          waist: 66,
          Hips: 94,
          ShirtLength: 40,
          SkirtLength: 115,
          SleeveLength: 0,
          SleeveWidth: 0,
          ShoulderToBust: 25,
          notes: "Sleeveless sweetheart neckline",
        },
      },
      {
        memberName: "Sister",
        orderType: "RENTAL",
        price: 1500,
        isPickedUp: false,
      },
    ],
    appointments: [
      { serviceName: "First Appointment", daysFromToday: 3, hour: 9, minute: 30 },
      { serviceName: "First Fitting", daysFromToday: 25, hour: 14 },
    ],
  },
  {
    name: "Noa Ben-David",
    phone: "053-220-8871",
    WeddingDate: daysFromNow(12),
    dueDate: daysFromNow(10),
    Recommended: "Walk-in",
    notes: "Urgent timeline — ceremony in two weeks.",
    paymentPlan: "fully_paid",
    paymentMethod: "cash",
    gowns: [
      {
        memberName: "Bride",
        orderType: "RENTAL",
        price: 1900,
        isPickedUp: true,
      },
    ],
    appointments: [
      { serviceName: "Rental", daysFromToday: -3, hour: 15, status: "COMPLETED", notes: "Gown already collected" },
    ],
  },
  {
    name: "Tamar Avraham",
    email: "tamar.a@email.com",
    phone: "052-334-1190",
    WeddingDate: daysFromNow(90),
    dueDate: daysFromNow(85),
    Recommended: "TikTok",
    paymentPlan: "none",
    gowns: [
      {
        memberName: "Bride",
        orderType: "CUSTOM_MAKE_RENTAL",
        price: 5200,
        isPickedUp: false,
        expenses: [{ type: "Crinoline", amount: 180 }],
      },
      {
        memberName: "Bridesmaid 1",
        orderType: "RENTAL",
        price: 900,
        isPickedUp: false,
      },
      {
        memberName: "Bridesmaid 2",
        orderType: "RENTAL",
        price: 900,
        isPickedUp: false,
      },
    ],
    appointments: [
      { serviceName: "First Appointment", daysFromToday: 7, hour: 10 },
      { serviceName: "First Fitting", daysFromToday: 35, hour: 11, minute: 30 },
    ],
  },
  {
    name: "Rina Shapiro",
    email: "rina.shapiro@email.com",
    phone: "058-661-2044",
    WeddingDate: daysFromNow(55),
    dueDate: daysFromNow(50),
    Recommended: "Previous client",
    notes: "Returning client — sister rented here last year.",
    paymentPlan: "owes",
    paymentMethod: "bit",
    gowns: [
      {
        memberName: "Bride",
        orderType: "RENTAL",
        price: 2400,
        isPickedUp: false,
        measurements: {
          Bust: 96,
          waist: 78,
          Hips: 104,
          ShirtLength: 44,
          SkirtLength: 108,
          SleeveLength: 60,
          SleeveWidth: 16,
          ShoulderToBust: 27,
        },
      },
    ],
    appointments: [
      { serviceName: "First Fitting", daysFromToday: 1, hour: 13 },
      { serviceName: "Second Fitting", daysFromToday: 14, hour: 13 },
      { serviceName: "Pickup", daysFromToday: 48, hour: 17 },
    ],
  },
  {
    name: "Hila Gold",
    email: "hila.gold@email.com",
    phone: "054-105-7788",
    WeddingDate: daysFromNow(110),
    dueDate: daysFromNow(100),
    Recommended: "WhatsApp group",
    paymentPlan: "partial",
    paymentMethod: "bank_transfer",
    gowns: [
      {
        memberName: "Bride",
        orderType: "CUSTOM_MAKE_RENTAL",
        price: 7500,
        isPickedUp: false,
        expenses: [
          { type: "Pearl detailing", amount: 600 },
          { type: "Custom veil", amount: 400 },
        ],
      },
    ],
    appointments: [
      { serviceName: "First Appointment", daysFromToday: 9, hour: 12 },
    ],
  },
  {
    name: "Dana Katz",
    phone: "050-443-9901",
    WeddingDate: daysFromNow(33),
    dueDate: daysFromNow(30),
    Recommended: "Instagram",
    notes: "Needs modest sleeves added to rental gown.",
    paymentPlan: "fully_paid",
    paymentMethod: "credit_card",
    gowns: [
      {
        memberName: "Bride",
        orderType: "CUSTOM_MAKE_RENTAL",
        price: 3100,
        isPickedUp: false,
        expenses: [{ type: "Sleeve extension", amount: 250 }],
      },
      {
        memberName: "Mother of Groom",
        orderType: "RENTAL",
        price: 1600,
        isPickedUp: false,
      },
    ],
    appointments: [
      { serviceName: "Second Fitting", daysFromToday: 4, hour: 15 },
      { serviceName: "Pickup", daysFromToday: 28, hour: 11 },
    ],
  },
  {
    name: "Lior Azulai",
    email: "lior.azulai@email.com",
    phone: "052-887-3300",
    WeddingDate: daysFromNow(20),
    dueDate: daysFromNow(18),
    Recommended: "Friend referral",
    paymentPlan: "owes",
    paymentMethod: "cash",
    gowns: [
      {
        memberName: "Bride",
        orderType: "RENTAL",
        price: 2100,
        isPickedUp: true,
        expenses: [{ type: "Express alterations", amount: 300 }],
      },
    ],
    appointments: [
      {
        serviceName: "Pickup",
        daysFromToday: -5,
        hour: 16,
        status: "COMPLETED",
        notes: "Picked up — still owes remaining balance",
      },
      { serviceName: "First Fitting", daysFromToday: -12, hour: 10, status: "COMPLETED" },
    ],
  },
  {
    name: "Eden Peretz",
    email: "eden.peretz@email.com",
    phone: "053-556-2211",
    WeddingDate: daysFromNow(75),
    dueDate: daysFromNow(70),
    Recommended: "Google",
    notes: "Consultation only for now — deciding between rental and custom.",
    paymentPlan: "none",
    gowns: [],
    appointments: [
      { serviceName: "First Appointment", daysFromToday: 6, hour: 18, notes: "Browse catalog together" },
    ],
  },
  {
    name: "Shira Ben-Ami",
    email: "shira.ba@email.com",
    phone: "054-990-1144",
    WeddingDate: daysFromNow(140),
    dueDate: daysFromNow(130),
    Recommended: "Bridal fair",
    paymentPlan: "partial",
    paymentMethod: "bit",
    gowns: [
      {
        memberName: "Bride",
        orderType: "CUSTOM_MAKE_RENTAL",
        price: 4800,
        isPickedUp: false,
      },
      {
        memberName: "Junior Bridesmaid",
        orderType: "RENTAL",
        price: 700,
        isPickedUp: false,
      },
    ],
    appointments: [
      { serviceName: "First Appointment", daysFromToday: 11, hour: 9 },
      { serviceName: "First Fitting", daysFromToday: 50, hour: 14 },
    ],
  },
  {
    name: "Maya Rosen",
    phone: "050-221-6677",
    WeddingDate: daysFromNow(8),
    dueDate: daysFromNow(6),
    Recommended: "Walk-in",
    notes: "Last-minute rental — fully settled.",
    paymentPlan: "fully_paid",
    paymentMethod: "cash",
    gowns: [
      {
        memberName: "Bride",
        orderType: "RENTAL",
        price: 1700,
        isPickedUp: true,
      },
    ],
    appointments: [
      { serviceName: "Rental", daysFromToday: 0, hour: 17, notes: "Same-day pickup slot" },
    ],
  },
]

function buildPayments(
  plan: PaymentPlan,
  totalBill: number,
  method: string
): { amount: number; note: string; method: string; date: Date }[] {
  if (plan === "none" || totalBill <= 0) return []

  if (plan === "fully_paid") {
    const deposit = Math.round(totalBill * 0.4)
    const remainder = totalBill - deposit
    return [
      {
        amount: deposit,
        note: "Initial downpayment",
        method,
        date: daysFromNow(-20, 12),
      },
      {
        amount: remainder,
        note: "Final payment — fully paid",
        method,
        date: daysFromNow(-2, 12),
      },
    ]
  }

  if (plan === "partial") {
    const deposit = Math.round(totalBill * 0.35)
    return [
      {
        amount: deposit,
        note: "Initial downpayment",
        method,
        date: daysFromNow(-10, 12),
      },
    ]
  }

  // owes — small deposit only, or none beyond a token amount
  const token = Math.min(300, Math.round(totalBill * 0.1))
  return [
    {
      amount: token,
      note: "Token deposit — balance outstanding",
      method,
      date: daysFromNow(-7, 12),
    },
  ]
}

async function clearGuestDemoData(ownerId: string) {
  const ownedClients = await prisma.client.findMany({
    where: { ownerId },
    select: { id: true, projects: { select: { id: true } } },
  })

  if (ownedClients.length === 0) return

  const clientIds = ownedClients.map((c) => c.id)
  const projectIds = ownedClients.flatMap((c) => c.projects.map((p) => p.id))

  await prisma.appointment.deleteMany({ where: { clientId: { in: clientIds } } })
  await prisma.payment.deleteMany({ where: { clientId: { in: clientIds } } })

  if (projectIds.length > 0) {
    await prisma.measurement.deleteMany({ where: { projectId: { in: projectIds } } })
    await prisma.expense.deleteMany({ where: { projectId: { in: projectIds } } })
    await prisma.project.deleteMany({ where: { id: { in: projectIds } } })
  }

  await prisma.client.deleteMany({ where: { id: { in: clientIds } } })
}

async function seedServices() {
  const byName: Record<string, number> = {}

  for (const service of SERVICES) {
    const existing = await prisma.service.findFirst({ where: { name: service.name } })
    if (existing) {
      const updated = await prisma.service.update({
        where: { id: existing.id },
        data: {
          defaultDurationMin: service.defaultDurationMin,
          color: service.color,
          active: true,
        },
      })
      byName[service.name] = updated.id
    } else {
      const created = await prisma.service.create({
        data: {
          name: service.name,
          defaultDurationMin: service.defaultDurationMin,
          color: service.color,
          active: true,
        },
      })
      byName[service.name] = created.id
    }
  }

  return byName
}

async function main() {
  const guestPasswordHash = await bcrypt.hash("123456", 10)

  const guest = await prisma.user.upsert({
    where: { username: "Guest" },
    update: {
      passwordHash: guestPasswordHash,
      role: "GUEST",
    },
    create: {
      username: "Guest",
      passwordHash: guestPasswordHash,
      role: "GUEST",
    },
  })

  const ownerPasswordHash = await bcrypt.hash("Racheli1234", 10)
  const owner = await prisma.user.upsert({
    where: { username: "Rz" },
    update: {},
    create: {
      username: "Rz",
      passwordHash: ownerPasswordHash,
      role: "OWNER",
    },
  })

  // Assign any legacy clients (ownerId null) to the real owner so they don't disappear
  const backfill = await prisma.client.updateMany({
    where: { ownerId: null },
    data: { ownerId: owner.id },
  })
  if (backfill.count > 0) {
    console.log(`Backfilled ${backfill.count} clients with null ownerId → ${owner.username}`)
  }

  console.log(`Upserted guest user: ${guest.username} (${guest.id})`)
  console.log(`Owner user: ${owner.username} (${owner.id})`)

  await clearGuestDemoData(guest.id)
  console.log("Cleared previous guest-owned demo data")

  const serviceIds = await seedServices()
  console.log(`Ensured ${Object.keys(serviceIds).length} calendar services`)

  let gownCount = 0
  let appointmentCount = 0
  let paymentCount = 0

  for (const client of CLIENTS) {
    const totalBill =
      client.gowns.reduce((sum, g) => {
        const expenses = g.expenses?.reduce((s, e) => s + e.amount, 0) ?? 0
        return sum + g.price + expenses
      }, 0)

    const payments = buildPayments(
      client.paymentPlan,
      totalBill,
      client.paymentMethod ?? "cash"
    )

    const created = await prisma.client.create({
      data: {
        name: client.name,
        email: client.email ?? null,
        phone: client.phone,
        WeddingDate: client.WeddingDate,
        dueDate: client.dueDate,
        Recommended: client.Recommended ?? null,
        notes: client.notes ?? null,
        ownerId: guest.id,
        projects: {
          create: client.gowns.map((g) => ({
            memberName: g.memberName,
            orderType: g.orderType,
            price: g.price,
            isPickedUp: g.isPickedUp,
            expenses: g.expenses
              ? { create: g.expenses.map((e) => ({ type: e.type, amount: e.amount })) }
              : undefined,
            measurements: g.measurements
              ? { create: [{ ...g.measurements }] }
              : undefined,
          })),
        },
        payments: {
          create: payments,
        },
        appointments: {
          create: client.appointments.map((apt) => {
            const start = daysFromNow(apt.daysFromToday, apt.hour, apt.minute ?? 0)
            const duration =
              SERVICES.find((s) => s.name === apt.serviceName)?.defaultDurationMin ?? 30
            const end = new Date(start.getTime() + duration * 60_000)

            return {
              serviceId: serviceIds[apt.serviceName],
              start,
              end,
              date: start,
              durationMinutes: duration,
              notes: apt.notes ?? null,
              status: apt.status ?? "SCHEDULED",
            }
          }),
        },
      },
      include: {
        projects: true,
        payments: true,
        appointments: true,
      },
    })

    gownCount += created.projects.length
    appointmentCount += created.appointments.length
    paymentCount += created.payments.length
  }

  console.log("Seed complete:")
  console.log(`  Clients:      ${CLIENTS.length}`)
  console.log(`  Gowns:        ${gownCount}`)
  console.log(`  Payments:     ${paymentCount}`)
  console.log(`  Appointments: ${appointmentCount}`)
  console.log('Demo login → username: "Guest" / password: "123456"')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
