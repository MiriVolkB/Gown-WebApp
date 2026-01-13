'use server'

import { prisma } from '@/lib/prisma'
import { sendConfirmationEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function createAppointment(formData: FormData) {
  const clientId = parseInt(formData.get('clientId') as string)
  const serviceName = formData.get('serviceName') as string // Now accepts Name!
  const dateStr = formData.get('date') as string
  const timeStr = formData.get('time') as string
  const duration = parseInt(formData.get('duration') as string)
  const notes = formData.get('notes') as string

  if (!clientId) {
    return { success: false, message: 'Please select a valid client from the list.' }
  }

  // 1. Combine Date and Time
  const startDateTime = new Date(`${dateStr}T${timeStr}`)
  const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

  try {
    // 2. Find (or Create) the Service ID based on the Name
    let service = await prisma.service.findFirst({
      where: { name: serviceName }
    })

    // If this service doesn't exist in DB yet, create it on the fly
    if (!service) {
      service = await prisma.service.create({
        data: { name: serviceName, defaultDurationMin: duration, active: true }
      })
    }

    // 3. Save Appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        clientId,
        serviceId: service.id,
        date: startDateTime,
        start: startDateTime,
        end: endDateTime,
        durationMinutes: duration,
        notes,
        status: 'SCHEDULED',
        confirmationSent: false
      },
      include: {
        client: true,
        service: true
      }
    })

    // 4. Send Email
    if (newAppointment.client.email) {
      await sendConfirmationEmail(
        newAppointment.client.email,
        newAppointment.client.name,
        dateStr,
        timeStr,
        newAppointment.service.name
      )
      
      // Mark as sent
      await prisma.appointment.update({
        where: { id: newAppointment.id },
        data: { confirmationSent: true }
      })
    }

    // 5. Refresh Page
    revalidatePath('/calendar')
    return { success: true, message: 'Booked & Email Sent!' }

  } catch (error) {
    console.error("Booking Error:", error)
    return { success: false, message: 'Failed to book appointment' }
  }
}