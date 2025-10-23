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
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    loadAppointments(false);

    // Rafraîchissement automatique toutes les 30 secondes (silencieux)
    const interval = setInterval(() => loadAppointments(true), 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadAppointments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/admin/calendar/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      
      // Convertir les dates string en objets Date et améliorer le titre
      const formattedEvents = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        title: `🚗 ${event.resource.customerName} - ${event.resource.vehicleBrand} ${event.resource.vehicleModel}`,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      if (!silent) setLoading(false);
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
    let backgroundColor = '#3174ad';
    let borderColor = '#2563eb';

    switch (event.resource.status) {
      case 'pending':
      case 'pending_verification':
        backgroundColor = '#f59e0b'; // Orange
        borderColor = '#d97706';
        break;
      case 'confirmed':
        backgroundColor = '#10b981'; // Vert
        borderColor = '#059669';
        break;
      case 'completed':
        backgroundColor = '#6366f1'; // Violet
        borderColor = '#4f46e5';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // Rouge
        borderColor = '#dc2626';
        break;
      default:
        backgroundColor = '#6b7280'; // Gris
        borderColor = '#4b5563';
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '6px',
        opacity: 0.95,
        color: 'white',
        border: 'none',
        display: 'block',
        padding: '4px 8px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      },
    };
  };

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter((e) => e.resource.status === filter);

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: '⏳ En attente',
      pending_verification: '📧 En attente de vérification',
      confirmed: '✅ Confirmé',
      completed: '🎉 Terminé',
      cancelled: '❌ Annulé',
    };
    return labels[status] || status;
  };

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
          <button onClick={() => loadAppointments(false)} className="refresh-btn">
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
            ⏳ En attente ({events.filter(e => e.resource.status === 'pending').length})
          </button>
          <button 
            className={filter === 'confirmed' ? 'active confirmed' : 'confirmed'} 
            onClick={() => setFilter('confirmed')}
          >
            ✅ Confirmés ({events.filter(e => e.resource.status === 'confirmed').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active completed' : 'completed'} 
            onClick={() => setFilter('completed')}
          >
            🎉 Complétés ({events.filter(e => e.resource.status === 'completed').length})
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
            style={{ height: 800 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={getEventStyle}
            messages={messages}
            culture="fr"
            defaultView="week"
            views={['week', 'day', 'agenda']}
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 8, 0, 0)}
            max={new Date(2024, 0, 1, 20, 0, 0)}
            scrollToTime={new Date(2024, 0, 1, 8, 0, 0)}
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
                <p><strong>Date:</strong> {selectedEvent.start ? format(selectedEvent.start, 'dd MMMM yyyy', { locale: fr }) : 'N/A'}</p>
                <p><strong>Heure:</strong> {selectedEvent.resource.time}</p>
                <p><strong>Statut:</strong> 
                  <span className={`status-badge ${selectedEvent.resource.status}`}>
                    {getStatusLabel(selectedEvent.resource.status)}
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
              <h3>⚙️ Changer le statut:</h3>
              <div className="status-buttons">
                {selectedEvent.resource.status !== 'pending' && (
                  <button 
                    onClick={() => updateStatus(selectedEvent.resource.id, 'pending')}
                    className="btn-pending"
                  >
                    ⏳ En attente
                  </button>
                )}
                {selectedEvent.resource.status !== 'confirmed' && (
                  <button 
                    onClick={() => updateStatus(selectedEvent.resource.id, 'confirmed')}
                    className="btn-confirmed"
                  >
                    ✅ Confirmer
                  </button>
                )}
                {selectedEvent.resource.status !== 'completed' && (
                  <button 
                    onClick={() => updateStatus(selectedEvent.resource.id, 'completed')}
                    className="btn-completed"
                  >
                    🎉 Terminer
                  </button>
                )}
                {selectedEvent.resource.status !== 'cancelled' && (
                  <button 
                    onClick={() => updateStatus(selectedEvent.resource.id, 'cancelled')}
                    className="btn-cancelled"
                  >
                    ❌ Annuler
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
