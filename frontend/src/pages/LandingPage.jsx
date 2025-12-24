import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, Sparkles, TrendingUp, Target, Clock, BarChart3, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI Interview Practice',
      description: 'Practice with realistic AI interviewers that ask relevant questions and provide instant feedback.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Resume Analysis',
      description: 'Get AI-powered feedback and suggestions to make your resume more effective and ATS-friendly.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Performance Insights',
      description: 'Receive detailed feedback on your interview performance and areas for improvement.'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Industry-Specific Practice',
      description: 'Customize your practice sessions based on your target job role and industry requirements.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Progress Tracking',
      description: 'Monitor your improvement over time with detailed analytics and performance metrics.'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Always Available',
      description: 'Practice anytime, anywhere with our 24/7 AI interview platform.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      content: 'This platform transformed my interview prep. The AI-powered feedback gave me insights I never would have discovered on my own!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Product Manager at Microsoft',
      content: 'The mock interviews felt incredibly realistic. The AI adapts to your responses and challenges you in ways that prepared me for the real thing.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    {
      name: 'Emily Watson',
      role: 'Data Scientist at Amazon',
      content: 'I was struggling until I found this platform. The detailed feedback helped me optimize my resume, and I started getting callbacks within days!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out interview practice',
      features: [
        '2 mock interviews per month',
        '1 resume analysis per month',
        'Standard AI feedback'
      ],
      popular: false
    },
    {
      name: 'Graduate',
      price: '$29',
      period: 'per month',
      description: 'Ideal for recent graduates and career changers',
      features: [
        '10 mock interviews per month',
        '5 resume analysis per month',
        'Advanced AI feedback and insights'
      ],
      popular: true
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'For experienced professionals and executives',
      features: [
        '25 mock interviews per month',
        'Unlimited resume analysis',
        'Priority support and insights'
      ],
      popular: false
    }
  ];

  const stats = [
    { value: '10K+', label: 'Interviews Completed' },
    { value: '85%', label: 'Users Land Jobs' },
    { value: '24/7', label: 'Practice Anytime' },
    { value: '4.9/5', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                AI Interview Pro
              </span>
            </button>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')} className="text-purple-700 hover:text-purple-900 hover:bg-purple-50">
                Login
              </Button>
              <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                AI-Powered Interview Practice
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Practice Interviews with{' '}
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                AI Confidence
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Master job interviews with realistic AI practice sessions, get instant feedback on your responses,
              and improve your resume with intelligent analysis
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-lg px-8 py-6 shadow-2xl shadow-purple-500/40 transform hover:scale-105 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 text-lg px-8 py-6"
              >
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Ace Interviews
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Our platform combines AI technology with proven interview preparation strategies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50/30"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-purple-500/30">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Professionals
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from professionals who transformed their careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-purple-100 hover:shadow-2xl transition-all duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4 border-4 border-purple-100"
                    />
                    <div>
                      <div className="font-bold text-lg text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-purple-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Simple,{' '}
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Start free and upgrade when you need more practice sessions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`border-2 hover:shadow-2xl transition-all duration-300 relative ${
                  plan.popular
                    ? 'border-purple-500 shadow-xl shadow-purple-500/20 transform scale-105'
                    : 'border-purple-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
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
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-600 to-violet-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of professionals who have transformed their careers with AI-powered interview practice
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-6 shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Start Practicing Now - It's Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AI Interview Pro</span>
          </div>
          <p className="text-sm">
            © 2025 AI Interview Pro. All rights reserved. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
