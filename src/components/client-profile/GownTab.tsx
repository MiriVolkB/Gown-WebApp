"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SingleMeasurementDisplay } from "@/components/measurements/SingleMeasurementDisplay";
import { AnyAaaaRecord, AnyARecord } from "node:dns";

// Keep your color variable
const deepNavy = '#1E2024';

interface GownTabProps {
    project: any; // Replace 'any' with your Prisma Project type if you have it exported
    onAddMeasurement: () => void;
    onAddExpense: () => void;
    
}

export function GownTab({
    project, onAddMeasurement, onAddExpense }: GownTabProps) {

    const router = useRouter();

    const handleDeleteMeasurement = async (id: number) => {
        if (!confirm("Are you sure you want to delete this measurement?")) return;

        try {
            await fetch(`/api/measurements/${id}`, { method: "DELETE" });
            // Refresh measurements (or reload)
            router.refresh(); // Next.js 13+ recommended
        } catch (error) {
            console.error("Failed to delete measurement", error);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-10">


            {/* SECTION 1: MAIN GOWN HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="space-y-1">
                    <h3 className="text-3xl font-serif text-slate-900">
                        {project.memberName}'s Gown
                    </h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                        Type: {project.orderType === 'RENTAL' ? 'Rental' : 'Custom Design'}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 transition-colors"
                        onClick={onAddExpense}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Expense
                    </Button>


                    <Button
                        style={{ backgroundColor: deepNavy, color: 'white' }}
                        onClick={onAddMeasurement}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Measurement
                    </Button>
                </div>
            </div>

            {/* SECTION 2: UNIFIED MEASUREMENTS LIST */}
            <section className="space-y-12">
                {project.measurements && project.measurements.length > 0 ? (
                    project.measurements.map((measurement: any) => (
                        <div key={measurement.id} className="space-y-4">

                            {/* Individual Fitting Header */}
                            <div className="flex items-baseline justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-serif text-slate-800">Measurements</h3>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <span className="h-1 w-1 bg-blue-400 rounded-full" />
                                        Last Fit: {new Date(measurement.date).toLocaleDateString("en-GB")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-200">                              Final Fitting
                                    </span>
                                    <div className="flex gap-2">
                                        
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-rose-600 hover:bg-rose-50 h-8 px-3"
                                            onClick={() => handleDeleteMeasurement(measurement.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* The Display Component with the slim lines */}
                            <SingleMeasurementDisplay
                                measurement={measurement}
                                onSave={async (field: string, value: string) => {
                                    await fetch(`/api/measurements/${measurement.id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ [field]: field === 'notes' ? value : Number(value) }),
                                    });
                                    router.refresh();
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 italic text-sm">No measurements recorded yet.</p>
                    </div>
                )}
            </section>

            {/* SECTION 3: ITEMIZED EXPENSES BREAKDOWN */}
            <section className="pt-10 border-t border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Gown Expense Breakdown</h4>
                        <p className="text-xs text-slate-400">Additional costs outside the base price</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Extras</p>
                        <p className="text-xl font-serif text-slate-900">
                            {project.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString()} <span className="text-xs">NIS</span>
                        </p>
                    </div>
                </div>

                {project.expenses && project.expenses.length > 0 ? (
                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100/50">
                                <tr className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                    <th className="px-8 py-4">Expense Description</th>
                                    <th className="px-8 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {project.expenses.map((exp: any) => (
                                    <tr key={exp.id} className="hover:bg-white transition-colors">
                                        <td className="px-8 py-4 font-medium text-slate-700">
                                            {exp.type}
                                        </td>
                                        <td className="px-8 py-4 text-right font-serif font-bold text-slate-900">
                                            {exp.amount.toLocaleString()} NIS
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs italic">No additional expenses recorded for this gown.</p>
                    </div>
                )}
            </section>
        </div>
    );
}