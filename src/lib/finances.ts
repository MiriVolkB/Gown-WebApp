export function calculateGlobalFinances(
  allProjects: any[] = [], 
  allPayments: any[] = [], 
  allExpenses: any[] = [] // These are business-wide expenses, not gown-specific
) {
  // Cash actually received in the selected window
  const totalIncome = allPayments?.reduce((sum, p) => sum + (p?.amount || 0), 0) || 0;
  
  // Business overhead (not gown-specific)
  const totalInternalExpenses = allExpenses?.reduce((sum, e) => sum + (e?.amount || 0), 0) || 0;

  // Grouping by Client to find the real "Owed" amount
  const clientMap = new Map<number, { bill: number, paid: number }>();

  allProjects.forEach((p) => {
    const cid = p.clientId;
    if (!clientMap.has(cid)) {
      clientMap.set(cid, {
        // Sum all payments ever made by this family
        paid: p.client?.payments?.reduce((s: number, pay: any) => s + (pay.amount || 0), 0) || 0,
        bill: 0
      });
    }
    
    // Project Price + Gown-specific expenses (Dying, Fabric, etc)
    const projectTotal = (p.price || 0) + 
      (p.expenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0);
    
    clientMap.get(cid)!.bill += projectTotal;
  });

  let totalOwed = 0;
  clientMap.forEach((val) => {
    const balance = val.bill - val.paid;
    if (balance > 0) totalOwed += balance;
  });

  return {
    totalIncome,
    totalInternalExpenses,
    totalOwed,
    netProfit: totalIncome - totalInternalExpenses
  };
}