import { Resend } from 'resend';

// Make sure your API key is in .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. The Original Confirmation Email
export async function sendConfirmationEmail(
  email: string,
  clientName: string,
  date: string,
  time: string,
  type: string
) {
  if (!email) return;

  try {
    await resend.emails.send({
      from: 'Rachelli Custom Gowns <onboarding@resend.dev>',
      to: email,
      subject: 'Appointment Confirmed! 📅',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Hi ${clientName},</h1>
          <p>Your appointment for <strong>${type}</strong> is confirmed.</p>
          <p><strong>When:</strong> ${date} at ${time}</p>
          <p>We look forward to seeing you!</p>
        </div>
      `,
    });
    console.log("✅ Confirmation email sent to " + email);
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
  }
}

// 2. The New Reschedule Email (Must be OUTSIDE the function above)
export async function sendRescheduleEmail(
  email: string,
  clientName: string,
  date: string,
  time: string,
  type: string
) {
  if (!email) return;

  try {
    await resend.emails.send({
      from: 'Rachelli Custom Gowns <onboarding@resend.dev>',
      to: email,
      subject: 'Update: Your Appointment has been Rescheduled 🗓️',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h1>Hi ${clientName},</h1>
          <p>Your appointment for <strong>${type}</strong> has been moved to a new time.</p>
          
          <div style="background: #eef2ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e7ff;">
            <p style="margin: 0; color: #3730a3; font-weight: bold;">YOUR NEW TIME:</p>
            <p style="margin: 10px 0 0 0; font-size: 18px;">📅 ${date}</p>
            <p style="margin: 5px 0 0 0; font-size: 18px;">⏰ ${time}</p>
          </div>

          <p>If this new time doesn't work for you, please contact us immediately.</p>
          <p>See you soon!</p>
        </div>
      `,
    });
    console.log("✅ Reschedule email sent to " + email);
  } catch (error) {
    console.error("❌ Failed to send reschedule email:", error);
  }
}