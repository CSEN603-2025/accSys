import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { Bell, Phone, X, Video, Mic, Share2, Monitor, MonitorUp } from 'lucide-react';

const mockContacts = [
  { id: 1, name: 'SCAD Office', type: 'university', role: 'University Staff', status: 'online' },
  { id: 2, name: 'Career Advisor', type: 'university', role: 'University Staff', status: 'offline' },
  { id: 3, name: 'TechSolutions', type: 'company', role: 'Company Representative', status: 'offline' },
];

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s]
    .filter((v, i) => v > 0 || i > 0)
    .map((v) => String(v).padStart(2, '0'))
    .join(':');
}

const StudentVideoCalls = ({ currentUser }) => {
  const [filter, setFilter] = useState('all');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [incomingCall, setIncomingCall] = useState({ from: 'SCAD Office', type: 'university' });
  const [inCall, setInCall] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [notif, setNotif] = useState('');
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const timerRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (inCall) {
      timerRef.current = setInterval(() => setCallTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setCallTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [inCall]);

  // Notification timeout
  useEffect(() => {
    if (notif) {
      const timeout = setTimeout(() => setNotif(''), 2500);
      return () => clearTimeout(timeout);
    }
  }, [notif]);

  // Video stream logic
  useEffect(() => {
    if (videoOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setNotif('Camera On');
        })
        .catch(() => {
          setNotif('Camera access denied');
          setVideoOn(false);
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setNotif('Camera Off');
    }
    // eslint-disable-next-line
  }, [videoOn]);

  // Attach video stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Screen sharing logic
  useEffect(() => {
    if (sharing) {
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then((mediaStream) => {
          setScreenStream(mediaStream);
          if (screenRef.current) {
            screenRef.current.srcObject = mediaStream;
          }
          setNotif('Screen Sharing Started');
          mediaStream.getVideoTracks()[0].onended = () => {
            setSharing(false);
            setNotif('Screen Sharing Stopped');
          };
        })
        .catch(() => {
          setNotif('Screen sharing denied');
          setSharing(false);
        });
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setNotif('Screen Sharing Stopped');
    }
    // eslint-disable-next-line
  }, [sharing]);

  const filteredContacts =
    filter === 'all'
      ? mockContacts
      : mockContacts.filter((c) => c.type === filter);

  // Accept call
  const handleAccept = () => {
    setInCall(true);
    setIncomingCall(null);
  };

  // Hang up
  const handleHangUp = () => {
    setInCall(false);
    setIncomingCall(null);
    setVideoOn(false);
    setSharing(false);
    setMicMuted(false);
  };

  // Toggle mic
  const handleToggleMic = () => {
    setMicMuted((m) => {
      setNotif(!m ? 'Microphone Muted' : 'Microphone Unmuted');
      return !m;
    });
  };

  // Toggle video
  const handleToggleVideo = () => {
    setVideoOn((v) => !v);
  };

  // Toggle screen sharing
  const handleToggleShare = () => {
    setSharing((s) => !s);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole="student" currentUser={currentUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ flex: 1, width: '100%', padding: '2rem 0', paddingLeft: 32, display: 'block' }}>
          <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Video-calls</div>
            <div style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>Video Calls</div>
            <div style={{ color: '#64748b', fontSize: 16, marginBottom: 32 }}>Connect with SCAD office and company representatives through video calls</div>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
              {/* Main Call Card */}
              <div style={{ flex: 2, minWidth: 400 }}>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px #e2e8f0', padding: '2.5rem 2rem', minHeight: 320, position: 'relative' }}>
                  {/* Incoming Call UI */}
                  {!inCall && incomingCall && (
                    <>
                      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{incomingCall.from}</div>
                      <div style={{ color: '#64748b', fontSize: 17, marginBottom: 32 }}>Incoming call...</div>
                      <div style={{ display: 'flex', gap: 24 }}>
                        <button onClick={handleAccept} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <Phone size={22} /> Accept
                        </button>
                        <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <X size={22} /> Reject
                        </button>
                      </div>
                    </>
                  )}
                  {/* In-Call UI */}
                  {inCall && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 24, fontWeight: 600 }}>Call with SCAD Office</div>
                        <span style={{ background: '#e0e7ef', color: '#2563eb', borderRadius: 12, padding: '4px 16px', fontWeight: 600, fontSize: 15 }}>Connected</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: 15, marginBottom: 12 }}>{formatTime(callTime)} &bull; Video call</div>
                      <div style={{ background: '#f1f5f9', borderRadius: 12, minHeight: 140, margin: '24px 0 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: 0, position: 'relative', overflow: 'hidden' }}>
                        {/* Video stream */}
                        {videoOn && stream && (
                          <video ref={videoRef} autoPlay playsInline muted style={{ width: 180, height: 120, borderRadius: 8, margin: 24, objectFit: 'cover', background: '#000' }} />
                        )}
                        {/* Screen share stream */}
                        {sharing && screenStream && (
                          <video ref={screenRef} autoPlay playsInline muted style={{ width: 220, height: 120, borderRadius: 8, margin: 24, objectFit: 'cover', background: '#000', border: '2px solid #2563eb' }} />
                        )}
                        {/* Fallback avatar */}
                        {!videoOn && !sharing && (
                          <div style={{ width: 90, height: 90, background: '#f8fafc', borderRadius: 12, margin: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#64748b', fontWeight: 700, boxShadow: '0 1px 4px #e2e8f0' }}>A</div>
                        )}
                        <div style={{ padding: 24, fontWeight: 600, color: '#64748b' }}>SCAD Office</div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'center' }}>
                        <button
                          onClick={handleToggleVideo}
                          style={{ background: videoOn ? '#1746a2' : '#e5e7eb', color: videoOn ? '#fff' : '#64748b', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        >
                          <Video size={22} />
                        </button>
                        <button
                          onClick={handleToggleMic}
                          style={{ background: !micMuted ? '#1746a2' : '#e5e7eb', color: !micMuted ? '#fff' : '#64748b', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        >
                          <Mic size={22} style={{ opacity: !micMuted ? 1 : 0.4 }} />
                        </button>
                        <button
                          onClick={handleToggleShare}
                          style={{ background: sharing ? '#1746a2' : '#e5e7eb', color: sharing ? '#fff' : '#64748b', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        >
                          {sharing ? <MonitorUp size={22} /> : <Monitor size={22} />}
                        </button>
                        <button onClick={handleHangUp} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <X size={22} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Contacts Card */}
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px #e2e8f0', padding: '2rem' }}>
                  <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>Contacts</div>
                  <div style={{ color: '#64748b', fontSize: 15, marginBottom: 18 }}>Start a call with university staff or companies</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                    <button onClick={() => setFilter('all')} style={{ background: filter === 'all' ? '#e0e7ef' : '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>All</button>
                    <button onClick={() => setFilter('university')} style={{ background: filter === 'university' ? '#e0e7ef' : '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>University</button>
                    <button onClick={() => setFilter('company')} style={{ background: filter === 'company' ? '#e0e7ef' : '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Companies</button>
                  </div>
                  <div>
                    {filteredContacts.map((contact) => (
                      <div key={contact.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            fontSize: 16
                          }}>
                            {contact.name}
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: contact.status === 'online' ? '#16a34a' : '#94a3b8',
                              display: 'inline-block'
                            }}></span>
                            <span style={{
                              fontSize: '12px',
                              color: contact.status === 'online' ? '#16a34a' : '#94a3b8',
                              fontWeight: '500'
                            }}>
                              {contact.status}
                            </span>
                          </div>
                          <div style={{ color: '#64748b', fontSize: 14 }}>{contact.role}</div>
                        </div>
                        <button
                          style={{
                            background: contact.status === 'online' ? '#1746a2' : '#e2e8f0',
                            border: 'none',
                            color: contact.status === 'online' ? 'white' : '#94a3b8',
                            cursor: contact.status === 'online' ? 'pointer' : 'not-allowed',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          disabled={contact.status !== 'online'}
                        >
                          <Phone size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Notification Bar */}
          {notif && (
            <div style={{ position: 'fixed', bottom: 32, right: 48, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e2e8f0', padding: '1.2rem 2rem', minWidth: 320, display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ fontWeight: 600, color: '#334155', fontSize: 17 }}>{notif}</div>
              <div style={{ color: '#64748b', fontSize: 15 }}>
                {notif === 'Microphone Muted' && 'You muted your microphone.'}
                {notif === 'Microphone Unmuted' && 'You unmuted your microphone.'}
                {notif === 'Camera On' && 'Your camera is now on.'}
                {notif === 'Camera Off' && 'Your camera is now off.'}
                {notif === 'Screen Sharing Started' && 'You are sharing your screen.'}
                {notif === 'Screen Sharing Stopped' && 'You stopped sharing your screen.'}
                {notif === 'Camera access denied' && 'Camera access was denied.'}
                {notif === 'Screen sharing denied' && 'Screen sharing was denied.'}
              </div>
            </div>
          )}
          {/* Notifications On Button */}
          <button
            onClick={() => setNotificationsOn((on) => !on)}
            style={{ position: 'absolute', top: 32, right: 48, background: '#1746a2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <Bell size={20} /> Notifications {notificationsOn ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentVideoCalls;