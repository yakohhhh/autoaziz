import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButton,
  IonSpinner,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonTitle,
  IonIcon,
  useIonToast,
  useIonAlert,
} from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, closeOutline, addOutline } from 'ionicons/icons';
import { appointmentService } from '../services/api';
import './PlanningNew.css';

interface TimeSlot {
  hour: number;
  minute: number;
  display: string;
}

const PlanningNew: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'agenda'>('week');
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
  
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  // Créneaux horaires de 7h à 18h30 par 15 min
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
      // Utiliser l'endpoint PATCH pour mettre à jour tous les champs
      const response = await fetch(
        `http://localhost:3001/admin/calendar/appointments/${editFormData.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
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

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }
      
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
      presentToast({
        message: 'Erreur lors de la modification',
        duration: 2000,
        color: 'danger',
      });
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

  const getTodayAppointments = () => {
    const today = toLocalDateString(new Date());
    return appointments
      .filter(apt => toLocalDateString(new Date(apt.appointmentDate)) === today)
      .sort((a, b) => {
        const timeA = a.appointmentTime.split(':').map(Number);
        const timeB = b.appointmentTime.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'pending_verification': return 'En attente vérif.';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <IonPage className="planning-page">
      <IonHeader>
        <IonToolbar>
          <div className="planning-header-content">
            <div className="app-name">AUTOSUR</div>
            <div className="page-name">Planning</div>
          </div>
        </IonToolbar>
        <IonToolbar>
          <div className="view-mode-selector">
            <IonButton 
              fill={viewMode === 'week' ? 'solid' : 'outline'} 
              size="small"
              onClick={() => setViewMode('week')}
            >
              Semaine
            </IonButton>
            <IonButton 
              fill={viewMode === 'agenda' ? 'solid' : 'outline'} 
              size="small"
              onClick={() => setViewMode('agenda')}
            >
              Agenda
            </IonButton>
          </div>
        </IonToolbar>
        {viewMode === 'week' && (
          <IonToolbar>
            <div className="navigation-section">
              <div className="week-navigation">
                <IonButton fill="clear" onClick={() => setWeekOffset(weekOffset - 1)}>
                  <IonIcon slot="icon-only" icon={chevronBackOutline} />
                </IonButton>
              <div className="week-label">
                {weekDays.length > 0 && `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`}
              </div>
              <IonButton fill="clear" onClick={() => setWeekOffset(weekOffset + 1)}>
                <IonIcon slot="icon-only" icon={chevronForwardOutline} />
              </IonButton>
            </div>
            <IonButton expand="block" className="today-button" onClick={() => setWeekOffset(0)}>
              Aujourd'hui
            </IonButton>
          </div>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
          </div>
        ) : viewMode === 'agenda' ? (
          <div className="agenda-container">
            <div className="agenda-header">
              <h2>Aujourd'hui - {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
              <div className="agenda-count">{getTodayAppointments().length} rendez-vous</div>
            </div>
            {getTodayAppointments().length === 0 ? (
              <div className="empty-agenda">
                <IonIcon icon={addOutline} size="large" />
                <p>Aucun rendez-vous aujourd'hui</p>
              </div>
            ) : (
              <div className="agenda-list">
                {getTodayAppointments().map((apt) => (
                  <div 
                    key={apt.id} 
                    className={`agenda-card status-${apt.status}`}
                    onClick={() => handleAppointmentClick(apt)}
                  >
                    <div className="agenda-time">
                      <div className="time-display">{apt.appointmentTime}</div>
                    </div>
                    <div className="agenda-details">
                      <div className="agenda-client">
                        <strong>{apt.firstName} {apt.lastName}</strong>
                      </div>
                      <div className="agenda-vehicle">
                        🚗 {apt.vehicleBrand} {apt.vehicleModel}
                      </div>
                      <div className="agenda-phone">
                        📞 {apt.phone}
                      </div>
                      {apt.vehicleRegistration && (
                        <div className="agenda-plate">
                          {apt.vehicleRegistration}
                        </div>
                      )}
                    </div>
                    <div className="agenda-status">
                      <span className="status-badge">{getStatusLabel(apt.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="planning-container">
            <div className="planning-table-wrapper">
              <table className="planning-table">
                <thead>
                  <tr>
                    <th>Heure</th>
                    {weekDays.map((day, idx) => (
                      <th key={idx}>{formatDate(day)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot.display}>
                      <td>{slot.display}</td>
                      {weekDays.map((day, dayIdx) => {
                        const slotAppointments = getAppointmentsForSlot(day, slot);
                        const hasAppointment = slotAppointments.length > 0;
                        const appointment = hasAppointment ? slotAppointments[0] : null;
                        
                        return (
                          <td
                            key={dayIdx}
                            className={hasAppointment ? `appointment-cell status-${appointment.status}` : ''}
                            onClick={() => handleSlotClick(day, slot)}
                          >
                            {hasAppointment && (
                              <div>
                                <div className="appointment-name">
                                  {appointment.firstName} {appointment.lastName}
                                </div>
                                <div className="appointment-vehicle">
                                  {appointment.vehicleBrand} {appointment.vehicleModel}
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Détails Rendez-vous */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Détails du rendez-vous</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedAppointment && !editMode && (
              <div className="modal-content-wrapper">
                <div className="detail-section">
                  <div className="detail-row">
                    <span className="detail-label">Client</span>
                    <span className="detail-value">{selectedAppointment.firstName} {selectedAppointment.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Téléphone</span>
                    <span className="detail-value">{selectedAppointment.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedAppointment.email || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Véhicule</span>
                    <span className="detail-value">{selectedAppointment.vehicleBrand} {selectedAppointment.vehicleModel}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Immatriculation</span>
                    <span className="detail-value">{selectedAppointment.vehicleRegistration || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{selectedAppointment.vehicleType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{new Date(selectedAppointment.appointmentDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Heure</span>
                    <span className="detail-value">{selectedAppointment.appointmentTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Statut</span>
                    <span className="detail-value">{selectedAppointment.status}</span>
                  </div>
                  {selectedAppointment.notes && (
                    <div className="detail-row">
                      <span className="detail-label">Notes</span>
                      <span className="detail-value">{selectedAppointment.notes}</span>
                    </div>
                  )}
                </div>
                
                <IonButton expand="block" className="action-button primary-button" onClick={() => setEditMode(true)}>
                  Modifier
                </IonButton>
                <IonButton expand="block" className="action-button danger-button" onClick={handleDeleteAppointment}>
                  Supprimer
                </IonButton>
              </div>
            )}
            
            {editMode && editFormData && (
              <form onSubmit={handleEditAppointment} className="modal-content-wrapper">
                <div className="detail-section">
                  <IonInput
                    label="Prénom *"
                    labelPlacement="stacked"
                    value={editFormData.firstName}
                    onIonInput={(e) => setEditFormData({ ...editFormData, firstName: e.detail.value! })}
                    required
                  />
                  <IonInput
                    label="Nom *"
                    labelPlacement="stacked"
                    value={editFormData.lastName}
                    onIonInput={(e) => setEditFormData({ ...editFormData, lastName: e.detail.value! })}
                    required
                  />
                  <IonInput
                    label="Téléphone *"
                    labelPlacement="stacked"
                    type="tel"
                    value={editFormData.phone}
                    onIonInput={(e) => setEditFormData({ ...editFormData, phone: e.detail.value! })}
                    required
                  />
                  <IonInput
                    label="Email"
                    labelPlacement="stacked"
                    type="email"
                    value={editFormData.email}
                    onIonInput={(e) => setEditFormData({ ...editFormData, email: e.detail.value! })}
                  />
                  <IonSelect
                    label="Type de véhicule *"
                    labelPlacement="stacked"
                    value={editFormData.vehicleType}
                    onIonChange={(e) => setEditFormData({ ...editFormData, vehicleType: e.detail.value })}
                  >
                    <IonSelectOption value="Voiture">Voiture</IonSelectOption>
                    <IonSelectOption value="Moto">Moto</IonSelectOption>
                    <IonSelectOption value="Utilitaire">Utilitaire</IonSelectOption>
                  </IonSelect>
                  <IonInput
                    label="Marque"
                    labelPlacement="stacked"
                    value={editFormData.vehicleBrand}
                    onIonInput={(e) => setEditFormData({ ...editFormData, vehicleBrand: e.detail.value! })}
                  />
                  <IonInput
                    label="Modèle"
                    labelPlacement="stacked"
                    value={editFormData.vehicleModel}
                    onIonInput={(e) => setEditFormData({ ...editFormData, vehicleModel: e.detail.value! })}
                  />
                  <IonInput
                    label="Immatriculation"
                    labelPlacement="stacked"
                    value={editFormData.vehicleRegistration}
                    onIonInput={(e) => setEditFormData({ ...editFormData, vehicleRegistration: e.detail.value! })}
                  />
                  <IonSelect
                    label="Statut *"
                    labelPlacement="stacked"
                    value={editFormData.status}
                    onIonChange={(e) => setEditFormData({ ...editFormData, status: e.detail.value })}
                  >
                    <IonSelectOption value="pending">En attente</IonSelectOption>
                    <IonSelectOption value="pending_verification">En attente vérification</IonSelectOption>
                    <IonSelectOption value="confirmed">Confirmé</IonSelectOption>
                    <IonSelectOption value="completed">Terminé</IonSelectOption>
                    <IonSelectOption value="cancelled">Annulé</IonSelectOption>
                  </IonSelect>
                  <IonTextarea
                    label="Notes"
                    labelPlacement="stacked"
                    value={editFormData.notes}
                    onIonInput={(e) => setEditFormData({ ...editFormData, notes: e.detail.value! })}
                    rows={3}
                  />
                </div>
                {formError && <div className="error-message">{formError}</div>}
                <IonButton expand="block" type="submit" disabled={formLoading} className="action-button primary-button">
                  {formLoading ? <IonSpinner name="crescent" /> : 'Enregistrer'}
                </IonButton>
                <IonButton expand="block" fill="outline" onClick={() => setEditMode(false)} className="action-button">
                  Annuler
                </IonButton>
              </form>
            )}
          </IonContent>
        </IonModal>

        {/* Modal Créer Rendez-vous */}
        <IonModal isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nouveau rendez-vous</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCreateModal(false)}>
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleCreateAppointment}>
              <IonInput
                label="Prénom *"
                labelPlacement="stacked"
                value={formData.firstName}
                onIonInput={(e) => setFormData({ ...formData, firstName: e.detail.value! })}
                required
              />
              <IonInput
                label="Nom *"
                labelPlacement="stacked"
                value={formData.lastName}
                onIonInput={(e) => setFormData({ ...formData, lastName: e.detail.value! })}
                required
              />
              <IonInput
                label="Téléphone *"
                labelPlacement="stacked"
                type="tel"
                value={formData.phone}
                onIonInput={(e) => setFormData({ ...formData, phone: e.detail.value! })}
                required
              />
              <IonInput
                label="Email"
                labelPlacement="stacked"
                type="email"
                value={formData.email}
                onIonInput={(e) => setFormData({ ...formData, email: e.detail.value! })}
              />
              <IonSelect
                label="Type de véhicule *"
                labelPlacement="stacked"
                value={formData.vehicleType}
                onIonChange={(e) => setFormData({ ...formData, vehicleType: e.detail.value })}
              >
                <IonSelectOption value="Voiture">Voiture</IonSelectOption>
                <IonSelectOption value="Moto">Moto</IonSelectOption>
                <IonSelectOption value="Utilitaire">Utilitaire</IonSelectOption>
              </IonSelect>
              <IonInput
                label="Marque"
                labelPlacement="stacked"
                value={formData.vehicleBrand}
                onIonInput={(e) => setFormData({ ...formData, vehicleBrand: e.detail.value! })}
              />
              <IonInput
                label="Modèle"
                labelPlacement="stacked"
                value={formData.vehicleModel}
                onIonInput={(e) => setFormData({ ...formData, vehicleModel: e.detail.value! })}
              />
              <IonInput
                label="Immatriculation"
                labelPlacement="stacked"
                value={formData.licensePlate}
                onIonInput={(e) => setFormData({ ...formData, licensePlate: e.detail.value! })}
              />
              <IonSelect
                label="Carburant *"
                labelPlacement="stacked"
                value={formData.fuelType}
                onIonChange={(e) => setFormData({ ...formData, fuelType: e.detail.value })}
              >
                <IonSelectOption value="Essence">Essence</IonSelectOption>
                <IonSelectOption value="Diesel">Diesel</IonSelectOption>
                <IonSelectOption value="Hybride">Hybride</IonSelectOption>
                <IonSelectOption value="Électrique">Électrique</IonSelectOption>
              </IonSelect>
              <IonTextarea
                label="Notes"
                labelPlacement="stacked"
                value={formData.notes}
                onIonInput={(e) => setFormData({ ...formData, notes: e.detail.value! })}
                rows={3}
              />
              {formError && <p style={{ color: 'red', fontSize: '12px' }}>{formError}</p>}
              <IonButton expand="block" type="submit" disabled={formLoading} style={{ marginTop: '20px' }}>
                {formLoading ? <IonSpinner name="crescent" /> : 'Créer'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default PlanningNew;
