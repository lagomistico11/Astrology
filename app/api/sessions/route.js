// app/api/sessions/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { serviceKey, scheduledAt, notes, userId } = await req.json();
    
    if (!serviceKey || !scheduledAt) {
      return new NextResponse('Missing required fields: serviceKey and scheduledAt', { status: 400 });
    }
    
    const db = await getDb();
    
    // Find the service
    const service = await db.collection('services').findOne({ key: serviceKey, active: true });
    if (!service) {
      return new NextResponse('Service not found', { status: 404 });
    }
    
    // Get user from JWT token if available
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const sessionUserId = userId || token?.email || null;
    
    const session = {
      userId: sessionUserId,
      readerId: 'lago.mistico11@gmail.com', // Admin reader
      serviceKey,
      serviceName: service.name,
      scheduledAt: new Date(scheduledAt),
      durationMins: service.durationMins,
      amount: Number(service.price),
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('sessions').insertOne(session);
    
    return NextResponse.json({ 
      id: result.insertedId.toString(), 
      ...session,
      _id: result.insertedId.toString()
    }, { status: 201 });
    
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    const db = await getDb();
    
    let query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    const sessions = await db.collection('sessions').find(query).sort({ createdAt: -1 }).toArray();
    
    const sessionsWithStringId = sessions.map(session => ({
      ...session,
      id: session._id.toString(),
      _id: session._id.toString()
    }));
    
    return NextResponse.json(sessionsWithStringId, { status: 200 });
    
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}