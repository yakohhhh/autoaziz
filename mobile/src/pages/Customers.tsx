import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import {
  personOutline,
  callOutline,
  mailOutline,
  carOutline,
  calendarOutline,
  createOutline,
  timeOutline,
  chatbubbleEllipsesOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { customerService, Customer } from '../services/api';
import './Customers.css';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  const [presentToast] = useIonToast();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      
      // Transformer les données pour avoir le nombre de rendez-vous et les véhicules
      const transformedData = data.map((customer: Customer) => ({
        ...customer,
        totalAppointments: customer.appointments?.length || 0,
        vehicles: customer.vehicles || [],
      }));
      
      setCustomers(transformedData);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      presentToast({
        message: 'Erreur lors du chargement des clients',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [presentToast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filterCustomers = useCallback(() => {
    if (!searchText) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(
      (customer) =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phone.includes(searchText) ||
        customer.vehicles?.some(
          (vehicle) =>
            vehicle.vehicleBrand?.toLowerCase().includes(searchText.toLowerCase()) ||
            vehicle.vehicleModel?.toLowerCase().includes(searchText.toLowerCase()) ||
            vehicle.licensePlate?.toLowerCase().includes(searchText.toLowerCase())
        )
    );

    setFilteredCustomers(filtered);
  }, [customers, searchText]);

  useEffect(() => {
    filterCustomers();
  }, [filterCustomers]);

  const handleRefresh = (event: CustomEvent) => {
    loadCustomers().then(() => event.detail.complete());
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <div className="toolbar-title">
              <div className="logo">AUTOSUR</div>
              <div className="subtitle">Clients</div>
            </div>
          </IonTitle>
        </IonToolbar>

        {/* Barre de recherche */}
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Rechercher un client..."
            animated
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="customers-page-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Stats rapides */}
        <div className="quick-stats">
          <IonCard className="stat-mini">
            <IonCardContent>
              <div className="stat-mini-value">{customers.length}</div>
              <div className="stat-mini-label">Clients</div>
            </IonCardContent>
          </IonCard>
          <IonCard className="stat-mini">
            <IonCardContent>
              <div className="stat-mini-value">
                {customers.reduce((sum, c) => sum + (c.vehicles?.length || 0), 0)}
              </div>
              <div className="stat-mini-label">Véhicules</div>
            </IonCardContent>
          </IonCard>
          <IonCard className="stat-mini">
            <IonCardContent>
              <div className="stat-mini-value">
                {customers.reduce((sum, c) => sum + (c.totalAppointments || 0), 0)}
              </div>
              <div className="stat-mini-label">RDV Total</div>
            </IonCardContent>
          </IonCard>
        </div>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : (
          <div className="customers-container">
            {filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={personOutline} />
                <p>Aucun client trouvé</p>
              </div>
            ) : (
              <div className="customer-grid">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="customer-card-premium">
                    <div className="card-accent-bar"></div>
                    
                    <div className="card-main-content">
                      {/* Header: Avatar & Name */}
                      <div className="profile-header">
                        <div className="avatar-container">
                          <div className="avatar-gradient-ring">
                            <div className="avatar-image">
                              {getInitials(customer.firstName, customer.lastName)}
                            </div>
                          </div>
                          {customer.totalAppointments && customer.totalAppointments > 5 && (
                            <div className="vip-badge">VIP</div>
                          )}
                        </div>
                        
                        <div className="profile-info">
                          <h2 className="profile-name">
                            {customer.firstName} <span className="last-name">{customer.lastName}</span>
                          </h2>
                          <div className="profile-meta">
                            <span className="meta-id">ID: #{customer.id}</span>
                            {customer.createdAt && (
                              <span className="meta-date"> • Client depuis {new Date(customer.createdAt).getFullYear()}</span>
                            )}
                          </div>
                        </div>
                        
                        <button className="more-options-btn">
                          <IonIcon icon={chevronForwardOutline} />
                        </button>
                      </div>

                      {/* Contact Info Pills */}
                      <div className="contact-section">
                        <a href={`tel:${customer.phone}`} className="contact-pill phone">
                          <IonIcon icon={callOutline} />
                          <span>{customer.phone}</span>
                        </a>
                        <a href={`mailto:${customer.email}`} className="contact-pill email">
                          <IonIcon icon={mailOutline} />
                          <span>{customer.email}</span>
                        </a>
                      </div>

                      {/* Vehicles Section */}
                      <div className="vehicles-section">
                        <div className="section-label">Véhicules ({customer.vehicles?.length || 0})</div>
                        <div className="vehicles-list">
                          {customer.vehicles && customer.vehicles.length > 0 ? (
                            customer.vehicles.slice(0, 2).map((vehicle) => (
                              <div key={vehicle.id} className="vehicle-item">
                                <div className="vehicle-icon-box">
                                  <IonIcon icon={carOutline} />
                                </div>
                                <div className="vehicle-details">
                                  <span className="vehicle-name">{vehicle.vehicleBrand} {vehicle.vehicleModel}</span>
                                  <span className="vehicle-plate">{vehicle.licensePlate}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="no-vehicle">Aucun véhicule enregistré</div>
                          )}
                          {customer.vehicles && customer.vehicles.length > 2 && (
                            <div className="more-vehicles">+{customer.vehicles.length - 2} autres</div>
                          )}
                        </div>
                      </div>

                      {/* Stats / History Summary */}
                      <div className="stats-grid">
                        <div className="stat-box">
                          <div className="stat-icon blue">
                            <IonIcon icon={calendarOutline} />
                          </div>
                          <div className="stat-content">
                            <span className="stat-value">{customer.totalAppointments}</span>
                            <span className="stat-label">Rendez-vous</span>
                          </div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-icon purple">
                            <IonIcon icon={timeOutline} />
                          </div>
                          <div className="stat-content">
                            <span className="stat-value">
                              {customer.lastVisit ? formatDate(customer.lastVisit) : '-'}
                            </span>
                            <span className="stat-label">Dernière visite</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="card-actions">
                        <button className="action-btn outline">
                          <IonIcon icon={createOutline} />
                          <span>Éditer</span>
                        </button>
                        <button className="action-btn primary">
                          <IonIcon icon={chatbubbleEllipsesOutline} />
                          <span>Contacter</span>
                        </button>
                        <button className="action-btn outline">
                          <IonIcon icon={timeOutline} />
                          <span>Historique</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Customers;
