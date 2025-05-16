import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { Plus, Calendar, Clock, User, MessageSquare, Star, FileText, Award, Briefcase, Mail, Edit2, Trash2, Play, Pause, Square, X, BookOpen, Users } from 'lucide-react';
import { Workshop } from '../../models/models';
import { mockUsers } from '../../DummyData/mockUsers';

const modalContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  zIndex: 1000
};

const modalContentStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '1.5rem',
  width: '100%',
  maxWidth: 500,
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  '&:hover': {
    color: '#1e293b'
  }
};

// Add tag style
const tagStyle = {
  padding: '4px 12px',
  borderRadius: 16,
  fontSize: 14,
  fontWeight: 500,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px'
};

const Workshops = ({ currentUser }) => {
  const navigate = useNavigate();
  const isSCAD = currentUser?.role === 'scad';
  const isProStudent = currentUser?.isProStudent;
  const [workshops, setWorkshops] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [workshopNotes, setWorkshopNotes] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    speaker: {
      name: '',
      title: '',
      bio: '',
      email: '',
      expertise: [],
      achievements: [],
      experience: ''
    },
    startDate: '',
    endDate: '',
    startTime: '',
    duration: '',
    agenda: '',
    isLive: true,
    isRecorded: false,
    recordingUrl: ''
  });

  // Load workshops from SCAD user
  useEffect(() => {
    // Find SCAD user in the mock data
    const scadUser = mockUsers.find(user => user.role === 'scad');
    if (scadUser && scadUser.workshops) {
      // Ensure each workshop has a studentsRegistered array
      const initializedWorkshops = scadUser.workshops.map(workshop => ({
        ...workshop,
        studentsRegistered: workshop.studentsRegistered || []
      }));
      setWorkshops(initializedWorkshops);
    }
  }, []);

  const handleCreateWorkshop = () => {
    if (isSCAD) {
      setShowCreateModal(true);
    }
  };

  const handleWorkshopSubmit = (e) => {
    e.preventDefault();
    if (isSCAD) {
      // Create new workshop using the Workshop model
      const workshop = new Workshop(
        Date.now(),
        newWorkshop.title,
        newWorkshop.description,
        newWorkshop.speaker,
        newWorkshop.startDate,
        newWorkshop.endDate,
        newWorkshop.startTime,
        newWorkshop.duration,
        newWorkshop.speaker.bio,
        newWorkshop.agenda,
        newWorkshop.isLive
      );

      // Find SCAD user and add workshop
      const scadUser = mockUsers.find(user => user.role === 'scad');
      if (scadUser) {
        scadUser.workshops = scadUser.workshops || [];
        scadUser.workshops.push(workshop);
        setWorkshops([...workshops, workshop]);
      }

      setShowCreateModal(false);
      setNewWorkshop({
        title: '',
        description: '',
        speaker: {
          name: '',
          title: '',
          bio: '',
          email: '',
          expertise: [],
          achievements: [],
          experience: ''
        },
        startDate: '',
        endDate: '',
        startTime: '',
        duration: '',
        agenda: '',
        isLive: true,
        isRecorded: false,
        recordingUrl: ''
      });
    }
  };

  const handleEditWorkshop = (workshop) => {
    if (isSCAD) {
      setSelectedWorkshop(workshop);
      setNewWorkshop(workshop);
      setShowEditModal(true);
    }
  };

  const handleUpdateWorkshop = (e) => {
    e.preventDefault();
    if (isSCAD && selectedWorkshop) {
      // Find SCAD user
      const scadUser = mockUsers.find(user => user.role === 'scad');
      if (scadUser) {
        // Update workshop in SCAD's workshops array
        const workshopIndex = scadUser.workshops.findIndex(w => w.id === selectedWorkshop.id);
        if (workshopIndex !== -1) {
          scadUser.workshops[workshopIndex] = {
            ...scadUser.workshops[workshopIndex],
            title: newWorkshop.title,
            description: newWorkshop.description,
            speaker: newWorkshop.speaker,
            startDate: newWorkshop.startDate,
            endDate: newWorkshop.endDate,
            startTime: newWorkshop.startTime,
            duration: newWorkshop.duration,
            agenda: newWorkshop.agenda,
            isLive: newWorkshop.isLive,
            isRecorded: newWorkshop.isRecorded,
            recordingUrl: newWorkshop.recordingUrl
          };

          // Update local state
          setWorkshops(workshops.map(w => 
            w.id === selectedWorkshop.id ? scadUser.workshops[workshopIndex] : w
          ));
          setShowEditModal(false);
        }
      }
    }
  };

  const handleDeleteWorkshop = (workshopId) => {
    if (isSCAD) {
      // Find SCAD user
      const scadUser = mockUsers.find(user => user.role === 'scad');
      if (scadUser) {
        // Remove workshop from SCAD's workshops array
        scadUser.workshops = scadUser.workshops.filter(w => w.id !== workshopId);
        setWorkshops(workshops.filter(w => w.id !== workshopId));
      }
    }
  };

  const handleViewDetails = (workshop) => {
    setSelectedWorkshop(workshop);
    setShowDetailsModal(true);
  };

  const handleViewSpeakerProfile = (speaker) => {
    setSelectedSpeaker(speaker);
    setShowSpeakerModal(true);
  };

  const handleRegister = (workshop) => {
    if (isProStudent) {
      // Find SCAD user
      const scadUser = mockUsers.find(user => user.role === 'scad');
      if (scadUser) {
        // Find the workshop in SCAD's workshops
        const workshopIndex = scadUser.workshops.findIndex(w => w.id === workshop.id);
        if (workshopIndex !== -1) {
          // Add student to workshop's registered students if not already registered
          if (!scadUser.workshops[workshopIndex].studentsRegistered.some(s => s.id === currentUser.id)) {
            scadUser.workshops[workshopIndex].studentsRegistered.push(currentUser);
            // Update local state
            setWorkshops(workshops.map(w => 
              w.id === workshop.id ? scadUser.workshops[workshopIndex] : w
            ));
            
            // Add registration notification
            currentUser.addNotification(`You have registered for workshop: ${workshop.title}`);
            
            // Add start date notification
            const startDate = new Date(workshop.startDate).toLocaleDateString();
            const startTime = workshop.startTime;
            currentUser.addNotification(`The workshop "${workshop.title}" starts on ${startDate} at ${startTime}. Don't forget to join!`);
          }
        }
      }
    }
  };

  const handleJoinWorkshop = (workshop) => {
    if (isProStudent && workshop.isLive) {
      navigate(`/workshop/${workshop.id}`);
    }
  };

  const handlePlayRecording = () => {
    setIsPlaying(!isPlaying);
  };

  const handleAddNote = () => {
    if (isProStudent && selectedWorkshop) {
      const updatedWorkshop = {
        ...selectedWorkshop,
        notes: [...selectedWorkshop.notes, {
          student: currentUser,
          content: workshopNotes,
          timestamp: new Date()
        }]
      };
      setWorkshops(workshops.map(w => w.id === selectedWorkshop.id ? updatedWorkshop : w));
      setWorkshopNotes('');
    }
  };

  const handleSendMessage = () => {
    if (isProStudent && selectedWorkshop) {
      const message = {
        student: currentUser,
        content: newMessage,
        timestamp: new Date()
      };
      const updatedWorkshop = {
        ...selectedWorkshop,
        chatMessages: [...selectedWorkshop.chatMessages, message]
      };
      setWorkshops(workshops.map(w => w.id === selectedWorkshop.id ? updatedWorkshop : w));
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
      
      // Notify other registered students
      selectedWorkshop.studentsRegistered.forEach(student => {
        if (student.id !== currentUser.id) {
          student.addNotification(`New message from ${currentUser.username} in ${selectedWorkshop.title} workshop chat: "${newMessage}"`);
        }
      });
    }
  };

  const handleRateWorkshop = () => {
    if (isProStudent && selectedWorkshop) {
      const updatedWorkshop = {
        ...selectedWorkshop,
        ratings: [...selectedWorkshop.ratings, {
          student: currentUser,
          rating,
          feedback,
          timestamp: new Date()
        }]
      };
      setWorkshops(workshops.map(w => w.id === selectedWorkshop.id ? updatedWorkshop : w));
      setShowRatingModal(false);
      setRating(0);
      setFeedback('');
    }
  };

  const generateCertificate = (workshop) => {
    if (isProStudent) {
      const certificate = {
        id: Date.now(),
        student: currentUser,
        workshop: workshop,
        issueDate: new Date()
      };
      currentUser.addNotification(`Certificate generated for workshop: ${workshop.title}`);
      return certificate;
    }
    return null;
  };

  const handleUnregister = (workshop) => {
    if (isProStudent) {
      // Find SCAD user
      const scadUser = mockUsers.find(user => user.role === 'scad');
      if (scadUser) {
        // Find the workshop in SCAD's workshops
        const workshopIndex = scadUser.workshops.findIndex(w => w.id === workshop.id);
        if (workshopIndex !== -1) {
          // Remove student from workshop's registered students
          scadUser.workshops[workshopIndex].studentsRegistered = 
            scadUser.workshops[workshopIndex].studentsRegistered.filter(s => s.id !== currentUser.id);
          // Update local state
          setWorkshops(workshops.map(w => 
            w.id === workshop.id ? scadUser.workshops[workshopIndex] : w
          ));
          currentUser.addNotification(`You have unregistered from workshop: ${workshop.title}`);
        }
      }
    }
  };

  const handleViewWorkshop = (workshopId) => {
    navigate(`/workshop/${workshopId}`);
  };

  // If user is not SCAD or Pro Student, redirect to home
  if (!isSCAD && !isProStudent) {
    return <Navigate to="/" />;
  }

  return (
    <div className="workshops-root" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role} currentUser={currentUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontWeight: 700 }}>Workshops</h2>
              <p style={{ color: '#64748b' }}>View and manage career development workshops</p>
            </div>
            {isSCAD && (
              <button
                onClick={handleCreateWorkshop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#1746a2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={20} />
                Create Workshop
              </button>
            )}
          </div>

          {/* Workshop List */}
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {workshops.map(workshop => (
              <div
                key={workshop.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 1px 4px #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <h3 style={{ fontWeight: 600, margin: 0 }}>{workshop.title}</h3>
                  <span style={{
                    ...tagStyle,
                    background: workshop.isLive ? '#dcfce7' : '#f1f5f9',
                    color: workshop.isLive ? '#166534' : '#64748b',
                    whiteSpace: 'nowrap'
                  }}>
                    {workshop.isLive ? (
                      <>
                        <Play size={16} />
                        Live
                      </>
                    ) : (
                      <>
                        <Square size={16} />
                        Recorded
                      </>
                    )}
                  </span>
                </div>
                <p style={{ color: '#64748b' }}>{workshop.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                  <Calendar size={16} />
                  <span>Start: {new Date(workshop.startDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                  <Calendar size={16} />
                  <span>End: {new Date(workshop.endDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                  <Clock size={16} />
                  <span>{workshop.startTime} ({workshop.duration})</span>
                </div>
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    color: '#64748b',
                    cursor: 'pointer',
                    '&:hover': { color: '#1746a2' }
                  }}
                  onClick={() => handleViewSpeakerProfile(workshop.speaker)}
                >
                  <User size={16} />
                  <span>{workshop.speaker.name}</span>
                </div>
                <div style={{ flex: 1 }} />
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  {isSCAD ? (
                    <>
                      <button
                        onClick={() => handleViewDetails(workshop)}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: '#1746a2',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <BookOpen size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleEditWorkshop(workshop)}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: '#f1f5f9',
                          color: '#1e293b',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorkshop(workshop.id)}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleViewDetails(workshop)}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: '#1746a2',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <BookOpen size={16} />
                        View Details
                      </button>
                      {isProStudent && (
                        workshop.studentsRegistered?.some(s => s.id === currentUser.id) ? (
                          <>
                            <button
                              onClick={() => handleViewWorkshop(workshop.id)}
                              style={{
                                flex: 1,
                                padding: '8px 16px',
                                background: '#1746a2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <Play size={16} />
                              Go to Workshop
                            </button>
                            <button
                              onClick={() => handleUnregister(workshop)}
                              style={{
                                flex: 1,
                                padding: '8px 16px',
                                background: '#fee2e2',
                                color: '#991b1b',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <X size={16} />
                              Unregister
                            </button>
                            {workshop.ratings && !workshop.ratings.some(rating => rating.student.id === currentUser.id) && (
                              <button
                                onClick={() => {
                                  setSelectedWorkshop(workshop);
                                  setShowRatingModal(true);
                                }}
                                style={{
                                  flex: 1,
                                  padding: '8px 16px',
                                  background: '#f1f5f9',
                                  color: '#1e293b',
                                  border: 'none',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <Star size={16} />
                                Rate Workshop
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handleRegister(workshop)}
                            style={{
                              flex: 1,
                              padding: '8px 16px',
                              background: '#1746a2',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <Plus size={16} />
                            Register
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Workshop Modal */}
      {(showCreateModal || showEditModal) && (
        <div style={modalContainerStyle}>
          <div style={modalContentStyle}>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
              }}
              style={closeButtonStyle}
            >
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>
              {showCreateModal ? 'Create New Workshop' : 'Edit Workshop'}
            </h3>
            <form onSubmit={showCreateModal ? handleWorkshopSubmit : handleUpdateWorkshop}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Workshop Title"
                  value={newWorkshop.title}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newWorkshop.description}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    minHeight: 100
                  }}
                  required
                />
                <input
                  type="text"
                  placeholder="Speaker Name"
                  value={newWorkshop.speaker.name}
                  onChange={(e) => setNewWorkshop({
                    ...newWorkshop,
                    speaker: { ...newWorkshop.speaker, name: e.target.value }
                  })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <input
                  type="text"
                  placeholder="Speaker Title"
                  value={newWorkshop.speaker.title}
                  onChange={(e) => setNewWorkshop({
                    ...newWorkshop,
                    speaker: { ...newWorkshop.speaker, title: e.target.value }
                  })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <textarea
                  placeholder="Speaker Bio"
                  value={newWorkshop.speaker.bio}
                  onChange={(e) => setNewWorkshop({
                    ...newWorkshop,
                    speaker: { ...newWorkshop.speaker, bio: e.target.value }
                  })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    minHeight: 100
                  }}
                  required
                />
                <input
                  type="email"
                  placeholder="Speaker Email"
                  value={newWorkshop.speaker.email}
                  onChange={(e) => setNewWorkshop({
                    ...newWorkshop,
                    speaker: { ...newWorkshop.speaker, email: e.target.value }
                  })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <input
                  type="text"
                  placeholder="Speaker Experience (e.g., 10 years in Software Engineering)"
                  value={newWorkshop.speaker.experience}
                  onChange={(e) => setNewWorkshop({
                    ...newWorkshop,
                    speaker: { ...newWorkshop.speaker, experience: e.target.value }
                  })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <input
                  type="text"
                  placeholder="Expertise (comma-separated)"
                  value={newWorkshop.speaker.expertise.join(', ')}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue.endsWith(',')) {
                      const newValue = inputValue.slice(0, -1).trim();
                      if (newValue && !newWorkshop.speaker.expertise.includes(newValue)) {
                        setNewWorkshop({
                          ...newWorkshop,
                          speaker: { 
                            ...newWorkshop.speaker, 
                            expertise: [...newWorkshop.speaker.expertise, newValue]
                          }
                        });
                      }
                    } else {
                      const values = inputValue.split(',').map(v => v.trim()).filter(v => v);
                      setNewWorkshop({
                        ...newWorkshop,
                        speaker: { 
                          ...newWorkshop.speaker, 
                          expertise: values
                        }
                      });
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                />
                <input
                  type="text"
                  placeholder="Achievements (comma-separated)"
                  value={newWorkshop.speaker.achievements.join(', ')}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue.endsWith(',')) {
                      const newValue = inputValue.slice(0, -1).trim();
                      if (newValue && !newWorkshop.speaker.achievements.includes(newValue)) {
                        setNewWorkshop({
                          ...newWorkshop,
                          speaker: { 
                            ...newWorkshop.speaker, 
                            achievements: [...newWorkshop.speaker.achievements, newValue]
                          }
                        });
                      }
                    } else {
                      const values = inputValue.split(',').map(v => v.trim()).filter(v => v);
                      setNewWorkshop({
                        ...newWorkshop,
                        speaker: { 
                          ...newWorkshop.speaker, 
                          achievements: values
                        }
                      });
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                />
                <input
                  type="date"
                  value={newWorkshop.startDate}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, startDate: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <input
                  type="date"
                  value={newWorkshop.endDate}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, endDate: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <input
                  type="time"
                  value={newWorkshop.startTime}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, startTime: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 2 hours)"
                  value={newWorkshop.duration}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, duration: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0'
                  }}
                  required
                />
                <textarea
                  placeholder="Agenda"
                  value={newWorkshop.agenda}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, agenda: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    minHeight: 100
                  }}
                  required
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="workshopType"
                      checked={newWorkshop.isLive}
                      onChange={(e) => setNewWorkshop({ 
                        ...newWorkshop, 
                        isLive: true,
                        isRecorded: false 
                      })}
                    />
                    Live Workshop
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="workshopType"
                      checked={newWorkshop.isRecorded}
                      onChange={(e) => setNewWorkshop({ 
                        ...newWorkshop, 
                        isLive: false,
                        isRecorded: true 
                      })}
                    />
                    Recorded Workshop
                  </label>
                </div>
                {newWorkshop.isRecorded && (
                  <input
                    type="url"
                    placeholder="Recording URL"
                    value={newWorkshop.recordingUrl}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, recordingUrl: e.target.value })}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      marginTop: '1rem'
                    }}
                  />
                )}
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '1.5rem',
                flexDirection: window.innerWidth < 640 ? 'column' : 'row'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#1746a2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  {showCreateModal ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workshop Details Modal */}
      {showDetailsModal && selectedWorkshop && (
        <div style={modalContainerStyle}>
          <div style={{
            ...modalContentStyle,
            maxWidth: 600
          }}>
            <button
              onClick={() => setShowDetailsModal(false)}
              style={closeButtonStyle}
            >
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{selectedWorkshop.title}</h3>
              <span style={{
                ...tagStyle,
                background: selectedWorkshop.isLive ? '#dcfce7' : '#f1f5f9',
                color: selectedWorkshop.isLive ? '#166534' : '#64748b'
              }}>
                {selectedWorkshop.isLive ? (
                  <>
                    <Play size={16} />
                    Live Workshop
                  </>
                ) : (
                  <>
                    <Square size={16} />
                    Recorded Workshop
                  </>
                )}
              </span>
            </div>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{selectedWorkshop.description}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  '&:hover': { color: '#1746a2' }
                }}
                onClick={() => handleViewSpeakerProfile(selectedWorkshop.speaker)}
              >
                <User size={16} />
                <span><strong>Speaker:</strong> {selectedWorkshop.speaker.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} />
                <span><strong>Start Date:</strong> {new Date(selectedWorkshop.startDate).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} />
                <span><strong>End Date:</strong> {new Date(selectedWorkshop.endDate).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} />
                <span><strong>Time:</strong> {selectedWorkshop.startTime} ({selectedWorkshop.duration})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} />
                <span><strong>Agenda:</strong></span>
              </div>
              <pre style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap',
                marginLeft: '1.5rem'
              }}>
                {selectedWorkshop.agenda}
              </pre>
              {selectedWorkshop.recordingUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Play size={16} />
                  <span><strong>Recording URL:</strong> {selectedWorkshop.recordingUrl}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} />
                <span><strong>Registered Students:</strong> {selectedWorkshop.studentsRegistered?.length || 0}</span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row'
            }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              {isSCAD && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditWorkshop(selectedWorkshop);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#1746a2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Edit2 size={16} />
                  Edit Workshop
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedWorkshop && (
        <div style={modalContainerStyle}>
          <div style={{
            ...modalContentStyle,
            display: 'flex',
            flexDirection: 'column',
            height: '80vh'
          }}>
            <button
              onClick={() => setShowChatModal(false)}
              style={closeButtonStyle}
            >
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1rem' }}>Workshop Chat</h3>
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              marginBottom: '1rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: 6
            }}>
              {selectedWorkshop.chatMessages.map((message, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong>{message.student.username}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ margin: 0 }}>{message.content}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '8px 16px',
                  background: '#1746a2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedWorkshop && (
        <div style={modalContainerStyle}>
          <div style={modalContentStyle}>
            <button
              onClick={() => setShowRatingModal(false)}
              style={closeButtonStyle}
            >
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1rem' }}>Rate Workshop</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rating</label>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        padding: '8px',
                        background: rating >= star ? '#1746a2' : '#f1f5f9',
                        color: rating >= star ? '#fff' : '#000',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <Star size={20} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts about the workshop..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    minHeight: 100
                  }}
                />
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '1.5rem',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row'
            }}>
              <button
                onClick={() => setShowRatingModal(false)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRateWorkshop}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: '#1746a2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Profile Modal */}
      {showSpeakerModal && selectedSpeaker && (
        <div style={modalContainerStyle}>
          <div style={modalContentStyle}>
            <button
              onClick={() => setShowSpeakerModal(false)}
              style={closeButtonStyle}
            >
              <X size={24} />
            </button>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              marginBottom: '1.5rem',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              textAlign: window.innerWidth < 640 ? 'center' : 'left'
            }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={40} color="#64748b" />
              </div>
              <div>
                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{selectedSpeaker.name}</h3>
                <p style={{ color: '#64748b', margin: 0 }}>{selectedSpeaker.title}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} />
                <span>{selectedSpeaker.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} />
                <span>{selectedSpeaker.experience}</span>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Expertise</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedSpeaker.expertise.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#f1f5f9',
                        padding: '4px 12px',
                        borderRadius: 16,
                        fontSize: 14
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Achievements</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {selectedSpeaker.achievements.map((achievement, index) => (
                    <li key={index} style={{ color: '#64748b' }}>{achievement}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Bio</h4>
                <p style={{ color: '#64748b', margin: 0 }}>{selectedSpeaker.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workshops;
