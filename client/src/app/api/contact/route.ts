import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;

    // If Resend API Key is configured, dispatch the real email to trustscan.ai@gmail.com
    if (apiKey) {
      const resend = new Resend(apiKey);

      await resend.emails.send({
        from: 'TrustScan AI <onboarding@resend.dev>', // Default free testing domain or your verified domain
        to: ['trustscan.ai@gmail.com'],
        replyTo: email,
        subject: `[TrustScan Contact Form] ${subject || 'New Inquiry'} from ${name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
            <div style="border-bottom: 2px solid #0052cc; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 20px;">TrustScan AI — New Contact Form Submission</h2>
              <span style="color: #64748b; font-size: 12px;">Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</span>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #475569; font-weight: 600; width: 120px;">Sender Name:</td>
                <td style="padding: 8px 0; color: #0f172a;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #475569; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #0052cc;"><a href="mailto:${email}" style="color: #0052cc; text-decoration: underline;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #475569; font-weight: 600;">Subject Category:</td>
                <td style="padding: 8px 0; color: #0f172a;">${subject || 'General'}</td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; border-left: 4px solid #0052cc; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">User Message:</h4>
              <p style="margin: 0; color: #1e293b; white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${message}</p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">Hit "Reply" in your email client to respond directly to <strong>${email}</strong>.</p>
            </div>
          </div>
        `,
      });

      console.log(`[Resend Email Dispatched] Message from ${email} successfully sent to trustscan.ai@gmail.com`);
    } else {
      console.warn('[Resend Notice] RESEND_API_KEY is not set in environment. Message logged to console:');
      console.log({ name, email, subject, message, timestamp: new Date().toISOString() });
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully.',
    });
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send message. Please try again or email us directly.' },
      { status: 500 }
    );
  }
}
