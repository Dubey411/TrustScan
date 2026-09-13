import { NextRequest, NextResponse } from 'next/server';

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

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Log the contact inquiry for admin records
    console.log(`[Contact Form Submission] From: ${name} <${email}> | Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // In production, this can also forward to trustscan.ai@gmail.com or save to Firestore
    return NextResponse.json({
      success: true,
      message: 'Your message has been received. Our security team will review it within 24 hours.',
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred while processing your message.' },
      { status: 500 }
    );
  }
}
