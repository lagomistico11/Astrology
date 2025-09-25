// components/ConsultationCTA.jsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Star, Calendar } from 'lucide-react';

export default function ConsultationCTA({ serviceKey = 'personal-tarot', className = '' }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = async () => {
    setIsLoading(true);
    try {
      // Redirect to booking page with service
      window.location.href = `/auth/signin?service=${serviceKey}&redirect=/book`;
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          Ready for Deeper Insights?
        </CardTitle>
        <CardDescription className="text-purple-200/80">
          Automated insights are just the beginning. Book a personal session for deep, transformative guidance.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-purple-200">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span>Personalized one-on-one session</span>
        </div>
        <div className="flex items-center gap-3 text-purple-200">
          <Calendar className="w-5 h-5 text-yellow-400" />
          <span>Live interaction with Mistica</span>
        </div>
        <div className="flex items-center gap-3 text-purple-200">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>Detailed interpretation & guidance</span>
        </div>
        
        <Button 
          onClick={handleBooking}
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Star className="w-4 h-4 mr-2" />
              Book Deep Interpretation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}