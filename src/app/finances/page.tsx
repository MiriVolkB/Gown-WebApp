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
    const [lifetimeRaw, setLifetimeRaw] = useState<any>(null); // raw lifetime response for breakdowns
    const [showBreakdown, setShowBreakdown] = useState<{ revenue?: boolean; expenses?: boolean; profit?: boolean; balances?: boolean }>({});
    const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setLoading(true);

        // Fetch LIFETIME stats (all-time) and keep raw data for breakdowns
        fetch(`/api/finances?month=all&year=all`)
            .then(res => res.json())
            .then(json => {
                if (json) {
                    const stats = calculateGlobalFinances(json.projects, json.payments, json.expenses);
                    setLifetimeStats(stats);
                    setLifetimeRaw(json);
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

// if data hasn't arrived yet or the fetch failed, show message
    if (!data) {
        if (loading) {
            return <div className="p-8 font-serif italic text-slate-400">Loading initial data...</div>;
        }
        return <div className="p-8 font-serif italic text-slate-400">No financial data available.</div>;
    }
    // --- 1. OVERALL LIFETIME STATS ---
    const overall = lifetimeStats;

    // --- 2. PERIOD STATS (Cash Flow for the month) ---
    const periodStats = calculateGlobalFinances(data.projects || [], data.payments || [], data.expenses || []);



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

    // helper amounts for toggles (now that balanceDueForPickupsThisMonth exists)
    const revenueAmt = periodStats.totalIncome || 0;
    const profitAmt = periodStats.netProfit || 0;
    const expensesAmt = periodStats.totalInternalExpenses || 0;
    const balancesAmt = balanceDueForPickupsThisMonth || 0;
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
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-2">Balances</p>
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
                    <div
                        className={`p-8 text-center transition-colors ${revenueAmt > 0 ? 'cursor-pointer hover:bg-slate-50/50' : 'cursor-not-allowed opacity-60'}`}
                        onClick={() => revenueAmt > 0 && setShowBreakdown(s => ({ ...s, revenue: !s.revenue }))}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Revenue</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{revenueAmt.toLocaleString()} NIS</p>
                        <div className="mt-2 text-xs text-blue-600 underline">
                            {showBreakdown.revenue ? 'Hide breakdown' : 'See breakdown'}
                        </div>
                    </div>
                    <div
                        className={`p-8 text-center transition-colors ${profitAmt > 0 ? 'cursor-pointer hover:bg-slate-50/50' : 'cursor-not-allowed opacity-60'}`}
                        onClick={() => profitAmt > 0 && setShowBreakdown(s => ({ ...s, profit: !s.profit }))}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Profit</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{profitAmt.toLocaleString()} NIS</p>
                        <div className="mt-2 text-xs text-emerald-600 underline">
                            {showBreakdown.profit ? 'Hide breakdown' : 'See breakdown'}
                        </div>
                    </div>
                    <div
                        className={`p-8 text-center transition-colors ${expensesAmt > 0 ? 'cursor-pointer hover:bg-slate-50/50' : 'cursor-not-allowed opacity-60'}`}
                        onClick={() => expensesAmt > 0 && setShowBreakdown(s => ({ ...s, expenses: !s.expenses }))}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-2">Expenses</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{expensesAmt.toLocaleString()} NIS</p>
                        <div className="mt-2 text-xs text-rose-500 underline">
                            {showBreakdown.expenses ? 'Hide breakdown' : 'See breakdown'}
                        </div>
                    </div>
                    <div
                        className={`p-8 text-center bg-slate-50/20 transition-colors ${balancesAmt > 0 ? 'cursor-pointer hover:bg-slate-50/50' : 'cursor-not-allowed opacity-60'}`}
                        onClick={() => balancesAmt > 0 && setShowBreakdown(s => ({ ...s, balances: !s.balances }))}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-2">Balances</p>
                        <p style={{ color: deepNavy }} className="text-3xl font-light">{balancesAmt.toLocaleString()} NIS</p>
                        <div className="mt-2 text-xs text-orange-600 underline">
                            {showBreakdown.balances ? 'Hide breakdown' : 'See breakdown'}
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* Render selected breakdowns */}
            {showBreakdown.revenue && (
                <div className="mt-6 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-semibold mb-4 text-blue-700">Revenue breakdown — {reportTitle}</h4>
                    <BreakdownTable rows={computeBreakdown(data, 'revenue')} copiedItems={copiedItems} onCopy={(text,id)=>copyText(text,`${id}-phone`,setCopiedItems)} />
                </div>
            )}
            {showBreakdown.expenses && (
                <div className="mt-6 bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-semibold mb-4 text-rose-700">Expenses breakdown — {reportTitle}</h4>
                    <BreakdownTable rows={computeBreakdown(data, 'expenses')} copiedItems={copiedItems} onCopy={(text,id)=>copyText(text,id,setCopiedItems)} />
                </div>
            )}
            {showBreakdown.profit && (
                <div className="mt-6 bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-semibold mb-4 text-emerald-700">Profit breakdown — {reportTitle}</h4>
                    <BreakdownTable rows={computeBreakdown(data, 'profit')} copiedItems={copiedItems} onCopy={(text,id)=>copyText(text,id,setCopiedItems)} />
                </div>
            )}
            {showBreakdown.balances && (
                <div className="mt-6 bg-white border border-orange-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-semibold mb-4 text-orange-700">Balances breakdown — {reportTitle}</h4>
                    <BreakdownTable
                        rows={computeBalances(
                            data,
                            selectedMonth === 'all' ? 'all' : Number(selectedMonth),
                            selectedYear === 'all' ? 'all' : Number(selectedYear)
                        )}
                        copiedItems={copiedItems}
                        onCopy={(text,id)=>copyText(text,id,setCopiedItems)}
                    />
                </div>
            )}




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
                        <BalanceTable clients={data.redFlags} variant="urgent" copiedItems={copiedItems} onCopy={(text,id)=>copyText(text,`${id}-phone`,setCopiedItems)} />
                    </div>
                </div>
            )}

            {/* --- 3. GENERAL OWED LIST --- */}
            {data.generalOwed?.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-white border border-orange-100 rounded-[2rem] overflow-hidden shadow-sm">
                        {/* Title Header moved INSIDE the box */}
                        <div className="bg-orange-50/50 px-8 py-5 border-b border-orange-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <h3 style={{ color: deepNavy, fontFamily: 'serif' }} className="text-xl">Balances</h3>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Family Accounts</span>
                        </div>

                        <BalanceTable clients={data.generalOwed} variant="general" copiedItems={copiedItems} onCopy={(text,id)=>copyText(text,`${id}-phone`,setCopiedItems)} />
                    </div>
                </div>
            )}
        </div>
    );
}

// --- DEFINE THIS OUTSIDE THE MAIN COMPONENT ---
function BalanceTable({ clients, variant, copiedItems, onCopy }: { clients: any[], variant: 'urgent' | 'general', copiedItems?: Record<string,boolean>, onCopy?: (text:string,id:string)=>void }) {
    const isUrgent = variant === 'urgent';
    return (
        <table className="w-full text-left">
            <thead className={isUrgent ? "bg-rose-50/30" : "bg-orange-50/50"}>
                <tr className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isUrgent ? 'text-rose-400' : 'text-orange-400'}`}>
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
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                    <span>{client.phone}</span>
                                    {onCopy && (
                                        <button
                                            onClick={() => onCopy(client.phone, `${client.id}-phone`)}
                                            className="p-1 rounded hover:bg-slate-100"
                                            aria-label={`Copy phone ${client.phone}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        </button>
                                    )}
                                    {copiedItems && copiedItems[`${client.id}-phone`] && (
                                        <span className="text-[10px] text-emerald-600">copied</span>
                                    )}
                                </div>
                            </td>
                            <td className={`px-8 py-5 text-sm text-center font-medium ${isUrgent ? 'text-rose-600 font-bold' : 'text-orange-600'}`}>
                                {client.dueDate ? new Date(client.dueDate).toLocaleDateString("en-GB") : "—"}
                            </td>
                            <td className={`px-8 py-5 text-right text-2xl font-light ${isUrgent ? 'text-rose-700 font-bold' : 'text-orange-700'}`}>
                                {balance.toLocaleString()} NIS
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

// Copy helper: copies to clipboard and flashes a small state
function copyText(text: string, key: string, setCopiedItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) {
    if (!text || !navigator?.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
        setCopiedItems(prev => ({ ...prev, [key]: true }));
        setTimeout(() => setCopiedItems(prev => ({ ...prev, [key]: false })), 1800);
    }).catch(() => {});
}

// Build per-client breakdown using the data payload (payments + expenses + projects).
// This ensures the totals match the values displayed in the metric cards (which are derived
// from data.payments and data.expenses) instead of using unfiltered project-level values.
function computeBreakdown(
  data: any,
  kind: 'revenue' | 'expenses' | 'profit'
) {
  const revenueMap = new Map<number, number>();
  const expenseMap = new Map<number, number>();

  // map clientId -> {name,phone,email,dueDate}
  const clientInfo = new Map<number, { name: string; phone: string; email: string; dueDate: string | null }>();
  (data.projects || []).forEach((p: any) => {
    if (p.client) {
      clientInfo.set(p.clientId, {
        name: p.client.name,
        phone: p.client.phone || '',
        email: p.client.email || '',
        dueDate: p.client.dueDate
      });
    }
  });

  // gather payments within the selected window
  (data.payments || []).forEach((pay: any) => {
    const cid = pay.clientId;
    revenueMap.set(cid, (revenueMap.get(cid) || 0) + (pay.amount || 0));
    if (!clientInfo.has(cid)) {
      clientInfo.set(cid, { name: pay.client?.name || 'Unknown', phone: pay.client?.phone || '', email: pay.client?.email || '', dueDate: pay.client?.dueDate });
    }
  });

  // gather project-specific expenses (filtered by date at API level)
  (data.expenses || []).forEach((exp: any) => {
    // expenses have projectId; find corresponding project to know client
    const proj = (data.projects || []).find((p: any) => p.id === exp.projectId);
    if (!proj) return;
    const cid = proj.clientId;
    expenseMap.set(cid, (expenseMap.get(cid) || 0) + (exp.amount || 0));
    if (!clientInfo.has(cid)) {
      clientInfo.set(cid, { name: proj.client?.name || 'Unknown', phone: proj.client?.phone || '', email: proj.client?.email || '', dueDate: proj.client?.dueDate });
    }
  });

  const rows: { id: string; name: string; phone: string; email: string; dueDate: string | null; amount: number }[] = [];
  const allIds = new Set<number>();
  if (kind === 'revenue' || kind === 'profit') {
    revenueMap.forEach((_, cid) => allIds.add(cid));
  }
  if (kind === 'expenses' || kind === 'profit') {
    expenseMap.forEach((_, cid) => allIds.add(cid));
  }

  allIds.forEach(cid => {
    const info = clientInfo.get(cid) || { name: 'Unknown', phone: '', email: '', dueDate: null };
    let amt = 0;
    if (kind === 'revenue') amt = revenueMap.get(cid) || 0;
    else if (kind === 'expenses') amt = expenseMap.get(cid) || 0;
    else if (kind === 'profit') amt = (revenueMap.get(cid) || 0) - (expenseMap.get(cid) || 0);
    rows.push({ id: String(cid), name: info.name, phone: info.phone, email: info.email, dueDate: info.dueDate, amount: amt });
  });

  rows.sort((a, b) => (b.amount || 0) - (a.amount || 0));
  return rows.filter(r => (r.amount || 0) > 0);
}

// compute balance breakdown for period: only includes clients whose dueDate falls in the selected month/year
function computeBalances(
  data: any,
  month: number | "all",
  year: number | "all"
) {
  const map = new Map<number, { id: string; name: string; phone: string; email: string; dueDate: string | null; amount: number }>();
  (data.projects || []).forEach((p: any) => {
    const d = p.client?.dueDate ? new Date(p.client.dueDate) : null;
    if (!d) return;
    const matchesMonth = month === "all" || (d.getMonth() + 1) === month;
    const matchesYear = year === "all" || d.getFullYear() === year;
    if (!matchesMonth || !matchesYear) return;

    const cid = p.clientId;
    if (!map.has(cid)) {
      map.set(cid, {
        id: String(cid),
        name: p.client?.name || 'Unknown',
        phone: p.client?.phone || '',
        email: p.client?.email || '',
        dueDate: p.client?.dueDate,
        amount: 0
      });
    }
    const entry = map.get(cid)!;
    const pTotal = (p.price || 0) + (p.expenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0);
    const paid = p.client?.payments?.reduce((s: number, pay: any) => s + (pay.amount || 0), 0) || 0;
    entry.amount += pTotal - paid;
  });

  const rows = Array.from(map.values()).filter(r => r.amount > 0);
  rows.sort((a, b) => (b.amount || 0) - (a.amount || 0));
  return rows;
}

function BreakdownTable({ rows, copiedItems, onCopy }: { rows: { id: string; name: string; phone: string; email: string; dueDate: string | null; amount: number }[], copiedItems?: Record<string,boolean>, onCopy?: (text:string,id:string)=>void }) {
    const hasValues = rows.some(r => (r.amount || 0) > 0);
    if (!rows.length || !hasValues) {
        return <p className="text-sm italic text-slate-500">No entries for the selected period.</p>;
    }
    return (
        <table className="w-full text-left">
            <thead className="bg-slate-50/50">
                <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {rows.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{r.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-400">{r.phone}</span>
                                {onCopy && (
                                    <button onClick={() => onCopy(r.phone, `${r.id}-phone`)} className="p-1 rounded hover:bg-slate-100" aria-label={`Copy ${r.phone}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                )}
                                {copiedItems && copiedItems[`${r.id}-phone`] && <span className="text-[10px] text-emerald-600">copied</span>}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-400">{r.email || '—'}</span>
                                {onCopy && r.email && (
                                    <button onClick={() => onCopy(r.email, `${r.id}-email`)} className="p-1 rounded hover:bg-slate-100" aria-label={`Copy ${r.email}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                )}
                                {copiedItems && copiedItems[`${r.id}-email`] && <span className="text-[10px] text-emerald-600">copied</span>}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                            {r.dueDate ? new Date(r.dueDate).toLocaleDateString("en-GB") : "—"}
                        </td>
                        <td className="px-6 py-4 text-right font-light text-2xl text-slate-700">{(r.amount || 0).toLocaleString()} NIS</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}