'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sun, 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Star, 
  Edit,
  Save,
  Eye,
  Search,
  Filter,
  Crown,
  Sparkles,
  Moon,
  BarChart3,
  MessageSquare
} from 'lucide-react';

export default function AdminPortal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.email !== 'lago.mistico11@gmail.com') {
      router.push('/auth/signin');
      return;
    }

    fetchAdminData();
  }, [session, status, router]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, sessionsRes, revenueRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/sessions'),
        fetch('/api/admin/revenue')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (revenueRes.ok) setRevenue(await revenueRes.json());
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const generateRealtimeChart = async (userId) => {
    try {
      const response = await fetch(`/api/admin/generate-chart/${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const chart = await response.json();
        // Update the selected user with new chart data
        setSelectedUser({ ...selectedUser, realtimeChart: chart });
      }
    } catch (error) {
      console.error('Error generating realtime chart:', error);
    }
  };

  const publishNote = async (userId, noteData) => {
    try {
      const response = await fetch('/api/admin/publish-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...noteData })
      });
      
      if (response.ok) {
        alert('Note published successfully!');
        setAdminNote('');
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error publishing note:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown className="w-8 h-8 text-purple-900" />
          </div>
          <p className="text-white text-lg">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-sm border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Mistica's Admin Portal
              </h1>
              <p className="text-purple-200/70 text-sm">Celestial Management System</p>
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
            <TabsTrigger value="users" className="data-[state=active]:bg-yellow-500/20">
              Users & Charts
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-yellow-500/20">
              Session Management
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-yellow-500/20">
              Revenue Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-400" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.totalUsers || 0}
                  </div>
                  <p className="text-purple-200/70 text-xs">
                    +{stats.newUsersThisMonth || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    Monthly Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">
                    ${stats.monthlyRevenue || 0}
                  </div>
                  <p className="text-purple-200/70 text-xs">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    {stats.revenueGrowth || 0}% growth
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.activeSessions || 0}
                  </div>
                  <p className="text-purple-200/70 text-xs">
                    {stats.upcomingSessions || 0} upcoming
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    Birth Charts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.totalCharts || 0}
                  </div>
                  <p className="text-purple-200/70 text-xs">
                    Charts generated
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    Today's Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.filter(s => s.date === new Date().toDateString()).length > 0 ? (
                    <div className="space-y-3">
                      {sessions.filter(s => s.date === new Date().toDateString()).map((session, index) => (
                        <div key={index} className="p-3 bg-purple-800/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-medium">{session.clientName}</h4>
                              <p className="text-purple-200 text-sm">{session.service}</p>
                            </div>
                            <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                              {session.time}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-purple-300 text-center py-8">No sessions scheduled for today</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-yellow-400/50 mx-auto mb-2" />
                      <p className="text-purple-300">Revenue chart will display here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white text-lg">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-purple-900/50 border-purple-500/50 text-white placeholder:text-purple-300"
                    />
                  </div>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user, index) => (
                    <Card key={index} className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 border border-purple-500/30">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white text-sm">{user.name}</CardTitle>
                            <p className="text-purple-200 text-xs">{user.email}</p>
                          </div>
                          <Badge variant={user.hasChart ? 'default' : 'secondary'} className="text-xs">
                            {user.hasChart ? 'Chart ✓' : 'No Chart'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-purple-300">Sessions:</span>
                            <span className="text-white">{user.sessionsCount || 0}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-purple-300">Last Active:</span>
                            <span className="text-white">{user.lastActive || 'Never'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="flex-1 bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 hover:from-yellow-400 hover:to-yellow-500 text-purple-900"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {user.hasChart && (
                            <Button
                              size="sm"
                              onClick={() => generateRealtimeChart(user.id)}
                              variant="outline"
                              className="border-yellow-500/50 text-white hover:bg-yellow-500/10"
                            >
                              <Moon className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Detail Modal */}
            {selectedUser && (
              <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-yellow-400" />
                    {selectedUser.name} - Detailed View
                  </CardTitle>
                  <Button
                    onClick={() => setSelectedUser(null)}
                    size="sm"
                    variant="ghost"
                    className="absolute top-4 right-4 text-white"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Info */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">User Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-300">Email:</span>
                          <span className="text-white">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Joined:</span>
                          <span className="text-white">{selectedUser.joinDate || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Total Sessions:</span>
                          <span className="text-white">{selectedUser.sessionsCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Revenue:</span>
                          <span className="text-yellow-400">${selectedUser.totalRevenue || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Birth Chart Info */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Birth Chart</h3>
                      {selectedUser.birthChart ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-300">Birth Date:</span>
                            <span className="text-white">{selectedUser.birthChart.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-300">Birth Time:</span>
                            <span className="text-white">{selectedUser.birthChart.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-300">Location:</span>
                            <span className="text-white">{selectedUser.birthChart.place}</span>
                          </div>
                          <Button
                            onClick={() => generateRealtimeChart(selectedUser.id)}
                            size="sm"
                            className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900"
                          >
                            Generate Real-time Chart
                          </Button>
                        </div>
                      ) : (
                        <p className="text-purple-400 text-sm">No birth chart available</p>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes Section */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Session Notes</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-purple-200 text-sm">Add Note for Client</Label>
                        <Textarea
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Write a note to publish to the client's portal..."
                          className="mt-2 bg-purple-900/50 border-purple-500/50 text-white placeholder:text-purple-300"
                        />
                        <Button
                          onClick={() => publishNote(selectedUser.id, { content: adminNote, title: 'Session Insights' })}
                          size="sm"
                          className="mt-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900"
                          disabled={!adminNote.trim()}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Publish to Client Portal
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white text-lg">Session Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    sessions.map((session, index) => (
                      <div key={index} className="p-4 border border-purple-500/30 rounded-lg bg-gradient-to-r from-purple-800/20 to-indigo-800/20">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-semibold">{session.clientName}</h4>
                            <p className="text-purple-200 text-sm">{session.email}</p>
                          </div>
                          <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-purple-300">Service:</span>
                            <p className="text-white">{session.service}</p>
                          </div>
                          <div>
                            <span className="text-purple-300">Date:</span>
                            <p className="text-white">{session.date}</p>
                          </div>
                          <div>
                            <span className="text-purple-300">Time:</span>
                            <p className="text-white">{session.time}</p>
                          </div>
                          <div>
                            <span className="text-purple-300">Amount:</span>
                            <p className="text-yellow-400">${session.amount}</p>
                          </div>
                        </div>
                        {session.meetLink && (
                          <div className="mt-3">
                            <Button
                              onClick={() => window.open(session.meetLink, '_blank')}
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white"
                            >
                              Join Google Meet
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                      <p className="text-white text-lg mb-2">No Sessions Found</p>
                      <p className="text-purple-200/70">Session data will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white text-lg">Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          ${stats.totalRevenue || 0}
                        </div>
                        <p className="text-green-200 text-sm">Total Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                          ${stats.monthlyRevenue || 0}
                        </div>
                        <p className="text-blue-200 text-sm">This Month</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                          ${stats.averageSession || 0}
                        </div>
                        <p className="text-yellow-200 text-sm">Avg per Session</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">Revenue Charts</p>
                    <p className="text-purple-200/70">Detailed analytics will display here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}