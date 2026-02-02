import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year") || new Date().getFullYear().toString();


    let dateFilter: any = {};

    if (year === "all") {
        // Option: All Time (No filter)
        dateFilter = undefined;
    } else if (month === "all") {
        // Option: Yearly View
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        dateFilter = { gte: startDate, lte: endDate };
    } else {
        // Option: Monthly View
        // Add || "1" so it defaults to January if something goes wrong
        const m = month || "1";
        const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);
        dateFilter = { gte: startDate, lte: endDate };
    }



    try {
        // 2. Fetch everything in parallel for speed
        const [payments, expenses, projects, allClientsForFlags] = await Promise.all([
            prisma.payment.findMany({ where: { date: dateFilter }, orderBy: { date: 'desc' } }),
            prisma.expense.findMany({ where: { date: dateFilter }, orderBy: { date: 'desc' } }),
            prisma.project.findMany({
                include: {
                    expenses: true,
                    client: {
                        include: {
                            payments: true // This is the missing piece!
                        }
                    }
                }
            }),
            // Specifically for Red Flags:
            prisma.client.findMany({
                include: {
                    projects: { include: { expenses: true } },
                    payments: true
                }
            })
        ]);

        // 3. Logic to find "Red Flag" clients (Owe money + Due Date passed)
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
        // 4. Return EVERYTHING to the frontend
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