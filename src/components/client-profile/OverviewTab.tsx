"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path if needed
import { FamilyFinancialSummary } from "@/components/client-profile/FamilyFinancialSummary";
import { FamilyInvoiceBreakdown } from "@/components/FamilyInvoiceBreakdown";
import { prisma } from "@/lib/prisma";
import { ClientProfileData } from "./InformationTab";

interface OverviewTabProps {
  client: ClientProfileData;
  onAddExpense: () => void;
  onAddPayment: () => void;
}

export function OverviewTab({ client, onAddExpense, onAddPayment}:  OverviewTabProps ) {

    return(
        <div className="space-y-6">
         {/* Top Summary Cards stay as they are for quick glance */}
            <FamilyFinancialSummary client={client} />

            {/* NEW: Unified Family Folder Container */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              {/* Folder Header */}
              <div className="bg-slate-50 border-b border-gray-100 px-8 py-4 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Billing & Activity</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={onAddExpense}
                    className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Family Expense
                  </Button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                  {/* LEFT & CENTER: The Money Flow (2 columns) */}
                  <div className="lg:col-span-2 space-y-10">

                    {/* Section 1: Detailed Breakdown */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-1 w-1 bg-blue-600 rounded-full" />
                        <h3 className="font-bold text-slate-800">Order Details</h3>
                      </div>
                      <FamilyInvoiceBreakdown client={client} />
                    </section>

                    {/* Section 2: Payment History */}
                    <section>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 bg-emerald-600 rounded-full" />
                          <h3 className="font-bold text-slate-800">Payment Records</h3>
                        </div>
                        <Button
                          onClick={onAddPayment}
                          variant="outline"
                          size="sm"
                          className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Record Payment
                        </Button>
                      </div>

                      {client?.payments && client.payments.length > 0 ? (
                        <div className="bg-slate-50/50 rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-slate-100/50">
                              <tr className="text-[10px] font-bold uppercase text-slate-400">
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Method</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {client.payments.map((payment) => (
                                <tr key={payment.id}>
                                  <td className="px-6 py-4 text-sm text-slate-600">
                                    {new Date(payment.date).toLocaleDateString("en-GB")}
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    <span className="text-slate-500 font-medium uppercase text-[10px] tracking-tight">
                                      {(payment.method?.replace('_', ' ') || 'N/A')}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">
                                    {payment.amount.toLocaleString()} NIS
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl border border-dashed border-gray-200 py-6 text-center">
                          <p className="text-slate-400 text-sm italic">No payments recorded yet.</p>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* RIGHT SIDE: Sidebar (1 column) */}
                  <div className="space-y-8">
                    {/* Notes Card inside the main container */}
                    <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-6">
                      <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                        Family Notes
                      </h3>
                      <p className="text-sm text-amber-800/80 leading-relaxed italic">
                        {client.notes || "No special instructions for this family."}
                      </p>
                    </div>

                    {/* Quick Stats or Contact Info can go here too */}
                    <div className="px-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Client Contact</h4>
                      <p className="text-sm font-medium text-slate-700">{client.phone}</p>
                      <p className="text-xs text-slate-500 mt-1">{client.email || "No email provided"}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            </div>
    );

}
