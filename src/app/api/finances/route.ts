import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

export async function GET(req: Request) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year") || new Date().getFullYear().toString();

    let dateFilter: any = {};

    if (year === "all") {
        dateFilter = undefined;
    } else if (month === "all") {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        dateFilter = { gte: startDate, lte: endDate };
    } else {
        const m = month || "1";
        const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);
        dateFilter = { gte: startDate, lte: endDate };
    }

    const ownerFilter = { ownerId: user.id };

    try {
        const [payments, expenses, projects, allClientsForFlags] = await Promise.all([
            prisma.payment.findMany({
                where: { date: dateFilter, client: ownerFilter },
                orderBy: { date: 'desc' },
                include: { client: true },
            }),
            prisma.expense.findMany({
                where: { date: dateFilter, project: { client: ownerFilter } },
                orderBy: { date: 'desc' },
            }),
            prisma.project.findMany({
                where: { client: ownerFilter },
                include: {
                    expenses: true,
                    client: {
                        include: {
                            payments: true
                        }
                    }
                }
            }),
            prisma.client.findMany({
                where: ownerFilter,
                include: {
                    projects: { include: { expenses: true } },
                    payments: true
                }
            })
        ]);

        const redFlags: any[] = [];
        const generalOwed: any[] = [];
        allClientsForFlags.forEach(client => {
            const totalBill = client.projects.reduce((sum, p) =>
                sum + p.price + (p.expenses?.reduce((s, e) => s + e.amount, 0) || 0), 0);
            const totalPaid = client.payments.reduce((sum, p) => sum + p.amount, 0);
            const balance = totalBill - totalPaid;

            if (balance > 0) {
                const hasPassedDueDate = client.dueDate && new Date(client.dueDate) < new Date();

                if (hasPassedDueDate) {
                    redFlags.push(client);
                } else {
                    generalOwed.push(client);
                }
            }
        });

        return NextResponse.json({
            payments,
            expenses,
            projects,
            redFlags,
            generalOwed
        });
    } catch (error) {
        console.error("Finance API Error:", error);
        return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
    }
}
