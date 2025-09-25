'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Star, Calendar, User, Sun, Moon, Sparkles, Edit, Save, BookOpen, Clock, CreditCard } from 'lucide-react';

export default function ClientPortal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [birthChart, setBirthChart] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [adminNotes, setAdminNotes] = useState([]);

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

    fetchUserData();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      const [userRes, chartRes, sessionsRes, notesRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/birth-chart'),
        fetch('/api/user/sessions'),
        fetch('/api/user/notes')
      ]);

      if (userRes.ok) setUserData(await userRes.json());
      if (chartRes.ok) setBirthChart(await chartRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setPersonalNotes(notesData.personal || '');
        setAdminNotes(notesData.admin || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      const response = await fetch('/api/user/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalNotes })
      });
      
      if (response.ok) {
        setIsEditingNotes(false);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const generateBirthChart = async () => {
    try {
      const response = await fetch('/api/user/generate-birth-chart', {
        method: 'POST'
      });
      
      if (response.ok) {
        const chart = await response.json();
        setBirthChart(chart);
      }
    } catch (error) {
      console.error('Error generating birth chart:', error);
    }
  };

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
              <p className="text-purple-200/70 text-sm">Welcome, {userData?.name || session.user?.name}</p>
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
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-purple-900/50 border border-yellow-500/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-yellow-500/20">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="birth-chart" className="data-[state=active]:bg-yellow-500/20">
              Birth Chart
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-yellow-500/20">
              Sessions
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-yellow-500/20">
              My Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">
                    {Array.isArray(sessions) ? sessions.filter(s => s.status === 'upcoming').length : 0}
                  </div>
                  <p className="text-purple-200/70 text-sm">Next session scheduled</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                    Past Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">
                    {sessions.filter(s => s.status === 'completed').length}
                  </div>
                  <p className="text-purple-200/70 text-sm">Readings completed</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Birth Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-yellow-400">
                    {birthChart ? 'Generated' : 'Not Created'}
                  </div>
                  <p className="text-purple-200/70 text-sm">
                    {birthChart ? 'View your cosmic blueprint' : 'Create your natal chart'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => window.open('/', '_blank')}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Book New Session
                  </Button>
                  
                  {!birthChart && (
                    <Button 
                      onClick={generateBirthChart}
                      variant="outline"
                      className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Create Birth Chart
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => window.open('mailto:lago.mistico11@gmail.com', '_blank')}
                    variant="outline"
                    className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
                  >
                    Contact Mistica
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="birth-chart" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Moon className="w-6 h-6 text-yellow-400" />
                  Your Natal Chart
                </CardTitle>
                <CardDescription className="text-purple-200/80">
                  Your cosmic blueprint at the moment of birth
                </CardDescription>
              </CardHeader>
              <CardContent>
                {birthChart ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-white font-semibold mb-3">Birth Information</h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-purple-200">
                            <span className="text-yellow-400">Date:</span> {birthChart.birthDate}
                          </p>
                          <p className="text-purple-200">
                            <span className="text-yellow-400">Time:</span> {birthChart.birthTime}
                          </p>
                          <p className="text-purple-200">
                            <span className="text-yellow-400">Location:</span> {birthChart.birthPlace}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white font-semibold mb-3">Key Placements</h3>
                        <div className="space-y-2 text-sm">
                          {birthChart.planets?.slice(0, 3).map((planet, index) => (
                            <p key={index} className="text-purple-200">
                              <span className="text-yellow-400">{planet.name}:</span> {planet.sign}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Chart visualization placeholder */}
                    <div className="mt-6 p-6 border border-yellow-500/30 rounded-lg bg-gradient-to-br from-purple-800/20 to-indigo-800/20">
                      <p className="text-center text-purple-200 mb-4">Birth Chart Visualization</p>
                      <div className="w-full h-64 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Sun className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                          <p className="text-yellow-400 text-sm">Chart visualization will appear here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">No Birth Chart Yet</p>
                    <p className="text-purple-200/70 mb-6">Create your natal chart to unlock cosmic insights</p>
                    <Button 
                      onClick={generateBirthChart}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900"
                    >
                      Generate My Birth Chart
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl">Session History</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session, index) => (
                      <div key={index} className="p-4 border border-purple-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-semibold">{session.service}</h3>
                          <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-purple-200 text-sm">
                          {session.date} • {session.duration} minutes
                        </p>
                        {session.notes && (
                          <p className="text-purple-200/80 text-sm mt-2">{session.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">No Sessions Yet</p>
                    <p className="text-purple-200/70 mb-6">Book your first cosmic consultation</p>
                    <Button 
                      onClick={() => window.open('/', '_blank')}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900"
                    >
                      Book a Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Notes */}
              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Edit className="w-5 h-5 text-yellow-400" />
                    Personal Notes
                  </CardTitle>
                  <CardDescription className="text-purple-200/80">
                    Your private thoughts and reflections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingNotes ? (
                    <>
                      <Textarea
                        value={personalNotes}
                        onChange={(e) => setPersonalNotes(e.target.value)}
                        placeholder="Write your personal notes here..."
                        className="bg-purple-900/50 border-purple-500/50 text-white placeholder:text-purple-300 min-h-32"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={savePersonalNotes}
                          size="sm"
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => setIsEditingNotes(false)}
                          variant="outline"
                          size="sm"
                          className="border-purple-500/50 text-white hover:bg-purple-500/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-purple-900/30 p-4 rounded-lg min-h-32">
                        {personalNotes ? (
                          <p className="text-purple-200 whitespace-pre-wrap">{personalNotes}</p>
                        ) : (
                          <p className="text-purple-400 italic">No personal notes yet. Click edit to add your thoughts.</p>
                        )}
                      </div>
                      <Button 
                        onClick={() => setIsEditingNotes(true)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Notes
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Mistica's Notes */}
              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Mistica's Notes
                  </CardTitle>
                  <CardDescription className="text-purple-200/80">
                    Insights and guidance from your sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminNotes.length > 0 ? (
                    <div className="space-y-4">
                      {adminNotes.map((note, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-4 rounded-lg border border-yellow-500/20">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-yellow-400 font-semibold">{note.title}</h4>
                            <span className="text-purple-300 text-xs">{note.date}</span>
                          </div>
                          <p className="text-purple-200 text-sm whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-purple-900/30 p-8 rounded-lg text-center">
                      <BookOpen className="w-12 h-12 text-yellow-400/50 mx-auto mb-3" />
                      <p className="text-purple-400 italic">No notes from Mistica yet.</p>
                      <p className="text-purple-500 text-sm mt-1">Session insights will appear here after your readings.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}