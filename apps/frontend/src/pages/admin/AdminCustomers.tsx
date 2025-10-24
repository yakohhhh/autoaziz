import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCustomers.css';

interface Vehicle {
  id: number;
  licensePlate: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  fuelType: string | null;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
  status: string;
  actualStatus: string | null;
  notes: string | null;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string | null;
  statistics: {
    totalVisits: number;
    totalCancellations: number;
    totalNoShows: number;
    totalSpent: number;
    totalAppointments: number;
    totalVehicles: number;
  };
  vehicles: Vehicle[];
  appointments: Appointment[];
  createdAt: string;
}

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('Tout');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    loadCustomers();
  }, [navigate]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/admin/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);

    const matchesLetter =
      selectedLetter === 'Tout' ||
      customer.lastName.charAt(0).toUpperCase() === selectedLetter;

    return matchesSearch && matchesLetter;
  });

  return (
    <div className='customers-page'>
      {/* Header */}
      <div className='customers-header'>
        <div className='header-left'>
          <button onClick={() => navigate('/admin')} className='back-button'>
            ← Retour
          </button>
          <h1>Gérer Mes Clients</h1>
        </div>
        <div className='header-actions'>
          <button className='btn-icon' title='Actualiser'>
            🔄
          </button>
          <button className='btn-icon' title='Paramètres'>
            ⚙️
          </button>
          <button className='btn-primary'>
            <span>➕</span>
            <span>Ajouter Client</span>
          </button>
        </div>
      </div>

      <div className='customers-container'>
        {/* Colonne gauche - Liste des clients */}
        <div className='customers-list-panel'>
          {/* Barre de recherche */}
          <div className='search-bar'>
            <input
              type='text'
              placeholder='Chercher'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='search-input'
            />
            <button className='search-button'>🔍</button>
          </div>

          {/* Filtres alphabétiques */}
          <div className='alphabet-filter'>
            <button
              className={`filter-btn ${selectedLetter === 'Tout' ? 'active' : ''}`}
              onClick={() => setSelectedLetter('Tout')}
            >
              Tout
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                className={`filter-btn ${selectedLetter === letter ? 'active' : ''}`}
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* En-têtes de colonnes */}
          <div className='list-header'>
            <div className='col-avatar'></div>
            <div className='col-name'>Nom complet</div>
            <div className='col-email'>Email</div>
            <div className='col-phone'>Téléphone</div>
            <div className='col-actions'></div>
          </div>

          {/* Liste des clients */}
          <div className='customers-list'>
            {loading ? (
              <div className='loading-state'>Chargement...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className='empty-state'>Aucun client trouvé</div>
            ) : (
              filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  className={`customer-row ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className='col-avatar'>
                    <div className='avatar-circle'>
                      {customer.firstName.charAt(0)}
                      {customer.lastName.charAt(0)}
                    </div>
                  </div>
                  <div className='col-name'>{customer.fullName}</div>
                  <div className='col-email'>{customer.email}</div>
                  <div className='col-phone'>{customer.phone}</div>
                  <div className='col-actions'>
                    <button className='btn-delete'>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Colonne droite - Détails du client */}
        <div
          className={`customer-details-panel ${selectedCustomer ? 'visible' : ''}`}
        >
          {selectedCustomer ? (
            <>
              {/* En-tête profil */}
              <div className='profile-header'>
                <div className='profile-avatar-large'>
                  {selectedCustomer.firstName.charAt(0)}
                  {selectedCustomer.lastName.charAt(0)}
                </div>
                <button
                  className='close-details'
                  onClick={() => setSelectedCustomer(null)}
                >
                  ✕
                </button>
              </div>

              {/* Informations principales */}
              <div className='profile-info'>
                <h2>{selectedCustomer.fullName}</h2>
                <div className='info-grid'>
                  <div className='info-row'>
                    <span className='info-label'>Actions</span>
                    <span className='info-value'>
                      {selectedCustomer.statistics.totalAppointments}
                    </span>
                  </div>
                  <div className='info-row'>
                    <span className='info-label'>Prénom</span>
                    <span className='info-value'>
                      {selectedCustomer.firstName}
                    </span>
                  </div>
                  <div className='info-row'>
                    <span className='info-label'>Email</span>
                    <span className='info-value'>{selectedCustomer.email}</span>
                  </div>
                  <div className='info-row'>
                    <span className='info-label'>Mobile</span>
                    <span className='info-value'>{selectedCustomer.phone}</span>
                  </div>
                  <div className='info-row'>
                    <span className='info-label'>Téléphone</span>
                    <span className='info-value'>{selectedCustomer.phone}</span>
                  </div>
                  <div className='info-row'>
                    <span className='info-label'>Notes</span>
                    <span className='info-value'>
                      {selectedCustomer.notes || 'Aucune'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sections avec dropdowns */}
              <div className='details-sections'>
                <details className='section'>
                  <summary className='section-header'>Historique</summary>
                  <div className='section-content'>
                    <div className='history-item'>
                      Client depuis le{' '}
                      {new Date(selectedCustomer.createdAt).toLocaleDateString(
                        'fr-FR'
                      )}
                    </div>
                  </div>
                </details>

                <details className='section'>
                  <summary className='section-header'>Options</summary>
                </details>

                <details className='section'>
                  <summary className='section-header'>Catalogue SMS</summary>
                </details>

                <details className='section'>
                  <summary className='section-header'>Catalogue Email</summary>
                </details>

                <details className='section'>
                  <summary className='section-header'>
                    Confirmation SMS
                  </summary>
                </details>

                <details className='section'>
                  <summary className='section-header'>
                    Confirmation Email
                  </summary>
                </details>

                <details className='section'>
                  <summary className='section-header'>Rappel SMS</summary>
                </details>

                <details className='section'>
                  <summary className='section-header'>Rappel Email</summary>
                </details>

                <details className='section'>
                  <summary className='section-header'>Suivi SMS</summary>
                </details>

                <details className='section'>
                  <summary className='section-header'>
                    Supprimer ce client
                  </summary>
                </details>
              </div>

              {/* Statistiques détaillées */}
              <div className='stats-section'>
                <h3>📊 Statistiques</h3>
                <div className='stats-cards'>
                  <div className='stat-card green'>
                    <div className='stat-number'>
                      {selectedCustomer.statistics.totalVisits}
                    </div>
                    <div className='stat-label'>Visites</div>
                  </div>
                  <div className='stat-card red'>
                    <div className='stat-number'>
                      {selectedCustomer.statistics.totalCancellations}
                    </div>
                    <div className='stat-label'>Annulations</div>
                  </div>
                  <div className='stat-card yellow'>
                    <div className='stat-number'>
                      {selectedCustomer.statistics.totalNoShows}
                    </div>
                    <div className='stat-label'>Absences</div>
                  </div>
                </div>
              </div>

              {/* Véhicules */}
              {selectedCustomer.vehicles.length > 0 && (
                <div className='vehicles-section'>
                  <h3>🚗 Véhicules ({selectedCustomer.vehicles.length})</h3>
                  <div className='vehicles-list-detail'>
                    {selectedCustomer.vehicles.map(vehicle => (
                      <div key={vehicle.id} className='vehicle-card'>
                        <div className='vehicle-plate'>
                          {vehicle.licensePlate}
                        </div>
                        <div className='vehicle-details'>
                          <strong>
                            {vehicle.vehicleBrand} {vehicle.vehicleModel}
                          </strong>
                          <div className='vehicle-meta'>
                            {vehicle.vehicleType} • {vehicle.fuelType}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historique des RDV */}
              {selectedCustomer.appointments &&
                selectedCustomer.appointments.length > 0 && (
                  <div className='appointments-section'>
                    <h3>📅 Historique des RDV</h3>
                    <div className='appointments-list-detail'>
                      {selectedCustomer.appointments.map(apt => (
                        <div key={apt.id} className='appointment-card'>
                          <div className='apt-date'>
                            {new Date(apt.appointmentDate).toLocaleDateString(
                              'fr-FR'
                            )}{' '}
                            à {apt.appointmentTime}
                          </div>
                          <div className='apt-vehicle'>
                            {apt.vehicleBrand} {apt.vehicleModel} (
                            {apt.vehicleRegistration})
                          </div>
                          <div className={`apt-status status-${apt.status}`}>
                            {apt.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className='no-selection'>
              <div className='no-selection-icon'>👤</div>
              <p>Sélectionnez un client pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
