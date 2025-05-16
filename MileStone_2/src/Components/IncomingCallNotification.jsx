import React, { useState, useEffect } from 'react';
import { Phone, X } from 'lucide-react';

const IncomingCallNotification = ({ onAccept, onReject }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept?.();
  };

  const handleReject = () => {
    setIsVisible(false);
    onReject?.();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '16px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '300px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone style={{ color: '#1746a2', width: '20px', height: '20px' }} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Incoming Call</span>
        </div>
        <button
          onClick={handleReject}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X style={{ width: '20px', height: '20px', color: '#6B7280' }} />
        </button>
      </div>
      
      <div style={{ color: '#4B5563', fontSize: '14px' }}>
        Call duration: {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleAccept}
          style={{
            flex: 1,
            backgroundColor: '#1746a2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          style={{
            flex: 1,
            backgroundColor: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default IncomingCallNotification; 