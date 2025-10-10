import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='home'>
      {/* Hero Section */}
      <section className='hero'>
        <div className='hero-background'>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
          <div className='gradient-orb orb-3'></div>
        </div>
        <div className={`hero-content ${isVisible ? 'fade-in' : ''}`}>
          <div className='hero-badge'>
            ✨ Centre certifié depuis 1995
          </div>
          <h1 className='hero-title'>
            <span className='highlight'>Auto Aziz</span>
            <br />
            Contrôle Technique Excellence
          </h1>
          <p className='hero-subtitle'>
            Votre sécurité routière est notre engagement quotidien. 
            Expertise, rapidité et transparence garanties.
          </p>
          <div className='hero-actions'>
            <Link to='/rendez-vous' className='cta-primary'>
              <span>📅</span>
              Réserver maintenant
            </Link>
            <Link to='/services' className='cta-secondary'>
              Nos services
            </Link>
          </div>
          <div className='hero-stats'>
            <div className='stat'>
              <span className='stat-number'>15k+</span>
              <span className='stat-label'>Véhicules contrôlés</span>
            </div>
            <div className='stat'>
              <span className='stat-number'>98%</span>
              <span className='stat-label'>Clients satisfaits</span>
            </div>
            <div className='stat'>
              <span className='stat-number'>30min</span>
              <span className='stat-label'>Temps moyen</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='features-section'>
        <div className='container'>
          <div className='section-header'>
            <h2>Pourquoi choisir Auto Aziz ?</h2>
            <p>Une expérience de contrôle technique réinventée</p>
          </div>
          <div className='features-grid'>
            <div className='feature-card'>
              <div className='feature-icon'>🔧</div>
              <h3>Équipement de pointe</h3>
              <p>Matériel dernier cri et techniciens certifiés pour un diagnostic précis et fiable</p>
            </div>
            <div className='feature-card'>
              <div className='feature-icon'>⚡</div>
              <h3>Service express</h3>
              <p>Contrôle rapide sans compromis sur la qualité, résultats immédiats</p>
            </div>
            <div className='feature-card'>
              <div className='feature-icon'>💎</div>
              <h3>Transparence totale</h3>
              <p>Explications détaillées, tarifs clairs, aucune surprise</p>
            </div>
            <div className='feature-card'>
              <div className='feature-icon'>📱</div>
              <h3>Réservation facile</h3>
              <p>Prenez rendez-vous en ligne, recevez des rappels automatiques</p>
            </div>
            <div className='feature-card'>
              <div className='feature-icon'>🚗</div>
              <h3>Tous véhicules</h3>
              <p>Voitures, motos, utilitaires - nous contrôlons tous types de véhicules</p>
            </div>
            <div className='feature-card'>
              <div className='feature-icon'>🛡️</div>
              <h3>Garantie qualité</h3>
              <p>Service certifié avec garantie, votre sécurité est notre priorité</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='cta-section'>
        <div className='container'>
          <div className='cta-content'>
            <h2>Prêt pour votre contrôle technique ?</h2>
            <p>Réservez dès maintenant et bénéficiez de notre service premium</p>
            <div className='cta-actions'>
              <Link to='/rendez-vous' className='btn-primary-large'>
                Prendre rendez-vous
              </Link>
              <Link to='/contact' className='btn-outline-large'>
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Quick Info */}
      <section className='contact-quick'>
        <div className='container'>
          <div className='contact-grid'>
            <div className='contact-card'>
              <div className='contact-icon'>📍</div>
              <h3>Adresse</h3>
              <p>123 Rue de la République<br />75001 Paris, France</p>
            </div>
            <div className='contact-card'>
              <div className='contact-icon'>📞</div>
              <h3>Téléphone</h3>
              <p>01 23 45 67 89</p>
            </div>
            <div className='contact-card'>
              <div className='contact-icon'>⏰</div>
              <h3>Horaires</h3>
              <p>Lun-Ven: 8h-18h<br />Sam: 9h-17h</p>
            </div>
            <div className='contact-card'>
              <div className='contact-icon'>✉️</div>
              <h3>Email</h3>
              <p>contact@autoaziz.fr</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
