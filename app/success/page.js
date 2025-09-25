'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Mail, Home, Star, Sun, Sparkles } from 'lucide-react';

export default function SuccessPage() {
  const [status, setStatus] = useState('loading');
  const [sessionInfo, setSessionInfo] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        setStatus('success');
        setSessionInfo({
          bookingId: sessionId.substring(8, 16),
          serviceName: 'Celestial Reading',
          amount: '85.00',
          duration: '60 minutes',
        });
      } catch (error) {
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [sessionId, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse cosmic-pulse">
            <Sun className="w-10 h-10 text-purple-900 animate-spin" />
          </div>
          <p className="text-white text-lg">Aligning with the cosmos...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="w-full max-w-md glass-card border-red-400/40">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-3xl">✗</span>
            </div>
            <CardTitle className="text-white text-2xl">Cosmic Disruption</CardTitle>
            <CardDescription className="text-red-200/80">
              The celestial energies were interrupted
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-200/70">
              Please try booking again or contact our cosmic support.
            </p>
            <Button 
              onClick={() => router.push('/')} 
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Celestia
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6 relative">
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
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

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl cosmic-pulse">
            <CheckCircle className="w-14 h-14 text-purple-900" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white text-shadow-golden">
              Cosmic Alignment Complete!
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-xl text-purple-200/80">
            Your journey through the celestial realm has begun
          </p>
        </div>

        {/* Booking Details */}
        <Card className="glass-card border-yellow-500/40 mb-8">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sun className="w-6 h-6 text-yellow-400" />
              <CardTitle className="text-white text-2xl">
                Session Confirmed
              </CardTitle>
              <Sun className="w-6 h-6 text-yellow-400" />
            </div>
            <CardDescription className="text-purple-200/70">
              The stars have aligned for your reading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-purple-200/60 text-sm uppercase tracking-wide">Cosmic ID</span>
                <p className="text-white font-mono font-bold text-lg">
                  ✨ {sessionInfo?.bookingId}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-purple-200/60 text-sm uppercase tracking-wide">Service</span>
                <p className="text-white font-semibold">
                  🔮 {sessionInfo?.serviceName}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-purple-200/60 text-sm uppercase tracking-wide">Duration</span>
                <p className="text-white">
                  ⏰ {sessionInfo?.duration}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-purple-200/60 text-sm uppercase tracking-wide">Investment</span>
                <p className="text-yellow-400 font-bold text-2xl">
                  ${sessionInfo?.amount}
                </p>
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-yellow-500/30 text-center">
              <Badge className="bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-200 border border-green-400/30 px-4 py-2">
                ✅ Payment Successful
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="glass-card border-yellow-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              Your Celestial Path Forward
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-purple-800/20 to-indigo-800/20 border border-purple-500/20">
              <Mail className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold mb-1">Check Your Sacred Inbox</p>
                <p className="text-purple-200/70 text-sm">
                  A cosmic confirmation with all celestial details has been sent to your email
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-purple-800/20 to-indigo-800/20 border border-purple-500/20">
              <Calendar className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold mb-1">Schedule Your Session</p>
                <p className="text-purple-200/70 text-sm">
                  You'll receive a Google Calendar invitation with a celestial Meet link
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-purple-800/20 to-indigo-800/20 border border-purple-500/20">
              <Star className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0 fill-yellow-400" />
              <div>
                <p className="text-white font-semibold mb-1">Prepare Your Questions</p>
                <p className="text-purple-200/70 text-sm">
                  Contemplate the cosmic mysteries you wish to explore during our session
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center space-y-6">
          <p className="text-purple-200/80 text-lg">
            Thank you for trusting Celestia with your spiritual journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900 font-bold px-8 py-3"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Celestia
            </Button>
            <Button 
              variant="outline"
              className="border-yellow-500/50 text-white hover:bg-yellow-500/10 px-8 py-3"
              onClick={() => window.open('mailto:Lago.mistico11@gmail.com', '_blank')}
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Oracle
            </Button>
          </div>
        </div>

        {/* Mystical Quote */}
        <div className="mt-16 text-center">
          <Card className="glass-card border-yellow-500/20">
            <CardContent className="pt-6">
              <blockquote className="text-lg text-purple-200/90 italic mb-4">
                "The cosmos is within us. We are made of star-stuff. 
                We are a way for the universe to know itself."
              </blockquote>
              <p className="text-yellow-400/80 font-medium">- Carl Sagan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}