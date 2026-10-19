// Who may do what. To change a rule, edit the list of roles on that line.
// Guests are handled before this check: they always get a simulated success.
export const ALLOWED_ROLES = {
  addPayment: ["OWNER", "SECRETARY"],
  addFamilyMember: ["OWNER", "SECRETARY"],
  addExpense: ["OWNER", "SECRETARY"],
  saveMeasurement: ["OWNER", "SECRETARY"],
  deleteMeasurement: ["OWNER", "SECRETARY"],
  viewFinances: ["OWNER", "GUEST"],
} satisfies Record<string, string[]>;

export type Action = keyof typeof ALLOWED_ROLES;

export function isAllowed(role: string, action: Action) {
  return ALLOWED_ROLES[action].includes(role);
}
