"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SingleMeasurementDisplay } from "@/components/measurements/SingleMeasurementDisplay";

const deepNavy = '#1E2024';

interface GownTabProps {
    project: any; 
    onAddMeasurement: () => void;
    onAddExpense: () => void;
}

export function GownTab({ project, onAddMeasurement, onAddExpense }: GownTabProps) {
    const router = useRouter();

    const [deletingId, setDeletingId] = useState<string | number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

    const closeDeleteDialog = () => {
        setDeletingId(null);
        setDeleteError("");
    };

    // Waits for the server before saying "Deleted!", so a failed delete is never hidden.
    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        const idToDelete = String(deletingId);

        setIsDeleting(true);
        setDeleteError("");

        try {
            const res = await fetch(`/api/measurements/${idToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error();

            setDeletedIds(prev => new Set(prev).add(idToDelete));
            setShowDeleteSuccess(true);
            setTimeout(() => {
                setShowDeleteSuccess(false);
                setDeletingId(null);
                router.refresh();
            }, 800);
        } catch {
            setDeleteError("Could not delete. Nothing was removed. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const visibleMeasurements = project.measurements?.filter(
        (m: any) => !deletedIds.has(String(m.id))
    ) || [];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-8 shadow-sm space-y-10">

            {/* SECTION 1: MAIN GOWN HEADER */}
            <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                
                <div className="space-y-1 w-full sm:w-auto">
                    <h3 className="text-3xl font-serif text-slate-900">
                        {project.memberName}'s Gown
                    </h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                        Type: {project.orderType === 'RENTAL' ? 'Rental' : 'Custom Design'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 transition-colors"
                        onClick={onAddExpense}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Expense
                    </Button>

                    <Button
                        style={{ backgroundColor: deepNavy, color: 'white' }}
                        className="flex-1 sm:flex-none"
                        onClick={onAddMeasurement}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Measurement
                    </Button>
                </div>
            </div>

            {/* SECTION 2: UNIFIED MEASUREMENTS LIST */}
            <section className="space-y-12">
                {visibleMeasurements.length > 0 ? (
                    visibleMeasurements.map((measurement: any) => (
                        <div key={measurement.id} className="space-y-4 animate-in fade-in">

                            {/* Individual Fitting Header */}
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                
                                <div className="space-y-1 min-w-0 flex-1">
                                    <h3 className="text-2xl font-serif text-slate-800">Measurements</h3>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 truncate">
                                        <span className="h-1 w-1 bg-blue-400 rounded-full shrink-0" />
                                        Last Fit: {new Date(measurement.date).toLocaleDateString("en-GB")}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 shrink-0">
                                    <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shrink-0 whitespace-nowrap">
                                        Fitting Details
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-rose-600 hover:bg-rose-50 h-8 px-3 shrink-0"
                                        onClick={() => setDeletingId(measurement.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            <SingleMeasurementDisplay
                                measurement={measurement}
                                onSave={async (field: string, value: string) => {
                                    const res = await fetch(`/api/measurements/${measurement.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ [field]: field === 'notes' ? value : Number(value) }),
                                    });
                                    if (!res.ok) {
                                        throw new Error(
                                            res.status === 400
                                                ? "Please enter a number greater than 0."
                                                : "Could not save. Please try again."
                                        );
                                    }
                                    router.refresh();
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 animate-in fade-in">
                        <p className="text-slate-400 italic text-sm">No measurements recorded yet.</p>
                    </div>
                )}
            </section>

            {/* SECTION 3: ITEMIZED EXPENSES BREAKDOWN */}
            <section className="pt-10 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Gown Expense Breakdown</h4>
                        <p className="text-xs text-slate-400">Additional costs outside the base price</p>
                    </div>
                    <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border border-slate-100 sm:border-none">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Total Extras</p>
                        <p className="text-xl font-serif text-slate-900">
                            {project.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0).toLocaleString()} <span className="text-xs">NIS</span>
                        </p>
                    </div>
                </div>

                {project.expenses && project.expenses.length > 0 ? (
                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[300px]">
                                <thead className="bg-slate-100/50">
                                    <tr className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                        <th className="px-4 sm:px-8 py-4">Expense Description</th>
                                        <th className="px-4 sm:px-8 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {project.expenses.map((exp: any) => (
                                        <tr key={exp.id} className="hover:bg-white transition-colors">
                                            <td className="px-4 sm:px-8 py-4 font-medium text-slate-700">
                                                {exp.type}
                                            </td>
                                            <td className="px-4 sm:px-8 py-4 text-right font-serif font-bold text-slate-900">
                                                {exp.amount.toLocaleString()} NIS
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs italic">No additional expenses recorded for this gown.</p>
                    </div>
                )}
            </section>

            {/* SECTION 4: THE FRIENDLY CANCEL CONFIRMATION MODAL */}
            {deletingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {showDeleteSuccess ? (
                            /* SUCCESS SCREEN */
                            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
                                <div className="animate-bounce">
                                    <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Deleted!</h2>
                                <p className="text-slate-500 text-sm">The measurement has been removed.</p>
                            </div>
                        ) : (
                            /* CONFIRMATION SCREEN */
                            <>
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <AlertTriangle className="h-5 w-5" />
                                        <h3 className="font-bold">Delete Measurement</h3>
                                    </div>
                                    <button 
                                        onClick={() => !isDeleting && closeDeleteDialog()}
                                        disabled={isDeleting}
                                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors disabled:opacity-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="p-6 text-center space-y-3">
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Are you sure you want to delete these measurements? This action cannot be undone.
                                    </p>
                                    {deleteError && (
                                        <p role="alert" className="text-sm text-rose-600">{deleteError}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-t border-slate-100">
                                    <Button 
                                        variant="outline" 
                                        onClick={closeDeleteDialog}
                                        disabled={isDeleting}
                                        className="flex-1 bg-white"
                                    >
                                        Keep it
                                    </Button>
                                    <Button 
                                        variant="destructive"
                                        onClick={handleConfirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                    </Button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}