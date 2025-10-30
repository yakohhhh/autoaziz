import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, getDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AdminPlanning.css';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // Commence le lundi
  getDay,
  locales,
});

interface AppointmentEvent extends Event {
  id: number;
  start: Date;
  end: Date;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // Date de navigation
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // États du formulaire de création
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licensePlate: '',
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    fuelType: '',
    appointmentDate: '',
    source: '',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const loadAppointments = async (silent = false) => {
    try {
      // Sauvegarder la position de scroll avant le rechargement
      const currentScrollTop = window.scrollY || window.pageYOffset;

      if (!silent) setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        'http://localhost:3001/admin/calendar/appointments',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();

      // Convertir les dates string en objets Date et améliorer le titre
      const formattedEvents = data.map((event: any) => {
        const isManual = event.resource.notes?.includes('[MANUEL]') || false;
        const sourceIcon = isManual ? '🟢' : '🌐';

        return {
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          title: `${sourceIcon} ${event.resource.customerName}\n${event.resource.vehicleBrand} ${event.resource.vehicleModel}\n📞 ${event.resource.phone}`,
        };
      });

      setEvents(formattedEvents);

      // Restaurer la position de scroll après le rechargement
      if (currentScrollTop > 0) {
        setTimeout(() => {
          window.scrollTo({
            top: currentScrollTop,
            behavior: 'auto', // Pas de smooth pour éviter l'animation
          });
        }, 50);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:3001/admin/calendar/appointments/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error('Erreur de mise à jour');

      // Déclencher un événement pour mettre à jour les stats dans la page Clients
      localStorage.setItem('appointment_status_changed', Date.now().toString());
      
      // Recharger les rendez-vous
      await loadAppointments();
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteAppointment = async (reason: string, note: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:3001/admin/calendar/appointments/${appointmentToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason,
            note,
            deletedBy: localStorage.getItem('userName') || 'Admin',
          }),
        }
      );

      if (response.ok) {
        // Fermer immédiatement les modals
        setShowDeleteModal(false);
        setAppointmentToDelete(null);
        setShowModal(false);
        setSelectedEvent(null);
        
        // Recharger les rendez-vous
        await loadAppointments();
        
        alert(
          '✅ Rendez-vous supprimé ! Le créneau est maintenant disponible.'
        );
      } else {
        const error = await response.json();
        console.error('Erreur suppression:', error);
        alert(
          '❌ Erreur lors de la suppression: ' +
            (error.message || 'Erreur inconnue')
        );
        setShowDeleteModal(false);
        setAppointmentToDelete(null);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression du rendez-vous');
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        'http://localhost:3001/admin/calendar/appointments/manual',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création');
      }

      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licensePlate: '',
        vehicleType: '',
        vehicleBrand: '',
        vehicleModel: '',
        fuelType: '',
        appointmentDate: '',
        source: '',
        notes: '',
      });

      setShowCreateModal(false);
      loadAppointments(false);
      alert('✅ Rendez-vous créé avec succès !');
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSelectEvent = (event: AppointmentEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const getEventStyle = (event: AppointmentEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#2563eb';

    // Différenciation par source : Manuel (vert) vs En ligne (jaune)
    const isManual = event.resource.notes?.includes('[MANUEL]') || false;

    if (event.resource.status === 'cancelled') {
      // Rouge pour annulé
      backgroundColor = '#ef4444';
      borderColor = '#dc2626';
    } else if (isManual) {
      // Vert pour RDV manuel (enregistré par admin)
      backgroundColor = '#10b981';
      borderColor = '#059669';
    } else {
      // Jaune pour RDV en ligne (pris par client)
      backgroundColor = '#fbbf24';
      borderColor = '#f59e0b';
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '6px',
        opacity: 0.95,
        color: event.resource.status === 'cancelled' ? 'white' : '#1f2937',
        border: 'none',
        display: 'block',
        padding: '6px 10px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        transition: 'all 0.2s ease',
      },
    };
  };

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter(e => e.resource.status === filter);

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      pending_verification: 'En attente de vérification',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
      no_show: 'Absent',
    };
    return labels[status] || status;
  };

  // Composant personnalisé pour afficher le header avec bouton +
  const CustomDayHeader = ({ date, label }: { date: Date; label: string }) => {
    return (
      <div className='custom-day-header'>
        <div className='day-label'>{label}</div>
        <button
          className='add-appointment-btn'
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedDate(date);
            setShowCreateModal(true);
          }}
          title='Ajouter un rendez-vous'
        >
          +
        </button>
      </div>
    );
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
    <div className='admin-dashboard'>
      <aside className='sidebar'>
        <div className='sidebar-header'>
          <h2>AUTOSUR</h2>
          <p>Admin Panel</p>
        </div>

        <nav className='sidebar-nav'>
          <a href='/admin/dashboard' className='nav-item'>
            <span className='icon'>📊</span>
            <span>Tableau de bord</span>
          </a>
          <a href='/admin/planning' className='nav-item active'>
            <span className='icon'>📅</span>
            <span>Planning</span>
          </a>
          <a href='/admin/customers' className='nav-item'>
            <span className='icon'>👥</span>
            <span>Clients</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>📈</span>
            <span>Statistiques</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>💰</span>
            <span>Finances</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>🎁</span>
            <span>Promotions</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>📧</span>
            <span>Messages</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>⚙️</span>
            <span>Paramètres</span>
          </a>
        </nav>

        <div className='sidebar-footer'>
          <button onClick={handleLogout} className='logout-button'>
            <span className='icon'>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className='main-content'>
        <div className='admin-planning'>
          <div className='planning-header'>
            <div className='header-compact'>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className='icon-btn back-btn'
                title='Retour au Dashboard'
              >
                ← Dashboard
              </button>

              <input
                type='date'
                className='date-picker'
                value={format(currentDate, 'yyyy-MM-dd')}
                onChange={e => setCurrentDate(new Date(e.target.value))}
                title='Choisir une date'
              />

              <div className='filters-compact'>
                <button
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => setFilter('all')}
                  title='Tous les rendez-vous'
                >
                  Tous ({events.length})
                </button>
                <button
                  className={
                    filter === 'pending' ? 'active pending' : 'pending'
                  }
                  onClick={() => setFilter('pending')}
                  title='En attente'
                >
                  ⏳{' '}
                  {events.filter(e => e.resource.status === 'pending').length}
                </button>
                <button
                  className={
                    filter === 'confirmed' ? 'active confirmed' : 'confirmed'
                  }
                  onClick={() => setFilter('confirmed')}
                  title='Confirmés'
                >
                  ✅{' '}
                  {events.filter(e => e.resource.status === 'confirmed').length}
                </button>
                <button
                  className={
                    filter === 'completed' ? 'active completed' : 'completed'
                  }
                  onClick={() => setFilter('completed')}
                  title='Complétés'
                >
                  🎉{' '}
                  {events.filter(e => e.resource.status === 'completed').length}
                </button>
                <button
                  className={
                    filter === 'cancelled' ? 'active cancelled' : 'cancelled'
                  }
                  onClick={() => setFilter('cancelled')}
                  title='Annulés'
                >
                  ❌{' '}
                  {events.filter(e => e.resource.status === 'cancelled').length}
                </button>
              </div>

              <button
                onClick={() => loadAppointments(false)}
                className='icon-btn refresh-btn'
                title='Actualiser le planning'
              >
                🔄
              </button>
            </div>
          </div>

          {loading ? (
            <div className='loading'>Chargement du planning...</div>
          ) : (
            <div className='calendar-container'>
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor='start'
                endAccessor='end'
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={getEventStyle}
                messages={messages}
                culture='fr'
                defaultView='week'
                views={['week', 'day', 'agenda']}
                step={15}
                timeslots={1}
                min={new Date(2024, 0, 1, 7, 0, 0)}
                max={new Date(2024, 0, 1, 20, 0, 0)}
                scrollToTime={new Date(2024, 0, 1, 7, 0, 0)}
                date={currentDate}
                onNavigate={(newDate: Date) => setCurrentDate(newDate)}
                components={{
                  week: {
                    header: CustomDayHeader,
                  },
                }}
              />
            </div>
          )}

          {showModal && selectedEvent && (
            <div className='modal-overlay' onClick={() => setShowModal(false)}>
              <div className='modal-content' onClick={e => e.stopPropagation()}>
                <div className='modal-header'>
                  <h2>Détails du Rendez-vous #{selectedEvent.resource.id}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className='close-btn'
                  >
                    ✕
                  </button>
                </div>

                <div className='modal-body'>
                  <div className='info-section'>
                    <h3>👤 Client</h3>
                    <p>
                      <strong>Nom:</strong>{' '}
                      {selectedEvent.resource.customerName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedEvent.resource.email}
                    </p>
                    <p>
                      <strong>Téléphone:</strong> {selectedEvent.resource.phone}
                    </p>
                  </div>

                  <div className='info-section'>
                    <h3>🚗 Véhicule</h3>
                    <p>
                      <strong>Type:</strong>{' '}
                      {selectedEvent.resource.vehicleType}
                    </p>
                    <p>
                      <strong>Marque:</strong>{' '}
                      {selectedEvent.resource.vehicleBrand}
                    </p>
                    <p>
                      <strong>Modèle:</strong>{' '}
                      {selectedEvent.resource.vehicleModel}
                    </p>
                    <p>
                      <strong>Immatriculation:</strong>{' '}
                      {selectedEvent.resource.vehicleRegistration}
                    </p>
                  </div>

                  <div className='info-section'>
                    <h3>📅 Rendez-vous</h3>
                    <p>
                      <strong>Date:</strong>{' '}
                      {selectedEvent.start
                        ? format(selectedEvent.start, 'dd MMMM yyyy', {
                            locale: fr,
                          })
                        : 'N/A'}
                    </p>
                    <p>
                      <strong>Heure:</strong> {selectedEvent.resource.time}
                    </p>
                    <p>
                      <strong>Source:</strong>{' '}
                      {selectedEvent.resource.notes?.includes('[MANUEL]') ? (
                        <span className='source-badge manual'>
                          🟢 RDV Manuel
                        </span>
                      ) : (
                        <span className='source-badge online'>
                          🌐 RDV En Ligne
                        </span>
                      )}
                    </p>
                    <p>
                      <strong>Statut:</strong>
                      <span
                        className={`status-badge ${selectedEvent.resource.status}`}
                      >
                        {getStatusLabel(selectedEvent.resource.status)}
                      </span>
                    </p>
                  </div>

                  {selectedEvent.resource.notes && (
                    <div className='info-section'>
                      <h3>📝 Notes</h3>
                      <p>{selectedEvent.resource.notes}</p>
                    </div>
                  )}
                </div>

                <div className='modal-actions'>
                  <h3>⚙️ Actions Rapides</h3>
                  <div className='status-buttons-grid'>
                    <button
                      onClick={() =>
                        updateStatus(selectedEvent.resource.id, 'confirmed')
                      }
                      className='status-btn status-btn-confirmed'
                      disabled={selectedEvent.resource.status === 'confirmed'}
                    >
                      <span className='status-icon'>✅</span>
                      <span className='status-text'>Confirmer</span>
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(selectedEvent.resource.id, 'completed')
                      }
                      className='status-btn status-btn-completed'
                      disabled={selectedEvent.resource.status === 'completed'}
                    >
                      <span className='status-icon'>🎉</span>
                      <span className='status-text'>Terminé</span>
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(selectedEvent.resource.id, 'no_show')
                      }
                      className='status-btn status-btn-no-show'
                      disabled={selectedEvent.resource.status === 'no_show'}
                    >
                      <span className='status-icon'>🚫</span>
                      <span className='status-text'>Absent</span>
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(selectedEvent.resource.id, 'cancelled')
                      }
                      className='status-btn status-btn-cancelled'
                      disabled={selectedEvent.resource.status === 'cancelled'}
                    >
                      <span className='status-icon'>❌</span>
                      <span className='status-text'>Annuler</span>
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <button
                      onClick={() => {
                        setAppointmentToDelete(selectedEvent.resource.id);
                        setShowDeleteModal(true);
                      }}
                      className='btn-delete-appointment'
                    >
                      <span>🗑️</span>
                      <span>Supprimer le RDV</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de suppression */}
          {showDeleteModal && appointmentToDelete && (
            <DeleteConfirmModal
              show={showDeleteModal}
              title='Supprimer ce rendez-vous'
              message='Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Le créneau sera libéré et redeviendra disponible.'
              itemName={
                selectedEvent
                  ? `${selectedEvent.resource.customerName} - ${selectedEvent.resource.time}`
                  : 'Rendez-vous'
              }
              onConfirm={handleDeleteAppointment}
              onCancel={() => {
                setShowDeleteModal(false);
                setAppointmentToDelete(null);
              }}
            />
          )}

          {/* Modal de création de RDV */}
          {showCreateModal && selectedDate && (
            <div
              className='modal-overlay'
              onClick={() => {
                setShowCreateModal(false);
                setFormError('');
              }}
            >
              <div
                className='modal-content create-modal'
                onClick={e => e.stopPropagation()}
              >
                <div className='modal-header'>
                  <h2>➕ Nouveau Rendez-vous</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormError('');
                    }}
                    className='close-btn'
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateAppointment} className='modal-body'>
                  <p className='selected-date-info'>
                    📅{' '}
                    {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>

                  {formError && (
                    <div className='error-message'>❌ {formError}</div>
                  )}

                  <div className='source-selection'>
                    <h3>📞 Source du rendez-vous *</h3>
                    <div className='source-buttons'>
                      <button
                        type='button'
                        className={`source-btn phone ${formData.source === 'phone' ? 'active' : ''}`}
                        onClick={() =>
                          setFormData({ ...formData, source: 'phone' })
                        }
                      >
                        📞 Par téléphone
                      </button>
                      <button
                        type='button'
                        className={`source-btn center ${formData.source === 'center' ? 'active' : ''}`}
                        onClick={() =>
                          setFormData({ ...formData, source: 'center' })
                        }
                      >
                        🏢 Au centre
                      </button>
                    </div>
                  </div>

                  <div className='form-section'>
                    <h3>👤 Informations client</h3>
                    <div className='form-row'>
                      <div className='form-group'>
                        <label>Prénom *</label>
                        <input
                          type='text'
                          value={formData.firstName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          required
                          placeholder='Jean'
                        />
                      </div>
                      <div className='form-group'>
                        <label>Nom *</label>
                        <input
                          type='text'
                          value={formData.lastName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          required
                          placeholder='Dupont'
                        />
                      </div>
                    </div>

                    <div className='form-row'>
                      <div className='form-group'>
                        <label>Email *</label>
                        <input
                          type='email'
                          value={formData.email}
                          onChange={e =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          placeholder='jean.dupont@email.com'
                        />
                      </div>
                      <div className='form-group'>
                        <label>Téléphone *</label>
                        <input
                          type='tel'
                          value={formData.phone}
                          onChange={e =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                          placeholder='06 12 34 56 78'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='form-section'>
                    <h3>🚗 Véhicule</h3>
                    <div className='form-group'>
                      <label>Type de véhicule *</label>
                      <select
                        value={formData.vehicleType}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            vehicleType: e.target.value,
                          })
                        }
                        required
                      >
                        <option value=''>Sélectionnez un type</option>
                        <option value='Voiture'>Voiture</option>
                        <option value='Moto'>Moto</option>
                        <option value='Quad'>Quad</option>
                        <option value='Scooter'>Scooter</option>
                        <option value='Utilitaire léger'>
                          Utilitaire léger
                        </option>
                      </select>
                    </div>

                    <div className='form-row'>
                      <div className='form-group'>
                        <label>Marque *</label>
                        <input
                          type='text'
                          value={formData.vehicleBrand}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              vehicleBrand: e.target.value,
                            })
                          }
                          required
                          placeholder='Peugeot'
                        />
                      </div>
                      <div className='form-group'>
                        <label>Modèle *</label>
                        <input
                          type='text'
                          value={formData.vehicleModel}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              vehicleModel: e.target.value,
                            })
                          }
                          required
                          placeholder='208'
                        />
                      </div>
                    </div>

                    <div className='form-row'>
                      <div className='form-group'>
                        <label>Immatriculation *</label>
                        <input
                          type='text'
                          value={formData.licensePlate}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              licensePlate: e.target.value,
                            })
                          }
                          required
                          placeholder='AB-123-CD'
                        />
                      </div>
                      <div className='form-group'>
                        <label>Type de carburant *</label>
                        <select
                          value={formData.fuelType}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              fuelType: e.target.value,
                            })
                          }
                          required
                        >
                          <option value=''>Sélectionnez</option>
                          <option value='Essence'>Essence</option>
                          <option value='Diesel'>Diesel</option>
                          <option value='Hybride'>Hybride</option>
                          <option value='Électrique'>Électrique</option>
                          <option value='GPL'>GPL</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className='form-section'>
                    <h3>📅 Date et heure *</h3>
                    <div className='form-group'>
                      <input
                        type='datetime-local'
                        value={formData.appointmentDate}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            appointmentDate: e.target.value,
                          })
                        }
                        required
                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      />
                    </div>
                  </div>

                  <div className='form-section'>
                    <h3>📝 Notes (optionnel)</h3>
                    <div className='form-group'>
                      <textarea
                        value={formData.notes}
                        onChange={e =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder='Informations supplémentaires...'
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className='modal-actions'>
                    <button
                      type='button'
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormError('');
                      }}
                      className='btn-secondary'
                      disabled={formLoading}
                    >
                      Annuler
                    </button>
                    <button
                      type='submit'
                      className='btn-primary'
                      disabled={formLoading || !formData.source}
                    >
                      {formLoading ? '⏳ Création...' : '✅ Créer le RDV'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPlanning;
