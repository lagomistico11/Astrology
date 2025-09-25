'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calendar, Mail, Phone, User, LogOut, CreditCard } from 'lucide-react';

const services = [
  {
    id: 'personal_tarot',
    name: 'Personal Tarot Reading',
    price: 85,
    duration: 60,
    description: 'Deep insights into your personal journey, relationships, and life path through traditional tarot cards.',
    features: ['60-minute session', 'Personalized insights', 'Written summary', 'Recording available']
  },
  {
    id: 'birth_chart',
    name: 'Birth Chart Analysis',
    price: 120,
    duration: 90,
    description: 'Complete astrological birth chart interpretation revealing your cosmic blueprint and life purpose.',
    features: ['90-minute session', 'Detailed chart analysis', 'PDF report included', 'Planetary positions']
  },
  {
    id: 'combo_reading',
    name: 'Birth Chart + Tarot Combo',
    price: 165,
    duration: 120,
    description: 'The ultimate mystical experience combining birth chart analysis with personalized tarot guidance.',
    features: ['120-minute session', 'Complete analysis', 'Combined insights', 'Premium package'],
    popular: true
  },
  {
    id: 'follow_up',
    name: 'Follow Up Session',
    price: 45,
    duration: 30,
    description: 'Continue your journey with focused guidance and updates on your previous readings.',
    features: ['30-minute session', 'Progress review', 'New insights', 'Affordable pricing']
  }
];

function ServiceCard({ service, onBook, loading }) {
  return (
    <Card className={`relative bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-400/30 backdrop-blur-sm hover:from-purple-700/30 hover:to-blue-700/30 transition-all duration-300 ${service.popular ? 'ring-2 ring-yellow-400/50' : ''}`}>
      {service.popular && (
        <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-purple-900 font-bold">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">{service.name}</CardTitle>
        <CardDescription className="text-purple-200">{service.description}</CardDescription>
        <div className="flex items-center justify-between mt-4">
          <span className="text-3xl font-bold text-yellow-400">${service.price}</span>
          <div className="flex items-center text-purple-200">
            <Clock className="w-4 h-4 mr-1" />
            <span>{service.duration} min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-center text-purple-200">
              <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onBook(service)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          {loading ? 'Processing...' : 'Book Session'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function AuthButton() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  if (loading) {
    return <Button disabled className="bg-purple-600">Loading...</Button>;
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-white">
          <User className="w-5 h-5" />
          <span>Welcome, {session.user?.name || session.user?.email}</span>
        </div>
        <Button
          onClick={() => signOut()}
          variant="outline"
          className="border-purple-400 text-white hover:bg-purple-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn('google')}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-2"
    >
      Sign in with Google
    </Button>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [bookingService, setBookingService] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBooking = async (service) => {
    if (!session) {
      signIn('google');
      return;
    }

    setLoading(true);
    setBookingService(service);

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          userId: session.user.email,
          serviceName: service.name,
          price: service.price,
          duration: service.duration
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('There was an error processing your booking. Please try again.');
    } finally {
      setLoading(false);
      setBookingService(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1592484939110-1f2ea1820782")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50"></div>
        
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold text-white">
              ✨ Mystic Astrology
            </div>
            <AuthButton />
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Cosmic Destiny
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 mb-8 leading-relaxed">
            Unlock the mysteries of the universe through personalized astrology readings, 
            tarot guidance, and birth chart analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
            >
              Explore Services
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-900 font-bold py-4 px-8 text-lg rounded-full transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-pulse opacity-70"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-50"></div>
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-80"></div>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Sacred Services
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Choose your path to cosmic understanding with our carefully crafted spiritual services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={handleBooking}
                loading={loading && bookingService?.id === service.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Your Journey to Cosmic Wisdom
          </h2>
          <p className="text-lg text-purple-200 mb-12 leading-relaxed">
            With years of experience in astrology, tarot, and spiritual guidance, 
            I help souls like you discover their true purpose and navigate life's mysteries 
            with clarity and confidence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Easy Booking</h3>
              <p className="text-purple-200">Schedule your session with Google Calendar integration</p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Expert Guidance</h3>
              <p className="text-purple-200">Personalized readings tailored to your unique energy</p>
            </div>
            <div className="text-center">
              <Mail className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Follow-up Support</h3>
              <p className="text-purple-200">Receive detailed summaries and ongoing guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Connect with the Universe
          </h2>
          <p className="text-lg text-purple-200 mb-8">
            Ready to begin your mystical journey? Book a session or reach out with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex items-center justify-center text-purple-200">
              <Mail className="w-5 h-5 mr-2" />
              <span>Lago.mistico11@gmail.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-purple-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-bold text-white mb-4">
            ✨ Mystic Astrology
          </div>
          <p className="text-purple-200 mb-4">
            Illuminating souls through cosmic wisdom and ancient divination.
          </p>
          <p className="text-purple-400 text-sm">
            © 2024 Mystic Astrology. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}