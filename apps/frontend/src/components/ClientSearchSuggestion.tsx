import React, { useState, useEffect } from 'react';
import './ClientSearchSuggestion.css';

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
  date: string;
  time: string;
  status: string;
}

interface ClientSuggestion {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  vehicles: Vehicle[];
  lastAppointments: Appointment[];
  totalAppointments: number;
}

interface ClientSearchSuggestionProps {
  onSelectClient: (client: ClientSuggestion) => void;
  onClearSelection: () => void;
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

const ClientSearchSuggestion: React.FC<ClientSearchSuggestionProps> = ({
  onSelectClient,
  onClearSelection,
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
}) => {
  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] =
    useState<ClientSuggestion | null>(null);

  useEffect(() => {
    const searchClients = async () => {
      if (!firstName && !lastName) {
        setSuggestions([]);
        return;
      }

      // Attendre au moins 2 caractères
      if (
        (firstName && firstName.length < 2) &&
        (lastName && lastName.length < 2)
      ) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (firstName) params.append('firstName', firstName);
        if (lastName) params.append('lastName', lastName);

        const token = localStorage.getItem('authToken');
        const response = await fetch(
          `http://localhost:3001/admin/customers/search-by-name?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce de 300ms
    const timeoutId = setTimeout(searchClients, 300);
    return () => clearTimeout(timeoutId);
  }, [firstName, lastName]);

  const handleSelectClient = (client: ClientSuggestion) => {
    setSelectedClient(client);
    setSuggestions([]);
    onSelectClient(client);
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
    onClearSelection();
  };

  return (
    <div className='client-search-suggestion'>
      {selectedClient ? (
        <div className='selected-client-card'>
          <div className='selected-client-header'>
            <div>
              <strong>✅ Client sélectionné</strong>
              <p className='selected-client-name'>{selectedClient.fullName}</p>
              <p className='selected-client-email'>{selectedClient.email}</p>
              <p className='selected-client-phone'>{selectedClient.phone}</p>
              <p className='selected-client-stats'>
                {selectedClient.totalAppointments} rendez-vous •{' '}
                {selectedClient.vehicles.length} véhicule(s)
              </p>
            </div>
            <button
              type='button'
              onClick={handleClearSelection}
              className='btn-clear-selection'
            >
              ✕ Changer
            </button>
          </div>
        </div>
      ) : (
        <div className='search-inputs'>
          <div className='form-row'>
            <div className='form-group'>
              <label>Prénom *</label>
              <input
                type='text'
                value={firstName}
                onChange={e => onFirstNameChange(e.target.value)}
                placeholder='Tapez pour rechercher...'
                autoComplete='off'
              />
            </div>
            <div className='form-group'>
              <label>Nom *</label>
              <input
                type='text'
                value={lastName}
                onChange={e => onLastNameChange(e.target.value)}
                placeholder='Tapez pour rechercher...'
                autoComplete='off'
              />
            </div>
          </div>

          {loading && (
            <div className='suggestions-loading'>
              <p>🔍 Recherche en cours...</p>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className='suggestions-list'>
              <p className='suggestions-header'>
                💡 {suggestions.length} client(s) trouvé(s) - Cliquez pour
                sélectionner
              </p>
              {suggestions.map(client => (
                <div
                  key={client.id}
                  className='suggestion-item'
                  onClick={() => handleSelectClient(client)}
                >
                  <div className='suggestion-main'>
                    <strong>{client.fullName}</strong>
                    <span className='suggestion-email'>{client.email}</span>
                  </div>
                  <div className='suggestion-details'>
                    <span>📱 {client.phone}</span>
                    <span>
                      📅 {client.totalAppointments} RDV
                    </span>
                    <span>
                      🚗 {client.vehicles.length} véhicule(s)
                    </span>
                  </div>
                  {client.vehicles.length > 0 && (
                    <div className='suggestion-vehicles'>
                      {client.vehicles.map(v => (
                        <span key={v.id} className='vehicle-tag'>
                          {v.licensePlate} - {v.vehicleBrand} {v.vehicleModel}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading &&
            suggestions.length === 0 &&
            (firstName || lastName) &&
            (firstName.length >= 2 || lastName.length >= 2) && (
              <div className='suggestions-empty'>
                <p>ℹ️ Aucun client trouvé - Un nouveau client sera créé</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ClientSearchSuggestion;
