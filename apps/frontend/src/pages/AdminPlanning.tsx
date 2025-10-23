import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AdminPlanning.css';

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface AppointmentEvent extends Event {
  id: number;
  resource: {
    id: number;
    customerName: string;
    email: string;
    phone: string;
    vehicleType: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleRegistration: string;
    time: string;
    status: string;
    notes?: string;
  };
}

const AdminPlanning: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    loadAppointments();
  }, [navigate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/admin/calendar/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      
      // Convertir les dates string en objets Date
      const formattedEvents = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/admin/calendar/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Erreur de mise à jour');

      // Recharger les rendez-vous
      await loadAppointments();
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleSelectEvent = (event: AppointmentEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const getEventStyle = (event: AppointmentEvent) => {
    const statusColors = {
      pending_verification: '#f59e0b',
      pending: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };

    return {
      style: {
        backgroundColor: statusColors[event.resource.status] || '#6b7280',
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.resource.status === filter);

  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucun rendez-vous dans cette période',
  };

  return (
    <div className="admin-planning">
      <div className="planning-header">
        <div className="header-top">
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
            ← Retour au Dashboard
          </button>
          <h1>📅 Planning des Rendez-vous</h1>
          <button onClick={loadAppointments} className="refresh-btn">
            🔄 Actualiser
          </button>
        </div>

        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Tous ({events.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active pending' : 'pending'} 
            onClick={() => setFilter('pending')}
          >
            En attente ({events.filter(e => e.resource.status === 'pending').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active completed' : 'completed'} 
            onClick={() => setFilter('completed')}
          >
            Complétés ({events.filter(e => e.resource.status === 'completed').length})
          </button>
          <button 
            className={filter === 'cancelled' ? 'active cancelled' : 'cancelled'} 
            onClick={() => setFilter('cancelled')}
          >
            Annulés ({events.filter(e => e.resource.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Chargement du planning...</div>
      ) : (
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={getEventStyle}
            messages={messages}
            culture="fr"
            defaultView="week"
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>
      )}

      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails du Rendez-vous #{selectedEvent.resource.id}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">✕</button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h3>👤 Client</h3>
                <p><strong>Nom:</strong> {selectedEvent.resource.customerName}</p>
                <p><strong>Email:</strong> {selectedEvent.resource.email}</p>
                <p><strong>Téléphone:</strong> {selectedEvent.resource.phone}</p>
              </div>

              <div className="info-section">
                <h3>🚗 Véhicule</h3>
                <p><strong>Type:</strong> {selectedEvent.resource.vehicleType}</p>
                <p><strong>Marque:</strong> {selectedEvent.resource.vehicleBrand}</p>
                <p><strong>Modèle:</strong> {selectedEvent.resource.vehicleModel}</p>
                <p><strong>Immatriculation:</strong> {selectedEvent.resource.vehicleRegistration}</p>
              </div>

              <div className="info-section">
                <h3>📅 Rendez-vous</h3>
                <p><strong>Heure:</strong> {selectedEvent.resource.time}</p>
                <p><strong>Statut:</strong> 
                  <span className={`status-badge ${selectedEvent.resource.status}`}>
                    {selectedEvent.resource.status}
                  </span>
                </p>
              </div>

              {selectedEvent.resource.notes && (
                <div className="info-section">
                  <h3>📝 Notes</h3>
                  <p>{selectedEvent.resource.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <h3>Changer le statut:</h3>
              <div className="status-buttons">
                {selectedEvent.resource.status !== 'pending' && (
                  <button 
                    onClick={() => updateStatus(selectedEvent.resource.id, 'pending')}
                    className="btn-pending"
                  >
                    Marquer comme En attente
                  </button>
                )}
                {selectedEvent.resource.status !== 'completed' && (
                  <button 
                    onClick={() => updateStatus(selectedEvent.resource.id, 'completed')}
                    className="btn-completed"
                  >
                    Marquer comme Complété
                  </button>
                )}
                {selectedEvent.resource.status !== 'cancelled' && (
                  <button 
                    onClick={() => updateStatus(selectedEvent.resource.id, 'cancelled')}
                    className="btn-cancelled"
                  >
                    Annuler le RDV
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlanning;
