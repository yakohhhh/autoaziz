import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    appointmentDate: '',
    appointmentTime: '09:00',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:3001/appointments', formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        vehicleRegistration: '',
        vehicleType: 'Voiture',
        appointmentDate: '',
        appointmentTime: '09:00',
      });
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.phone;
      case 2:
        return formData.vehicleRegistration && formData.vehicleType;
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

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  return (
    <div className='appointments'>
      <section className='appointments-header'>
        <div className='header-background'>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
        </div>
        <div className={`header-content ${isVisible ? 'fade-in' : ''}`}>
          <div className='appointment-badge'>
            ⚡ Réservation instantanée
          </div>
          <h1>Prendre Rendez-vous</h1>
          <p>Réservez votre contrôle technique en 3 étapes simples</p>
        </div>
      </section>

      <section className='appointments-content'>
        <div className='container'>
          {submitted && (
            <div className='success-message'>
              <div className='success-icon'>🎉</div>
              <h2>Rendez-vous confirmé !</h2>
              <p>Vous recevrez une confirmation par email sous peu. Merci de votre confiance !</p>
              <div className='success-details'>
                <div className='detail'>
                  <span className='icon'>📅</span>
                  <span>Rendez-vous le {formData.appointmentDate} à {formData.appointmentTime}</span>
                </div>
                <div className='detail'>
                  <span className='icon'>🚗</span>
                  <span>{formData.vehicleType} - {formData.vehicleRegistration}</span>
                </div>
              </div>
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
                  <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <span className='step-number'>1</span>
                    <span className='step-label'>Informations</span>
                  </div>
                  <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <span className='step-number'>2</span>
                    <span className='step-label'>Véhicule</span>
                  </div>
                  <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                    <span className='step-number'>3</span>
                    <span className='step-label'>Planning</span>
                  </div>
                </div>
                <div className='progress-line'>
                  <div 
                    className='progress-fill' 
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  ></div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className='appointment-form'>
                {currentStep === 1 && (
                  <div className='form-step active'>
                    <div className='step-header'>
                      <h3>Vos informations personnelles</h3>
                      <p>Commençons par vos coordonnées</p>
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

                {currentStep === 2 && (
                  <div className='form-step active'>
                    <div className='step-header'>
                      <h3>Informations de votre véhicule</h3>
                      <p>Quelques détails sur votre véhicule</p>
                    </div>
                    
                    <div className='form-group'>
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

                    <div className='form-group'>
                      <label>Type de véhicule *</label>
                      <div className='vehicle-types'>
                        {vehicleTypes.map((type) => (
                          <div 
                            key={type.value}
                            className={`vehicle-option ${formData.vehicleType === type.value ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, vehicleType: type.value })}
                          >
                            <span className='vehicle-icon'>{type.icon}</span>
                            <span className='vehicle-name'>{type.value}</span>
                            <span className='vehicle-price'>{type.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='step-navigation'>
                      <button type='button' className='btn-prev' onClick={prevStep}>
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

                {currentStep === 3 && (
                  <div className='form-step active'>
                    <div className='step-header'>
                      <h3>Choisissez votre créneau</h3>
                      <p>Sélectionnez la date et l'heure qui vous conviennent</p>
                    </div>
                    
                    <div className='form-group'>
                      <label htmlFor='appointmentDate'>
                        <span className='label-icon'>📅</span>
                        Date du rendez-vous *
                      </label>
                      <input
                        type='date'
                        id='appointmentDate'
                        name='appointmentDate'
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className='form-group'>
                      <label>
                        <span className='label-icon'>⏰</span>
                        Créneau horaire *
                      </label>
                      <div className='time-slots'>
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className={`time-slot ${formData.appointmentTime === time ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, appointmentTime: time })}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='step-navigation'>
                      <button type='button' className='btn-prev' onClick={prevStep}>
                        <span>←</span> Retour
                      </button>
                      <button 
                        type='submit' 
                        className='btn-submit'
                        disabled={!isStepValid(3) || loading}
                      >
                        {loading ? 'Confirmation...' : 'Confirmer le rendez-vous'} 
                        <span>✓</span>
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
