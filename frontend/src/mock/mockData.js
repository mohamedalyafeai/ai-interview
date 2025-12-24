// Mock data for frontend development
// This will be replaced with real API calls later

export const mockInterviewHistory = [
  {
    id: 1,
    position: 'Software Engineer',
    date: '2025-01-15',
    score: 8.5,
    duration: '22 min'
  },
  {
    id: 2,
    position: 'Full Stack Developer',
    date: '2025-01-12',
    score: 7.8,
    duration: '18 min'
  },
  {
    id: 3,
    position: 'Data Scientist',
    date: '2025-01-10',
    score: 9.2,
    duration: '25 min'
  },
  {
    id: 4,
    position: 'DevOps Engineer',
    date: '2025-01-08',
    score: 8.0,
    duration: '20 min'
  },
  {
    id: 5,
    position: 'Product Manager',
    date: '2025-01-05',
    score: 8.7,
    duration: '24 min'
  }
];

export const mockQuestions = [
  'Tell me about yourself and your background in this field.',
  'What interests you most about this role and our company?',
  'Can you describe a challenging project you worked on and how you overcame obstacles?',
  'How do you stay updated with the latest trends and technologies in your field?',
  'Where do you see yourself in the next 3-5 years?'
];

export const mockFeedback = {
  overallScore: 8.5,
  categories: {
    communication: 9,
    technicalKnowledge: 8,
    problemSolving: 8.5,
    cultureFit: 9,
    confidence: 8
  },
  strengths: [
    'Excellent communication skills and clear articulation of ideas',
    'Strong technical knowledge demonstrated through detailed examples',
    'Good use of the STAR method in answering behavioral questions',
    'Showed enthusiasm and genuine interest in the role'
  ],
  improvements: [
    'Could provide more specific metrics and quantifiable achievements',
    'Consider structuring answers more concisely to stay within time limits',
    'Include more examples of leadership and team collaboration'
  ],
  overallFeedback: 'You demonstrated strong interview skills overall. Your responses were well-structured and showed good preparation. Focus on quantifying your achievements with specific metrics and numbers to make your answers more impactful. Your technical knowledge is solid, and your communication style is professional and engaging. Keep practicing to refine your delivery and you\'ll be ready for any interview!'
};

export const mockResumeAnalysis = {
  overallScore: 78,
  categoryScores: {
    atsCompatibility: 85,
    contentQuality: 75,
    formatting: 72
  },
  strengths: [
    'Strong technical skills section with relevant keywords',
    'Clear and concise job descriptions',
    'Good use of action verbs in bullet points',
    'Educational background is well-presented'
  ],
  weaknesses: [
    'Missing quantifiable achievements and metrics',
    'Limited use of industry-specific keywords',
    'Summary section could be more impactful',
    'Some formatting inconsistencies in dates'
  ],
  suggestions: [
    'Add specific numbers and metrics to your achievements (e.g., "Increased efficiency by 40%" instead of "Improved efficiency")',
    'Include more industry-specific keywords relevant to your target roles',
    'Rewrite your professional summary to highlight your unique value proposition',
    'Ensure consistent formatting throughout, especially for dates and bullet points',
    'Add relevant certifications or ongoing learning initiatives',
    'Consider adding a projects section to showcase practical applications of your skills'
  ]
};
