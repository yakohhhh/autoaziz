import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCustomers.css';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

// Composant pour éditer les notes
const NotesEditor: React.FC<{
  customerId: number;
  initialNotes: string;
  onSave: () => void;
}> = ({ customerId, initialNotes, onSave }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mettre à jour les notes quand on change de client
  useEffect(() => {
    setNotes(initialNotes);
    setEditing(false);
  }, [customerId, initialNotes]);

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+33',
    notes: '',
    vehicleBrand: '',
    vehicleModel: '',
    licensePlate: '',
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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

      // Si un client est sélectionné, recharger ses détails pour mettre à jour les stats
      if (selectedCustomer) {
        loadCustomerDetails(selectedCustomer.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:3001/admin/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erreur de chargement');

      const customerDetails = await response.json();
      setSelectedCustomer(customerDetails);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    loadCustomers();

    // Rafraîchissement automatique toutes les 30 secondes pour mettre à jour les stats
    const interval = setInterval(() => loadCustomers(), 30000);

    // Écouter les changements de statut depuis d'autres pages (Planning)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appointment_status_changed') {
        // Un statut a changé, recharger les stats
        loadCustomers();
        // Nettoyer l'événement
        localStorage.removeItem('appointment_status_changed');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const handleDeleteCustomer = async (reason: string, note: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:3001/admin/customers/${customerToDelete}`,
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
        const data = await response.json();
        alert(
          `✅ Client supprimé ! ${data.appointmentsFreed} créneau(x) libéré(s).`
        );
        setShowDeleteModal(false);
        setCustomerToDelete(null);
        setSelectedCustomer(null);
        loadCustomers();
      } else {
        alert('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la suppression');
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
              <button
                className='btn-icon'
                title='Actualiser'
                onClick={() => {
                  loadCustomers();
                  alert('✅ Liste actualisée !');
                }}
              >
                🔄
              </button>
              <button className='btn-icon' title='Paramètres'>
                ⚙️
              </button>
              <button
                className='btn-primary'
                onClick={() => setShowAddModal(true)}
              >
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
                      onClick={() => loadCustomerDetails(customer.id)}
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
                        <span className='info-value'>
                          {selectedCustomer.email}
                        </span>
                      </div>
                      <div className='info-row'>
                        <span className='info-label'>Mobile</span>
                        <span className='info-value'>
                          {selectedCustomer.phone}
                        </span>
                      </div>
                      <div className='info-row'>
                        <span className='info-label'>Téléphone</span>
                        <span className='info-value'>
                          {selectedCustomer.phone}
                        </span>
                      </div>
                    </div>

                    {/* Section Notes Éditable */}
                    <div className='notes-section'>
                      <h3>📝 Notes</h3>
                      <NotesEditor
                        customerId={selectedCustomer.id}
                        initialNotes={selectedCustomer.notes || ''}
                        onSave={() => loadCustomerDetails(selectedCustomer.id)}
                      />
                    </div>

                    <div
                      className='info-grid-hidden'
                      style={{ display: 'none' }}
                    >
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
                          {new Date(
                            selectedCustomer.createdAt
                          ).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </details>

                    <details className='section'>
                      <summary className='section-header'>Options</summary>
                      <div
                        className='section-content'
                        style={{ padding: '1rem' }}
                      >
                        <button
                          onClick={() => {
                            setCustomerToDelete(selectedCustomer.id);
                            setShowDeleteModal(true);
                          }}
                          className='btn-delete-customer'
                        >
                          🗑️ Supprimer ce client
                        </button>
                        <p
                          style={{
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            marginTop: '0.75rem',
                          }}
                        >
                          ⚠️ Cette action supprimera le client, ses véhicules et
                          tous ses rendez-vous. Les créneaux seront libérés.
                        </p>
                      </div>
                    </details>

                    <details className='section'>
                      <summary className='section-header'>
                        Catalogue SMS
                      </summary>
                    </details>

                    <details className='section'>
                      <summary className='section-header'>
                        Catalogue Email
                      </summary>
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
                    <h3>📊 Statistiques des Rendez-vous</h3>
                    <div className='stats-cards'>
                      <div className='stat-card green'>
                        <div className='stat-number'>
                          {
                            (selectedCustomer.appointments || []).filter(
                              apt => apt.actualStatus === 'completed'
                            ).length
                          }
                        </div>
                        <div className='stat-label'>Venues Effectuées</div>
                      </div>
                      <div className='stat-card red'>
                        <div className='stat-number'>
                          {
                            (selectedCustomer.appointments || []).filter(
                              apt => apt.actualStatus === 'cancelled'
                            ).length
                          }
                        </div>
                        <div className='stat-label'>Annulations</div>
                      </div>
                      <div className='stat-card yellow'>
                        <div className='stat-number'>
                          {
                            (selectedCustomer.appointments || []).filter(
                              apt => apt.actualStatus === 'no_show'
                            ).length
                          }
                        </div>
                        <div className='stat-label'>Absences (No-Show)</div>
                      </div>
                    </div>
                    <div className='stats-summary'>
                      <p>
                        Total RDV:{' '}
                        <strong>
                          {(selectedCustomer.appointments || []).length}
                        </strong>{' '}
                        | En attente/Confirmés:{' '}
                        <strong>
                          {
                            (selectedCustomer.appointments || []).filter(
                              apt =>
                                !apt.actualStatus ||
                                (apt.status !== 'cancelled' &&
                                  apt.actualStatus !== 'completed' &&
                                  apt.actualStatus !== 'no_show' &&
                                  apt.actualStatus !== 'cancelled')
                            ).length
                          }
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Véhicules */}
                  <div className='vehicles-section'>
                    <h3>
                      🚗 Véhicules ({selectedCustomer.vehicles?.length || 0})
                    </h3>
                    {selectedCustomer.vehicles &&
                    selectedCustomer.vehicles.length > 0 ? (
                      <div className='vehicles-list-detail'>
                        {selectedCustomer.vehicles.map(vehicle => {
                          // Compte les RDV pour ce véhicule basé sur vehicleId
                          const vehicleAppointments = (
                            selectedCustomer.appointments || []
                          ).filter(
                            apt =>
                              apt.vehicleRegistration === vehicle.licensePlate
                          );

                          const completedCount = vehicleAppointments.filter(
                            apt => apt.actualStatus === 'completed'
                          ).length;
                          const cancelledCount = vehicleAppointments.filter(
                            apt => apt.actualStatus === 'cancelled'
                          ).length;
                          const noShowCount = vehicleAppointments.filter(
                            apt => apt.actualStatus === 'no_show'
                          ).length;
                          const pendingCount = vehicleAppointments.filter(
                            apt =>
                              !apt.actualStatus ||
                              (apt.actualStatus !== 'completed' &&
                                apt.actualStatus !== 'cancelled' &&
                                apt.actualStatus !== 'no_show')
                          ).length;

                          const lastAppointment =
                            vehicleAppointments.length > 0
                              ? vehicleAppointments[0]
                              : null;

                          return (
                            <div key={vehicle.id} className='vehicle-card'>
                              <div className='vehicle-header'>
                                <div className='vehicle-plate'>
                                  🚗 {vehicle.licensePlate}
                                </div>
                                <div className='vehicle-badge'>
                                  {vehicleAppointments.length} RDV
                                </div>
                              </div>
                              <div className='vehicle-details'>
                                <strong>
                                  {vehicle.vehicleBrand} {vehicle.vehicleModel}
                                </strong>
                                <div className='vehicle-meta'>
                                  {vehicle.vehicleType}
                                  {vehicle.fuelType && ` • ${vehicle.fuelType}`}
                                </div>
                                <div className='vehicle-stats'>
                                  <span className='vehicle-stat-item success'>
                                    ✅ {completedCount} venue
                                    {completedCount !== 1 ? 's' : ''}
                                  </span>
                                  {cancelledCount > 0 && (
                                    <span className='vehicle-stat-item cancelled'>
                                      ❌ {cancelledCount} annulation
                                      {cancelledCount !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {noShowCount > 0 && (
                                    <span className='vehicle-stat-item no-show'>
                                      🚫 {noShowCount} absence
                                      {noShowCount !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {pendingCount > 0 && (
                                    <span className='vehicle-stat-item pending'>
                                      ⏳ {pendingCount} en attente
                                    </span>
                                  )}
                                </div>
                                {lastAppointment && (
                                  <div className='vehicle-last-visit'>
                                    📅 Dernier RDV:{' '}
                                    {new Date(
                                      lastAppointment.appointmentDate
                                    ).toLocaleDateString('fr-FR')}{' '}
                                    {lastAppointment.actualStatus ===
                                    'completed'
                                      ? '✅'
                                      : lastAppointment.actualStatus ===
                                          'cancelled'
                                        ? '❌'
                                        : lastAppointment.actualStatus ===
                                            'no_show'
                                          ? '🚫'
                                          : '⏳'}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className='empty-vehicles'>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                          🚗 Aucun véhicule enregistré pour ce client
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Historique des RDV */}
                  {selectedCustomer.appointments &&
                    selectedCustomer.appointments.length > 0 && (
                      <div className='appointments-section'>
                        <h3>
                          📅 Historique des RDV (
                          {selectedCustomer.appointments.length})
                        </h3>
                        <div className='appointments-list-detail'>
                          {selectedCustomer.appointments.map(apt => {
                            const getStatusInfo = (
                              status: string,
                              actualStatus: string | null
                            ) => {
                              // Priorité à actualStatus si défini
                              const displayStatus = actualStatus || status;

                              const statusMap: Record<
                                string,
                                { icon: string; label: string; class: string }
                              > = {
                                pending: {
                                  icon: '⏳',
                                  label: 'En attente',
                                  class: 'status-pending',
                                },
                                pending_verification: {
                                  icon: '⏳',
                                  label: 'En attente vérification',
                                  class: 'status-pending',
                                },
                                confirmed: {
                                  icon: '✅',
                                  label: 'Confirmé',
                                  class: 'status-confirmed',
                                },
                                completed: {
                                  icon: '🎉',
                                  label: 'Venue effectuée',
                                  class: 'status-completed',
                                },
                                cancelled: {
                                  icon: '❌',
                                  label: 'Annulé',
                                  class: 'status-cancelled',
                                },
                                no_show: {
                                  icon: '🚫',
                                  label: 'Absent',
                                  class: 'status-no-show',
                                },
                              };
                              return (
                                statusMap[displayStatus] || {
                                  icon: '❓',
                                  label: displayStatus,
                                  class: 'status-unknown',
                                }
                              );
                            };

                            const statusInfo = getStatusInfo(
                              apt.status,
                              apt.actualStatus
                            );

                            return (
                              <div key={apt.id} className='appointment-card'>
                                <div className='apt-date'>
                                  📅{' '}
                                  {new Date(
                                    apt.appointmentDate
                                  ).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}{' '}
                                  à {apt.appointmentTime}
                                </div>
                                <div className='apt-vehicle'>
                                  🚗 {apt.vehicleBrand} {apt.vehicleModel} (
                                  {apt.vehicleRegistration})
                                </div>
                                <div
                                  className={`apt-status ${statusInfo.class}`}
                                >
                                  {statusInfo.icon} {statusInfo.label}
                                </div>
                                {apt.notes && (
                                  <div className='apt-notes'>
                                    📝 {apt.notes}
                                  </div>
                                )}
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

      {/* Modal Ajouter Client */}
      {showAddModal && (
        <div className='modal-overlay' onClick={() => setShowAddModal(false)}>
          <div className='modal-content-add' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>➕ Ajouter un nouveau client</h2>
              <button
                className='close-modal-btn'
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form
              className='add-customer-form'
              onSubmit={async e => {
                e.preventDefault();
                try {
                  const token = localStorage.getItem('authToken');
                  const response = await fetch(
                    'http://localhost:3001/admin/customers',
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(newCustomer),
                    }
                  );

                  if (response.ok) {
                    alert('✅ Client ajouté avec succès !');
                    setShowAddModal(false);
                    setNewCustomer({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '+33',
                      notes: '',
                      vehicleBrand: '',
                      vehicleModel: '',
                      licensePlate: '',
                    });
                    loadCustomers();
                  } else {
                    alert("❌ Erreur lors de l'ajout du client");
                  }
                } catch (error) {
                  console.error('Erreur:', error);
                  alert("❌ Erreur lors de l'ajout du client");
                }
              }}
            >
              <h3
                style={{
                  marginBottom: '1rem',
                  color: '#1f2937',
                  fontSize: '1.1rem',
                }}
              >
                👤 Informations Client
              </h3>

              <div className='form-row'>
                <div className='form-group'>
                  <label>Prénom</label>
                  <input
                    type='text'
                    value={newCustomer.firstName}
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        firstName: e.target.value,
                      })
                    }
                    placeholder='Jean'
                  />
                </div>
                <div className='form-group'>
                  <label>Nom</label>
                  <input
                    type='text'
                    value={newCustomer.lastName}
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        lastName: e.target.value,
                      })
                    }
                    placeholder='Dupont'
                  />
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label>Email</label>
                  <input
                    type='email'
                    value={newCustomer.email}
                    onChange={e =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    placeholder='jean.dupont@email.com'
                  />
                </div>
                <div className='form-group'>
                  <label>Téléphone</label>
                  <input
                    type='tel'
                    value={newCustomer.phone}
                    onChange={e => {
                      let value = e.target.value;
                      // Assure que ça commence par +33
                      if (!value.startsWith('+33')) {
                        value = '+33' + value.replace(/^\+?33?/, '');
                      }
                      // Retire les espaces et caractères non numériques sauf +
                      value = value.replace(/[^\d+]/g, '');
                      setNewCustomer({ ...newCustomer, phone: value });
                    }}
                    placeholder='+33612345678'
                  />
                </div>
              </div>

              <h3
                style={{
                  marginTop: '1.5rem',
                  marginBottom: '1rem',
                  color: '#1f2937',
                  fontSize: '1.1rem',
                }}
              >
                🚗 Informations Véhicule (optionnel)
              </h3>

              <div className='form-row'>
                <div className='form-group'>
                  <label>Marque</label>
                  <input
                    type='text'
                    value={newCustomer.vehicleBrand}
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        vehicleBrand: e.target.value,
                      })
                    }
                    placeholder='Peugeot'
                  />
                </div>
                <div className='form-group'>
                  <label>Modèle</label>
                  <input
                    type='text'
                    value={newCustomer.vehicleModel}
                    onChange={e =>
                      setNewCustomer({
                        ...newCustomer,
                        vehicleModel: e.target.value,
                      })
                    }
                    placeholder='208'
                  />
                </div>
              </div>

              <div className='form-group'>
                <label>Immatriculation</label>
                <input
                  type='text'
                  value={newCustomer.licensePlate}
                  onChange={e => {
                    // Convertit en majuscules automatiquement
                    const value = e.target.value.toUpperCase();
                    setNewCustomer({ ...newCustomer, licensePlate: value });
                  }}
                  placeholder='AB-123-CD'
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className='form-group'>
                <label>Notes (optionnel)</label>
                <textarea
                  value={newCustomer.notes}
                  onChange={e =>
                    setNewCustomer({ ...newCustomer, notes: e.target.value })
                  }
                  rows={3}
                  placeholder='Informations supplémentaires...'
                />
              </div>

              <div className='form-actions'>
                <button
                  type='button'
                  className='btn-cancel'
                  onClick={() => setShowAddModal(false)}
                >
                  Annuler
                </button>
                <button type='submit' className='btn-submit'>
                  ✅ Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedCustomer && (
        <DeleteConfirmModal
          show={showDeleteModal}
          title='Supprimer ce client'
          message='⚠️ Attention : Cela va supprimer le client, ses véhicules et tous ses rendez-vous. Les créneaux seront libérés.'
          itemName={`${selectedCustomer.fullName} (${selectedCustomer.email})`}
          onConfirm={handleDeleteCustomer}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default AdminCustomers;
