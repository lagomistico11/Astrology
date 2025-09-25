'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calendar, Mail, Phone, User, LogOut, CreditCard, Sparkles, Sun, Moon, Globe } from 'lucide-react';

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
    <Card className={`relative bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30 backdrop-blur-sm hover:from-purple-800/50 hover:to-indigo-800/50 transition-all duration-300 ${service.popular ? 'ring-2 ring-yellow-400/60' : ''}`}>
      {service.popular && (
        <Badge className="absolute -top-3 left-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-bold px-3 py-1">
          ✨ Most Popular
        </Badge>
      )}
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          {service.name}
        </CardTitle>
        <CardDescription className="text-purple-200/80 leading-relaxed">
          {service.description}
        </CardDescription>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-500/30">
          <span className="text-3xl font-bold text-yellow-400">${service.price}</span>
          <div className="flex items-center text-purple-200">
            <Clock className="w-4 h-4 mr-1" />
            <span>{service.duration} min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-center text-purple-200/90 text-sm">
              <Star className="w-4 h-4 mr-3 text-yellow-400 fill-yellow-400" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          onClick={() => onBook(service)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Book Session
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function LoginPortal({ onSignIn }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-32 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-40 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-60 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-16 w-1 h-1 bg-purple-300 rounded-full animate-ping"></div>
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6">
        <Button variant="outline" className="border-yellow-500/50 text-white hover:bg-yellow-500/10 text-sm">
          <Globe className="w-4 h-4 mr-2" />
          🇺🇸 English
        </Button>
      </div>

      {/* Celestial Logo Stars */}
      <div className="absolute top-10 left-10">
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </div>
      <div className="absolute bottom-10 right-10">
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </div>

      {/* Main Portal Card */}
      <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-yellow-500/40 backdrop-blur-lg shadow-2xl">
        <CardHeader className="text-center pb-8">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sun className="w-8 h-8 text-purple-900" />
          </div>
          
          <CardTitle className="text-4xl font-bold text-white mb-2">
            Celestia
          </CardTitle>
          <CardDescription className="text-purple-200/80 text-lg">
            Unlock the mysteries of the stars
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Portal Access Header */}
          <div className="text-center py-6 px-6 border border-yellow-500/30 rounded-lg bg-gradient-to-r from-purple-800/30 to-indigo-800/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-semibold text-white uppercase tracking-wider">
                Enter Your Celestial Realm
              </h3>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-purple-200/70 text-sm">
              Access your astrology and tarot portal
            </p>
          </div>

          {/* Google Sign In Button */}
          <Button 
            onClick={onSignIn}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900 font-bold py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <User className="w-5 h-5 mr-3" />
            ENTER CELESTIA
          </Button>

          {/* Divider */}
          <div className="text-center">
            <p className="text-purple-200/60 text-sm">
              Step into a world where the cosmos guides your path
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Toggle */}
      <div className="absolute bottom-6 left-6">
        <Button variant="outline" size="icon" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
          <Sun className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
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

  // Show login portal if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sun className="w-8 h-8 text-purple-900" />
          </div>
          <p className="text-white text-lg">Connecting to the cosmos...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPortal onSignIn={() => signIn('google')} />;
  }

  // Main Dashboard for authenticated users
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-sm border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Sun className="w-5 h-5 text-purple-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Celestia</h1>
              <p className="text-purple-200/70 text-sm">Mystic Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User className="w-4 h-4" />
              <span className="text-sm">Welcome, {session.user?.name || session.user?.email}</span>
            </div>
            <Button
              onClick={() => signOut()}
              variant="outline"
              size="sm"
              className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit Celestia
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative py-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-indigo-900/20"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white">
              Your Cosmic Journey Awaits
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-xl text-purple-200/80 mb-8 leading-relaxed">
            Welcome to Celestia, {session.user?.name?.split(' ')[0] || 'Seeker'}. 
            Choose your path through the mysteries of the universe.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Moon className="w-8 h-8 text-yellow-400" />
              Sacred Services
              <Sun className="w-8 h-8 text-yellow-400" />
            </h2>
            <p className="text-lg text-purple-200/80 max-w-2xl mx-auto">
              Choose your celestial consultation to unlock the wisdom of the stars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <section className="py-16 px-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-3">
            <Sparkles className="w-7 h-7 text-yellow-400" />
            The Celestial Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-800/30 to-indigo-800/30 border border-yellow-500/20">
              <Calendar className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-3">Seamless Booking</h3>
              <p className="text-purple-200/70 text-sm">
                Automated Google Calendar integration with Meet links for your sessions
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-800/30 to-indigo-800/30 border border-yellow-500/20">
              <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4 fill-yellow-400" />
              <h3 className="text-lg font-semibold text-white mb-3">Expert Guidance</h3>
              <p className="text-purple-200/70 text-sm">
                Personalized readings tailored to your unique cosmic blueprint
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-800/30 to-indigo-800/30 border border-yellow-500/20">
              <Mail className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-3">Complete Records</h3>
              <p className="text-purple-200/70 text-sm">
                Detailed summaries and insights delivered to your inbox
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-yellow-500/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Sun className="w-4 h-4 text-purple-900" />
            </div>
            <span className="text-2xl font-bold text-white">Celestia</span>
          </div>
          <p className="text-purple-200/70 mb-4">
            Illuminating souls through cosmic wisdom and ancient divination.
          </p>
          <p className="text-purple-400/60 text-sm">
            Contact: Lago.mistico11@gmail.com
          </p>
          <p className="text-purple-500/50 text-xs mt-2">
            © 2024 Celestia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}