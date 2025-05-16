import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { MessageSquare, FileText, Users, Clock, Calendar, User, X, Play, Pause, SkipForward, Maximize, Volume2, Settings, Share2, Bookmark } from 'lucide-react';
import { mockUsers } from '../../DummyData/mockUsers';

const styles = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const WorkshopView = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    // Find SCAD user and get workshop
    const scadUser = mockUsers.find(user => user.role === 'scad');
    if (scadUser) {
      const foundWorkshop = scadUser.workshops.find(w => w.id === parseInt(id));
      if (foundWorkshop) {
        setWorkshop(foundWorkshop);
        setChatMessages(foundWorkshop.chatMessages || []);
        setNotes(foundWorkshop.notes || '');
      }
    }
  }, [id]);

  const handleSendMessage = () => {
    if (newMessage.trim() && workshop) {
      const message = {
        student: currentUser,
        content: newMessage,
        timestamp: new Date()
      };
      
      // Update workshop chat messages
      const updatedWorkshop = {
        ...workshop,
        chatMessages: [...workshop.chatMessages, message]
      };
      
      // Find SCAD user and update workshop
      const scadUser = mockUsers.find(user => user.role === 'scad');
      if (scadUser) {
        scadUser.updateWorkshop(workshop.id, updatedWorkshop);
        setWorkshop(updatedWorkshop);
        setChatMessages([...chatMessages, message]);
        setNewMessage('');

        // Send notifications to all registered students except the sender
        workshop.studentsRegistered.forEach(student => {
          if (student.id !== currentUser.id) {
            student.addNotification(`New message from ${currentUser.username} in ${workshop.title} workshop chat`);
          }
        });
      }
    }
  };

  const handleAddNote = () => {
    if (notes.trim() && workshop) {
      const note = {
        student: currentUser,
        content: notes,
        timestamp: new Date()
      };
      
      // Update workshop notes
      const updatedWorkshop = {
        ...workshop,
        notes: [...(workshop.notes || []), note]
      };
      
      // Find SCAD user and update workshop
      const scadUser = mockUsers.find(user => user.role === 'scad');
      if (scadUser) {
        scadUser.updateWorkshop(workshop.id, updatedWorkshop);
        setWorkshop(updatedWorkshop);
        setNotes('');
      }
    }
  };

  if (!workshop) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={currentUser?.role} currentUser={currentUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ padding: '2rem', flex: 1 }}>
          {/* Video Player Section */}
          <div style={{ 
            background: '#000',
            borderRadius: 12,
            aspectRatio: '16/9',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.5rem'
            }}>
              {workshop.isLive ? 'Live Stream' : 'Workshop Recording'}
            </div>

            {/* Video Controls */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {!workshop.isLive && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      padding: '0.5rem'
                    }}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                )}
                {workshop.isLive && (
                  <div style={{
                    background: '#ef4444',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      background: '#fff',
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite'
                    }} />
                    LIVE
                  </div>
                )}
              </div>
              {!workshop.isLive && (
                <button
                  onClick={() => {/* Fast forward logic */}}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <SkipForward size={24} />
                </button>
              )}
              <div style={{ flex: 1 }} />
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowVolume(!showVolume)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <Volume2 size={24} />
                </button>
                {showVolume && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    background: '#fff',
                    padding: '1rem',
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      style={{ width: '100px' }}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <Maximize size={24} />
              </button>
            </div>
          </div>

          {/* Workshop Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Workshop Info */}
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '2rem',
                boxShadow: '0 1px 4px #e2e8f0'
              }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{workshop.title}</h1>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>{workshop.description}</p>
                
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} />
                    <span>{new Date(workshop.startDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} />
                    <span>{workshop.startTime} ({workshop.duration})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} />
                    <span>{workshop.studentsRegistered?.length || 0} attendees</span>
                  </div>
                </div>

                <div style={{ 
                  background: '#f8fafc', 
                  padding: '1.5rem', 
                  borderRadius: 8,
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Agenda</h3>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    color: '#64748b'
                  }}>
                    {workshop.agenda}
                  </pre>
                </div>
              </div>

              {/* Speaker Card */}
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '2rem',
                boxShadow: '0 1px 4px #e2e8f0'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>About the Speaker</h2>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={60} color="#64748b" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {workshop.speaker.name}
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>{workshop.speaker.title}</p>
                    <p style={{ marginBottom: '1.5rem' }}>{workshop.speaker.bio}</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {workshop.speaker.expertise?.map((skill, index) => (
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
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                background: '#fff',
                padding: '1rem',
                borderRadius: 12,
                boxShadow: '0 1px 4px #e2e8f0'
              }}>
                <button
                  onClick={() => setShowChat(!showChat)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: showChat ? '#1746a2' : '#f1f5f9',
                    color: showChat ? '#fff' : '#000',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <MessageSquare size={16} />
                  Chat
                </button>
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: showNotes ? '#1746a2' : '#f1f5f9',
                    color: showNotes ? '#fff' : '#000',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FileText size={16} />
                  Notes
                </button>
              </div>

              {/* Chat Panel */}
              {showChat && (
                <div style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '1.5rem',
                  boxShadow: '0 1px 4px #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100vh - 400px)'
                }}>
                  <h3 style={{ marginBottom: '1rem' }}>Workshop Chat</h3>
                  <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: 6
                  }}>
                    {chatMessages.map((message, index) => (
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
              )}

              {/* Notes Panel */}
              {showNotes && (
                <div style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '1.5rem',
                  boxShadow: '0 1px 4px #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100vh - 400px)'
                }}>
                  <h3 style={{ marginBottom: '1rem' }}>Workshop Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes during the workshop..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      resize: 'none',
                      marginBottom: '1rem'
                    }}
                  />
                  <button
                    onClick={handleAddNote}
                    style={{
                      padding: '8px 16px',
                      background: '#1746a2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    Add Note
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopView; 