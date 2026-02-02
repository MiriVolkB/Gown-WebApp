"use client";

import React from 'react';

// If you want to use the exact colors from your main page

export function FamilyInvoiceBreakdown({ client }: { client: any }) {
  const deepNavy = "#1E2024";
  if (!client?.projects) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Detailed Itemization
        </h3>
        <span className="text-xs text-slate-400">Gowns + Extra Charges</span>
      </div>
      
      <div className="divide-y divide-gray-100">
        {client.projects?.map((project: any) => {
          const projectExpensesTotal = project.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
          const projectTotal = project.price + projectExpensesTotal;

          return (
            <div key={project.id} className="p-6 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-lg" style={{ color: deepNavy }}>
                    {project.memberName}
                  </h4>
                  <p className="text-xs font-medium text-slate-400 uppercase">
                    {project.orderType.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold" style={{ color: deepNavy }}>
                    {projectTotal.toLocaleString()} NIS
                  </span>
                </div>
              </div>

              {/* Sub-items list */}
              <div className="space-y-2 ml-1 border-l-2 border-slate-100 pl-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Base Gown Price</span>
                  <span className="text-slate-700">{project.price.toLocaleString()} NIS</span>
                </div>
                
                {project.expenses?.map((exp: any) => (
                  <div key={exp.id} className="flex justify-between text-sm">
                    <span className="text-blue-600 flex items-center">
                      <span className="mr-1.5">+</span> {exp.type}
                    </span>
                    <span className="text-slate-700">{exp.amount.toLocaleString()} NIS</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Footer for the breakdown box */}
      <div className="bg-slate-50 p-4 px-6 text-right">
        <span className="text-sm text-slate-500 mr-2">Total Project Value:</span>
        <span className="font-bold text-slate-900">
          {client.projects?.reduce((sum: number, p: any) => 
            sum + p.price + (p.expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0), 0
          ).toLocaleString()} NIS
        </span>
      </div>
    </div>
  );
}