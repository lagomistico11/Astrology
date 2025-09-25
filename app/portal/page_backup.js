'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

export default function ClientPortal() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    // Redirect admin to admin portal
    if (session.user?.email === 'lago.mistico11@gmail.com') {
      router.push('/admin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sun className="w-8 h-8 text-purple-900" />
          </div>
          <p className="text-white text-lg">Loading your celestial portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-sm border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Sun className="w-5 h-5 text-purple-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Your Celestial Portal</h1>
              <p className="text-purple-200/70 text-sm">Welcome, {session.user?.name}</p>
            </div>
          </div>
          
          <Button
            onClick={() => signOut()}
            variant="outline"
            size="sm"
            className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
          >
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Welcome to Your Portal</CardTitle>
            <CardDescription className="text-purple-200/80">
              Your cosmic dashboard is being prepared...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Sun className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">Portal Loading Successfully!</p>
              <p className="text-purple-200/70">The credentials sign-in issue has been fixed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}