import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authService, emailService } from '../services/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Registration, 2: Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleGoogleSignUp = async () => {
    setLoading(true);
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleManualSignUp = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // First, send verification email
      await emailService.sendVerification({
        email: formData.email,
        name: formData.name
      });
      
      toast.success('Verification code sent to your email!');
      setStep(2);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to send verification code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // Verify the code
      await emailService.verifyCode({
        email: formData.email,
        code: verificationCode
      });
      
      // Now create the account
      const response = await authService.manualSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Verification failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await emailService.sendVerification({
        email: formData.email,
        name: formData.name
      });
      toast.success('New verification code sent!');
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Email Verification
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">AI Interview Pro</div>
              <div className="text-sm text-purple-300">Professional Interview Platform</div>
            </div>
          </div>

          <Card className="border border-purple-500/20 shadow-2xl bg-slate-800/90 backdrop-blur-xl">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-3">Verify Your Email</CardTitle>
              <p className="text-purple-200">
                We've sent a 6-digit code to<br />
                <span className="font-semibold text-purple-300">{formData.email}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <Label htmlFor="code" className="text-purple-200 mb-2 block">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-3xl tracking-[0.5em] bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500 py-6"
                    maxLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg font-semibold shadow-xl"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </Button>
              </form>

              <div className="text-center space-y-4">
                <p className="text-purple-300 text-sm">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Resend Code
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="w-full text-purple-300 hover:text-purple-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Registration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 1: Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-12">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">
              AI Interview Pro
            </div>
            <div className="text-sm text-purple-300">Professional Interview Platform</div>
          </div>
        </div>

        <Card className="border border-purple-500/20 shadow-2xl bg-slate-800/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle className="text-3xl font-bold text-white mb-3">
              Create Professional Account
            </CardTitle>
            <p className="text-purple-200">
              Join thousands of professionals preparing for success
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {/* Manual Registration Form */}
            <form onSubmit={handleManualSignUp} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-purple-200 mb-2 block">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-purple-200 mb-2 block">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-purple-200 mb-2 block">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 pr-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-purple-200 mb-2 block">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg font-semibold shadow-xl"
              >
                {loading ? 'Sending Verification...' : 'Continue with Email Verification'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-500/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-purple-300">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 py-6 text-lg font-semibold shadow-xl transition-all duration-200 border-2 border-white/20"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign Up with Google (No verification needed)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-500/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-purple-300">Already have an account?</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full border-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50 py-6 text-lg font-semibold bg-transparent"
            >
              Sign In to Your Account
            </Button>

            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-center space-x-6 text-xs text-purple-300">
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                  Email Verification
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                  Secure Storage
                </span>
              </div>
              <p className="text-center text-xs text-purple-400">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-purple-300 hover:text-purple-200">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
