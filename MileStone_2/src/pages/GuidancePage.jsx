import React, { useState } from 'react';
import SideBar from '../Components/SideBar';
import NavBar from '../Components/NavBar';
import { Lightbulb, BookOpen, GraduationCap, Clock, Calendar, Target, Award, Video, Check, X, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Add this import

const GuidancePage = ({ currentUser }) => {
    const navigate = useNavigate(); // Add this line to use navigation

    // Check if the user is a Pro Student, if not redirect or show message
    const isProStudent = currentUser?.role === 'student' && currentUser?.isProStudent === true;

    // State for appointment management
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [appointmentForm, setAppointmentForm] = useState({
        date: '',
        time: '',
        reason: '',
        type: 'career'  // 'career' or 'report'
    });
    const [appointmentSuccess, setAppointmentSuccess] = useState(false);
    const [appointments, setAppointments] = useState([
        // Sample appointments for demo
        {
            id: 1,
            date: '2023-12-15',
            time: '14:30',
            reason: 'Discuss career opportunities in AI',
            type: 'career',
            status: 'pending',
            studentId: currentUser?.id
        },
        {
            id: 2,
            date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            time: '10:00',
            reason: 'Get clarification on report requirements',
            type: 'report',
            status: 'accepted',
            studentId: currentUser?.id,
            meetingLink: 'https://meet.google.com/abc-defg-hij'
        },
        {
            id: 3,
            date: '2023-12-05',
            time: '16:00',
            reason: 'Discuss internship report feedback',
            type: 'report',
            status: 'rejected',
            studentId: currentUser?.id,
            rejectionReason: 'Advisor unavailable at this time. Please reschedule.'
        }
    ]);

    // For SCAD officers: appointments to review
    const [pendingAppointments, setPendingAppointments] = useState([
        {
            id: 4,
            studentName: "Karim Ahmed",
            date: '2023-12-18',
            time: '13:00',
            reason: 'Need guidance on which industry to pursue',
            type: 'career',
            status: 'pending',
            studentId: 6
        },
        {
            id: 5,
            studentName: "Layla Mohamed",
            date: '2023-12-19',
            time: '11:30',
            reason: 'Questions about my rejected report',
            type: 'report',
            status: 'pending',
            studentId: 7
        }
    ]);

    // Handle appointment form submission
    const handleAppointmentSubmit = (e) => {
        e.preventDefault();

        // Create new appointment
        const newAppointment = {
            id: Date.now(),
            ...appointmentForm,
            status: 'pending',
            studentId: currentUser?.id
        };

        // Add to appointments list
        setAppointments(prev => [...prev, newAppointment]);

        // Add notification to SCAD admin
        if (currentUser?.addNotification) {
            const scadAdmin = { addNotification: (msg) => console.log("SCAD notification:", msg) }; // Mock SCAD admin
            scadAdmin.addNotification(`New appointment request from ${currentUser.username} for ${appointmentForm.date} at ${appointmentForm.time}`);
        }

        // Reset form and show success message
        setAppointmentForm({
            date: '',
            time: '',
            reason: '',
            type: 'career'
        });
        setAppointmentSuccess(true);
        setTimeout(() => {
            setAppointmentSuccess(false);
            setShowAppointmentModal(false);
        }, 2000);
    };

    // Handle form input changes
    const handleAppointmentChange = (e) => {
        const { name, value } = e.target;
        setAppointmentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle appointment status change (for SCAD officers and students accepting/rejecting appointments)
    const handleAppointmentStatusChange = (appointmentId, newStatus, meetingLink = '', rejectionReason = '') => {
        // Update pending appointments list if this is a SCAD officer
        if (currentUser?.role === 'scad') {
            setPendingAppointments(prev =>
                prev.filter(appointment => appointment.id !== appointmentId)
            );
        } else {
            // For students accepting/rejecting their own appointments
            setAppointments(prev =>
                prev.map(appointment =>
                    appointment.id === appointmentId
                        ? {
                            ...appointment, status: newStatus,
                            meetingLink: newStatus === 'accepted' ? meetingLink || appointment.meetingLink : null,
                            rejectionReason: newStatus === 'rejected' ? rejectionReason || 'Appointment cancelled by student' : null
                        }
                        : appointment
                )
            );
        }

        // Mock notification to student
        const studentToNotify = { addNotification: (msg) => console.log("Student notification:", msg) };
        if (newStatus === 'accepted') {
            studentToNotify.addNotification(`Your appointment request for ${pendingAppointments.find(a => a.id === appointmentId)?.date} has been accepted. Meeting link: ${meetingLink}`);
        } else {
            studentToNotify.addNotification(`Your appointment request for ${pendingAppointments.find(a => a.id === appointmentId)?.date} has been declined. Reason: ${rejectionReason}`);
        }

        // Add notification to current user if they're a student
        if (currentUser?.role === 'student') {
            setTimeout(() => {
                if (currentUser?.addNotification) {
                    if (newStatus === 'accepted') {
                        currentUser.addNotification(`Your appointment for ${pendingAppointments.find(a => a.id === appointmentId)?.date || 'the requested date'} has been accepted`);
                    } else {
                        currentUser.addNotification(`Your appointment for ${pendingAppointments.find(a => a.id === appointmentId)?.date || 'the requested date'} has been rejected`);
                    }
                }
            }, 2000); // Simulated delay for demo purposes
        }
    };

    // Add these navigation handlers
    const handleNavigateToAssessments = () => {
        navigate('/assessments');
    };

    const handleNavigateToWorkshops = () => {
        navigate('/workshops');
    };

    if (!isProStudent) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
                <SideBar userRole="student" currentUser={currentUser} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <NavBar currentUser={currentUser} />
                    <div style={{ padding: '2rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                            maxWidth: '500px',
                            padding: '2rem',
                            textAlign: 'center',
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <Award size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Pro Student Access Only</h2>
                            <p style={{ color: '#64748b' }}>
                                This page is exclusively available to Pro Students who have completed at least 3 months of internships.
                                Continue building your experience to unlock this feature.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <SideBar userRole={currentUser?.role?.toLowerCase() || 'student'} currentUser={currentUser} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <NavBar currentUser={currentUser} />
                <div style={{ padding: '2rem', flex: 1 }}>
                    <h1 style={{ fontWeight: '700', fontSize: '28px', marginBottom: '1.5rem' }}>Pro Student Guidance</h1>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',  // Changed to 3 fixed columns instead of responsive
                        gap: '1rem',  // Reduced gap from 1.5rem to 1rem
                        marginBottom: '2rem'
                    }}>
                        <div
                            style={{
                                padding: '1.25rem', // Reduced padding from 1.5rem
                                background: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                minWidth: 0, // Ensure cards can shrink below minimum content size
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }
                            }}
                            onClick={() => setShowAppointmentModal(true)}
                        >
                            <div style={{
                                width: '40px', // Reduced from 48px
                                height: '40px', // Reduced from 48px
                                borderRadius: '8px',
                                background: '#e0f2fe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.75rem' // Reduced from 1rem
                            }}>
                                <Video size={20} color="#0ea5e9" /> {/* Reduced from size 24 */}
                            </div>
                            <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '0.5rem' }}>Request Guidance Appointment</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.4', fontSize: '14px' }}>Schedule a one-on-one video call with an academic advisor for guidance.</p>
                            <button
                                style={{
                                    background: '#0ea5e9',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 14px', // Reduced padding
                                    marginTop: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px' // Added smaller font
                                }}
                                onClick={() => setShowAppointmentModal(true)}
                            >
                                Request Appointment
                            </button>
                        </div>
                        <div style={{
                            padding: '1.25rem',
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            minWidth: 0
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '8px',
                                background: '#fef9c3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.75rem'
                            }}>
                                <Target size={20} color="#eab308" />
                            </div>
                            <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '0.5rem' }}>Online Assessments</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.4', fontSize: '14px' }}>Take professional skill assessments and track your progress with detailed analytics.</p>
                            {/* Add button to navigate to assessments page */}
                            <button
                                onClick={handleNavigateToAssessments}
                                style={{
                                    background: '#eab308',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 14px',
                                    marginTop: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Take Assessments
                            </button>
                        </div>
                        <div style={{
                            padding: '1.25rem',
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            minWidth: 0
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '8px',
                                background: '#dcfce7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.75rem'
                            }}>
                                <GraduationCap size={20} color="#10b981" />
                            </div>
                            <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '0.5rem' }}>Career Workshops</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.4', fontSize: '14px' }}>Browse and register for exclusive workshops focused on industry-specific skills.</p>
                            {/* Add button to navigate to workshops page */}
                            <button
                                onClick={handleNavigateToWorkshops}
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 14px',
                                    marginTop: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Browse Workshops
                            </button>
                        </div>
                    </div>

                    {/* My Appointments Section */}
                    <h2 style={{ fontWeight: '600', fontSize: '22px', marginBottom: '1rem' }}>My Appointments</h2>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                        }}>
                            {appointments.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                    You haven't scheduled any appointments yet.
                                </div>
                            ) : (
                                appointments.map((appointment, idx) => (
                                    <AppointmentItem
                                        key={idx}
                                        appointment={appointment}
                                        isLast={idx === appointments.length - 1}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* For SCAD Officers: Pending Appointments to Review */}
                    {currentUser?.role === 'scad' && (
                        <>
                            <h2 style={{ fontWeight: '600', fontSize: '22px', marginBottom: '1rem' }}>Pending Appointment Requests</h2>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    overflow: 'hidden',
                                }}>
                                    {pendingAppointments.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                            No pending appointment requests.
                                        </div>
                                    ) : (
                                        pendingAppointments.map((appointment, idx) => (
                                            <PendingAppointmentItem
                                                key={idx}
                                                appointment={appointment}
                                                isLast={idx === pendingAppointments.length - 1}
                                                onAccept={() => handleAppointmentStatusChange(appointment.id, 'accepted', 'https://meet.google.com/abc-defg-hij')}
                                                onReject={() => handleAppointmentStatusChange(appointment.id, 'rejected', '', 'Schedule conflict with another appointment')}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Removed: Upcoming Opportunities and Career Development sections */}
                </div>
            </div>

            {/* Appointment Request Modal */}
            {showAppointmentModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '500px',
                        padding: '2rem',
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        {appointmentSuccess ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem 0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    background: '#dcfce7',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Check size={30} color="#16a34a" />
                                </div>
                                <h3 style={{ fontWeight: '600', fontSize: '20px' }}>Appointment Requested!</h3>
                                <p style={{ color: '#64748b' }}>You'll receive a notification when your request is reviewed.</p>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowAppointmentModal(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        color: '#64748b'
                                    }}
                                >
                                    &times;
                                </button>
                                <h2 style={{ fontWeight: '600', fontSize: '20px', marginBottom: '1.5rem' }}>Request an Appointment</h2>
                                <form onSubmit={handleAppointmentSubmit}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label
                                            htmlFor="appointment-type"
                                            style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Appointment Type
                                        </label>
                                        <select
                                            id="appointment-type"
                                            name="type"
                                            value={appointmentForm.type}
                                            onChange={handleAppointmentChange}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}
                                            required
                                        >
                                            <option value="career">Career Guidance</option>
                                            <option value="report">Report Clarification</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label
                                            htmlFor="appointment-date"
                                            style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Preferred Date
                                        </label>
                                        <input
                                            id="appointment-date"
                                            type="date"
                                            name="date"
                                            value={appointmentForm.date}
                                            onChange={handleAppointmentChange}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label
                                            htmlFor="appointment-time"
                                            style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Preferred Time
                                        </label>
                                        <input
                                            id="appointment-time"
                                            type="time"
                                            name="time"
                                            value={appointmentForm.time}
                                            onChange={handleAppointmentChange}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label
                                            htmlFor="appointment-reason"
                                            style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Reason for Appointment
                                        </label>
                                        <textarea
                                            id="appointment-reason"
                                            name="reason"
                                            value={appointmentForm.reason}
                                            onChange={handleAppointmentChange}
                                            placeholder="Please describe what you'd like to discuss in this appointment..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                minHeight: '100px'
                                            }}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: '#0ea5e9',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Submit Request
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Appointment card component for student's appointments
const AppointmentItem = ({ appointment, isLast }) => {
    const navigate = useNavigate(); // Add useNavigate hook here

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return {
                    bg: '#fef9c3',
                    color: '#b45309',
                    icon: <Clock size={16} />,
                    text: 'Pending'
                };
            case 'accepted':
                return {
                    bg: '#dcfce7',
                    color: '#16a34a',
                    icon: <Check size={16} />,
                    text: 'Accepted'
                };
            case 'rejected':
                return {
                    bg: '#fee2e2',
                    color: '#ef4444',
                    icon: <X size={16} />,
                    text: 'Rejected'
                };
            default:
                return {
                    bg: '#e2e8f0',
                    color: '#64748b',
                    icon: <Info size={16} />,
                    text: status
                };
        }
    };

    const statusInfo = getStatusInfo(appointment.status);

    // Replace showAcceptReject with showRejectModal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    return (
        <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', fontSize: '16px' }}>
                    {appointment.type === 'career' ? 'Career Guidance' : 'Report Clarification'}
                </h4>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    fontSize: '12px',
                    fontWeight: '500'
                }}>
                    {statusInfo.icon}
                    {statusInfo.text}
                </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '0.75rem' }}>{appointment.reason}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: appointment.status === 'accepted' || appointment.status === 'rejected' ? '0.75rem' : '0' }}>
                <div><strong>Date:</strong> {appointment.date}</div>
                <div><strong>Time:</strong> {appointment.time}</div>
            </div>

            {/* Replace the old pending section with direct buttons */}
            {appointment.status === 'pending' && (
                <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px'
                }}>
                    <button
                        onClick={() => {
                            handleAppointmentStatusChange(appointment.id, 'accepted', 'https://meet.google.com/generated-link');
                        }}
                        style={{
                            background: '#15803d', // Darker green color
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            color: 'white', // Changed to white for better contrast
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            maxWidth: '100px'
                        }}
                    >
                        <Check size={12} /> {/* Increased from 14px to 16px */}
                        Accept
                    </button>
                    <button
                        onClick={() => setShowRejectModal(true)}
                        style={{
                            background: '#b91c1c', // Darker red color
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            color: 'white', // Changed to white for better contrast
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            maxWidth: '100px'
                        }}
                    >
                        <X size={12} /> {/* Increased from 14px to 16px */}
                        Reject
                    </button>
                </div>
            )}

            {/* Add the modal for rejection reason */}
            {showRejectModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            marginBottom: '1rem'
                        }}>
                            Rejection Reason
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            marginBottom: '1rem'
                        }}>
                            Please provide a reason for rejecting this appointment:
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                marginBottom: '1rem',
                                minHeight: '100px',
                                fontSize: '14px'
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px'
                        }}>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                style={{
                                    background: '#e2e8f0',
                                    color: '#1e293b',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 16px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleAppointmentStatusChange(
                                        appointment.id,
                                        'rejected',
                                        '',
                                        rejectionReason.trim() || 'Cancelled by student'
                                    );
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                style={{
                                    background: '#b91c1c', // Darker red color to match reject button
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 16px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {appointment.status === 'accepted' && (
                <div style={{
                    marginTop: '0.5rem',
                    background: '#f0f9ff',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span><strong>Meeting scheduled</strong> for {appointment.date} at {appointment.time}</span>
                    <button
                        onClick={() => navigate('/student/video')} // Fixed path to the video calls page
                        style={{
                            background: '#1746a2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px'
                        }}
                    >
                        <Video size={16} />
                        Join Meeting
                    </button>
                </div>
            )}

            {appointment.status === 'rejected' && appointment.rejectionReason && (
                <div style={{
                    marginTop: '0.5rem',
                    background: '#fef2f2',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                }}>
                    <AlertCircle size={18} style={{ marginTop: '2px' }} />
                    <div>
                        <strong>Reason:</strong> {appointment.rejectionReason}
                    </div>
                </div>
            )}
        </div>
    );
};

// Pending appointment component for SCAD officers
const PendingAppointmentItem = ({ appointment, isLast, onAccept, onReject }) => {
    return (
        <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', fontSize: '16px' }}>{appointment.studentName}</h4>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#fef9c3',
                    color: '#b45309',
                    fontSize: '12px',
                    fontWeight: '500'
                }}>
                    <Clock size={16} />
                    Pending
                </div>
            </div>
            <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500', marginBottom: '0.5rem' }}>
                {appointment.type === 'career' ? 'Career Guidance' : 'Report Clarification'}
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '0.75rem' }}>{appointment.reason}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '1rem' }}>
                <div><strong>Date:</strong> {appointment.date}</div>
                <div><strong>Time:</strong> {appointment.time}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={onAccept}
                    style={{
                        flex: 1,
                        padding: '8px 16px',
                        background: '#dcfce7',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#16a34a',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Check size={16} />
                    Accept
                </button>
                <button
                    onClick={onReject}
                    style={{
                        flex: 1,
                        padding: '8px 16px',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ef4444',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <X size={16} />
                    Reject
                </button>
            </div>
        </div>
    );
};

const GuidanceCard = ({ icon, iconBg, title, description, iconSize = 40 }) => (
    <div style={{
        padding: '1.25rem', // Reduced padding
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minWidth: 0 // Ensure cards can shrink below minimum content size
    }}>
        <div style={{
            width: iconSize, // Use the prop value instead of hardcoded
            height: iconSize, // Use the prop value instead of hardcoded
            borderRadius: '8px',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem' // Reduced from 1rem
        }}>
            {icon}
        </div>
        <h3 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: '#64748b', lineHeight: '1.4', fontSize: '14px' }}>{description}</p>
    </div>
);

// Remove OpportunityItem component since it's no longer used

// Remove opportunities data array since it's no longer used

export default GuidancePage;
