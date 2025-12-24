import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, Crown, Zap, Rocket } from 'lucide-react';
import { authService } from '../services/api';
import { toast } from 'sonner';

const Subscription = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');

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

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: <Zap className="w-8 h-8" />,
      description: 'Perfect for trying out',
      features: [
        '2 mock interviews per month',
        '1 resume analysis per month',
        'Standard AI feedback',
        'Basic analytics'
      ],
      color: 'from-gray-500 to-gray-600',
      current: currentPlan === 'free'
    },
    {
      name: 'Graduate',
      price: '$29',
      period: 'per month',
      icon: <Crown className="w-8 h-8" />,
      description: 'Ideal for recent graduates',
      features: [
        '10 mock interviews per month',
        '5 resume analysis per month',
        'Advanced AI feedback',
        'Detailed analytics',
        'Voice interview mode',
        'Priority support'
      ],
      color: 'from-purple-500 to-violet-600',
      current: currentPlan === 'graduate',
      popular: true
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      icon: <Rocket className="w-8 h-8" />,
      description: 'For experienced professionals',
      features: [
        'Unlimited mock interviews',
        'Unlimited resume analysis',
        'Expert AI feedback',
        'Advanced analytics',
        'Voice interview mode',
        '24/7 Priority support',
        'Custom interview scenarios',
        'Team collaboration'
      ],
      color: 'from-violet-600 to-purple-700',
      current: currentPlan === 'professional'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <NavBar user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Upgrade anytime to unlock more features and practice sessions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`border-2 hover:shadow-2xl transition-all duration-300 relative ${
                plan.popular
                  ? 'border-purple-500 shadow-xl shadow-purple-500/20 transform scale-105'
                  : 'border-purple-100'
              } ${plan.current ? 'ring-4 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Current Plan
                  </span>
                </div>
              )}
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full py-6 text-lg font-semibold ${
                    plan.current
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                  onClick={() => toast.info('Subscription feature coming soon!')}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;