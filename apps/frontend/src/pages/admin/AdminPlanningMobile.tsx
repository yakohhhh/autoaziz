import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPlanningMobile.css';
import { API_CONFIG } from '../../constants/app.constants';

interface Appointment {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes?: string;
}

interface TimeSlot {
  hour: number;
  minute: number;
  display: string;
}

const AdminPlanningMobile: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: string;
  } | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [blockedSlotsData, setBlockedSlotsData] = useState<
    Map<string, { id: number; reason: string }>
  >(new Map());
  const [selectedBlockedSlot, setSelectedBlockedSlot] = useState<{
    key: string;
    id: number;
    date: Date;
    time: string;
    reason: string;
  } | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licensePlate: '',
    vehicleType: 'Voiture',
    vehicleBrand: '',
    vehicleModel: '',
    fuelType: 'Essence',
    appointmentDate: '',
    source: 'manual',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Appointment | null>(null);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Générer les créneaux horaires de 7h à 19h par tranche de 15 minutes
  const timeSlots: TimeSlot[] = [];
  for (let hour = 7; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 30) break;
      timeSlots.push({
        hour,
        minute,
        display: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      });
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Redirection automatique vers desktop si écran >= 768px
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop && window.location.pathname === '/admin/planning-mobile') {
      navigate('/admin/planning');
      return;
    }

    loadAppointments();
    loadBlockedSlots();
  }, [navigate, selectedDate]);

  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const dateStr = toLocalDateString(selectedDate);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/calendar/appointments?start=${dateStr}&end=${dateStr}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedSlots = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const dateStr = toLocalDateString(selectedDate);

      const url = `${API_CONFIG.BASE_URL}/admin/calendar/blocked-slots?start=${dateStr}&end=${dateStr}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newBlockedSlots = new Set<string>();
        const newBlockedSlotsData = new Map<
          string,
          { id: number; reason: string }
        >();
        data.forEach(
          (block: {
            id: number;
            date: string;
            time: string;
            reason: string;
          }) => {
            const key = `${block.date}_${block.time}`;
            newBlockedSlots.add(key);
            newBlockedSlotsData.set(key, {
              id: block.id,
              reason: block.reason,
            });
          }
        );
        setBlockedSlots(newBlockedSlots);
        setBlockedSlotsData(newBlockedSlotsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux bloqués:', error);
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getAppointmentsForSlot = (timeSlot: TimeSlot): Appointment[] => {
    const dateStr = toLocalDateString(selectedDate);
    return appointments.filter(apt => {
      const aptDate = toLocalDateString(new Date(apt.appointmentDate));
      return aptDate === dateStr && apt.appointmentTime === timeSlot.display;
    });
  };

  const getSlotKey = (timeSlot: TimeSlot): string => {
    return `${toLocalDateString(selectedDate)}_${timeSlot.display}`;
  };

  const isSlotBlocked = (timeSlot: TimeSlot): boolean => {
    return blockedSlots.has(getSlotKey(timeSlot));
  };

  const handleSlotClick = (timeSlot: TimeSlot) => {
    const slotAppointments = getAppointmentsForSlot(timeSlot);
    const isBlocked = isSlotBlocked(timeSlot);

    if (slotAppointments.length > 0) {
      handleAppointmentClick(slotAppointments[0]);
    } else if (isBlocked) {
      handleBlockedSlotClick(timeSlot);
    } else {
      openCreateModal(selectedDate, timeSlot.display);
    }
  };

  const handleSlotLongPress = (timeSlot: TimeSlot) => {
    const slotAppointments = getAppointmentsForSlot(timeSlot);
    const isBlocked = isSlotBlocked(timeSlot);

    if (slotAppointments.length === 0 && !isBlocked) {
      setSelectedSlot({ date: selectedDate, time: timeSlot.display });
      setShowBlockModal(true);
    }
  };

  const openCreateModal = (date: Date, time: string) => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licensePlate: '',
      vehicleType: 'Voiture',
      vehicleBrand: '',
      vehicleModel: '',
      fuelType: 'Essence',
      appointmentDate: toLocalDateString(date),
      source: 'manual',
      notes: '',
    });
    setSelectedSlot({ date, time });
    setShowCreateModal(true);
    setFormError('');
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setFormLoading(true);
    setFormError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/calendar/appointments/manual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            selectedDate: formData.appointmentDate,
            selectedTime: selectedSlot.time,
          }),
        }
      );

      if (response.ok) {
        setShowCreateModal(false);
        loadAppointments();
        alert('✅ Rendez-vous créé avec succès');
      } else {
        const error = await response.json();
        setFormError(
          error.message || 'Erreur lors de la création du rendez-vous'
        );
      }
    } catch (error) {
      setFormError('Erreur de connexion au serveur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData(appointment);
    setEditMode(true);
    setShowModal(true);
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/calendar/appointments/${editFormData.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: editFormData.firstName,
            lastName: editFormData.lastName,
            email: editFormData.email,
            phone: editFormData.phone,
            vehicleType: editFormData.vehicleType,
            vehicleBrand: editFormData.vehicleBrand,
            vehicleModel: editFormData.vehicleModel,
            vehicleRegistration: editFormData.vehicleRegistration,
            status: editFormData.status,
            notes: editFormData.notes,
          }),
        }
      );

      if (response.ok) {
        setShowModal(false);
        setEditMode(false);
        loadAppointments();
        alert('✅ Rendez-vous modifié avec succès');
      } else {
        alert('Erreur lors de la modification du rendez-vous');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification du rendez-vous');
    }
  };

  const handleDeleteAppointment = async () => {
    if (
      !editFormData ||
      !window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')
    )
      return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/calendar/appointments/${editFormData.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShowModal(false);
        setEditMode(false);
        loadAppointments();
        alert('✅ Rendez-vous supprimé avec succès');
      } else {
        alert('Erreur lors de la suppression du rendez-vous');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du rendez-vous');
    }
  };

  const handleConfirmBlock = async () => {
    if (!selectedSlot) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/calendar/blocked-slots`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            slots: [
              {
                date: toLocalDateString(selectedSlot.date),
                time: selectedSlot.time,
              },
            ],
            reason: blockReason || "Créneau bloqué par l'administrateur",
          }),
        }
      );

      if (response.ok) {
        setShowBlockModal(false);
        setBlockReason('');
        setSelectedSlot(null);
        loadBlockedSlots();
        alert('✅ Créneau bloqué avec succès');
      } else {
        alert('Erreur lors du blocage du créneau');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du blocage du créneau');
    }
  };

  const handleBlockedSlotClick = (timeSlot: TimeSlot) => {
    const key = getSlotKey(timeSlot);
    const blockData = blockedSlotsData.get(key);
    if (blockData) {
      setSelectedBlockedSlot({
        key,
        id: blockData.id,
        date: selectedDate,
        time: timeSlot.display,
        reason: blockData.reason,
      });
      setShowUnblockModal(true);
    }
  };

  const handleConfirmUnblock = async () => {
    if (!selectedBlockedSlot) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/calendar/blocked-slots/${selectedBlockedSlot.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShowUnblockModal(false);
        setSelectedBlockedSlot(null);
        loadBlockedSlots();
        alert('✅ Créneau débloqué avec succès');
      } else {
        alert('Erreur lors du déblocage du créneau');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du déblocage du créneau');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return '#fbbf24';
      case 'confirmed':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Touch handlers pour swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left - jour suivant
      handleNextDay();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      // Swipe right - jour précédent
      handlePrevDay();
    }
  };

  return (
    <div className='admin-planning-mobile'>
      {/* Header */}
      <header className='mobile-header'>
        <div className='header-top'>
          <button className='menu-btn' onClick={() => setShowMenu(!showMenu)}>
            ☰
          </button>
          <h1>AUTOSUR</h1>
          <button className='btn-add' onClick={() => handleToday()}>
            📅
          </button>
        </div>
        <div className='header-date'>
          <button className='btn-nav' onClick={handlePrevDay}>
            ‹
          </button>
          <div className='current-date'>{formatDate(selectedDate)}</div>
          <button className='btn-nav' onClick={handleNextDay}>
            ›
          </button>
        </div>
      </header>

      {/* Menu latéral */}
      {showMenu && (
        <div className='mobile-menu-overlay' onClick={() => setShowMenu(false)}>
          <div className='mobile-menu' onClick={e => e.stopPropagation()}>
            <div className='menu-header'>
              <h2>AUTOSUR</h2>
              <button onClick={() => setShowMenu(false)}>×</button>
            </div>
            <nav className='menu-nav'>
              <a href='/admin' onClick={() => setShowMenu(false)}>
                <span className='icon'>📊</span>
                <span>Dashboard</span>
              </a>
              <a href='/admin/planning' onClick={() => setShowMenu(false)}>
                <span className='icon'>📅</span>
                <span>Planning</span>
              </a>
              <a href='/admin/clients' onClick={() => setShowMenu(false)}>
                <span className='icon'>👥</span>
                <span>Clients</span>
              </a>
            </nav>
            <div className='menu-footer'>
              <button onClick={handleLogout} className='logout-btn'>
                <span className='icon'>🚪</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Planning grid */}
      <div
        className='mobile-planning-container'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className='mobile-loading'>
            <div className='spinner'></div>
            <p>Chargement...</p>
          </div>
        ) : (
          <div className='time-slots-list'>
            {timeSlots.map((slot, index) => {
              const slotAppointments = getAppointmentsForSlot(slot);
              const isBlocked = isSlotBlocked(slot);
              const isPastSlot =
                selectedDate.toDateString() === new Date().toDateString() &&
                (slot.hour < new Date().getHours() ||
                  (slot.hour === new Date().getHours() &&
                    slot.minute < new Date().getMinutes()));

              return (
                <div
                  key={index}
                  className={`time-slot-card ${isBlocked ? 'blocked' : ''} ${slotAppointments.length > 0 ? 'has-appointment' : ''} ${isPastSlot ? 'past' : ''}`}
                  onClick={() => !isPastSlot && handleSlotClick(slot)}
                  onContextMenu={e => {
                    e.preventDefault();
                    !isPastSlot && handleSlotLongPress(slot);
                  }}
                >
                  <div className='slot-time'>{slot.display}</div>
                  <div className='slot-content'>
                    {isBlocked ? (
                      <div className='blocked-indicator'>
                        <span className='icon'>🚫</span>
                        <span>Bloqué</span>
                      </div>
                    ) : slotAppointments.length > 0 ? (
                      slotAppointments.map((apt, aptIndex) => (
                        <div
                          key={aptIndex}
                          className='appointment-preview'
                          style={{
                            borderLeftColor: getStatusColor(apt.status),
                          }}
                        >
                          <div className='apt-name'>
                            {apt.lastName.toUpperCase()} {apt.firstName}
                          </div>
                          <div className='apt-details'>
                            <span>
                              {apt.vehicleBrand} - {apt.vehicleRegistration}
                            </span>
                          </div>
                          <div
                            className='apt-status'
                            style={{ color: getStatusColor(apt.status) }}
                          >
                            {getStatusLabel(apt.status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='empty-slot'>
                        <span className='icon'>+</span>
                        <span>Ajouter RDV</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bouton flottant */}
      <button className='fab' onClick={() => openCreateModal(selectedDate, '')}>
        +
      </button>

      {/* Modal de création */}
      {showCreateModal && (
        <div
          className='modal-overlay'
          onClick={() => setShowCreateModal(false)}
        >
          <div className='modal-mobile' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Nouveau RDV</h2>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateAppointment}>
              <div className='modal-body'>
                {formError && <div className='error-message'>{formError}</div>}

                <div className='form-group'>
                  <label>Prénom *</label>
                  <input
                    type='text'
                    value={formData.firstName}
                    onChange={e =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Nom *</label>
                  <input
                    type='text'
                    value={formData.lastName}
                    onChange={e =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Email *</label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
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
                  />
                </div>

                <div className='form-group'>
                  <label>Type de véhicule *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={e =>
                      setFormData({ ...formData, vehicleType: e.target.value })
                    }
                    required
                  >
                    <option value='Voiture'>Voiture</option>
                    <option value='Moto'>Moto</option>
                    <option value='Utilitaire léger'>Utilitaire léger</option>
                    <option value='Quad'>Quad</option>
                    <option value='Scooter'>Scooter</option>
                  </select>
                </div>

                <div className='form-group'>
                  <label>Marque *</label>
                  <input
                    type='text'
                    value={formData.vehicleBrand}
                    onChange={e =>
                      setFormData({ ...formData, vehicleBrand: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Modèle *</label>
                  <input
                    type='text'
                    value={formData.vehicleModel}
                    onChange={e =>
                      setFormData({ ...formData, vehicleModel: e.target.value })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Immatriculation *</label>
                  <input
                    type='text'
                    value={formData.licensePlate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        licensePlate: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Carburant *</label>
                  <select
                    value={formData.fuelType}
                    onChange={e =>
                      setFormData({ ...formData, fuelType: e.target.value })
                    }
                    required
                  >
                    <option value='Essence'>Essence</option>
                    <option value='Diesel'>Diesel</option>
                    <option value='Électrique'>Électrique</option>
                    <option value='Hybride'>Hybride</option>
                  </select>
                </div>

                <div className='form-group'>
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={e =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn-secondary'
                  onClick={() => setShowCreateModal(false)}
                >
                  Annuler
                </button>
                <button
                  type='submit'
                  className='btn-primary'
                  disabled={formLoading}
                >
                  {formLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showModal && editFormData && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal-mobile' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Modifier RDV</h2>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditAppointment}>
              <div className='modal-body'>
                <div className='form-group'>
                  <label>Prénom *</label>
                  <input
                    type='text'
                    value={editFormData.firstName}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Nom *</label>
                  <input
                    type='text'
                    value={editFormData.lastName}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Email *</label>
                  <input
                    type='email'
                    value={editFormData.email}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Téléphone *</label>
                  <input
                    type='tel'
                    value={editFormData.phone}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Type de véhicule *</label>
                  <select
                    value={editFormData.vehicleType}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        vehicleType: e.target.value,
                      })
                    }
                    required
                  >
                    <option value='Voiture'>Voiture</option>
                    <option value='Moto'>Moto</option>
                    <option value='Utilitaire léger'>Utilitaire léger</option>
                    <option value='Quad'>Quad</option>
                    <option value='Scooter'>Scooter</option>
                  </select>
                </div>

                <div className='form-group'>
                  <label>Statut *</label>
                  <select
                    value={editFormData.status}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }
                    required
                  >
                    <option value='pending'>En attente</option>
                    <option value='confirmed'>Confirmé</option>
                    <option value='completed'>Terminé</option>
                    <option value='cancelled'>Annulé</option>
                  </select>
                </div>

                <div className='form-group'>
                  <label>Marque *</label>
                  <input
                    type='text'
                    value={editFormData.vehicleBrand}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        vehicleBrand: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Modèle *</label>
                  <input
                    type='text'
                    value={editFormData.vehicleModel}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        vehicleModel: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Immatriculation *</label>
                  <input
                    type='text'
                    value={editFormData.vehicleRegistration}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        vehicleRegistration: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>

                <div className='form-group'>
                  <label>Notes</label>
                  <textarea
                    value={editFormData.notes || ''}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn-danger'
                  onClick={handleDeleteAppointment}
                >
                  Supprimer
                </button>
                <button type='submit' className='btn-primary'>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de blocage */}
      {showBlockModal && selectedSlot && (
        <div className='modal-overlay' onClick={() => setShowBlockModal(false)}>
          <div className='modal-mobile' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Bloquer créneau</h2>
              <button onClick={() => setShowBlockModal(false)}>×</button>
            </div>
            <div className='modal-body'>
              <p>
                <strong>Créneau :</strong> {selectedSlot.time}
              </p>
              <p>
                <strong>Date :</strong> {formatDate(selectedSlot.date)}
              </p>
              <div className='form-group'>
                <label>Raison (optionnel)</label>
                <textarea
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  rows={3}
                  placeholder='Ex: Congés, maintenance...'
                />
              </div>
            </div>
            <div className='modal-footer'>
              <button
                className='btn-secondary'
                onClick={() => setShowBlockModal(false)}
              >
                Annuler
              </button>
              <button className='btn-primary' onClick={handleConfirmBlock}>
                Bloquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de déblocage */}
      {showUnblockModal && selectedBlockedSlot && (
        <div
          className='modal-overlay'
          onClick={() => setShowUnblockModal(false)}
        >
          <div className='modal-mobile' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Débloquer créneau</h2>
              <button onClick={() => setShowUnblockModal(false)}>×</button>
            </div>
            <div className='modal-body'>
              <p>
                <strong>Heure :</strong> {selectedBlockedSlot.time}
              </p>
              <p>
                <strong>Date :</strong> {formatDate(selectedBlockedSlot.date)}
              </p>
              {selectedBlockedSlot.reason && (
                <p>
                  <strong>Raison :</strong> {selectedBlockedSlot.reason}
                </p>
              )}
              <div className='warning-text'>
                ⚠️ Ce créneau redeviendra disponible à la réservation.
              </div>
            </div>
            <div className='modal-footer'>
              <button
                className='btn-secondary'
                onClick={() => setShowUnblockModal(false)}
              >
                Annuler
              </button>
              <button className='btn-danger' onClick={handleConfirmUnblock}>
                Débloquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlanningMobile;
