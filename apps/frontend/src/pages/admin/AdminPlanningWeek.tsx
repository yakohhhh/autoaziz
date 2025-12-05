import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPlanningWeek.css';
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

const AdminPlanningWeek: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: string;
  } | null>(null);
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    day: number;
    slot: number;
  } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: number; slot: number } | null>(
    null
  );
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [blockedSlotsData, setBlockedSlotsData] = useState<
    Map<string, { id: number; reason: string }>
  >(new Map());
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedBlockedSlot, setSelectedBlockedSlot] = useState<{
    key: string;
    id: number;
    date: Date;
    time: string;
    reason: string;
  } | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Générer les créneaux horaires de 7h à 19h par tranche de 15 minutes
  const timeSlots: TimeSlot[] = [];
  for (let hour = 7; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 30) break; // Arrêter à 18:30
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

    // Redirection automatique vers mobile si écran < 768px
    const isMobile = window.innerWidth < 768;
    if (isMobile && window.location.pathname === '/admin/planning') {
      navigate('/admin/planning-mobile');
      return;
    }

    generateWeekDays();
  }, [navigate, weekOffset]);

  // Charger les rendez-vous une fois que les jours de la semaine sont prêts
  useEffect(() => {
    if (weekDays.length === 7) {
      loadAppointments();
      loadBlockedSlots();
    }
  }, [weekDays]);

  const generateWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Lundi = début de semaine

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  };

  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // Calculer la plage de dates pour la semaine en utilisant la date locale
      const startDate =
        weekDays.length > 0 ? toLocalDateString(weekDays[0]) : '';
      const endDate = weekDays.length > 0 ? toLocalDateString(weekDays[6]) : '';

      const url =
        startDate && endDate
          ? `${API_CONFIG.BASE_URL}/admin/calendar/appointments?start=${startDate}&end=${endDate}`
          : `${API_CONFIG.BASE_URL}/admin/calendar/appointments`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        console.error('Erreur serveur:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ];
    return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getAppointmentsForSlot = (
    date: Date,
    timeSlot: TimeSlot
  ): Appointment[] => {
    const dateStr = toLocalDateString(date);

    return appointments.filter(apt => {
      if (!apt.appointmentDate || !apt.appointmentTime) return false;

      try {
        const aptDate = new Date(apt.appointmentDate);
        if (isNaN(aptDate.getTime())) return false;

        // Convertir la date du rendez-vous en string local YYYY-MM-DD
        // Si la date vient de la DB en UTC (ex: 2023-12-05T00:00:00.000Z),
        // on veut comparer la partie date.
        // Si on a créé le RDV via l'interface, il a été envoyé en ISO.

        // On utilise la date locale du rendez-vous pour la comparaison
        const aptDateStr = toLocalDateString(aptDate);

        const [aptHour, aptMinute] = apt.appointmentTime.split(':').map(Number);

        if (isNaN(aptHour) || isNaN(aptMinute)) return false;

        return (
          aptDateStr === dateStr &&
          aptHour === timeSlot.hour &&
          aptMinute === timeSlot.minute
        );
      } catch (error) {
        console.error('Error parsing appointment date:', error);
        return false;
      }
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return '#90EE90';
      case 'pending':
      case 'pending_verification':
        return '#FFD700';
      case 'cancelled':
        return '#FFB6C1';
      default:
        return '#E0E0E0';
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData(appointment);
    setEditMode(false);
    setShowModal(true);
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    setFormLoading(true);
    setFormError('');

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
        const error = await response.json();
        setFormError(error.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFormError('Erreur lors de la modification du rendez-vous');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer le rendez-vous #${selectedAppointment.id} ?`
      )
    ) {
      return;
    }

    setFormLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/calendar/appointments/${selectedAppointment.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShowModal(false);
        loadAppointments();
        alert('🗑️ Rendez-vous supprimé avec succès');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du rendez-vous');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePrevWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(weekOffset + 1);
  };

  const handleCurrentWeek = () => {
    setWeekOffset(0);
  };

  const handleSlotClick = (date: Date, timeSlot: TimeSlot) => {
    const dateTime = new Date(date);
    dateTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);

    setSelectedSlot({ date, time: timeSlot.display });
    setFormData(prev => ({
      ...prev,
      appointmentDate: dateTime.toISOString(),
    }));
    setShowCreateModal(true);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
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
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setShowCreateModal(false);
        loadAppointments();
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
          appointmentDate: '',
          source: 'manual',
          notes: '',
        });
        alert('✅ Rendez-vous créé avec succès');
      } else {
        const error = await response.json();
        setFormError(
          error.message || 'Erreur lors de la création du rendez-vous'
        );
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFormError('Erreur lors de la création du rendez-vous');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // Drag-to-block handlers
  const handleSlotMouseDown = (
    dayIndex: number,
    slotIndex: number,
    e: React.MouseEvent
  ) => {
    if (e.button !== 0) return; // Only left click
    setMouseDownTime(Date.now());
    setHasDragged(false);
    setDragStart({ day: dayIndex, slot: slotIndex });
    setDragEnd({ day: dayIndex, slot: slotIndex });
  };

  const handleSlotMouseEnter = (dayIndex: number, slotIndex: number) => {
    if (dragStart) {
      setHasDragged(true);
      setIsDragging(true);
      setDragEnd({ day: dayIndex, slot: slotIndex });
    }
  };

  const handleSlotMouseUp = (day: Date, slot: TimeSlot) => {
    const clickDuration = Date.now() - mouseDownTime;

    // Si c'est un simple clic rapide sans drag (< 200ms et pas de mouvement)
    if (clickDuration < 200 && !hasDragged) {
      // Créer un RDV
      handleSlotClick(day, slot);
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setHasDragged(false);
      return;
    }

    // Si c'est un drag (mouvement détecté)
    if (isDragging && dragStart && dragEnd && hasDragged) {
      // Only allow blocking on same day
      if (dragStart.day === dragEnd.day) {
        setShowBlockModal(true);
      }
    }

    setIsDragging(false);
    setHasDragged(false);
  };

  const isSlotInDragSelection = (
    dayIndex: number,
    slotIndex: number
  ): boolean => {
    if (!isDragging || !dragStart || !dragEnd || dragStart.day !== dayIndex)
      return false;

    const minSlot = Math.min(dragStart.slot, dragEnd.slot);
    const maxSlot = Math.max(dragStart.slot, dragEnd.slot);

    return slotIndex >= minSlot && slotIndex <= maxSlot;
  };

  const getSlotKey = (date: Date, timeSlot: TimeSlot): string => {
    return `${toLocalDateString(date)}_${timeSlot.display}`;
  };

  const isSlotBlocked = (date: Date, timeSlot: TimeSlot): boolean => {
    return blockedSlots.has(getSlotKey(date, timeSlot));
  };

  const handleConfirmBlock = async () => {
    if (!dragStart || !dragEnd || dragStart.day !== dragEnd.day) return;

    const dayIndex = dragStart.day;
    const minSlot = Math.min(dragStart.slot, dragEnd.slot);
    const maxSlot = Math.max(dragStart.slot, dragEnd.slot);

    const newBlockedSlots = new Set(blockedSlots);
    const slotsToBlock: Array<{ date: string; time: string }> = [];

    for (let i = minSlot; i <= maxSlot; i++) {
      const slot = timeSlots[i];
      const day = weekDays[dayIndex];
      const key = getSlotKey(day, slot);
      newBlockedSlots.add(key);
      slotsToBlock.push({
        date: toLocalDateString(day),
        time: slot.display,
      });
    }

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
            slots: slotsToBlock,
            reason: blockReason || "Créneau bloqué par l'administrateur",
          }),
        }
      );

      if (response.ok) {
        setBlockedSlots(newBlockedSlots);
        setShowBlockModal(false);
        setBlockReason('');
        setDragStart(null);
        setDragEnd(null);
        alert('✅ Créneaux bloqués avec succès');
      } else {
        alert('Erreur lors du blocage des créneaux');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du blocage des créneaux');
    }
  };

  const loadBlockedSlots = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const startDate =
        weekDays.length > 0 ? toLocalDateString(weekDays[0]) : '';
      const endDate = weekDays.length > 0 ? toLocalDateString(weekDays[6]) : '';

      const url = `${API_CONFIG.BASE_URL}/admin/calendar/blocked-slots?start=${startDate}&end=${endDate}`;

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

  const handleBlockedSlotClick = (date: Date, timeSlot: TimeSlot) => {
    const key = getSlotKey(date, timeSlot);
    const blockData = blockedSlotsData.get(key);
    if (blockData) {
      setSelectedBlockedSlot({
        key,
        id: blockData.id,
        date,
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
        const newBlockedSlots = new Set(blockedSlots);
        newBlockedSlots.delete(selectedBlockedSlot.key);
        setBlockedSlots(newBlockedSlots);

        const newBlockedSlotsData = new Map(blockedSlotsData);
        newBlockedSlotsData.delete(selectedBlockedSlot.key);
        setBlockedSlotsData(newBlockedSlotsData);

        setShowUnblockModal(false);
        setSelectedBlockedSlot(null);
        alert('✅ Créneau débloqué avec succès');
      } else {
        alert('Erreur lors du déblocage du créneau');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du déblocage du créneau');
    }
  };

  return (
    <div className='admin-planning-week'>
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
        <header className='planning-header'>
          <div className='header-content'>
            <div className='header-left'>
              <h1>📅 Planning Hebdomadaire</h1>
            </div>
            <div className='header-actions'>
              <button
                type='button'
                onClick={() => setShowCreateModal(true)}
                className='btn-create'
              >
                + Nouveau RDV
              </button>
            </div>
          </div>
        </header>

        <div className='planning-controls'>
          <button onClick={handlePrevWeek} className='btn-nav'>
            ← Semaine précédente
          </button>
          <button
            onClick={handleCurrentWeek}
            className='btn-current'
            disabled={weekOffset === 0}
          >
            Aujourd'hui
          </button>
          <button onClick={handleNextWeek} className='btn-nav'>
            Semaine suivante →
          </button>
        </div>

        {loading ? (
          <div className='planning-loading'>
            <div className='spinner'></div>
            <p>Chargement du planning...</p>
          </div>
        ) : (
          <div className='planning-grid-container'>
            <div className='planning-grid'>
              {/* En-tête des jours */}
              <div className='time-column header-cell'>Horaire</div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`day-header ${day.toDateString() === new Date().toDateString() ? 'today' : ''}`}
                >
                  <div className='day-name'>{formatDate(day)}</div>
                  <div className='day-label'>Aziz</div>
                </div>
              ))}

              {/* Lignes de créneaux horaires */}
              {timeSlots.map((slot, slotIndex) => (
                <React.Fragment key={slotIndex}>
                  <div className='time-cell'>{slot.display}</div>
                  {weekDays.map((day, dayIndex) => {
                    const slotAppointments = getAppointmentsForSlot(day, slot);
                    const isBlocked = isSlotBlocked(day, slot);
                    const isInSelection = isSlotInDragSelection(
                      dayIndex,
                      slotIndex
                    );

                    return (
                      <div
                        key={`${slotIndex}-${dayIndex}`}
                        className={`slot-cell ${slotAppointments.length > 0 ? 'has-appointment' : ''} ${isBlocked ? 'blocked-slot' : ''} ${isInSelection ? 'drag-selected' : ''}`}
                        onMouseDown={e =>
                          !isBlocked &&
                          slotAppointments.length === 0 &&
                          handleSlotMouseDown(dayIndex, slotIndex, e)
                        }
                        onMouseEnter={() =>
                          handleSlotMouseEnter(dayIndex, slotIndex)
                        }
                        onMouseUp={() =>
                          !isBlocked &&
                          slotAppointments.length === 0 &&
                          handleSlotMouseUp(day, slot)
                        }
                        onClick={() =>
                          isBlocked && handleBlockedSlotClick(day, slot)
                        }
                        style={{
                          cursor: isBlocked
                            ? 'pointer'
                            : slotAppointments.length === 0
                              ? 'pointer'
                              : 'default',
                        }}
                      >
                        {isBlocked && (
                          <div className='blocked-indicator'>🚫 Bloqué</div>
                        )}
                        {!isBlocked && slotAppointments.length === 0 && (
                          <div className='empty-slot-hint'>+</div>
                        )}
                        {slotAppointments.map((apt, aptIndex) => (
                          <div
                            key={aptIndex}
                            className='appointment-card'
                            style={{
                              backgroundColor: getStatusColor(apt.status),
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              handleAppointmentClick(apt);
                            }}
                          >
                            <div className='appointment-time'>
                              {apt.appointmentTime}
                            </div>
                            <div className='appointment-name'>
                              {apt.lastName.toUpperCase()} {apt.firstName}
                            </div>
                            <div className='appointment-id'>ID: {apt.id}</div>
                            <div className='appointment-vehicle'>
                              {apt.vehicleBrand} - {apt.vehicleRegistration}
                            </div>
                            {apt.notes && (
                              <div className='appointment-notes'>
                                {apt.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Modal de création */}
        {showCreateModal && (
          <div
            className='modal-overlay'
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className='modal-content modal-create'
              onClick={e => e.stopPropagation()}
            >
              <div className='modal-header'>
                <h2>Créer un rendez-vous</h2>
                <button
                  className='btn-close'
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateAppointment}>
                <div className='modal-body'>
                  {formError && (
                    <div className='error-message'>{formError}</div>
                  )}

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
                  </div>

                  <div className='form-row'>
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
                        <option value='Voiture'>Voiture</option>
                        <option value='Moto'>Moto</option>
                        <option value='Utilitaire léger'>
                          Utilitaire léger
                        </option>
                        <option value='Quad'>Quad</option>
                        <option value='Scooter'>Scooter</option>
                      </select>
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
                        <option value='Hybride'>Hybride</option>
                        <option value='Électrique'>Électrique</option>
                        <option value='GPL'>GPL</option>
                      </select>
                    </div>
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
                      />
                    </div>
                  </div>

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
                      placeholder='AA-123-BB'
                      required
                    />
                  </div>

                  <div className='form-group'>
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={e =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      placeholder='Informations complémentaires...'
                    />
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn-secondary'
                    onClick={() => setShowCreateModal(false)}
                    disabled={formLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type='submit'
                    className='btn-primary'
                    disabled={formLoading}
                  >
                    {formLoading ? 'Création...' : 'Créer le rendez-vous'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de détails/édition */}
        {showModal && selectedAppointment && editFormData && (
          <div className='modal-overlay' onClick={() => setShowModal(false)}>
            <div
              className='modal-content modal-edit'
              onClick={e => e.stopPropagation()}
            >
              <div className='modal-header'>
                <h2>Rendez-vous #{selectedAppointment.id}</h2>
                <button
                  className='btn-close'
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleEditAppointment}>
                  <div className='modal-body'>
                    {formError && (
                      <div className='error-message'>{formError}</div>
                    )}

                    <div className='form-row'>
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
                    </div>

                    <div className='form-row'>
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
                    </div>

                    <div className='form-row'>
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
                          <option value='Utilitaire léger'>
                            Utilitaire léger
                          </option>
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
                    </div>

                    <div className='form-row'>
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
                    </div>

                    <div className='form-group'>
                      <label>Immatriculation *</label>
                      <input
                        type='text'
                        value={editFormData.vehicleRegistration}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            vehicleRegistration: e.target.value,
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
                      disabled={formLoading}
                    >
                      🗑️ Supprimer
                    </button>
                    <button
                      type='button'
                      className='btn-secondary'
                      onClick={() => setEditMode(false)}
                      disabled={formLoading}
                    >
                      Annuler
                    </button>
                    <button
                      type='submit'
                      className='btn-primary'
                      disabled={formLoading}
                    >
                      {formLoading ? 'Enregistrement...' : '💾 Enregistrer'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className='modal-body'>
                    <div className='detail-row'>
                      <strong>Client:</strong> {selectedAppointment.firstName}{' '}
                      {selectedAppointment.lastName}
                    </div>
                    <div className='detail-row'>
                      <strong>Email:</strong> {selectedAppointment.email}
                    </div>
                    <div className='detail-row'>
                      <strong>Téléphone:</strong> {selectedAppointment.phone}
                    </div>
                    <div className='detail-row'>
                      <strong>Date:</strong>{' '}
                      {new Date(
                        selectedAppointment.appointmentDate
                      ).toLocaleDateString('fr-FR')}
                    </div>
                    <div className='detail-row'>
                      <strong>Heure:</strong>{' '}
                      {selectedAppointment.appointmentTime}
                    </div>
                    <div className='detail-row'>
                      <strong>Véhicule:</strong>{' '}
                      {selectedAppointment.vehicleType} -{' '}
                      {selectedAppointment.vehicleBrand}{' '}
                      {selectedAppointment.vehicleModel}
                    </div>
                    <div className='detail-row'>
                      <strong>Immatriculation:</strong>{' '}
                      {selectedAppointment.vehicleRegistration}
                    </div>
                    <div className='detail-row'>
                      <strong>Statut:</strong>
                      <span
                        className={`status-badge status-${selectedAppointment.status}`}
                      >
                        {selectedAppointment.status}
                      </span>
                    </div>
                    {selectedAppointment.notes && (
                      <div className='detail-row'>
                        <strong>Notes:</strong> {selectedAppointment.notes}
                      </div>
                    )}
                  </div>
                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn-danger'
                      onClick={handleDeleteAppointment}
                      disabled={formLoading}
                    >
                      🗑️ Supprimer
                    </button>
                    <button
                      type='button'
                      className='btn-secondary'
                      onClick={() => setShowModal(false)}
                    >
                      Fermer
                    </button>
                    <button
                      type='button'
                      className='btn-primary'
                      onClick={() => setEditMode(true)}
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal de blocage de créneaux */}
        {showBlockModal && dragStart && dragEnd && (
          <div
            className='modal-overlay'
            onClick={() => {
              setShowBlockModal(false);
              setDragStart(null);
              setDragEnd(null);
              setIsDragging(false);
              setHasDragged(false);
            }}
          >
            <div className='modal-content' onClick={e => e.stopPropagation()}>
              <div className='modal-header'>
                <h2>Bloquer les créneaux sélectionnés</h2>
                <button
                  className='btn-close'
                  onClick={() => {
                    setShowBlockModal(false);
                    setDragStart(null);
                    setDragEnd(null);
                    setIsDragging(false);
                    setHasDragged(false);
                  }}
                >
                  ×
                </button>
              </div>
              <div className='modal-body'>
                <p>
                  Vous êtes sur le point de bloquer{' '}
                  {Math.abs(dragEnd.slot - dragStart.slot) + 1} créneau(x) le{' '}
                  {formatDate(weekDays[dragStart.day])}.
                </p>
                <p>
                  Ces créneaux ne seront plus disponibles à la réservation sur
                  le site public.
                </p>
                <div className='form-group'>
                  <label>Raison du blocage (optionnel)</label>
                  <textarea
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    rows={3}
                    placeholder='Ex: Congés, maintenance, fermeture exceptionnelle...'
                  />
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn-secondary'
                  onClick={() => {
                    setShowBlockModal(false);
                    setDragStart(null);
                    setDragEnd(null);
                    setIsDragging(false);
                    setHasDragged(false);
                  }}
                >
                  Annuler
                </button>
                <button
                  type='button'
                  className='btn-primary'
                  onClick={handleConfirmBlock}
                >
                  🚫 Bloquer les créneaux
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de déblocage */}
        {showUnblockModal && selectedBlockedSlot && (
          <div
            className='modal-overlay'
            onClick={() => {
              setShowUnblockModal(false);
              setSelectedBlockedSlot(null);
            }}
          >
            <div className='modal-content' onClick={e => e.stopPropagation()}>
              <div className='modal-header'>
                <h2>Débloquer ce créneau</h2>
                <button
                  className='btn-close'
                  onClick={() => {
                    setShowUnblockModal(false);
                    setSelectedBlockedSlot(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className='modal-body'>
                <p>
                  <strong>Date :</strong> {formatDate(selectedBlockedSlot.date)}
                  <br />
                  <strong>Heure :</strong> {selectedBlockedSlot.time}
                </p>
                {selectedBlockedSlot.reason && (
                  <p>
                    <strong>Raison :</strong> {selectedBlockedSlot.reason}
                  </p>
                )}
                <p className='warning-text'>
                  ⚠️ Ce créneau redeviendra disponible à la réservation sur le
                  site public.
                </p>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn-secondary'
                  onClick={() => {
                    setShowUnblockModal(false);
                    setSelectedBlockedSlot(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  type='button'
                  className='btn-danger'
                  onClick={handleConfirmUnblock}
                >
                  ✅ Débloquer le créneau
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPlanningWeek;
