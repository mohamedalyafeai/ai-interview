import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Sparkles, Video, FileText, TrendingUp, Clock, LogOut, Award, Target } from 'lucide-react';
import { authService, dashboardService } from '../services/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    total_interviews: 0,
    average_score: '0/10',
    total_time: '0h',
    improvement_percentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      // If user data passed from AuthCallback, use it directly
      if (location.state?.user) {
        setUser(location.state.user);
        await fetchDashboardData();
        return;
      }

      // Otherwise, verify session
      try {
        const response = await authService.getMe();
        setUser(response.data);
        await fetchDashboardData();
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Please log in to continue');
        navigate('/login');
      }
    };

    const fetchDashboardData = async () => {
      try {
        const statsResponse = await dashboardService.getStats();
        const data = statsResponse.data;
        
        setStats({
          total_interviews: data.total_interviews || 0,
          average_score: data.average_score || '0/10',
          total_time: data.total_time || '0h',
          improvement_percentage: data.improvement_percentage || 0
        });
        
        setInterviews(data.recent_interviews || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate, location]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const statCards = [
    {
      title: 'Total Interviews',
      value: stats.total_interviews,
      icon: <Video className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Average Score',
      value: stats.average_score,
      icon: <Award className="w-6 h-6" />,
      color: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Total Practice Time',
      value: stats.total_time,
      icon: <Clock className="w-6 h-6" />,
      color: 'from-purple-600 to-violet-700'
    },
    {
      title: 'Improvement',
      value: `+${stats.improvement_percentage}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-violet-600 to-purple-700'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <NavBar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ready to practice your interview skills?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-2 border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-purple-200 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Video className="w-7 h-7 mr-3 text-purple-600" />
                Start Mock Interview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Practice with our AI interviewer. Get instant feedback on your answers and improve your performance.
              </p>
              <Button
                onClick={() => navigate('/interview')}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg shadow-lg shadow-purple-500/30"
              >
                Start Interview
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <FileText className="w-7 h-7 mr-3 text-violet-600" />
                Analyze Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Upload your resume and get AI-powered insights to make it more effective and ATS-friendly.
              </p>
              <Button
                onClick={() => navigate('/resume-analysis')}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-6 text-lg shadow-lg shadow-violet-500/30"
              >
                Analyze Resume
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Interviews */}
        <Card className="border-2 border-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Interview Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interviews.length > 0 ? (
                interviews.slice(0, 5).map((interview, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{interview.position}</div>
                        <div className="text-sm text-gray-500">{interview.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Score</div>
                        <div className="text-lg font-bold text-purple-600">{interview.score}/10</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="text-lg font-semibold text-gray-900">{interview.duration}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Video className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                  <p className="text-lg">No interviews yet. Start your first practice session!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
