// app/api/services/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = await getDb();
    const services = await db.collection('services').find({ active: true }).project({}).toArray();
    
    // Convert MongoDB _id to string for JSON serialization
    const servicesWithStringId = services.map(service => ({
      ...service,
      id: service._id.toString(),
      _id: service._id.toString()
    }));
    
    return NextResponse.json(servicesWithStringId, { status: 200 });
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const serviceData = await req.json();
    const db = await getDb();
    
    const service = {
      ...serviceData,
      active: serviceData.active !== false,
      createdAt: new Date(),
    };
    
    const result = await db.collection('services').insertOne(service);
    
    return NextResponse.json({ 
      id: result.insertedId.toString(), 
      ...service 
    }, { status: 201 });
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}