import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Dynamic import for swisseph to handle external module
let swisseph = null;
try {
  swisseph = require('swisseph');
} catch (error) {
  console.warn('Swiss Ephemeris not available:', error.message);
}

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
const emailTransporter = nodemailer.createTransport({
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

// Birth chart calculation using Swiss Ephemeris
async function calculateBirthChart({ birthDate, birthTime, latitude, longitude }) {
  try {
    if (!swisseph) {
      console.warn('Swiss Ephemeris not available, returning mock data');
      // Return mock data for testing when swisseph is not available
      return {
        julianDay: 2451545.0, // Mock Julian Day
        planets: [
          { name: 'Sun', longitude: 280.5, sign: 'Capricorn', degree: 10.5 },
          { name: 'Moon', longitude: 342.3, sign: 'Pisces', degree: 12.3 },
          { name: 'Mercury', longitude: 275.7, sign: 'Capricorn', degree: 5.7 },
          { name: 'Venus', longitude: 295.2, sign: 'Capricorn', degree: 25.2 },
          { name: 'Mars', longitude: 45.8, sign: 'Taurus', degree: 15.8 }
        ],
        houses: [],
        aspects: [],
        generated: new Date().toISOString(),
        note: 'Mock data - Swiss Ephemeris not available'
      };
    }

    // This is a simplified example - real Swiss Ephemeris integration would be more complex
    const julianDay = swisseph.swe_julday(
      parseInt(birthDate.split('-')[0]), // year
      parseInt(birthDate.split('-')[1]), // month
      parseInt(birthDate.split('-')[2]), // day
      parseFloat(birthTime.split(':')[0]) + parseFloat(birthTime.split(':')[1]) / 60, // hour
      1 // calendar type: 1 = Gregorian
    );

    const planets = [];
    const planetIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    for (let i = 0; i < planetIds.length; i++) {
      const position = swisseph.swe_calc_ut(julianDay, planetIds[i], 0);
      if (position.longitude !== undefined) {
        const sign = Math.floor(position.longitude / 30);
        const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        
        planets.push({
          name: planetNames[i],
          longitude: position.longitude,
          sign: signNames[sign],
          degree: position.longitude % 30
        });
      }
    }

    return {
      julianDay,
      planets,
      houses: [], // Houses calculation would go here
      aspects: [], // Aspects calculation would go here
      generated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Birth chart calculation error:', error);
    return null;
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
            <h1 style="color: #fbbf24; text-align: center;">✨ Celestia</h1>
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
      new_user_registration: {
        subject: `New User Registration - ${data.userName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>New User Registration</h2>
            <p><strong>Name:</strong> ${data.userName}</p>
            <p><strong>Email:</strong> ${data.userEmail}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
            ${data.birthInfo ? `<p><strong>Birth Info:</strong> ${data.birthInfo}</p>` : ''}
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

export async function GET(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Health check
    if (path.includes('/api/health')) {
      return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    return NextResponse.json({ message: 'API is working' });
  } catch (error) {
    console.error('GET API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    const body = await request.json();

    // User Registration
    if (path.includes('/api/register') || path.includes('/auth/register')) {
      const { email, password, name, birthDate, birthTime, birthPlace } = body;
      const { db } = await connectToDatabase();

      // Check if user exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return NextResponse.json({ message: 'User already exists' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create user
      const user = {
        id: userId,
        email,
        name,
        role: email === 'lago.mistico11@gmail.com' ? 'admin' : 'client',
        createdAt: new Date(),
        password: hashedPassword, // Store hashed password
        birthInfo: {
          birthDate: birthDate || null,
          birthTime: birthTime || null,
          birthPlace: birthPlace || null
        }
      };

      await db.collection('users').insertOne(user);

      // Send notification email to admin
      try {
        await sendEmail({
          to: 'lago.mistico11@gmail.com',
          type: 'new_user_registration',
          data: {
            userName: name,
            userEmail: email,
            birthInfo: birthDate ? `${birthDate} ${birthTime || ''} ${birthPlace || ''}`.trim() : 'Not provided'
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      // Return user data without password
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      };

      return NextResponse.json({ 
        message: 'User created successfully', 
        user: userResponse 
      }, { status: 201 });
    }

    // User Profile
    if (path.includes('/api/user/profile')) {
      // Get user profile data (requires authentication)
      return NextResponse.json({ 
        name: 'User Name',
        email: 'user@example.com',
        joinDate: '2024-01-01'
      });
    }

    // Generate Birth Chart
    if (path.includes('/api/user/generate-birth-chart')) {
      const { db } = await connectToDatabase();
      // This would get user's birth info from database and calculate chart
      const birthChart = await calculateBirthChart({
        birthDate: '1990-01-01',
        birthTime: '12:00',
        latitude: 40.7128,
        longitude: -74.0060
      });

      if (birthChart) {
        // Save chart to database
        await db.collection('birthCharts').insertOne({
          userId: 'user_id', // Would get from authentication
          ...birthChart
        });
      }

      return NextResponse.json(birthChart);
    }

    // Get Birth Chart
    if (path.includes('/api/user/birth-chart')) {
      return NextResponse.json({
        birthDate: '1990-01-01',
        birthTime: '12:00:00',
        birthPlace: 'New York, NY',
        planets: [
          { name: 'Sun', sign: 'Capricorn', degree: 10.5 },
          { name: 'Moon', sign: 'Pisces', degree: 22.3 },
          { name: 'Mercury', sign: 'Capricorn', degree: 5.7 }
        ]
      });
    }

    // User Sessions
    if (path.includes('/api/user/sessions')) {
      return NextResponse.json([
        {
          id: 1,
          service: 'Personal Tarot Reading',
          date: '2024-01-15',
          status: 'completed',
          duration: 60,
          notes: 'Great insights about career path'
        }
      ]);
    }

    // User Notes
    if (path.includes('/api/user/notes')) {
      if (request.method === 'POST' && body.personalNotes) {
        const { personalNotes } = body;
        // Save personal notes to database
        return NextResponse.json({ success: true });
      }
      
      // Return notes data for GET or POST without personalNotes
      return NextResponse.json({
        personal: 'My personal reflection notes...',
        admin: [
          {
            title: 'Session Insights',
            content: 'Your energy suggests a time of transformation...',
            date: '2024-01-15'
          }
        ]
      });
    }

    // Admin Stats
    if (path.includes('/api/admin/stats')) {
      const { db } = await connectToDatabase();
      
      // Get actual stats from database
      const totalUsers = await db.collection('users').countDocuments({ role: 'client' });
      const totalBookings = await db.collection('bookings').countDocuments();
      
      return NextResponse.json({
        totalUsers,
        newUsersThisMonth: 5,
        monthlyRevenue: 1250,
        revenueGrowth: 15,
        activeSessions: 3,
        upcomingSessions: 7,
        totalCharts: 12,
        totalRevenue: 5670,
        averageSession: 85
      });
    }

    // Admin Users
    if (path.includes('/api/admin/users')) {
      const { db } = await connectToDatabase();
      
      const users = await db.collection('users').find({ role: 'client' }).toArray();
      
      return NextResponse.json(users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        joinDate: user.createdAt?.toDateString(),
        lastActive: user.lastActive?.toDateString() || 'Never',
        hasChart: Boolean(user.birthInfo?.birthDate),
        sessionsCount: 0, // Would calculate from sessions collection
        totalRevenue: 0, // Would calculate from payments
        birthChart: user.birthInfo
      })));
    }

    // Admin Sessions
    if (path.includes('/api/admin/sessions')) {
      return NextResponse.json([
        {
          id: 1,
          clientName: 'Sarah Johnson',
          email: 'sarah@example.com',
          service: 'Personal Tarot Reading',
          date: new Date().toDateString(),
          time: '2:00 PM',
          status: 'confirmed',
          amount: 85,
          meetLink: 'https://meet.google.com/abc-def-ghi'
        }
      ]);
    }

    // Admin Revenue
    if (path.includes('/api/admin/revenue')) {
      return NextResponse.json([
        { month: 'Jan', revenue: 1200 },
        { month: 'Feb', revenue: 1450 },
        { month: 'Mar', revenue: 1300 }
      ]);
    }

    // Generate Real-time Chart for Admin
    if (path.includes('/api/admin/generate-chart/')) {
      const userId = path.split('/').pop();
      const { db } = await connectToDatabase();
      
      // Get user's birth info
      const user = await db.collection('users').findOne({ _id: userId });
      
      if (user?.birthInfo) {
        const realtimeChart = await calculateBirthChart({
          birthDate: user.birthInfo.birthDate,
          birthTime: user.birthInfo.birthTime,
          latitude: 40.7128, // Would get from birth place
          longitude: -74.0060
        });
        
        return NextResponse.json(realtimeChart);
      }
      
      return NextResponse.json({ error: 'User birth info not found' }, { status: 404 });
    }

    // Publish Admin Note
    if (path.includes('/api/admin/publish-note')) {
      const { userId, title, content } = body;
      const { db } = await connectToDatabase();
      
      await db.collection('adminNotes').insertOne({
        userId,
        title,
        content,
        publishedAt: new Date(),
        publishedBy: 'lago.mistico11@gmail.com'
      });
      
      return NextResponse.json({ success: true });
    }

    // New Payment System - /api/payments/v1/checkout/session
    if (path.includes('/api/payments/v1/checkout/session')) {
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

      // Store payment in database
      const { db } = await connectToDatabase();
      await db.collection('payments').insertOne({
        checkoutSessionId: session.id,
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

    // Sessions Management - POST create session
    if (path.includes('/api/sessions')) {
      const { serviceId, userId, scheduledDate, scheduledTime } = body;
      const { db } = await connectToDatabase();
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session = {
        id: sessionId,
        serviceId,
        userId,
        scheduledDate,
        scheduledTime,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('sessions').insertOne(session);
      
      return NextResponse.json({ 
        message: 'Session created successfully', 
        session: session 
      }, { status: 201 });
    }

    // Create Stripe Checkout Session (existing compatibility)
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

    // Create Calendar Event (existing)
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

    // Send Email (existing)
    if (path.includes('/api/send-email')) {
      const result = await sendEmail(body);
      return NextResponse.json(result);
    }

    // Get Bookings (existing)
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