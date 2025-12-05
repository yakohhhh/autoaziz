import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WeeklyCalendar } from '../../components';
import { VEHICLE_BRANDS, FUEL_TYPES } from '../../utils/vehicleData';
import { API_CONFIG } from '../../constants/app.constants';
import './Appointments.css';

const Appointments: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const loadFormData = () => {
    try {
      const savedData = localStorage.getItem('appointmentFormData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {}
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '+33',
      vehicleRegistration: '',
      vehicleType: 'Voiture',
      vehicleBrand: '',
      vehicleBrandCustom: '',
      vehicleModel: '',
      fuelType: 'Essence',
      appointmentDate: '',
      appointmentTime: '',
      notes: '',
    };
  };

  const [formData, setFormData] = useState(loadFormData());
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('appointmentFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      vehicleBrand: '',
      vehicleModel: '',
    }));
  }, [formData.vehicleType]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSlotSelection = (date: string, time: string) => {
    setFormData({
      ...formData,
      appointmentDate: date,
      appointmentTime: time,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || submitted) {
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Si "Autre" est sélectionné, utiliser la marque personnalisée
      const dataToSend = {
        ...formData,
        vehicleBrand:
          formData.vehicleBrand === 'Autre'
            ? formData.vehicleBrandCustom
            : formData.vehicleBrand,
      };
      // Retirer vehicleBrandCustom du payload envoyé
      delete dataToSend.vehicleBrandCustom;

      await axios.post(`${API_CONFIG.BASE_URL}/appointments`, dataToSend);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Une erreur est survenue. Veuillez réessayer.';
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.phone &&
          formData.phone.length >= 12
        );
      case 2:
        return (
          formData.vehicleRegistration &&
          formData.vehicleType &&
          formData.vehicleBrand &&
          (formData.vehicleBrand !== 'Autre' || formData.vehicleBrandCustom) &&
          formData.vehicleModel
        );
      case 3:
        return formData.appointmentDate && formData.appointmentTime;
      default:
        return false;
    }
  };

  const vehicleTypes = [
    { value: 'Voiture', icon: '🚗', price: '70€' },
    { value: 'Moto', icon: '🏍️', price: '60€' },
    { value: 'Utilitaire', icon: '🚐', price: '80€' },
    {
      value: '4x4',
      icon: '🚙',
      price: '75€',
      info: 'Sélectionnez 4x4 si votre véhicule possède 4 roues motrices, sont considérés comme 4X4 les SUV 4 roues motrices. Sélectionnez Voiture si vous possédez un SUV 2 roues motrices.',
    },
    { value: 'Camping-car', icon: '🚐', price: '90€' },
    { value: 'Collection', icon: '🏎️', price: '90€' },
  ];

  return (
    <div className='appointments'>
      <section className='appointments-header'>
        <div className='header-background'>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
        </div>
        <div className={`header-content ${isVisible ? 'fade-in' : ''}`}>
          <div className='appointment-badge'>⚡ Réservation instantanée</div>
          <h1>Prendre Rendez-vous</h1>
          <p>Réservez votre contrôle technique en quelques clics</p>
        </div>
      </section>

      <section className='appointments-content'>
        <div className='container'>
          {submitted && (
            <div className='success-message'>
              <div className='success-icon'>🎉</div>
              <h2>Rendez-vous confirmé !</h2>
              <p>
                Vous recevrez une confirmation par email et SMS. Merci de votre
                confiance !
              </p>
              <div className='success-details'>
                <div className='detail'>
                  <span className='icon'>📅</span>
                  <span>
                    Rendez-vous le {formData.appointmentDate} à{' '}
                    {formData.appointmentTime}
                  </span>
                </div>
                <div className='detail'>
                  <span className='icon'>🚗</span>
                  <span>
                    {formData.vehicleBrand === 'Autre'
                      ? formData.vehicleBrandCustom
                      : formData.vehicleBrand}{' '}
                    {formData.vehicleModel} - {formData.vehicleRegistration}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(1);
                  const resetData = {
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '+33',
                    vehicleRegistration: '',
                    vehicleType: 'Voiture',
                    vehicleBrand: '',
                    vehicleBrandCustom: '',
                    vehicleModel: '',
                    fuelType: 'Essence',
                    appointmentDate: '',
                    appointmentTime: '',
                    notes: '',
                  };
                  setFormData(resetData);
                  localStorage.removeItem('appointmentFormData');
                }}
                className='btn-new-appointment'
              >
                Nouveau rendez-vous
              </button>
            </div>
          )}

          {error && (
            <div className='error-message'>
              <span className='error-icon'>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!submitted && (
            <>
              <div className='progress-bar'>
                <div className='progress-steps'>
                  <div
                    className={`step ${currentStep >= 1 ? 'active' : ''} ${
                      currentStep > 1 ? 'completed' : ''
                    }`}
                  >
                    <span className='step-number'>1</span>
                    <span className='step-label'>Contact</span>
                  </div>
                  <div
                    className={`step ${currentStep >= 2 ? 'active' : ''} ${
                      currentStep > 2 ? 'completed' : ''
                    }`}
                  >
                    <span className='step-number'>2</span>
                    <span className='step-label'>Véhicule</span>
                  </div>
                  <div
                    className={`step ${currentStep >= 3 ? 'active' : ''} ${
                      currentStep > 3 ? 'completed' : ''
                    }`}
                  >
                    <span className='step-number'>3</span>
                    <span className='step-label'>Date & Heure</span>
                  </div>
                  <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                    <span className='step-number'>4</span>
                    <span className='step-label'>Confirmation</span>
                  </div>
                </div>
                <div className='progress-line'>
                  <div
                    className='progress-fill'
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className='appointment-form'>
                {/* ÉTAPE 1 : Contact */}
                {currentStep === 1 && (
                  <div className='form-step active'>
                    <div className='step-header'>
                      <h3>Vos informations personnelles</h3>
                      <p>Nous avons besoin de vos coordonnées</p>
                    </div>
                    <div className='form-grid'>
                      <div className='form-group'>
                        <label htmlFor='firstName'>
                          <span className='label-icon'>👤</span>
                          Prénom *
                        </label>
                        <input
                          type='text'
                          id='firstName'
                          name='firstName'
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder='Votre prénom'
                          required
                        />
                      </div>

                      <div className='form-group'>
                        <label htmlFor='lastName'>
                          <span className='label-icon'>👤</span>
                          Nom *
                        </label>
                        <input
                          type='text'
                          id='lastName'
                          name='lastName'
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder='Votre nom'
                          required
                        />
                      </div>

                      <div className='form-group'>
                        <label htmlFor='email'>
                          <span className='label-icon'>✉️</span>
                          Adresse email *
                        </label>
                        <input
                          type='email'
                          id='email'
                          name='email'
                          value={formData.email}
                          onChange={handleChange}
                          placeholder='votre@email.com'
                          required
                        />
                      </div>

                      <div className='form-group'>
                        <label htmlFor='phone'>
                          <span className='label-icon'>📱</span>
                          Téléphone *
                        </label>
                        <input
                          type='tel'
                          id='phone'
                          name='phone'
                          value={formData.phone}
                          onChange={e => {
                            let value = e.target.value;

                            // Retirer tous les espaces et caractères spéciaux sauf + au début
                            value = value.replace(/\s/g, '');

                            // Si l'utilisateur essaie de tout effacer, garder +33
                            if (value === '' || value === '+') {
                              setFormData({ ...formData, phone: '+33' });
                              return;
                            }

                            // Si le numéro commence par 0 (format français local)
                            if (value.startsWith('0')) {
                              // Convertir 06... en +336...
                              value = '+33' + value.substring(1);
                            }
                            // Si le numéro commence par +330 (erreur commune)
                            else if (value.startsWith('+330')) {
                              // Convertir +3306... en +336...
                              value = '+33' + value.substring(4);
                            }
                            // Si le numéro ne commence pas par +33
                            else if (!value.startsWith('+33')) {
                              // Si c'est juste des chiffres, ajouter +33 devant
                              if (/^\d/.test(value)) {
                                value = '+33' + value;
                              } else if (!value.startsWith('+')) {
                                value = '+33';
                              }
                            }

                            // Nettoyer : garder uniquement +33 suivi de chiffres
                            const match = value.match(/^\+33(\d*)/);
                            if (match) {
                              value = '+33' + match[1].replace(/\D/g, '');
                            } else {
                              value = '+33';
                            }

                            // Limiter à 12 caractères (+33 + 9 chiffres max)
                            if (value.length > 12) {
                              value = value.substring(0, 12);
                            }

                            setFormData({ ...formData, phone: value });
                          }}
                          onFocus={e => {
                            // Placer le curseur à la fin
                            const input = e.target;
                            setTimeout(() => {
                              input.setSelectionRange(
                                input.value.length,
                                input.value.length
                              );
                            }, 0);
                          }}
                          placeholder='06 12 34 56 78 ou +33 6 12 34 56 78'
                          pattern='\+33[1-9]\d{8}'
                          title='Numéro français valide (ex: 0612345678 ou +33612345678)'
                          required
                        />
                        <small
                          style={{
                            color: '#666',
                            fontSize: '0.85rem',
                            marginTop: '4px',
                            display: 'block',
                          }}
                        >
                          {formData.phone.length >= 12
                            ? '✓ Numéro valide'
                            : 'Tapez votre numéro (ex: 06 12 34 56 78)'}
                        </small>
                      </div>
                    </div>
                    <div className='step-navigation'>
                      <button
                        type='button'
                        className='btn-next'
                        onClick={nextStep}
                        disabled={!isStepValid(1)}
                      >
                        Continuer <span>→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 : Véhicule */}
                {currentStep === 2 && (
                  <div className='form-step active'>
                    <div className='step-header'>
                      <h3>Informations de votre véhicule</h3>
                      <p>Détails complets de votre véhicule</p>
                    </div>

                    <div className='form-group'>
                      <label>Type de véhicule *</label>
                      <div className='vehicle-types'>
                        {vehicleTypes.map(type => (
                          <div
                            key={type.value}
                            className={`vehicle-option ${
                              formData.vehicleType === type.value
                                ? 'selected'
                                : ''
                            }`}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                vehicleType: type.value,
                              })
                            }
                          >
                            <span className='vehicle-icon'>{type.icon}</span>
                            <span className='vehicle-name'>{type.value}</span>
                            <span className='vehicle-price'>{type.price}</span>
                          </div>
                        ))}
                      </div>
                      {formData.vehicleType === '4x4' && (
                        <div className='info-box' style={{ marginTop: '15px' }}>
                          <span className='icon'>ℹ️</span>
                          <div>
                            <p style={{ fontSize: '0.9rem', margin: 0 }}>
                              <strong>Important :</strong> Sélectionnez 4x4 si
                              votre véhicule possède 4 roues motrices. Sont
                              considérés comme 4X4 les SUV 4 roues motrices.
                              Sélectionnez Voiture si vous possédez un SUV 2
                              roues motrices.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='form-grid'>
                      <div className='form-group'>
                        <label htmlFor='vehicleBrand'>
                          <span className='label-icon'>🏭</span>
                          Marque *
                        </label>
                        <select
                          id='vehicleBrand'
                          name='vehicleBrand'
                          value={formData.vehicleBrand}
                          onChange={handleChange}
                          required
                        >
                          <option value=''>Sélectionnez une marque</option>
                          {VEHICLE_BRANDS[formData.vehicleType]?.map(brand => (
                            <option key={brand.name} value={brand.name}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.vehicleBrand === 'Autre' && (
                        <div className='form-group'>
                          <label htmlFor='vehicleBrandCustom'>
                            <span className='label-icon'>🏭</span>
                            Quelle marque ? *
                          </label>
                          <input
                            type='text'
                            id='vehicleBrandCustom'
                            name='vehicleBrandCustom'
                            value={formData.vehicleBrandCustom || ''}
                            onChange={handleChange}
                            placeholder='Tapez la marque de votre véhicule'
                            required
                          />
                        </div>
                      )}

                      <div className='form-group'>
                        <label htmlFor='vehicleModel'>
                          <span className='label-icon'>🚙</span>
                          Modèle *
                        </label>
                        <input
                          type='text'
                          id='vehicleModel'
                          name='vehicleModel'
                          value={formData.vehicleModel}
                          onChange={handleChange}
                          placeholder='Ex: Clio, 308, Golf...'
                          required
                        />
                      </div>

                      <div className='form-group'>
                        <label htmlFor='fuelType'>
                          <span className='label-icon'>⛽</span>
                          Type de carburant *
                        </label>
                        <select
                          id='fuelType'
                          name='fuelType'
                          value={formData.fuelType}
                          onChange={handleChange}
                          required
                        >
                          {FUEL_TYPES.map(fuel => (
                            <option key={fuel} value={fuel}>
                              {fuel}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className='form-group'>
                        <label htmlFor='vehicleRegistration'>
                          <span className='label-icon'>�</span>
                          Immatriculation *
                        </label>
                        <input
                          type='text'
                          id='vehicleRegistration'
                          name='vehicleRegistration'
                          value={formData.vehicleRegistration}
                          onChange={handleChange}
                          placeholder='AB-123-CD'
                          required
                        />
                      </div>
                    </div>

                    <div className='step-navigation'>
                      <button
                        type='button'
                        className='btn-prev'
                        onClick={prevStep}
                      >
                        <span>←</span> Retour
                      </button>
                      <button
                        type='button'
                        className='btn-next'
                        onClick={nextStep}
                        disabled={!isStepValid(2)}
                      >
                        Continuer <span>→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3 : Calendrier */}
                {currentStep === 3 && (
                  <div className='form-step active'>
                    <div className='step-header'>
                      <h3>Choisissez votre créneau</h3>
                      <p>
                        Sélectionnez un jour et un horaire (minimum 24h à
                        l'avance)
                      </p>
                    </div>

                    <WeeklyCalendar
                      onSelectSlot={handleSlotSelection}
                      selectedDate={formData.appointmentDate}
                      selectedTime={formData.appointmentTime}
                    />

                    {formData.appointmentDate && formData.appointmentTime && (
                      <div className='selected-slot-info'>
                        <div className='icon'>✓</div>
                        <div>
                          <strong>Créneau sélectionné :</strong>
                          <p>
                            {new Date(
                              formData.appointmentDate
                            ).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}{' '}
                            à {formData.appointmentTime}
                          </p>
                          <small
                            style={{
                              color: '#667eea',
                              fontWeight: '600',
                              marginTop: '8px',
                              display: 'block',
                            }}
                          >
                            👉 Cliquez sur "Continuer" pour valider ce créneau
                          </small>
                        </div>
                      </div>
                    )}

                    <div className='step-navigation'>
                      <button
                        type='button'
                        className='btn-prev'
                        onClick={prevStep}
                      >
                        <span>←</span> Retour
                      </button>
                      <button
                        type='button'
                        className='btn-next'
                        onClick={nextStep}
                        disabled={!isStepValid(3)}
                      >
                        Continuer <span>→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 4 : Confirmation */}
                {currentStep === 4 && (
                  <div className='form-step active'>
                    <div className='step-header'>
                      <h3>Récapitulatif de votre rendez-vous</h3>
                      <p>Vérifiez vos informations avant de confirmer</p>
                    </div>

                    <div className='summary-card'>
                      <div className='summary-section'>
                        <h4>👤 Vos informations</h4>
                        <p>
                          <strong>Prénom :</strong> {formData.firstName}
                        </p>
                        <p>
                          <strong>Nom :</strong> {formData.lastName}
                        </p>
                        <p>
                          <strong>Email :</strong> {formData.email}
                        </p>
                        <p>
                          <strong>Téléphone :</strong> {formData.phone}
                        </p>
                      </div>

                      <div className='summary-section'>
                        <h4>🚗 Votre véhicule</h4>
                        <p>
                          <strong>Type :</strong> {formData.vehicleType}
                        </p>
                        <p>
                          <strong>Véhicule :</strong>{' '}
                          {formData.vehicleBrand === 'Autre'
                            ? formData.vehicleBrandCustom
                            : formData.vehicleBrand}{' '}
                          {formData.vehicleModel}
                        </p>
                        <p>
                          <strong>Carburant :</strong> {formData.fuelType}
                        </p>
                        <p>
                          <strong>Immatriculation :</strong>{' '}
                          {formData.vehicleRegistration}
                        </p>
                      </div>

                      <div className='summary-section'>
                        <h4>📅 Rendez-vous</h4>
                        <p>
                          <strong>Date :</strong>{' '}
                          {new Date(
                            formData.appointmentDate
                          ).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p>
                          <strong>Heure :</strong> {formData.appointmentTime}
                        </p>
                        <p>
                          <strong>Prix :</strong>{' '}
                          {
                            vehicleTypes.find(
                              t => t.value === formData.vehicleType
                            )?.price
                          }
                        </p>
                      </div>
                    </div>

                    <div className='form-group'>
                      <label htmlFor='notes'>
                        <span className='label-icon'>📝</span>
                        Informations complémentaires (optionnel)
                      </label>
                      <textarea
                        id='notes'
                        name='notes'
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder='Ajoutez des informations supplémentaires si nécessaire...'
                        rows={4}
                      />
                    </div>

                    <div className='info-box'>
                      <span className='icon'>ℹ️</span>
                      <div>
                        <strong>Important :</strong>
                        <p>
                          Vous recevrez un code de vérification par email et SMS
                          pour valider votre rendez-vous.
                        </p>
                      </div>
                    </div>

                    <div className='step-navigation'>
                      <button
                        type='button'
                        className='btn-prev'
                        onClick={prevStep}
                      >
                        <span>←</span> Retour
                      </button>
                      <button
                        type='submit'
                        className='btn-submit'
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className='spinner-small'></span> Envoi en
                            cours...
                          </>
                        ) : (
                          <>
                            Confirmer le rendez-vous <span>✓</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Appointments;
