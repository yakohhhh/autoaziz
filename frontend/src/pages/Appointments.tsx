import React, { useState } from 'react';
import axios from 'axios';
import './Appointments.css';

const Appointments: React.FC = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      console.error(err);
    }
  };

  return (
    <div className="appointments">
      <section className="appointments-header">
        <h1>Prendre Rendez-vous</h1>
        <p>Réservez votre créneau en quelques clics</p>
      </section>

      <section className="appointments-content">
        {submitted && (
          <div className="success-message">
            <h2>✓ Rendez-vous confirmé !</h2>
            <p>Vous recevrez une confirmation par email.</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-section">
            <h3>Vos informations</h3>
            <div className="form-group">
              <label htmlFor="name">Nom complet *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Informations du véhicule</h3>
            <div className="form-group">
              <label htmlFor="vehicleRegistration">Immatriculation *</label>
              <input
                type="text"
                id="vehicleRegistration"
                name="vehicleRegistration"
                value={formData.vehicleRegistration}
                onChange={handleChange}
                placeholder="AB-123-CD"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vehicleType">Type de véhicule *</label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
              >
                <option value="Voiture">Voiture</option>
                <option value="Moto">Moto</option>
                <option value="Camionnette">Camionnette</option>
                <option value="Collection">Véhicule de collection</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Date et heure</h3>
            <div className="form-group">
              <label htmlFor="appointmentDate">Date du rendez-vous *</label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointmentTime">Heure *</label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
              >
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
              </select>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Confirmer le rendez-vous
          </button>
        </form>
      </section>
    </div>
  );
};

export default Appointments;
