import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCustomers.css';

// Composant pour éditer les notes
const NotesEditor: React.FC<{
  customerId: number;
  initialNotes: string;
  onSave: () => void;
}> = ({ customerId, initialNotes, onSave }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:3001/admin/customers/${customerId}/notes`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes }),
        }
      );

      if (response.ok) {
        setEditing(false);
        onSave();
        alert('✅ Notes enregistrées avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='notes-editor'>
      {!editing ? (
        <>
          <p className='notes-display'>{notes || 'Aucune note'}</p>
          <button onClick={() => setEditing(true)} className='btn-edit-notes'>
            ✏️ Modifier
          </button>
        </>
      ) : (
        <>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className='notes-textarea'
            rows={5}
            placeholder='Ajoutez vos notes ici...'
          />
          <div className='notes-actions'>
            <button
              onClick={() => {
                setNotes(initialNotes);
                setEditing(false);
              }}
              className='btn-cancel-notes'
              disabled={saving}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className='btn-save-notes'
              disabled={saving}
            >
              {saving ? '⏳ Sauvegarde...' : '✅ Enregistrer'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
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
          <a href='/admin/planning' className='nav-item'>
            <span className='icon'>📅</span>
            <span>Planning</span>
          </a>
          <a href='/admin/customers' className='nav-item active'>
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
        <div className='customers-page'>
        {/* Header */}
        <div className='customers-header'>
          <h1>Gérer Mes Clients</h1>
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
                </div>

                {/* Section Notes Éditable */}
                <div className='notes-section'>
                  <h3>📝 Notes</h3>
                  <NotesEditor
                    customerId={selectedCustomer.id}
                    initialNotes={selectedCustomer.notes || ''}
                    onSave={loadCustomers}
                  />
                </div>

                <div className='info-grid-hidden' style={{ display: 'none' }}>
                  <div className='info-row'>
                    <span className='info-label'>Old Notes Display</span>
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
                    <h3>📅 Historique des RDV ({selectedCustomer.appointments.length})</h3>
                    <div className='appointments-list-detail'>
                      {selectedCustomer.appointments.map(apt => {
                        const getStatusInfo = (status: string) => {
                          const statusMap: Record<string, { icon: string; label: string; class: string }> = {
                            pending: { icon: '⏳', label: 'En attente', class: 'status-pending' },
                            confirmed: { icon: '✅', label: 'Confirmé', class: 'status-confirmed' },
                            completed: { icon: '🎉', label: 'Venue effectuée', class: 'status-completed' },
                            cancelled: { icon: '❌', label: 'Annulé', class: 'status-cancelled' },
                            no_show: { icon: '🚫', label: 'Absent', class: 'status-no-show' },
                          };
                          return statusMap[status] || { icon: '❓', label: status, class: 'status-unknown' };
                        };

                        const statusInfo = getStatusInfo(apt.status);
                        
                        return (
                          <div key={apt.id} className='appointment-card'>
                            <div className='apt-date'>
                              📅 {new Date(apt.appointmentDate).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })} à {apt.appointmentTime}
                            </div>
                            <div className='apt-vehicle'>
                              🚗 {apt.vehicleBrand} {apt.vehicleModel} ({apt.vehicleRegistration})
                            </div>
                            <div className={`apt-status ${statusInfo.class}`}>
                              {statusInfo.icon} {statusInfo.label}
                            </div>
                          </div>
                        );
                      })}
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
      </main>
    </div>
  );
};

export default AdminCustomers;
