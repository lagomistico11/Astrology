'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calendar, Mail, Phone, User, LogOut, CreditCard, Sparkles, Sun, Moon, Globe, X } from 'lucide-react';

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
            <span>{service.durationMins} min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {service.features && service.features.map((feature, index) => (
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

function LoginModal({ isOpen, onClose, onSignIn }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-32 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-40 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-60 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
      </div>

      {/* Main Portal Card */}
      <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border border-yellow-500/40 backdrop-blur-lg shadow-2xl relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>

        <CardHeader className="text-center pb-8">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sun className="w-8 h-8 text-purple-900" />
          </div>
          
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Enter Celestia
          </CardTitle>
          <CardDescription className="text-purple-200/80">
            Sign in to book your cosmic journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Sign In */}
          <Button 
            onClick={onSignIn}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 text-base rounded-lg transition-all duration-300 border border-gray-300"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Email Option */}
          <div className="text-center">
            <p className="text-purple-200/60 text-sm mb-4">
              Don't have a Google account? Contact us directly:
            </p>
            <Button 
              variant="outline"
              className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
              onClick={() => window.open('mailto:Lago.mistico11@gmail.com?subject=Booking Request', '_blank')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email to Book
            </Button>
          </div>

          <div className="text-center">
            <p className="text-purple-200/60 text-sm">
              We'll help you schedule your celestial session
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [bookingService, setBookingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Services state - now properly inside the component
  const [services, setServices] = useState([
    {
      id: 'personal-tarot',
      key: 'personal-tarot',
      name: 'Personal Tarot Reading',
      price: 85,
      durationMins: 60,
      description: 'Deep insights into your personal journey, relationships, and life path through traditional tarot cards.',
      features: ['60-minute session', 'Personalized insights', 'Written summary', 'Recording available']
    },
    {
      id: 'birth-chart',
      key: 'birth-chart',
      name: 'Birth Chart Analysis',
      price: 120,
      durationMins: 90,
      description: 'Complete astrological birth chart interpretation revealing your cosmic blueprint and life purpose.',
      features: ['90-minute session', 'Detailed chart analysis', 'PDF report included', 'Planetary positions']
    },
    {
      id: 'chart-tarot-combo',
      key: 'chart-tarot-combo',
      name: 'Birth Chart + Tarot Combo',
      price: 165,
      durationMins: 120,
      description: 'The ultimate mystical experience combining birth chart analysis with personalized tarot guidance.',
      features: ['120-minute session', 'Complete analysis', 'Combined insights', 'Premium package'],
      popular: true
    },
    {
      id: 'follow-up',
      key: 'follow-up',
      name: 'Follow Up Session',
      price: 45,
      durationMins: 30,
      description: 'Continue your journey with focused guidance and updates on your previous readings.',
      features: ['30-minute session', 'Progress review', 'New insights', 'Affordable pricing']
    }
  ]);
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

function LoginModal({ isOpen, onClose, onSignIn }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-32 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-40 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-60 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
      </div>

      {/* Main Portal Card */}
      <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border border-yellow-500/40 backdrop-blur-lg shadow-2xl relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>

        <CardHeader className="text-center pb-8">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sun className="w-8 h-8 text-purple-900" />
          </div>
          
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Enter Celestia
          </CardTitle>
          <CardDescription className="text-purple-200/80">
            Sign in to book your cosmic journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Sign In */}
          <Button 
            onClick={onSignIn}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 text-base rounded-lg transition-all duration-300 border border-gray-300"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Email Option */}
          <div className="text-center">
            <p className="text-purple-200/60 text-sm mb-4">
              Don't have a Google account? Contact us directly:
            </p>
            <Button 
              variant="outline"
              className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
              onClick={() => window.open('mailto:Lago.mistico11@gmail.com?subject=Booking Request', '_blank')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email to Book
            </Button>
          </div>

          <div className="text-center">
            <p className="text-purple-200/60 text-sm">
              We'll help you schedule your celestial session
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [bookingService, setBookingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleBooking = async (service) => {
    // If not logged in, show login modal
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setBookingService(service);

    try {
      // Use the new payment API
      const response = await fetch('/api/payments/v1/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceKey: service.key,
          userEmail: session.user.email,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.origin
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

  const handleSignIn = async () => {
    setShowLoginModal(false);
    await signIn('google');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-sm border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Sun className="w-5 h-5 text-purple-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Celestia</h1>
              <p className="text-purple-200/70 text-sm">Mystic Astrology</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Welcome, {session.user?.name || session.user?.email}</span>
                </div>
                <Button
                  onClick={() => {
                    if (session.user?.role === 'admin' || session.user?.email === 'lago.mistico11@gmail.com') {
                      window.location.href = '/admin';
                    } else {
                      window.location.href = '/portal';
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = '/auth/signin'}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900 font-semibold"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Always Visible */}
      <div className="relative py-20 px-6 text-center">
        {/* Background Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white">
              Unlock the Mysteries of the Stars
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-xl text-purple-200/80 mb-8 leading-relaxed">
            Discover your cosmic destiny through personalized astrology readings, 
            tarot guidance, and birth chart analysis. Welcome to your spiritual journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900 font-bold py-4 px-8 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
            >
              Explore Services
            </Button>
            <Button 
              variant="outline"
              className="border-yellow-500/50 text-white hover:bg-yellow-500/10 font-bold py-4 px-8 text-lg rounded-full transition-all duration-300"
              onClick={() => window.open('mailto:Lago.mistico11@gmail.com', '_blank')}
            >
              Contact Oracle
            </Button>
          </div>
        </div>
      </div>

      {/* Services Section - Always Visible */}
      <section id="services" className="py-16 px-6">
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
              <h3 className="text-lg font-semibold text-white mb-3">Easy Booking</h3>
              <p className="text-purple-200/70 text-sm">
                Seamless appointment scheduling with Google Calendar integration
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

      {/* Contact Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Connect with the Universe
          </h2>
          <p className="text-lg text-purple-200/80 mb-8">
            Ready to begin your mystical journey? Multiple ways to get started.
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

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSignIn={handleSignIn}
      />
    </div>
  );
}