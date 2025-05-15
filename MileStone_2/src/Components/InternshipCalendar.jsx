import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const InternshipCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateSelect = (selectInfo) => {
    const title = prompt('Please enter the internship cycle name:');
    if (title) {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect(); // clear date selection

      const newEvent = {
        id: Date.now(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      };

      setEvents([...events, newEvent]);
      setSelectedDates({
        start: selectInfo.startStr,
        end: selectInfo.endStr,
      });
    }
  };

  const handleEventClick = (clickInfo) => {
    if (window.confirm(`Are you sure you want to delete the internship cycle '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
      setEvents(events.filter(event => event.id !== clickInfo.event.id));
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={openModal}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          background: '#1746a2',
          color: '#fff',
          fontSize: '0.9375rem',
          fontWeight: 600,
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#0b2e59'}
        onMouseLeave={e => e.currentTarget.style.background = '#1746a2'}
      >
        Manage Internship Cycles
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            width: '91.666667%',
            maxWidth: '56rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700
              }}>Internship Cycle Calendar</h2>
              <button
                onClick={closeModal}
                style={{
                  color: '#6B7280',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                  }}
                  initialView="dayGridMonth"
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={events}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  height="auto"
                />
              </div>
              {selectedDates.start && selectedDates.end && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '0.5rem'
                }}>
                  <h3 style={{
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>Selected Dates:</h3>
                  <p>Start: {new Date(selectedDates.start).toLocaleDateString()}</p>
                  <p>End: {new Date(selectedDates.end).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '0.625rem 1rem',
                  background: 'rgb(23, 70, 162)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#475569'}
                onMouseLeave={e => e.currentTarget.style.background = '#64748B'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InternshipCalendar; 