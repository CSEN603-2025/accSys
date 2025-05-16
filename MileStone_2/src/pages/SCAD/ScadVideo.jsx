import React, { useState, useRef, useEffect } from 'react';
import SideBar from '../../Components/SideBar';
import NavBar from '../../Components/NavBar';
import { Bell, Phone, X, Video, Mic, Share2, Monitor, MonitorUp, Check, Calendar, Users, Search, Filter, AlertCircle, MessageSquare } from 'lucide-react';
import { mockUsers } from '../../DummyData/mockUsers';

const mockContacts = [
    { id: 1, name: 'Ziad', type: 'student', role: 'Pro Student', status: 'online' },
    { id: 2, name: 'Mohamed', type: 'student', role: 'Pro Student', status: 'offline' },
    { id: 3, name: 'Khaled', type: 'student', role: 'Pro Student', status: 'online' },
    { id: 4, name: 'Faculty Advisor', type: 'faculty', role: 'Faculty Staff', status: 'offline' },
];

// Mock appointment data
const mockAppointments = [
    {
        id: 101,
        studentId: 5,
        studentName: "Ziad",
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        time: "14:30",
        reason: "Need guidance on career opportunities in AI",
        type: "career",
        status: "pending",
        requestedAt: new Date(Date.now() - 172800000) // 2 days ago
    },
    {
        id: 102,
        studentId: 6,
        studentName: "Karim",
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
        time: "10:15",
        reason: "Questions about my rejected report",
        type: "report",
        status: "pending",
        requestedAt: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
        id: 103,
        studentId: 7,
        studentName: "Khairy",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
        time: "16:00",
        reason: "Need feedback on internship applications",
        type: "career",
        status: "accepted",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        requestedAt: new Date(Date.now() - 259200000) // 3 days ago
    },
    {
        id: 104,
        studentId: 5,
        studentName: "Ziad",
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        time: "11:30",
        reason: "Report clarification",
        type: "report",
        status: "rejected",
        rejectionReason: "Schedule conflict. Please propose a different time.",
        requestedAt: new Date(Date.now() - 345600000) // 4 days ago
    }
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

const ScadVideo = ({ currentUser }) => {
    const [filter, setFilter] = useState('all');
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [incomingCall, setIncomingCall] = useState(null);
    const [inCall, setInCall] = useState(false);
    const [callTime, setCallTime] = useState(0);
    const [micMuted, setMicMuted] = useState(false);
    const [videoOn, setVideoOn] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [notif, setNotif] = useState('');
    const [stream, setStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [currentContact, setCurrentContact] = useState(null);
    const videoRef = useRef(null);
    const screenRef = useRef(null);
    const timerRef = useRef(null);

    // New state for appointments
    const [appointments, setAppointments] = useState(mockAppointments);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeTab, setActiveTab] = useState('calls');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({
        studentId: '',
        date: '',
        time: '',
        reason: '',
        type: 'report'
    });
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
    const [showStudentsDropdown, setShowStudentsDropdown] = useState(false);

    // Get students list
    const proStudents = mockUsers.filter(user =>
        user.role === 'student' && user.isProStudent === true
    );

    // Filter students for dropdown
    const filteredStudents = proStudents.filter(student =>
        student.username.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );

    // Filter appointments based on status
    const filteredAppointments = appointments.filter(appointment => {
        if (appointmentStatusFilter === 'all') return true;
        return appointment.status === appointmentStatusFilter;
    });

    // Simulate incoming call after component mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Math.random() > 0.5) { // 50% chance to get an incoming call
                const studentIdx = Math.floor(Math.random() * 3); // Random student from first 3 in mockContacts
                setIncomingCall({ from: mockContacts[studentIdx].name, type: 'student' });
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

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
                    setNotif('Screen sharing started');

                    // Stop sharing when the user stops sharing via the browser UI
                    mediaStream.getVideoTracks()[0].onended = () => {
                        setSharing(false);
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
            setNotif('Screen sharing stopped');
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
        setCurrentContact({ name: incomingCall.from, type: incomingCall.type });
        setIncomingCall(null);
    };

    // Initiate call
    const handleCall = (contact) => {
        setInCall(true);
        setCurrentContact(contact);
        setNotif(`Calling ${contact.name}...`);
    };

    // Hang up
    const handleHangUp = () => {
        setInCall(false);
        setCurrentContact(null);
        setVideoOn(false);
        setMicMuted(false);
        setSharing(false);
        setCallTime(0);
    };

    // Toggle mic
    const handleToggleMic = () => {
        setMicMuted(!micMuted);
        setNotif(micMuted ? 'Microphone On' : 'Microphone Off');
    };

    // Toggle video
    const handleToggleVideo = () => {
        setVideoOn(!videoOn);
    };

    // Toggle screen sharing
    const handleToggleShare = () => {
        setSharing(!sharing);
    };

    // Handle appointment acceptance
    const handleAcceptAppointment = (appointment) => {
        // Create a meeting link (in a real app, this would integrate with a video conferencing API)
        const meetingLink = "https://meet.google.com/xyz-abcd-efg";

        // Update appointment status
        const updatedAppointments = appointments.map(app =>
            app.id === appointment.id ? {
                ...app,
                status: 'accepted',
                meetingLink,
                updatedAt: new Date()
            } : app
        );

        setAppointments(updatedAppointments);

        // Send notification to student
        const student = mockUsers.find(user => user.id === appointment.studentId);
        if (student && student.addNotification) {
            student.addNotification(`Your appointment for ${appointment.date} at ${appointment.time} has been accepted. Check your video calls section.`);
        }

        setNotif(`Appointment with ${appointment.studentName} accepted successfully!`);
    };

    // Show rejection modal
    const handleShowRejectionModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowRejectionModal(true);
    };

    // Handle appointment rejection
    const handleRejectAppointment = () => {
        // Update appointment status
        const updatedAppointments = appointments.map(app =>
            app.id === selectedAppointment.id ? {
                ...app,
                status: 'rejected',
                rejectionReason,
                updatedAt: new Date()
            } : app
        );

        setAppointments(updatedAppointments);

        // Send notification to student
        const student = mockUsers.find(user => user.id === selectedAppointment.studentId);
        if (student && student.addNotification) {
            student.addNotification(`Your appointment for ${selectedAppointment.date} at ${selectedAppointment.time} has been rejected. Reason: ${rejectionReason}`);
        }

        // Close modal and reset form
        setShowRejectionModal(false);
        setRejectionReason('');
        setSelectedAppointment(null);
        setNotif(`Appointment with ${selectedAppointment.studentName} rejected.`);
    };

    // Handle appointment request submission
    const handleRequestSubmit = (e) => {
        e.preventDefault();

        // Create new appointment
        const student = mockUsers.find(user => user.id === Number(requestForm.studentId));
        if (!student) return;

        const newAppointment = {
            id: Date.now(),
            studentId: Number(requestForm.studentId),
            studentName: student.username,
            date: requestForm.date,
            time: requestForm.time,
            reason: requestForm.reason,
            type: requestForm.type,
            status: 'pending', // Sent by SCAD, student needs to accept/reject
            requestedAt: new Date(),
            requestedBy: 'scad'  // Add this field to distinguish who requested it
        };

        // Update appointments list
        setAppointments([...appointments, newAppointment]);

        // Send notification to student
        if (student.addNotification) {
            student.addNotification(`SCAD Office has requested a video appointment with you on ${requestForm.date} at ${requestForm.time}. Please respond.`);
        }

        // Close modal and reset form
        setShowRequestModal(false);
        setRequestForm({
            studentId: '',
            date: '',
            time: '',
            reason: '',
            type: 'report'
        });

        setNotif('Appointment request sent to student successfully!');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <SideBar userRole="scad" currentUser={currentUser} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <NavBar currentUser={currentUser} />
                <div style={{ padding: '2rem', flex: 1 }}>
                    <h1 style={{ marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.875rem' }}>Video Calls</h1>

                    {/* Tab navigation */}
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid #e2e8f0',
                        marginBottom: '1.5rem'
                    }}>
                        <button
                            onClick={() => setActiveTab('calls')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                fontWeight: activeTab === 'calls' ? '600' : '500',
                                color: activeTab === 'calls' ? '#1746a2' : '#64748b',
                                borderBottom: activeTab === 'calls' ? '2px solid #1746a2' : 'none',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Video size={18} />
                                Video Calls
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('appointments')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                fontWeight: activeTab === 'appointments' ? '600' : '500',
                                color: activeTab === 'appointments' ? '#1746a2' : '#64748b',
                                borderBottom: activeTab === 'appointments' ? '2px solid #1746a2' : 'none',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={18} />
                                Appointments
                            </div>
                        </button>
                    </div>

                    {inCall ? (
                        // Call in progress UI
                        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
                            <div style={{ position: 'relative', flex: 1, background: '#0f172a', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {/* Main video area - shows sharing or remote video */}
                                {sharing && (
                                    <video
                                        ref={screenRef}
                                        autoPlay
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                )}

                                {!sharing && (
                                    <div style={{ color: 'white', textAlign: 'center' }}>
                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            background: '#1746a2',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            margin: '0 auto 1rem',
                                            fontSize: '2rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {currentContact?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>{currentContact?.name || 'Unknown'}</div>
                                    </div>
                                )}

                                {/* Self video (if enabled) */}
                                {videoOn && (
                                    <div style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        bottom: '1rem',
                                        width: '200px',
                                        height: '150px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        background: '#1e293b'
                                    }}>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                {/* Call timer */}
                                <div style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
                                    {formatTime(callTime)}
                                </div>
                            </div>

                            {/* Call controls */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem' }}>
                                <button
                                    onClick={handleToggleMic}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: micMuted ? '#ef4444' : '#1746a2',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    title={micMuted ? 'Turn on microphone' : 'Mute microphone'}
                                >
                                    <Mic size={24} />
                                </button>
                                <button
                                    onClick={handleToggleVideo}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: videoOn ? '#1746a2' : '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    title={videoOn ? 'Turn off camera' : 'Turn on camera'}
                                >
                                    <Video size={24} />
                                </button>
                                <button
                                    onClick={handleToggleShare}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: sharing ? '#1746a2' : '#475569',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    title={sharing ? 'Stop screen sharing' : 'Share screen'}
                                >
                                    <Monitor size={24} />
                                </button>
                                <button
                                    onClick={handleHangUp}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    title="End call"
                                >
                                    <Phone size={24} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Tab content
                        activeTab === 'calls' ? (
                            // Call directory UI
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div style={{ flex: 2 }}>
                                    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Student Video Support</h2>

                                        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
                                            Connect with students for video calls to provide academic support and guidance. Students can request video calls for report clarifications and career guidance.
                                        </p>

                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Filter Contacts</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => setFilter('all')}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: filter === 'all' ? '#1746a2' : '#e2e8f0',
                                                        color: filter === 'all' ? 'white' : '#1e293b',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    All
                                                </button>
                                                <button
                                                    onClick={() => setFilter('student')}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: filter === 'student' ? '#1746a2' : '#e2e8f0',
                                                        color: filter === 'student' ? 'white' : '#1e293b',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Students
                                                </button>
                                                <button
                                                    onClick={() => setFilter('faculty')}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: filter === 'faculty' ? '#1746a2' : '#e2e8f0',
                                                        color: filter === 'faculty' ? 'white' : '#1e293b',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Faculty
                                                </button>
                                            </div>
                                        </div>

                                        {/* Notifications toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Bell size={18} />
                                                <span>Call Notifications</span>
                                            </div>
                                            <button
                                                onClick={() => setNotificationsOn(!notificationsOn)}
                                                style={{
                                                    width: '48px',
                                                    height: '24px',
                                                    borderRadius: '12px',
                                                    background: notificationsOn ? '#1746a2' : '#e2e8f0',
                                                    position: 'relative',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        background: 'white',
                                                        top: '2px',
                                                        left: notificationsOn ? '26px' : '2px',
                                                        transition: 'left 0.2s'
                                                    }}
                                                ></span>
                                            </button>
                                        </div>

                                        {/* Contacts list */}
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Contacts</h3>

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
                                                        onClick={() => contact.status === 'online' && handleCall(contact)}
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

                                <div style={{ flex: 1 }}>
                                    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Recently Contacted</h2>

                                        <div style={{ color: '#64748b', padding: '2rem 0', textAlign: 'center' }}>
                                            No recent calls. Your call history will appear here.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Appointments UI
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Appointment controls */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '1.5rem',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    {/* Filter bar */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        <div>
                                            <button
                                                onClick={() => setAppointmentStatusFilter('all')}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: appointmentStatusFilter === 'all' ? '#1746a2' : '#e2e8f0',
                                                    color: appointmentStatusFilter === 'all' ? 'white' : '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => setAppointmentStatusFilter('pending')}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: appointmentStatusFilter === 'pending' ? '#1746a2' : '#e2e8f0',
                                                    color: appointmentStatusFilter === 'pending' ? 'white' : '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    marginLeft: '0.5rem'
                                                }}
                                            >
                                                Pending
                                            </button>
                                            <button
                                                onClick={() => setAppointmentStatusFilter('accepted')}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: appointmentStatusFilter === 'accepted' ? '#1746a2' : '#e2e8f0',
                                                    color: appointmentStatusFilter === 'accepted' ? 'white' : '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    marginLeft: '0.5rem'
                                                }}
                                            >
                                                Accepted
                                            </button>
                                            <button
                                                onClick={() => setAppointmentStatusFilter('rejected')}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: appointmentStatusFilter === 'rejected' ? '#1746a2' : '#e2e8f0',
                                                    color: appointmentStatusFilter === 'rejected' ? 'white' : '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    marginLeft: '0.5rem'
                                                }}
                                            >
                                                Rejected
                                            </button>
                                        </div>
                                    </div>

                                    {/* Request appointment button */}
                                    <button
                                        onClick={() => setShowRequestModal(true)}
                                        style={{
                                            background: '#1746a2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.5rem 1rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Plus size={18} />
                                        Request Appointment
                                    </button>
                                </div>

                                {/* Appointments list */}
                                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                                    {filteredAppointments.length === 0 ? (
                                        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
                                            No appointments found matching your criteria.
                                        </div>
                                    ) : (
                                        filteredAppointments.map((appointment, index) => (
                                            <div
                                                key={appointment.id}
                                                style={{
                                                    padding: '1.25rem 1.5rem',
                                                    borderBottom: index === filteredAppointments.length - 1 ? 'none' : '1px solid #e2e8f0',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '0.25rem' }}>{appointment.studentName}</h3>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: appointment.type === 'career' ? '#3b82f6' : '#8b5cf6',
                                                            fontWeight: '500',
                                                            marginBottom: '0.5rem'
                                                        }}>
                                                            {appointment.type === 'career' ? 'Career Guidance' : 'Report Clarification'}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        background: getStatusBg(appointment.status),
                                                        color: getStatusColor(appointment.status)
                                                    }}>
                                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                    </div>
                                                </div>

                                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '0.75rem' }}>{appointment.reason}</p>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                                                    <div><strong>Date:</strong> {appointment.date}</div>
                                                    <div><strong>Time:</strong> {appointment.time}</div>
                                                    <div><strong>Requested:</strong> {formatDate(appointment.requestedAt)}</div>
                                                </div>

                                                {/* Additional information based on status */}
                                                {appointment.status === 'accepted' && (
                                                    <div style={{
                                                        marginTop: '0.75rem',
                                                        background: '#f0f9ff',
                                                        padding: '0.75rem',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <span>Meeting link: <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1746a2', textDecoration: 'underline' }}>{appointment.meetingLink}</a></span>
                                                    </div>
                                                )}

                                                {appointment.status === 'rejected' && appointment.rejectionReason && (
                                                    <div style={{
                                                        marginTop: '0.75rem',
                                                        background: '#fef2f2',
                                                        padding: '0.75rem',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        color: '#991b1b'
                                                    }}>
                                                        <strong>Reason:</strong> {appointment.rejectionReason}
                                                    </div>
                                                )}

                                                {/* Action buttons for pending appointments */}
                                                {appointment.status === 'pending' && (
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        gap: '0.75rem',
                                                        marginTop: '1rem'
                                                    }}>
                                                        <button
                                                            onClick={() => handleAcceptAppointment(appointment)}
                                                            style={{
                                                                background: '#dcfce7',
                                                                color: '#16a34a',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                padding: '0.5rem 1rem',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <Check size={16} />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleShowRejectionModal(appointment)}
                                                            style={{
                                                                background: '#fee2e2',
                                                                color: '#ef4444',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                padding: '0.5rem 1rem',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <X size={16} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Incoming call modal */}
            {incomingCall && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#1746a2',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '0 auto 1rem',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>
                            {incomingCall.from.charAt(0)}
                        </div>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{incomingCall.from}</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Incoming {incomingCall.type} call</p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setIncomingCall(null)}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={24} />
                            </button>
                            <button
                                onClick={handleAccept}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Phone size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection reason modal */}
            {showRejectionModal && selectedAppointment && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Reject Appointment</h3>
                        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                            Please provide a reason for rejecting the appointment request from <strong>{selectedAppointment.studentName}</strong>.
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                marginBottom: '1.5rem',
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                            required
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false);
                                    setRejectionReason('');
                                    setSelectedAppointment(null);
                                }}
                                style={{
                                    background: '#e2e8f0',
                                    color: '#1e293b',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.75rem 1.5rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectAppointment}
                                disabled={!rejectionReason.trim()}
                                style={{
                                    background: rejectionReason.trim() ? '#ef4444' : '#fca5a5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.75rem 1.5rem',
                                    fontWeight: 500,
                                    cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Reject Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request appointment modal */}
            {showRequestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Request Video Appointment</h3>

                        <form onSubmit={handleRequestSubmit}>
                            {/* Student selection */}
                            <div style={{ marginBottom: '1rem', position: 'relative' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '14px' }}>
                                    Student <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Search for a student..."
                                        value={studentSearchQuery}
                                        onChange={(e) => {
                                            setStudentSearchQuery(e.target.value);
                                            setShowStudentsDropdown(true);
                                        }}
                                        onClick={() => setShowStudentsDropdown(true)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            paddingLeft: '2.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />

                                    {/* Student selection dropdown */}
                                    {showStudentsDropdown && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderTop: 'none',
                                            borderRadius: '0 0 6px 6px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            zIndex: 10,
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {filteredStudents.length === 0 ? (
                                                <div style={{ padding: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                                                    No Pro Students found
                                                </div>
                                            ) : (
                                                filteredStudents.map(student => (
                                                    <div
                                                        key={student.id}
                                                        onClick={() => {
                                                            setStudentSearchQuery(student.username);
                                                            setRequestForm(prev => ({ ...prev, studentId: student.id }));
                                                            setShowStudentsDropdown(false);
                                                        }}
                                                        style={{
                                                            padding: '0.75rem',
                                                            borderBottom: '1px solid #f1f5f9',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            '&:hover': {
                                                                background: '#f8fafc'
                                                            }
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '24px',
                                                            height: '24px',
                                                            borderRadius: '50%',
                                                            background: '#1746a2',
                                                            color: 'white',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {student.username.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 500 }}>{student.username}</div>
                                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{student.email}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Appointment type */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '14px' }}>
                                    Appointment Type <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        flex: 1,
                                        background: requestForm.type === 'report' ? '#eff6ff' : 'white',
                                        borderColor: requestForm.type === 'report' ? '#3b82f6' : '#e2e8f0'
                                    }}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="report"
                                            checked={requestForm.type === 'report'}
                                            onChange={() => setRequestForm(prev => ({ ...prev, type: 'report' }))}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        Report Clarification
                                    </label>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        flex: 1,
                                        background: requestForm.type === 'career' ? '#eff6ff' : 'white',
                                        borderColor: requestForm.type === 'career' ? '#3b82f6' : '#e2e8f0'
                                    }}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="career"
                                            checked={requestForm.type === 'career'}
                                            onChange={() => setRequestForm(prev => ({ ...prev, type: 'career' }))}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        Career Guidance
                                    </label>
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '14px' }}>
                                        Date <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={requestForm.date}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, date: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0'
                                        }}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '14px' }}>
                                        Time <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={requestForm.time}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, time: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0'
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '14px' }}>
                                    Reason for Appointment <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    value={requestForm.reason}
                                    onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Explain the purpose of this appointment..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        minHeight: '100px',
                                        resize: 'vertical'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRequestModal(false);
                                        setRequestForm({
                                            studentId: '',
                                            date: '',
                                            time: '',
                                            reason: '',
                                            type: 'report'
                                        });
                                        setStudentSearchQuery('');
                                    }}
                                    style={{
                                        background: '#e2e8f0',
                                        color: '#1e293b',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.75rem 1.5rem',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!requestForm.studentId || !requestForm.date || !requestForm.time || !requestForm.reason}
                                    style={{
                                        background: requestForm.studentId && requestForm.date && requestForm.time && requestForm.reason ? '#1746a2' : '#94a3b8',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.75rem 1.5rem',
                                        fontWeight: 500,
                                        cursor: requestForm.studentId && requestForm.date && requestForm.time && requestForm.reason ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Request Appointment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification toast */}
            {notif && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1e293b',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '9999px',
                    zIndex: 40,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {notif}
                </div>
            )}
        </div>
    );
};

// Helper components and functions
const Plus = ({ size, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const getStatusBg = (status) => {
    switch (status) {
        case 'pending': return '#fef9c3';
        case 'accepted': return '#dcfce7';
        case 'rejected': return '#fee2e2';
        default: return '#e2e8f0';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return '#b45309';
        case 'accepted': return '#16a34a';
        case 'rejected': return '#ef4444';
        default: return '#64748b';
    }
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
};

export default ScadVideo;
