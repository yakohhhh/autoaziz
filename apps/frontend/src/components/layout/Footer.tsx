import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className='footer'>
      <div className='footer-content'>
        <div className='footer-section'>
          <h3>Auto Aziz</h3>
          <p>Votre centre de contrôle technique de confiance</p>
        </div>

        <div className='footer-section'>
          <h3>Contact</h3>
          <p>📍 123 Rue de la République, 75001 Paris</p>
          <p>📞 01 23 45 67 89</p>
          <p>📧 contact@autoaziz.fr</p>
        </div>

        <div className='footer-section'>
          <h3>Horaires</h3>
          <p>Lundi - Vendredi: 8h00 - 18h00</p>
          <p>Samedi: 9h00 - 17h00</p>
          <p>Dimanche: Fermé</p>
        </div>
      </div>

      <div className='footer-bottom'>
        <p>&copy; 2024 Auto Aziz. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
