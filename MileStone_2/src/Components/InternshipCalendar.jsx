import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { X } from 'lucide-react';
import { mockUsers } from '../DummyData/mockUsers';

const InternshipCalendar = () => {
  const [cycles, setCycles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleStart, setCycleStart] = useState('');
  const [cycleEnd, setCycleEnd] = useState('');

  const handleAddCycle = (e) => {
    e.preventDefault();
    if (!cycleName || !cycleStart || !cycleEnd) return;
    setCycles([...cycles, {
      id: Date.now(),
      name: cycleName,
      start: cycleStart,
      end: cycleEnd
    }]);
    // Send notification to all students
    mockUsers.forEach(user => {
      if (user.role === 'student' && typeof user.addNotification === 'function') {
        user.addNotification(`A new internship cycle (${cycleName}) is starting on ${cycleStart}`);
      }
    });
    setCycleName('');
    setCycleStart('');
    setCycleEnd('');
    setShowForm(false);
  };

  const handleDeleteCycle = (id) => {
    setCycles(cycles.filter(cycle => cycle.id !== id));
  };

  return (
    <div style={{ background: '#fff', borderRadius: '1.25rem', boxShadow: '0 8px 32px rgba(23,70,162,0.10), 0 1.5px 6px rgba(0,0,0,0.08)', border: '1.5px solid #e5e7eb', padding: '1.25rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1746a2' }}>Internship Cycles</h2>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', transition: 'background 0.2s', display: showForm ? 'none' : 'inline-block' }}
        >
          Add New Cycle
        </button>
      </div>
      {showForm && (
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <button
            onClick={() => setShowForm(false)}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              background: '#64748b',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <form onSubmit={handleAddCycle} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', paddingTop: 8, paddingRight: 36 }}>
            <input
              type="text"
              placeholder="Cycle Name"
              value={cycleName}
              onChange={e => setCycleName(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, minWidth: 120 }}
              required
            />
            <input
              type="date"
              value={cycleStart}
              onChange={e => setCycleStart(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, minWidth: 120 }}
              required
            />
            <input
              type="date"
              value={cycleEnd}
              onChange={e => setCycleEnd(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, minWidth: 120 }}
              required
            />
            <button
              type="submit"
              style={{ background: '#1746a2', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              Save
            </button>
          </form>
        </div>
      )}
      <div>
        {cycles.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 15, textAlign: 'center', marginTop: 24 }}>No cycles added yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#334155', fontWeight: 700 }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Start Date</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>End Date</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map(cycle => (
                <tr key={cycle.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px' }}>{cycle.name}</td>
                  <td style={{ padding: '8px' }}>{cycle.start}</td>
                  <td style={{ padding: '8px' }}>{cycle.end}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteCycle(cycle.id)}
                      style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InternshipCalendar; 