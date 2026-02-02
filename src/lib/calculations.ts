// Define interfaces based on your Prisma models for better type safety
interface Expense {
  amount: number;
}

interface Project {
  price: number;
  expenses: Expense[];
}

interface Payment {
  amount: number;
}

interface ClientWithRelations {
  projects: Project[];
  payments: Payment[];
}

export function calculateFamilyFinances(client: any) {
  // 1. Sum up base prices of all gowns
  const totalBasePrice = client.projects?.reduce((sum: number, p: any) => sum + p.price, 0) || 0;

  // 2. Sum up all extra expenses (Dying, Fabric, etc.) from all gowns
  const totalExpenses = client.projects?.reduce((sum: number, p: any) => {
    const projectExpenses = p.expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0;
    return sum + projectExpenses;
  }, 0) || 0;

  // 3. Sum up all payments made by the family
  const totalPaid = client.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  // Final math
  const totalBill = totalBasePrice + totalExpenses;
  const balance = totalBill - totalPaid;
  const isFullyPaid = balance <= 0;

  return {
    totalBasePrice,
    totalExpenses,
    totalBill,
    totalPaid,
    balance,
    isFullyPaid
  };
}