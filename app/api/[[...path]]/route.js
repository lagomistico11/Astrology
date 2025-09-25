import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Initialize clients
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// MongoDB connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const db = client.db(process.env.DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Email transporter
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// NextAuth configuration
const authHandler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (Date.now() < token.expiresAt * 1000) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});

async function refreshAccessToken(token) {
  try {
    const url = "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// Google Calendar helpers
async function getGoogleCalendarClient(token) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ access_token: token });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

async function createCalendarEvent({ token, summary, description, startDateTime, endDateTime, timeZone = "America/Chicago", attendees = [] }) {
  try {
    const calendar = await getGoogleCalendarClient(token);
    const requestId = `meet-${Date.now()}`;
    
    const event = {
      summary,
      description,
      start: { dateTime: startDateTime, timeZone },
      end: { dateTime: endDateTime, timeZone },
      attendees: attendees.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}

// Email helper
async function sendEmail({ to, subject, html, type, data = {} }) {
  try {
    const templates = {
      booking_confirmation: {
        subject: `Booking Confirmation - ${data.bookingId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px;">
            <h1 style="color: #fbbf24; text-align: center;">✨ Mystic Astrology</h1>
            <h2>Your Session is Confirmed!</h2>
            <p>Dear ${data.customerName},</p>
            <p>Thank you for booking your cosmic journey with us. Your session has been confirmed:</p>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>📅 Booking ID:</strong> ${data.bookingId}</p>
              <p><strong>🔮 Service:</strong> ${data.serviceName}</p>
              <p><strong>⏰ Duration:</strong> ${data.duration} minutes</p>
              <p><strong>💫 Date & Time:</strong> ${data.sessionDateTime}</p>
              <p><strong>💰 Amount:</strong> $${data.amount}</p>
              ${data.meetLink ? `<p><strong>🎥 Google Meet:</strong> <a href="${data.meetLink}" style="color: #fbbf24;">${data.meetLink}</a></p>` : ''}
            </div>
            <p>Prepare your questions and open your heart to receive the cosmic wisdom that awaits you.</p>
            <p>Blessed be,<br>Your Mystic Guide</p>
          </div>
        `
      },
      payment_receipt: {
        subject: `Payment Receipt - ${data.transactionId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Payment Received ✅</h2>
            <p>Your payment has been successfully processed:</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 5px;">
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Amount:</strong> $${data.amount}</p>
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        `
      }
    };

    const emailContent = type && templates[type] ? templates[type] : { subject, html };
    
    const mailOptions = {
      from: {
        name: process.env.FROM_NAME,
        address: process.env.FROM_EMAIL
      },
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

// Main request handler
export async function GET(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle NextAuth routes
  if (path.includes('/api/auth')) {
    return authHandler(request);
  }

  return NextResponse.json({ message: 'API is working' });
}

export async function POST(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle NextAuth routes
  if (path.includes('/api/auth')) {
    return authHandler(request);
  }

  try {
    const body = await request.json();

    // Create Stripe Checkout Session
    if (path.includes('/api/create-checkout')) {
      const { serviceId, userId, serviceName, price, duration } = body;
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: serviceName,
                description: `${duration}-minute ${serviceName.toLowerCase()} session`,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}`,
        metadata: {
          serviceId,
          userId,
          serviceName,
          duration: duration.toString(),
        },
        customer_email: userId,
      });

      // Store booking in database
      const { db } = await connectToDatabase();
      await db.collection('bookings').insertOne({
        id: session.id,
        serviceId,
        serviceName,
        userId,
        price,
        duration,
        status: 'pending',
        createdAt: new Date(),
        stripeSessionId: session.id,
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // Handle Stripe Webhooks
    if (path.includes('/api/webhook/stripe')) {
      const sig = request.headers.get('stripe-signature');
      let event;

      try {
        const rawBody = await request.text();
        event = stripe.webhooks.constructEvent(
          rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (error) {
        return NextResponse.json(
          { error: 'Webhook signature verification failed' },
          { status: 400 }
        );
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { db } = await connectToDatabase();

        // Update booking status
        await db.collection('bookings').updateOne(
          { stripeSessionId: session.id },
          {
            $set: {
              status: 'paid',
              paymentDetails: session,
              updatedAt: new Date(),
            },
          }
        );

        // Send confirmation email
        try {
          await sendEmail({
            to: session.customer_email || session.metadata.userId,
            type: 'booking_confirmation',
            data: {
              bookingId: session.id.substring(8, 16),
              customerName: session.customer_details?.name || 'Valued Client',
              serviceName: session.metadata.serviceName,
              duration: session.metadata.duration,
              amount: (session.amount_total / 100).toFixed(2),
              sessionDateTime: 'To be scheduled via calendar link',
            },
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      return NextResponse.json({ received: true });
    }

    // Create Calendar Event
    if (path.includes('/api/calendar/create-event')) {
      const { summary, description, startDateTime, endDateTime, attendees, accessToken } = body;

      const event = await createCalendarEvent({
        token: accessToken,
        summary,
        description,
        startDateTime,
        endDateTime,
        attendees,
      });

      let meetLink = null;
      if (event.conferenceData && event.conferenceData.entryPoints) {
        const videoEntry = event.conferenceData.entryPoints.find(
          (entry) => entry.entryPointType === "video"
        );
        if (videoEntry) {
          meetLink = videoEntry.uri;
        }
      }

      return NextResponse.json({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        meetLink,
        htmlLink: event.htmlLink,
      });
    }

    // Send Email
    if (path.includes('/api/send-email')) {
      const result = await sendEmail(body);
      return NextResponse.json(result);
    }

    // Get Bookings
    if (path.includes('/api/bookings')) {
      const { db } = await connectToDatabase();
      const bookings = await db.collection('bookings').find({}).toArray();
      return NextResponse.json(bookings);
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  return POST(request);
}

export async function DELETE(request) {
  return POST(request);
}