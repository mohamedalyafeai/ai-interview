import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { User, Mail, Calendar, Award } from 'lucide-react';
import { authService } from '../services/api';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthday: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        setUser(response.data);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <NavBar user={user} onLogout={handleLogout} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid gap-6">
          {/* Profile Info Card */}
          <Card className="border-2 border-purple-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
              <CardTitle className="text-2xl">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center space-x-6 mb-6">
                <img
                  src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=7c3aed&color=fff&size=120`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-purple-200"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    value={user.name}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    value={user.email}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Member Since</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    value={new Date(user.created_at).toLocaleDateString()}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-2 border-purple-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
              <CardTitle className="text-2xl flex items-center">
                <Award className="w-6 h-6 mr-2" />
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{user.interview_count || 0}</div>
                  <div className="text-gray-600">Total Interviews</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg">
                  <div className="text-4xl font-bold text-violet-600 mb-2">{Math.round((user.total_practice_time || 0) / 60)}h</div>
                  <div className="text-gray-600">Practice Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;