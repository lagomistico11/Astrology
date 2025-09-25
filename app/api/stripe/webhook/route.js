// app/api/stripe/webhook/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const sig = req.headers.get('stripe-signature');
    const buf = Buffer.from(await req.arrayBuffer());
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
    
    const db = await getDb();
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sessionId = session.metadata?.sessionId || null;
      
      console.log('Payment completed for session:', sessionId);
      
      // Update session if sessionId exists and is valid ObjectId
      if (sessionId && /^[a-f\d]{24}$/i.test(sessionId)) {
        await db.collection('sessions').updateOne(
          { _id: new ObjectId(sessionId) }, 
          { 
            $set: { 
              paymentStatus: 'PAID', 
              status: 'BOOKED',
              stripeSessionId: session.id,
              updatedAt: new Date()
            } 
          }
        );
      }
      
      // Update payment record
      await db.collection('payments').updateOne(
        { checkoutSessionId: session.id }, 
        { 
          $set: { 
            status: 'PAID',
            paidAt: new Date(),
            stripePaymentIntent: session.payment_intent,
            updatedAt: new Date()
          } 
        }
      );
      
      // Send confirmation email
      try {
        await sendEmail({
          to: session.customer_email || session.customer_details?.email,
          type: 'booking_confirmation',
          data: {
            bookingId: session.id.substring(8, 16).toUpperCase(),
            customerName: session.customer_details?.name || 'Valued Client',
            serviceName: session.metadata?.serviceName || 'Astrology Session',
            duration: session.metadata?.duration || '60',
            amount: (session.amount_total / 100).toFixed(2),
            sessionDateTime: 'We will contact you to schedule your session'
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
      
      // Notify admin
      try {
        await sendEmail({
          to: 'lago.mistico11@gmail.com',
          subject: `💰 Payment Received - ${session.metadata?.serviceName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #10b981;">Payment Received! 💰</h2>
              <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Service:</strong> ${session.metadata?.serviceName}</p>
                <p><strong>Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                <p><strong>Customer:</strong> ${session.customer_email}</p>
                <p><strong>Booking ID:</strong> ${session.id.substring(8, 16).toUpperCase()}</p>
                <p><strong>Payment ID:</strong> ${session.payment_intent}</p>
              </div>
              <p>Please schedule the session with your client! ✨</p>
            </div>
          `
        });
      } catch (adminEmailError) {
        console.error('Failed to send admin notification:', adminEmailError);
      }
    }
    
    return new NextResponse('ok', { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
}