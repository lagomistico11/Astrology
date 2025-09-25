'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Mail, Home, Star } from 'lucide-react';

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

    // Simulate checking payment status
    const checkPaymentStatus = async () => {
      try {
        // In a real implementation, you'd check the payment status via API
        setStatus('success');
        setSessionInfo({
          bookingId: sessionId.substring(8, 16),
          serviceName: 'Astrology Reading',
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Confirming your cosmic booking...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="w-full max-w-md bg-gradient-to-br from-red-800/20 to-red-900/20 border-red-400/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-3xl">✗</span>
            </div>
            <CardTitle className="text-white text-2xl">Payment Error</CardTitle>
            <CardDescription className="text-red-200">
              There was an issue processing your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-200">
              Please try booking again or contact support if the issue persists.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            🌟 Booking Confirmed! 🌟
          </h1>
          <p className="text-xl text-purple-200">
            Your journey into the cosmos awaits
          </p>
        </div>

        {/* Booking Details */}
        <Card className="bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-400/30 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-purple-200 text-sm uppercase tracking-wide">Booking ID</span>
                <p className="text-white font-mono font-bold">
                  {sessionInfo?.bookingId}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-purple-200 text-sm uppercase tracking-wide">Service</span>
                <p className="text-white font-semibold">
                  {sessionInfo?.serviceName}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-purple-200 text-sm uppercase tracking-wide">Duration</span>
                <p className="text-white">
                  {sessionInfo?.duration}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-purple-200 text-sm uppercase tracking-wide">Amount Paid</span>
                <p className="text-white font-bold text-xl">
                  ${sessionInfo?.amount}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-purple-400/30">
              <Badge className="bg-green-100 text-green-800">
                Payment Successful
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-yellow-800/20 to-orange-800/20 border-yellow-400/30 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              ✨ What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-white font-semibold">Check Your Email</p>
                <p className="text-yellow-200 text-sm">
                  A confirmation email with all details has been sent to your inbox
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-white font-semibold">Schedule Your Session</p>
                <p className="text-yellow-200 text-sm">
                  You'll receive a calendar link to book your preferred time slot
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <p className="text-white font-semibold">Prepare Questions</p>
                <p className="text-yellow-200 text-sm">
                  Think about what aspects of your life you'd like cosmic guidance on
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <p className="text-purple-200 text-lg">
            Thank you for trusting us with your spiritual journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
            <Button 
              variant="outline"
              className="border-purple-400 text-white hover:bg-purple-700"
              onClick={() => window.open('mailto:Lago.mistico11@gmail.com', '_blank')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

        {/* Mystical Quote */}
        <div className="mt-16 text-center">
          <blockquote className="text-lg text-purple-200 italic">
            "The universe is not only stranger than we imagine, 
            it is stranger than we can imagine."
          </blockquote>
          <p className="text-purple-400 mt-2">- J.B.S. Haldane</p>
        </div>
      </div>
    </div>
  );
}