// app/api/payments/v1/checkout/session/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { serviceKey, sessionId, successUrl, cancelUrl, userEmail } = await req.json();
    
    const db = await getDb();
    
    // Find the service
    const service = await db.collection('services').findOne({ key: serviceKey });
    if (!service) {
      return new NextResponse('Service not found', { status: 404 });
    }
    
    let priceId = service.stripePriceId;
    
    // Create Stripe product and price if not exists
    if (!priceId) {
      const product = await stripe.products.create({ 
        name: service.name, 
        description: service.description,
        metadata: { key: service.key } 
      });
      
      const price = await stripe.prices.create({ 
        unit_amount: Math.round(Number(service.price) * 100), 
        currency: 'usd', 
        product: product.id 
      });
      
      priceId = price.id;
      
      // Update service with Stripe IDs
      await db.collection('services').updateOne(
        { key: service.key }, 
        { $set: { stripeProductId: product.id, stripePriceId: price.id, updatedAt: new Date() } }
      );
    }
    
    // Create Stripe checkout session
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}`,
      customer_email: userEmail,
      metadata: { 
        serviceKey, 
        sessionId: String(sessionId || ''),
        serviceName: service.name,
        duration: String(service.durationMins)
      }
    });
    
    // Store payment record
    await db.collection('payments').insertOne({
      sessionId: sessionId || null,
      serviceKey,
      serviceName: service.name,
      provider: 'stripe', 
      checkoutSessionId: checkout.id, 
      amount: Number(service.price), 
      currency: 'USD', 
      status: 'UNPAID', 
      userEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({ 
      url: checkout.url,
      checkoutSessionId: checkout.id 
    });
    
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}