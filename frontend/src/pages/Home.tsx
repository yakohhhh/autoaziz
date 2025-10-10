import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Auto Aziz - Contrôle Technique Automobile</h1>
          <p>Votre sécurité, notre priorité</p>
          <a href="/rendez-vous" className="cta-button">Prendre rendez-vous</a>
        </div>
      </section>

      <section className="info-section">
        <h2>Bienvenue chez Auto Aziz</h2>
        <p>
          Nous sommes un centre de contrôle technique automobile certifié, 
          engagé à garantir la sécurité et la conformité de votre véhicule.
        </p>
        <div className="features">
          <div className="feature">
            <h3>🔧 Service Professionnel</h3>
            <p>Techniciens certifiés et équipements de pointe</p>
          </div>
          <div className="feature">
            <h3>⏰ Horaires Flexibles</h3>
            <p>Ouvert du lundi au samedi pour votre convenance</p>
          </div>
          <div className="feature">
            <h3>📍 Facilement Accessible</h3>
            <p>Parking gratuit et accessible en transport</p>
          </div>
        </div>
      </section>

      <section className="contact-info">
        <h2>Nos Coordonnées</h2>
        <div className="contact-details">
          <div className="contact-item">
            <h3>📍 Adresse</h3>
            <p>123 Rue de la République<br/>75001 Paris, France</p>
          </div>
          <div className="contact-item">
            <h3>📞 Téléphone</h3>
            <p>01 23 45 67 89</p>
          </div>
          <div className="contact-item">
            <h3>⏰ Horaires</h3>
            <p>Lundi - Vendredi: 8h00 - 18h00<br/>Samedi: 9h00 - 17h00<br/>Dimanche: Fermé</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
