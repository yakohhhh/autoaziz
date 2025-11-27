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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  IonModal,
  IonButton,
  IonSpinner,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { add, timeOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { appointmentService, Appointment } from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Planning.css';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const formats = {
  timeGutterFormat: (date: Date, culture: any, localizer: any) => 
    localizer.format(date, 'HH\'H\'mm', culture),
  eventTimeRangeFormat: () => "", // Hide default time range to avoid duplication
  agendaTimeRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
    localizer.format(start, 'HH\'H\'mm', culture) + ' - ' + localizer.format(end, 'HH\'H\'mm', culture),
  dayHeaderFormat: (date: Date, culture: any, localizer: any) =>
    localizer.format(date, 'EEEE d MMMM yyyy', culture),
};

const CustomEvent = ({ event }: { event: any }) => (
  <div className="custom-event-content">
    <div className="event-time">{format(event.start, 'HH:mm')}</div>
    <div className="event-title">{event.resource.customerName}</div>
    <div className="event-vehicle">{event.resource.vehicleBrand} {event.resource.vehicleModel}</div>
  </div>
);

const Planning: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
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
  
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAll();
      const parsedData = data.map((evt: any) => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
      }));
      setAppointments(parsedData);
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
