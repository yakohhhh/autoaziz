import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../utils/leafletFix';
import './Contact.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const position: [number, number] = [48.8566, 2.3522]; // Paris coordinates

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:3001/contacts', formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    }
  };

  return (
    <div className='contact'>
      <section className='contact-header'>
        <div className='header-content'>
          <h1>Nous Contacter</h1>
          <p>Une question ? N'hésitez pas à nous écrire</p>
        </div>
      </section>

      <section className='contact-content'>
        <div className='contact-info-section'>
          <div className='info-card'>
            <h3>📍 Adresse</h3>
            <p>
              123 Rue de la République
              <br />
              75001 Paris, France
            </p>
          </div>
          <div className='info-card'>
            <h3>📞 Téléphone</h3>
            <p>01 23 45 67 89</p>
          </div>
          <div className='info-card'>
            <h3>📧 Email</h3>
            <p>contact@autoaziz.fr</p>
          </div>
          <div className='info-card'>
            <h3>⏰ Horaires</h3>
            <p>
              Lundi - Vendredi: 8h00 - 18h00
              <br />
              Samedi: 9h00 - 17h00
              <br />
              Dimanche: Fermé
            </p>
          </div>
        </div>

        <div className='map-container'>
          <h2>Notre Localisation</h2>
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={position}>
              <Popup>
                Auto Aziz
                <br />
                123 Rue de la République
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className='contact-form-section'>
          <h2>Envoyez-nous un message</h2>

          {submitted && (
            <div className='success-message'>
              <h3>✓ Message envoyé !</h3>
              <p>Nous vous répondrons dans les plus brefs délais.</p>
            </div>
          )}

          {error && (
            <div className='error-message'>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='contact-form'>
            <div className='form-group'>
              <label htmlFor='name'>Nom complet *</label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='email'>Email *</label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='phone'>Téléphone *</label>
              <input
                type='tel'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='message'>Message *</label>
              <textarea
                id='message'
                name='message'
                value={formData.message}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>

            <button type='submit' className='submit-button'>
              Envoyer le message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
