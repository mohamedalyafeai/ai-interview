import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Sparkles, Upload, FileText, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService, resumeService } from '../services/api';

const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        setFile(selectedFile);
        toast.success('Resume uploaded successfully!');
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const analyzeResume = async () => {
    if (!file) {
      toast.error('Please upload a resume first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await resumeService.upload(formData);
      setAnalysis(response.data.analysis);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Error analyzing resume');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return null;
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
        {!analysis ? (
          <Card className="border-2 border-purple-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
              <CardTitle className="text-3xl flex items-center">
                <FileText className="w-8 h-8 mr-3" />
                AI Resume Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="border-4 border-dashed border-purple-200 rounded-lg p-12 text-center hover:border-purple-400 transition-all duration-300 bg-gradient-to-br from-purple-50/50 to-violet-50/50">
                {!file ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">
                      Upload Your Resume
                    </p>
                    <p className="text-gray-600">
                      Click to browse or drag and drop your PDF resume here
                    </p>
                  </label>
                ) : (
                  <div>
                    <FileText className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">
                      {file.name}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setFile(null)}
                      className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {file && (
                <div className="p-6 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-2">What we'll analyze:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      ATS (Applicant Tracking System) compatibility score
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      Content quality and keyword optimization
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      Structure, formatting, and readability
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      Actionable suggestions for improvement
                    </li>
                  </ul>
                </div>
              )}

              <Button
                onClick={analyzeResume}
                disabled={!file || isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg shadow-lg shadow-purple-500/30"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="border-2 border-purple-200 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                <CardTitle className="text-3xl">Resume Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                    {analysis.overallScore}/100
                  </div>
                  <p className="text-xl text-gray-600">Overall Resume Score</p>
                </div>
                <div className="h-4 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-1000"
                    style={{ width: `${analysis.overallScore}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Category Scores */}
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(analysis.categoryScores).map(([category, score]) => (
                <Card key={category} className="border-2 border-purple-100 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                      {score}/100
                    </div>
                    <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Strengths */}
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center text-gray-900">
                  <CheckCircle2 className="w-7 h-7 mr-3 text-green-500" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start p-4 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center text-gray-900">
                  <AlertCircle className="w-7 h-7 mr-3 text-orange-500" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <AlertCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center text-gray-900">
                  <Sparkles className="w-7 h-7 mr-3 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start p-4 bg-white rounded-lg border border-purple-200">
                      <span className="text-purple-600 font-bold mr-3 flex-shrink-0">{index + 1}.</span>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setAnalysis(null);
                  setFile(null);
                }}
                variant="outline"
                className="flex-1 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 py-6 text-lg"
              >
                Analyze Another Resume
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg shadow-lg"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysis;
