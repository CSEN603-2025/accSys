import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { Award, Clock, CheckCircle, X, ArrowRight, ArrowLeft, Star, FileText } from 'lucide-react';

// Mock assessments data
const mockAssessments = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
    duration: '30 minutes',
    questions: [
      {
        id: 1,
        question: 'What is the output of: console.log(typeof [])?',
        options: ['array', 'object', 'undefined', 'null'],
        correctAnswer: 'object'
      },
      {
        id: 2,
        question: 'Which method is used to add elements to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 'push()'
      },
      // Add more questions as needed
    ],
    difficulty: 'Beginner',
    category: 'Programming',
    completedBy: []
  },
  {
    id: 2,
    title: 'React Essentials',
    description: 'Evaluate your understanding of React core concepts including components, props, and state.',
    duration: '45 minutes',
    questions: [
      {
        id: 1,
        question: 'What hook is used to perform side effects in a function component?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 'useEffect'
      },
      {
        id: 2,
        question: 'What is the correct way to update state in React?',
        options: [
          'this.state.count = 5',
          'setState({ count: 5 })',
          'setCount(5)',
          'Both B and C'
        ],
        correctAnswer: 'Both B and C'
      },
      // Add more questions as needed
    ],
    difficulty: 'Intermediate',
    category: 'Web Development',
    completedBy: []
  },
  // Add more assessments as needed
];

const Assessments = ({ currentUser }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState(mockAssessments);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const isProStudent = currentUser?.isProStudent;
  const [addedToProfile, setAddedToProfile] = useState(false);

  // Redirect if not a pro student
  useEffect(() => {
    if (!isProStudent) {
      navigate('/student');
    }
  }, [isProStudent, navigate]);

  const startAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setAddedToProfile(false);
    // Convert duration string to seconds
    const minutes = parseInt(assessment.duration);
    setTimeLeft(minutes * 60);
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (selectedAssessment && timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            calculateScore();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedAssessment, timeLeft, showResults]);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!selectedAssessment) return;

    let correct = 0;
    selectedAssessment.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / selectedAssessment.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    
    // Only track completion, don't add to profile
    const updatedAssessments = assessments.map(assessment => {
      if (assessment.id === selectedAssessment.id) {
        return {
          ...assessment,
          completedBy: [...(assessment.completedBy || []), {
            userId: currentUser.id,
            score: finalScore,
            completedAt: new Date()
          }]
        };
      }
      return assessment;
    });
    setAssessments(updatedAssessments);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return {
          background: '#e7f8e7',
          color: '#2db52d',
          border: '1px solid #2db52d'
        };
      case 'intermediate':
        return {
          background: '#fff7e6',
          color: '#ffa116',
          border: '1px solid #ffa116'
        };
      case 'advanced':
        return {
          background: '#ffefef',
          color: '#ef4743',
          border: '1px solid #ef4743'
        };
      default:
        return {
          background: '#f1f5f9',
          color: '#64748b',
          border: '1px solid #cbd5e1'
        };
    }
  };

  const addScoreToProfile = () => {
    if (!selectedAssessment || addedToProfile) return;

    // Add the completion record to the assessment
    const updatedAssessments = assessments.map(assessment => {
      if (assessment.id === selectedAssessment.id) {
        return {
          ...assessment,
          completedBy: [
            ...(assessment.completedBy || []),
            {
              userId: currentUser.id,
              score: score,
              completedAt: new Date()
            }
          ]
        };
      }
      return assessment;
    });
    
    // Add score to user's profile
    if (!currentUser.assessmentScores) {
      currentUser.assessmentScores = [];
    }

    const newScore = {
      assessmentId: selectedAssessment.id,
      title: selectedAssessment.title,
      score: score,
      difficulty: selectedAssessment.difficulty,
      completedAt: new Date()
    };

    const existingIndex = currentUser.assessmentScores.findIndex(
      s => s.assessmentId === selectedAssessment.id
    );

    if (existingIndex >= 0) {
      currentUser.assessmentScores[existingIndex] = newScore;
    } else {
      currentUser.assessmentScores.push(newScore);
    }
    
    setAssessments(updatedAssessments);
    setAddedToProfile(true);

    // Add notification
    currentUser.addNotification(`Assessment score added to profile: ${selectedAssessment.title} - ${score}%`);
  };

  if (!isProStudent) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role} currentUser={currentUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ padding: '2rem' }}>
          {!selectedAssessment ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontWeight: 700 }}>Technical Assessments</h2>
                  <p style={{ color: '#64748b' }}>Enhance your profile with verified skills</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {assessments.map((assessment) => {
                  const hasCompleted = assessment.completedBy?.some(
                    completion => completion.userId === currentUser.id
                  );
                  
                  return (
                    <div
                      key={assessment.id}
                      style={{
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 1px 4px #e2e8f0',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontWeight: 600, margin: 0 }}>{assessment.title}</h3>
                        <span style={{
                          background: getDifficultyColor(assessment.difficulty).background,
                          color: getDifficultyColor(assessment.difficulty).color,
                          border: getDifficultyColor(assessment.difficulty).border,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          display: 'inline-block'
                        }}>
                          {assessment.difficulty}
                        </span>
                      </div>
                      <p style={{ color: '#64748b', margin: 0 }}>{assessment.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} />
                          <span>{assessment.duration}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} />
                          <span>{assessment.questions.length} Questions</span>
                        </div>
                      </div>
                      {hasCompleted ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#f8fafc',
                          padding: '0.75rem',
                          borderRadius: 8,
                          color: '#1746a2',
                          fontWeight: 500
                        }}>
                          <CheckCircle size={16} />
                          Score: {assessment.completedBy.find(c => c.userId === currentUser.id).score}%
                        </div>
                      ) : (
                        <button
                          onClick={() => startAssessment(assessment)}
                          style={{
                            background: '#1746a2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            marginTop: 'auto'
                          }}
                        >
                          Start Assessment
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 1px 4px #e2e8f0',
              padding: '2rem',
              maxWidth: 800,
              margin: '0 auto'
            }}>
              {!showResults ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>{selectedAssessment.title}</h2>
                    <div style={{
                      background: timeLeft < 60 ? '#fee2e2' : '#f1f5f9',
                      color: timeLeft < 60 ? '#991b1b' : '#1e293b',
                      padding: '0.5rem 1rem',
                      borderRadius: 8,
                      fontWeight: 500
                    }}>
                      Time Left: {formatTime(timeLeft)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontWeight: 500, marginBottom: '1rem' }}>
                      Question {currentQuestion + 1} of {selectedAssessment.questions.length}
                    </div>
                    <div style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                      {selectedAssessment.questions[currentQuestion].question}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {selectedAssessment.questions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(selectedAssessment.questions[currentQuestion].id, option)}
                          style={{
                            padding: '1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            background: answers[selectedAssessment.questions[currentQuestion].id] === option ? '#1746a2' : '#fff',
                            color: answers[selectedAssessment.questions[currentQuestion].id] === option ? '#fff' : '#000',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: 8,
                        background: currentQuestion === 0 ? '#f1f5f9' : '#1746a2',
                        color: currentQuestion === 0 ? '#64748b' : '#fff',
                        cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>
                    {currentQuestion === selectedAssessment.questions.length - 1 ? (
                      <button
                        onClick={calculateScore}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: 8,
                          background: '#16a34a',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        Submit
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestion(prev => Math.min(selectedAssessment.questions.length - 1, prev + 1))}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: 8,
                          background: '#1746a2',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        Next
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: score >= 70 ? '#dcfce7' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                  }}>
                    {score >= 70 ? (
                      <CheckCircle size={40} color="#16a34a" />
                    ) : (
                      <X size={40} color="#991b1b" />
                    )}
                  </div>
                  <h2 style={{ marginBottom: '0.5rem' }}>Assessment Complete!</h2>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: score >= 70 ? '#16a34a' : '#991b1b', marginBottom: '1rem' }}>
                    {score}%
                  </div>
                  <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                    {score >= 70 ? 
                      'Congratulations! You\'ve passed the assessment.' :
                      'Keep practicing! You can retake the assessment later.'}
                  </p>
                  
                  {/* Add to Profile button - only visible for pro students */}
                  {currentUser?.isProStudent && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <button
                        onClick={addScoreToProfile}
                        disabled={addedToProfile}
                        style={{
                          background: addedToProfile ? '#dcfce7' : '#1746a2',
                          color: addedToProfile ? '#166534' : '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '0.75rem 1.5rem',
                          fontWeight: 500,
                          cursor: addedToProfile ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {addedToProfile ? (
                          <>
                            <CheckCircle size={16} />
                            Added to Profile
                          </>
                        ) : (
                          <>
                            <Award size={16} />
                            Add to Profile
                          </>
                        )}
                      </button>
                      {addedToProfile && (
                        <span style={{ 
                          color: '#166534',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <CheckCircle size={14} />
                          Score has been added to your profile
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedAssessment(null)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: 8,
                      background: '#f1f5f9',
                      color: '#1e293b',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Back to Assessments
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
