import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('No session ID found');
          navigate('/login');
          return;
        }

        // Exchange session_id for user data
        const response = await authService.callback(sessionId);
        const userData = response.data;

        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));

        // Navigate to dashboard with user data
        toast.success('Login successful!');
        navigate('/dashboard', { state: { user: userData }, replace: true });
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    processAuth();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
