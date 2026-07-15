// src/lib/actions/appointments.ts

export const serviceIdMap: Record<string, number> = {
  'First Appointment': 1,
  'First Fitting': 2,
  'Second Fitting': 3,
  'Pickup': 4,
  'Rental': 5,
  'Other': 6,
};

// 1. Unified Save (Handles Create and Update)
export async function saveAppointmentAction(
  appointmentData: any,
  clientId?: number | null,
  clientName?: string
) {
  const isCustom = appointmentData.bookingType === 'custom' || (!clientId && !clientName);

  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...appointmentData,
      bookingType: isCustom ? 'custom' : 'client',
      clientId: isCustom ? null : clientId,
      clientName: isCustom ? undefined : clientName,
      serviceId: serviceIdMap[appointmentData.serviceName] || (isCustom ? 6 : 1),
    }),
  });

  return response;
}

// 2. Unified Cancel
export async function cancelAppointmentAction(appointmentId: number) {
  const response = await fetch(`/api/appointments?id=${appointmentId}`, {
    method: 'DELETE',
  });
  
  return response;
}