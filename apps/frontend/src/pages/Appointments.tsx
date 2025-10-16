import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { VEHICLE_BRANDS, FUEL_TYPES, getYearsList } from '../utils/vehicleData';
import './Appointments.css';

const Appointments: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleRegistration: '',
    vehicleType: 'Voiture',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    fuelType: 'Essence',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Mettre à jour les modèles disponibles quand la marque change
  useEffect(() => {
    if (formData.vehicleBrand) {
      const brand = VEHICLE_BRANDS[formData.vehicleType]?.find(
        b => b.name === formData.vehicleBrand
      );
      setAvailableModels(brand?.models || []);
      // Reset le modèle si la marque change
      setFormData(prev => ({ ...prev, vehicleModel: '' }));
    } else {
      setAvailableModels([]);
    }
  }, [formData.vehicleBrand, formData.vehicleType]);

  // Réinitialiser marque et modèle quand le type change
  useEffect(() => {
    setFormData(prev => ({
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
      [name]: name === 'vehicleYear' ? parseInt(value) : value,
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
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:3001/appointments', formData);
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
        return formData.name && formData.email && formData.phone;
      case 2:
        return (
          formData.vehicleRegistration &&
          formData.vehicleType &&
          formData.vehicleBrand &&
          formData.vehicleModel &&
          formData.vehicleYear
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
    { value: 'Camionnette', icon: '🚐', price: '80€' },
    { value: 'Collection', icon: '🏎️', price: '90€' },
  ];

  const yearsList = getYearsList();

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
                    {formData.vehicleBrand} {formData.vehicleModel} (
                    {formData.vehicleYear}) - {formData.vehicleRegistration}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(1);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    vehicleRegistration: '',
                    vehicleType: 'Voiture',
                    vehicleBrand: '',
                    vehicleModel: '',
                    vehicleYear: new Date().getFullYear(),
                    fuelType: 'Essence',
                    appointmentDate: '',
                    appointmentTime: '',
                    notes: '',
                  });
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
                        <label htmlFor='name'>
                          <span className='label-icon'>👤</span>
                          Nom complet *
                        </label>
                        <input
                          type='text'
                          id='name'
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                          placeholder='Votre nom et prénom'
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
                          onChange={handleChange}
                          placeholder='06 12 34 56 78'
                          required
                        />
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

                      <div className='form-group'>
                        <label htmlFor='vehicleModel'>
                          <span className='label-icon'>🚙</span>
                          Modèle *
                        </label>
                        <select
                          id='vehicleModel'
                          name='vehicleModel'
                          value={formData.vehicleModel}
                          onChange={handleChange}
                          disabled={!formData.vehicleBrand}
                          required
                        >
                          <option value=''>
                            {formData.vehicleBrand
                              ? 'Sélectionnez un modèle'
                              : "Choisissez d'abord une marque"}
                          </option>
                          {availableModels.map(model => (
                            <option key={model} value={model}>
                              {model}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className='form-group'>
                        <label htmlFor='vehicleYear'>
                          <span className='label-icon'>📅</span>
                          Année de mise en circulation *
                        </label>
                        <select
                          id='vehicleYear'
                          name='vehicleYear'
                          value={formData.vehicleYear}
                          onChange={handleChange}
                          required
                        >
                          {yearsList.map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
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

                      <div className='form-group full-width'>
                        <label htmlFor='vehicleRegistration'>
                          <span className='label-icon'>🏷️</span>
                          Numéro d'immatriculation *
                        </label>
                        <input
                          type='text'
                          id='vehicleRegistration'
                          name='vehicleRegistration'
                          value={formData.vehicleRegistration}
                          onChange={handleChange}
                          placeholder='AA-123-BB'
                          style={{ textTransform: 'uppercase' }}
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
                          <strong>Nom :</strong> {formData.name}
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
                          <strong>Véhicule :</strong> {formData.vehicleBrand}{' '}
                          {formData.vehicleModel} ({formData.vehicleYear})
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
