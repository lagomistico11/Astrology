// scripts/seed-services.js
require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const services = [
  { 
    key: 'general-reading', 
    name: 'General or Purpose Reading', 
    price: 65, 
    durationMins: 45, 
    description: 'A focused tarot session to explore your current path and purpose. Perfect for gaining clarity on life decisions.', 
    active: true 
  },
  { 
    key: 'personal-tarot', 
    name: 'Personal Tarot Reading', 
    price: 85, 
    durationMins: 60, 
    description: 'Deep insights into your personal journey, relationships, and life path through traditional tarot cards.', 
    active: true 
  },
  { 
    key: 'birth-chart', 
    name: 'Birth Chart Analysis', 
    price: 120, 
    durationMins: 90, 
    description: 'Complete astrological birth chart interpretation revealing your cosmic blueprint and life purpose.', 
    active: true 
  },
  { 
    key: 'chart-tarot-combo', 
    name: 'Birth Chart + Tarot Combo', 
    price: 165, 
    durationMins: 120, 
    description: 'The ultimate mystical experience combining birth chart analysis with personalized tarot guidance.', 
    active: true 
  },
  { 
    key: 'follow-up', 
    name: 'Follow Up Session', 
    price: 45, 
    durationMins: 30, 
    description: 'Continue your journey with focused guidance and updates on your previous readings.', 
    active: true 
  },
];

(async () => {
  try {
    console.log('🌟 Starting Celestia services seeding...');
    
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    
    console.log('📋 Connected to database, processing services...');
    
    for (const s of services) {
      const existing = await db.collection('services').findOne({ key: s.key });
      
      if (!existing) {
        // Create Stripe product
        console.log(`🏗️  Creating Stripe product for ${s.name}...`);
        const product = await stripe.products.create({ 
          name: s.name, 
          description: s.description,
          metadata: { key: s.key } 
        });
        
        // Create Stripe price
        const price = await stripe.prices.create({ 
          unit_amount: Math.round(s.price * 100), 
          currency: 'usd', 
          product: product.id 
        });
        
        // Insert service with Stripe IDs
        await db.collection('services').insertOne({ 
          ...s, 
          stripeProductId: product.id, 
          stripePriceId: price.id, 
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ Seeded ${s.key} - $${s.price} for ${s.durationMins} mins`);
      } else {
        console.log(`⏭️  Already exists: ${s.key}`);
      }
    }
    
    // Create indexes
    await db.collection('services').createIndex({ key: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ userId: 1 });
    await db.collection('sessions').createIndex({ status: 1 });
    await db.collection('payments').createIndex({ checkoutSessionId: 1 });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    console.log('📊 Created database indexes');
    
    await client.close();
    console.log('🎉 Celestia services seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
})();