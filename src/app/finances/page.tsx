"use client";
import React, { useEffect, useState } from 'react';
import { calculateGlobalFinances } from "@/lib/finances";

const deepNavy = "#1E2024";
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function FinancesPage() {
    const [selectedMonth, setSelectedMonth] = useState<number | "all">(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number | "all">(new Date().getFullYear());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lifetimeStats, setLifetimeStats] = useState<any>(null); // To store "All Time" data

    useEffect(() => {
        setLoading(true);

        // Fetch LIFETIME stats (all-time)
        fetch(`/api/finances?month=all&year=all`)
            .then(res => res.json())
            .then(json => {
                if (json) {
                    const stats = calculateGlobalFinances(json.projects, json.payments, json.expenses);
                    setLifetimeStats(stats);
                }
            });

        // Fetch FILTERED stats (your existing logic)
        fetch(`/api/finances?month=${selectedMonth}&year=${selectedYear}`)
            .then(res => res.json())
            .then(json => {
                if (json) {
                    setData(json);
                    setLoading(false);
                }
            })
            .catch(err => console.error("Fetch error:", err));
    }, [selectedMonth, selectedYear]);

if (!data && loading) return <div className="p-8 font-serif italic text-slate-400">Loading initial data...</div>;
    // --- 1. OVERALL LIFETIME STATS ---
    const overall = lifetimeStats;

    // --- 2. PERIOD STATS (Cash Flow for the month) ---
    const periodStats = calculateGlobalFinances(data.projects, data.payments, data.expenses);



    // 3. THE FIX: Monthly Pickup Balance
    // This shows how much money is still missing for families who have a pickup THIS month
    const balanceDueForPickupsThisMonth = Array.from(
        data.projects?.reduce((map: Map<number, any>, p: any) => {
            // FILTER: Only look at projects where the CLIENT'S dueDate is this month
            // In your schema, dueDate is on the Client model!
            const d = p.client?.dueDate ? new Date(p.client.dueDate) : null;
            const isThisMonth = d && (selectedMonth === "all" || (d.getMonth() + 1) === selectedMonth);

            if (!isThisMonth) return map;

            const cid = p.clientId;
            if (!map.has(cid)) {
                map.set(cid, {
                    bill: 0,
                    paid: p.client?.payments?.reduce((s: number, pay: any) => s + (pay.amount || 0), 0) || 0
                });
            }

            const pTotal = (p.price || 0) + (p.expenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0);
            map.get(cid).bill += pTotal;
            return map;
        }, new Map()).values() || []
    ).reduce((sum: number, clientData: any) => {
        const bal = clientData.bill - clientData.paid;
        return sum + (bal > 0 ? bal : 0);
    }, 0);
    // --- 4. DYNAMIC TITLE ---
    const reportTitle = selectedYear === "all"
        ? "Lifetime Financial Summary"
        : selectedMonth === "all"
            ? `${selectedYear} Yearly Report`
            : `${months[Number(selectedMonth) - 1]} ${selectedYear} Report`;



    return (
        <div className="p-10 max-w-5xl mx-auto space-y-12">
            {/* --- ELEGANT HEADER --- */}
            <header className="text-center space-y-2">
                <h1 style={{ color: deepNavy, fontFamily: 'serif' }} className="text-4xl">
                    Financial Statement
                </h1>
            </header>

            {/* --- 2.total card --- */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 style={{ color: deepNavy, fontFamily: 'serif' }} className="text-xl">Lifetime Summary (Overall)</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Performance Metrics</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-8 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Revenue</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{lifetimeStats?.totalIncome.toLocaleString()} NIS</p>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Profit</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{lifetimeStats?.netProfit.toLocaleString()} NIS</p>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-2">Expenses</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{lifetimeStats?.totalInternalExpenses.toLocaleString()} NIS</p>
                    </div>
                    <div className="p-8 text-center bg-slate-50/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">Balances</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{lifetimeStats?.totalOwed.toLocaleString()} NIS</p>
                    </div>
                </div>
            </div>

            {/* --- 2. BREAKDOWN CARD --- */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex justify-center items-center gap-4">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="bg-transparent border-b border-slate-200 text-sm py-1 focus:outline-none"
                    >
                        <option value="all">Full Year</option>
                        {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="bg-transparent border-b border-slate-200 text-sm py-1 focus:outline-none"
                    >
                        <option value="all">All Time</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                </div>
                {/* The rest of the content dims when loading, but stays on screen */}
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 style={{ color: deepNavy, fontFamily: 'serif' }} className="text-xl">{reportTitle}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Performance Metrics</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-8 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Revenue</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{periodStats.totalIncome.toLocaleString()} NIS</p>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Profit</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{periodStats.netProfit.toLocaleString()} NIS</p>
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-2">Expenses</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{periodStats.totalInternalExpenses.toLocaleString()} NIS</p>
                    </div>
                    <div className="p-8 text-center bg-slate-50/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">Balances</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{balanceDueForPickupsThisMonth.toLocaleString()} NIS</p>
                    </div>
                </div>
                </div>
            </div>




            <hr className="border-slate-100 my-8" />

            {/* --- 1. OVERDUE RED FLAGS --- */}
            {data.redFlags?.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-white border border-rose-100 rounded-[2rem] overflow-hidden shadow-sm">
                        {/* Title Header inside the box */}
                        <div className="bg-rose-50/50 px-8 py-5 border-b border-rose-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <h3 style={{ color: deepNavy, fontFamily: 'serif' }} className="text-xl">Priority: Overdue Balances</h3>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Action Required</span>
                        </div>

                        {/* The Table - Make sure this is calling the updated component below */}
                        <BalanceTable clients={data.redFlags} variant="urgent" />
                    </div>
                </div>
            )}

            {/* --- 3. GENERAL OWED LIST --- */}
            {data.generalOwed?.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                        {/* Title Header moved INSIDE the box */}
                        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 style={{ color: deepNavy, fontFamily: 'serif' }} className="text-xl opacity-90">
                                Balances
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Family Accounts
                            </span>
                        </div>

                        <BalanceTable clients={data.generalOwed} variant="general" />
                    </div>
                </div>
            )}
        </div>
    );
}

// --- DEFINE THIS OUTSIDE THE MAIN COMPONENT ---
function BalanceTable({ clients, variant }: { clients: any[], variant: 'urgent' | 'general' }) {
    const isUrgent = variant === 'urgent';
    return (
        <table className="w-full text-left">
            <thead className={isUrgent ? "bg-rose-50/30" : "bg-slate-50/50"}>
                <tr className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isUrgent ? 'text-rose-400' : 'text-slate-400'}`}>
                    <th className="px-8 py-4">Client</th>
                    <th className="px-8 py-4 text-center">Due Date</th>
                    <th className="px-8 py-4 text-right">Balance</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {clients.map((client) => {
                    const totalBill = client.projects.reduce((sum: number, p: any) =>
                        sum + p.price + (p.expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0), 0);
                    const totalPaid = client.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
                    const balance = totalBill - totalPaid;

                    return (
                        <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                                <p className="font-bold text-slate-900">{client.name}</p>
                                <p className="text-xs text-slate-400 font-mono">{client.phone}</p>
                            </td>
                            <td className={`px-8 py-5 text-sm text-center font-medium ${isUrgent ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                {client.dueDate ? new Date(client.dueDate).toLocaleDateString("en-GB") : "—"}
                            </td>
                            <td className={`px-8 py-5 text-right text-2xl font-light ${isUrgent ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                                {balance.toLocaleString()} NIS
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}