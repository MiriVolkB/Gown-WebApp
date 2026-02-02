"use client";

import React from 'react';
import { calculateFamilyFinances } from '@/lib/calculations';
import { ClientWithRelations } from "@/types";

export function FamilyFinancialSummary({ client }: { client: ClientWithRelations }) {
  const finances = calculateFamilyFinances(client);
  const { totalBill, totalPaid, balance, isFullyPaid, totalBasePrice, totalExpenses } = finances;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Bill</div>
        <div className="text-2xl font-bold mt-1">{totalBill.toLocaleString()} NIS</div>
        {totalExpenses > 0 && (
          <div className="text-xs text-slate-400 mt-1">
            {totalBasePrice.toLocaleString()} base + {totalExpenses.toLocaleString()} extras
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Paid</div>
        <div className="text-2xl font-bold text-emerald-600 mt-1">{totalPaid.toLocaleString()} NIS</div>
      </div>

      <div className={`p-6 rounded-xl border shadow-sm ${isFullyPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Balance Due</div>
        <div className={`text-2xl font-bold mt-1 ${isFullyPaid ? 'text-emerald-700' : 'text-rose-700'}`}>
          {balance.toLocaleString()} NIS
        </div>
      </div>
    </div>
  );
}