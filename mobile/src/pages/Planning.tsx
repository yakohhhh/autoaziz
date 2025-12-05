/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonButton,
  IonSpinner,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  useIonAlert,
  useIonToast,
  IonButtons,
  IonTitle,
} from '@ionic/react';
import { add, chevronBackOutline, chevronForwardOutline, calendarOutline, closeOutline } from 'ionicons/icons';
import { appointmentService, Appointment } from '../services/api';
import './Planning.css';

interface TimeSlot {
  hour: number;
  minute: number;
  display: string;
}

const Planning: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
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
  const [editFormData, setEditFormData] = useState<any | null>(null);
  
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  // Générer les créneaux horaires de 7h à 19h par tranche de 15 minutes
  const timeSlots: TimeSlot[] = [];
  for (let hour = 7; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 30) break;
      timeSlots.push({
        hour,
        minute,
        display: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      });
    }
  }

  useEffect(() => {
    generateWeekDays();
  }, [weekOffset]);

  useEffect(() => {
    if (weekDays.length === 7) {
      loadAppointments();
    }
  }, [weekDays]);

  const generateWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (weekOffset * 7));
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
      const startDate = weekDays.length > 0 ? toLocalDateString(weekDays[0]) : '';
      const endDate = weekDays.length > 0 ? toLocalDateString(weekDays[6]) : '';
      
      const data = await appointmentService.getAll();
      
      // Filtrer les rendez-vous de la semaine
      const weekAppointments = data.filter((apt: any) => {
        const aptDate = toLocalDateString(new Date(apt.appointmentDate));
        return aptDate >= startDate && aptDate <= endDate;
      });
      
      setAppointments(weekAppointments);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      presentToast({
        message: 'Erreur lors du chargement des rendez-vous',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]}`;
  };

  const getAppointmentsForSlot = (date: Date, timeSlot: TimeSlot): any[] => {
    const dateStr = toLocalDateString(date);
    
    return appointments.filter(apt => {
      if (!apt.appointmentDate || !apt.appointmentTime) return false;
      
      const aptDate = toLocalDateString(new Date(apt.appointmentDate));
      const [aptHour, aptMinute] = apt.appointmentTime.split(':').map(Number);
      
      return aptDate === dateStr && aptHour === timeSlot.hour && aptMinute === timeSlot.minute;
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

  const handleSlotClick = (date: Date, timeSlot: TimeSlot) => {
    const slotAppointments = getAppointmentsForSlot(date, timeSlot);
    
    if (slotAppointments.length > 0) {
      handleAppointmentClick(slotAppointments[0]);
    } else {
      openCreateModal(date, timeSlot.display);
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

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditFormData(appointment);
    setEditMode(false);
    setShowModal(true);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setFormLoading(true);
    setFormError('');

    try {
      await appointmentService.create({
        ...formData,
        selectedDate: formData.appointmentDate,
        selectedTime: selectedSlot.time,
      });

      setShowCreateModal(false);
      loadAppointments();
      presentToast({
        message: '✅ Rendez-vous créé avec succès',
        duration: 2000,
        color: 'success',
      });
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    setFormLoading(true);
    setFormError('');

    try {
      await appointmentService.updateStatus(editFormData.id, editFormData.status);
      
      setShowModal(false);
      setEditMode(false);
      loadAppointments();
      presentToast({
        message: '✅ Rendez-vous modifié avec succès',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      setFormError('Erreur lors de la modification du rendez-vous');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    presentAlert({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir supprimer le rendez-vous #${selectedAppointment.id} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              setFormLoading(true);
              await appointmentService.delete(selectedAppointment.id);
              
              setShowModal(false);
              loadAppointments();
              presentToast({
                message: '🗑️ Rendez-vous supprimé avec succès',
                duration: 2000,
                color: 'success',
              });
            } catch (error) {
              presentToast({
                message: 'Erreur lors de la suppression',
                duration: 2000,
                color: 'danger',
              });
            } finally {
              setFormLoading(false);
            }
          }
        }
      ]
    });
  };

  const handleRefresh = (event: CustomEvent) => {
    loadAppointments().then(() => event.detail.complete());
  };
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      presentToast({
        message: 'Erreur lors du chargement des rendez-vous',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [presentToast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const filterAppointments = useCallback(() => {
    let filtered = appointments;

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((apt: any) =>
        (apt.title && apt.title.toLowerCase().includes(search)) ||
        (apt.resource?.customerName && apt.resource.customerName.toLowerCase().includes(search)) ||
        (apt.resource?.email && apt.resource.email.toLowerCase().includes(search)) ||
        (apt.resource?.phone && apt.resource.phone.includes(search)) ||
        (apt.resource?.vehicleRegistration && apt.resource.vehicleRegistration.toLowerCase().includes(search))
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchText]);

  useEffect(() => {
    filterAppointments();
  }, [filterAppointments]);

  const handleRefresh = (event: CustomEvent) => {
    loadAppointments().then(() => event.detail.complete());
  };

  // Helper pour voir si une date a des RDV - Not needed for Big Calendar
  // const tileContent = ...

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      presentToast({
        message: 'Veuillez remplir les champs obligatoires',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      // Combine date and time
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);

      await appointmentService.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        licensePlate: formData.vehicleRegistration,
        vehicleType: formData.vehicleType,
        vehicleBrand: formData.vehicleBrand,
        vehicleModel: formData.vehicleModel,
        fuelType: formData.fuelType,
        appointmentDate: appointmentDateTime.toISOString(),
        source: 'manual',
        notes: formData.notes
      });
      
      setShowModal(false);
      loadAppointments();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '09:00',
        vehicleType: 'Voiture',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleRegistration: '',
        fuelType: 'Essence',
        notes: '',
      });
      
      presentToast({
        message: 'Rendez-vous créé avec succès',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      presentToast({
        message: 'Erreur lors de la création du rendez-vous',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    presentAlert({
      header: 'Confirmer',
      message: `Changer le statut en "${getStatusLabel(newStatus)}" ?`,
      buttons: [
        'Annuler',
        {
          text: 'Confirmer',
          handler: async () => {
            try {
              await appointmentService.updateStatus(id, newStatus);
              loadAppointments();
              presentToast({
                message: 'Statut mis à jour',
                duration: 2000,
                color: 'success',
              });
            } catch (error) {
              console.error('Erreur lors de la mise à jour du statut:', error);
              presentToast({
                message: 'Erreur lors de la mise à jour',
                duration: 2000,
                color: 'danger',
              });
            }
          },
        },
      ],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  };

  const getStatusLabel = (status: string) => {
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

  const groupByDate = (appointments: any[]) => {
    const groups: { [key: string]: any[] } = {};
    appointments.forEach((apt) => {
      const date = apt.start.toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(apt);
    });
    return groups;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const groupedAppointments = groupByDate(filteredAppointments);

  return (
    <IonPage className="planning-page">
      <IonHeader className="planning-header">
        <IonToolbar>
          <div className="header-content">
            <div className="header-title">
              <h1>Planning</h1>
              <p>Gérez vos rendez-vous</p>
            </div>
            <IonSegment
              value={viewMode}
              onIonChange={(e) => setViewMode(e.detail.value as 'month' | 'week' | 'day' | 'list')}
              className="custom-segment"
            >
              <IonSegmentButton value="month">
                <IonLabel>Mois</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="week">
                <IonLabel>Semaine</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="day">
                <IonLabel>Jour</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="list">
                <IonLabel>Liste</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>
        </IonToolbar>
        
        {/* Barre de recherche */}
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Rechercher un client, véhicule..."
            className="custom-searchbar"
            animated
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="planning-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : (
          <div className="planning-container">
            {viewMode !== 'list' ? (
              <div style={{ height: 'calc(100vh - 220px)', padding: '0', background: '#fff' }}>
                <Calendar
                  localizer={localizer}
                  formats={formats}
                  events={filteredAppointments}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  messages={{
                    next: "Suivant",
                    previous: "Précédent",
                    today: "Aujourd'hui",
                    month: "Mois",
                    week: "Semaine",
                    day: "Jour",
                    agenda: "Agenda",
                    date: "Date",
                    time: "Heure",
                    event: "Événement",
                    noEventsInRange: "Aucun événement dans cette plage",
                  }}
                  culture='fr'
                  view={viewMode as any}
                  onView={(view) => setViewMode(view as any)}
                  views={['month', 'week', 'day']}
                  min={new Date(0, 0, 0, 8, 0, 0)}
                  max={new Date(0, 0, 0, 19, 0, 0)}
                  date={selectedDate}
                  onNavigate={(date) => setSelectedDate(date)}
                  onSelectEvent={(event: any) => {
                    // Show details or actions
                    handleStatusChange(event.resource.id, event.resource.status === 'pending' ? 'confirmed' : 'pending');
                  }}
                  eventPropGetter={(event: any) => {
                    let className = 'rbc-event-custom';
                    if (event.resource.status) {
                      className += ` status-${event.resource.status}`;
                    }
                    return { className };
                  }}
                  components={{
                    event: CustomEvent
                  }}
                />
              </div>
            ) : (
            <div className="appointments-list">
              {Object.keys(groupedAppointments).length === 0 ? (
                <div className="empty-state">
                  <IonIcon icon={timeOutline} />
                  <p>Aucun rendez-vous trouvé</p>
                </div>
              ) : (
                Object.keys(groupedAppointments)
                  .sort()
                  .map((date) => (
                    <div key={date} className="date-group">
                      <h3 className="date-header">{formatDate(date)}</h3>
                      {groupedAppointments[date]
                        .sort((a, b) => a.start.getTime() - b.start.getTime())
                        .map((appointment) => (
                          <IonCard key={appointment.id} className="appointment-card">
                            <IonCardContent>
                              <div className="appointment-header">
                                <div className="appointment-time">
                                  <IonIcon icon={timeOutline} />
                                  {format(appointment.start, 'HH:mm')}
                                </div>
                                <IonChip color={getStatusColor(appointment.resource.status)} className="status-chip">
                                  {getStatusLabel(appointment.resource.status)}
                                </IonChip>
                              </div>

                              <div className="appointment-body">
                                <div className="appointment-info">
                                  <div className="info-row">
                                    <IonIcon icon={personOutline} />
                                    <span className="customer-name">
                                      {appointment.resource.customerName}
                                    </span>
                                  </div>
                                  <div className="info-row">
                                    <span className="service-name">
                                      {appointment.resource.vehicleType || 'Contrôle technique'}
                                    </span>
                                  </div>
                                  {appointment.resource.vehicleBrand && (
                                    <div className="info-row vehicle">
                                      🚗 {appointment.resource.vehicleBrand} {appointment.resource.vehicleModel}
                                      {appointment.resource.vehicleRegistration && ` - ${appointment.resource.vehicleRegistration}`}
                                    </div>
                                  )}
                                  <div className="info-row phone">
                                    📞 {appointment.resource.phone}
                                  </div>
                                  {appointment.resource.email && (
                                    <div className="info-row email">
                                      ✉️ {appointment.resource.email}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {appointment.resource.status === 'pending' && (
                                <div className="appointment-actions">
                                  <IonButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleStatusChange(appointment.resource.id, 'confirmed')}
                                  >
                                    Confirmer
                                  </IonButton>
                                  <IonButton
                                    size="small"
                                    color="danger"
                                    fill="outline"
                                    onClick={() => handleStatusChange(appointment.resource.id, 'cancelled')}
                                  >
                                    Annuler
                                  </IonButton>
                                </div>
                              )}
                            </IonCardContent>
                          </IonCard>
                        ))}
                    </div>
                  ))
              )}
            </div>
            )}
          </div>
        )}

        {/* Bouton flottant pour ajouter un RDV */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" className="planning-fab">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modal d'ajout de rendez-vous */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="appointment-modal">
          <div className="modal-header">
            <h2>Nouveau rendez-vous</h2>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              <IonIcon icon={add} style={{ transform: 'rotate(45deg)' }} />
            </button>
          </div>
          <div className="modal-content">
            <div className="form-section">
              <div className="section-title">
                <IonIcon icon={personOutline} />
                Informations Client
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Jean"
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Dupont"
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0612345678"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <IonIcon icon={timeOutline} />
                Date et Heure
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Heure *</label>
                  <input
                    className="form-input"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <IonIcon icon={calendarOutline} />
                Véhicule
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    className="form-select"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  >
                    <option value="Voiture">Voiture</option>
                    <option value="Moto">Moto</option>
                    <option value="Quad">Quad</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Utilitaire léger">Utilitaire léger</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Carburant *</label>
                  <select
                    className="form-select"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  >
                    <option value="Essence">Essence</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybride">Hybride</option>
                    <option value="Électrique">Électrique</option>
                    <option value="GPL">GPL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Marque</label>
                  <input
                    className="form-input"
                    value={formData.vehicleBrand}
                    onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                    placeholder="Renault"
                  />
                </div>
                <div className="form-group">
                  <label>Modèle</label>
                  <input
                    className="form-input"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    placeholder="Clio"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Immatriculation</label>
                  <input
                    className="form-input"
                    value={formData.vehicleRegistration}
                    onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value })}
                    placeholder="AB-123-CD"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Remarques particulières..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!formData.firstName || !formData.lastName || !formData.phone}
            >
              Créer le rendez-vous
            </button>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Planning;
