import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sparkles, Video, Send, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService, interviewService } from '../services/api';

const Interview = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [answer, setAnswer] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getMe();
        setUser(response.data);
      } catch (error) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const roles = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'DevOps Engineer',
    'UX Designer',
    'Full Stack Developer'
  ];

  const levels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Principal'];

  const startInterview = async () => {
    if (!selectedRole || !selectedLevel) {
      toast.error('Please select both role and experience level');
      return;
    }

    setIsLoading(true);
    try {
      const response = await interviewService.start({
        position: selectedRole,
        level: selectedLevel
      });
      
      setInterviewId(response.data.interview_id);
      setInterviewStarted(true);
      setConversation([{ type: 'ai', text: response.data.first_question }]);
      toast.success('Interview started! Good luck!');
    } catch (error) {
      toast.error('Failed to start interview');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setIsLoading(true);
    
    // Add user answer to conversation
    const newConversation = [...conversation, { type: 'user', text: answer }];
    setConversation(newConversation);
    setAnswer('');

    try {
      const response = await interviewService.answer({
        interview_id: interviewId,
        answer: answer
      });

      if (response.data.is_complete) {
        // Interview complete, get feedback
        setInterviewComplete(true);
        const feedbackResponse = await interviewService.complete(interviewId);
        setFeedback(feedbackResponse.data.feedback);
        toast.success('Interview completed!');
      } else {
        // Add AI response
        setConversation([...newConversation, { type: 'ai', text: response.data.next_question }]);
      }
    } catch (error) {
      toast.error('Error submitting answer');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (interviewComplete && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  AI Interview Pro
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="border-2 border-purple-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
              <CardTitle className="text-3xl">Interview Feedback</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Overall Score</h3>
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    {feedback.overallScore}/10
                  </div>
                </div>
                <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-1000"
                    style={{ width: `${(feedback.overallScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(feedback.categories).map(([category, score]) => (
                  <div key={category} className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-xl font-bold text-purple-600">{score}/10</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
                        style={{ width: `${(score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Strengths</h4>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 text-xl">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {feedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2 text-xl">→</span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg border-2 border-purple-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Overall Feedback</h4>
                  <p className="text-gray-700 leading-relaxed">{feedback.overallFeedback}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg shadow-lg"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 py-6 text-lg"
                >
                  Start New Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                AI Interview Pro
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!interviewStarted ? (
          <Card className="border-2 border-purple-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
              <CardTitle className="text-3xl flex items-center">
                <Video className="w-8 h-8 mr-3" />
                Setup Your Mock Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Target Role
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full border-2 border-purple-200 py-6 text-lg">
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role} className="text-lg py-3">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Experience Level
                </label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-full border-2 border-purple-200 py-6 text-lg">
                    <SelectValue placeholder="Choose your level..." />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level} className="text-lg py-3">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">What to expect:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    5-6 role-specific questions
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Real-time AI feedback on your answers
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Detailed performance analysis at the end
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    Approximately 15-20 minutes
                  </li>
                </ul>
              </div>

              <Button
                onClick={startInterview}
                disabled={!selectedRole || !selectedLevel}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg shadow-lg shadow-purple-500/30"
              >
                Start Interview
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Interview Progress */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">Question {questionIndex + 1} of {mockQuestions.length}</span>
                  <span className="text-sm font-semibold text-purple-600">{selectedRole} - {selectedLevel}</span>
                </div>
                <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-500"
                    style={{ width: `${((questionIndex + 1) / mockQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Conversation */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                          : 'bg-gradient-to-r from-purple-50 to-violet-50 text-gray-900 border border-purple-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'ai' && (
                          <MessageCircle className="w-5 h-5 flex-shrink-0 mt-1 text-purple-600" />
                        )}
                        <p className="leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Answer Input */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6 space-y-4">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-32 border-2 border-purple-200 focus:border-purple-400 resize-none text-lg"
                  disabled={isLoading}
                />
                <Button
                  onClick={submitAnswer}
                  disabled={isLoading || !answer.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
