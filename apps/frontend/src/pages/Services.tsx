import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

const Services: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const services = [
    {
      title: 'Contrôle Technique Périodique',
      description:
        'Contrôle obligatoire tous les 2 ans pour les véhicules de plus de 4 ans',
      price: '70€',
      duration: '30 min',
      icon: '🔍',
      popular: true,
    },
    {
      title: 'Contre-Visite',
      description:
        'Vérification des réparations effectuées suite à un contrôle défavorable',
      price: '25€',
      duration: '15 min',
      icon: '🔧',
      popular: false,
    },
    {
      title: 'Contrôle Pollution',
      description: 'Vérification des émissions polluantes de votre véhicule',
      price: '40€',
      duration: '20 min',
      icon: '🌱',
      popular: false,
    },
    {
      title: 'Contrôle pour Véhicules de Collection',
      description: 'Contrôle spécialisé pour les véhicules de plus de 30 ans',
      price: '80€',
      duration: '45 min',
      icon: '🏆',
      popular: false,
    },
  ];

  return (
    <div className='services'>
      <section className='services-header'>
        <div className='header-background'>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
        </div>
        <div className={`header-content ${isVisible ? 'fade-in' : ''}`}>
          <div className='service-badge'>🏅 Certifié DEKRA depuis 1995</div>
          <h1>Nos Services Premium</h1>
          <p>
            Des prestations de qualité supérieure pour tous types de véhicules
          </p>
        </div>
      </section>

      <section className='services-list'>
        <div className='container'>
          <div className='section-header'>
            <h2>Choisissez votre service</h2>
            <p>Tarifs transparents et service rapide garanti</p>
          </div>
          <div className='services-grid'>
            {services.map((service, index) => (
              <div
                key={index}
                className={`service-card ${service.popular ? 'popular' : ''}`}
              >
                {service.popular && (
                  <div className='popular-badge'>Populaire</div>
                )}
                <div className='service-icon'>{service.icon}</div>
                <h3>{service.title}</h3>
                <p className='description'>{service.description}</p>
                <div className='service-details'>
                  <div className='price-tag'>
                    <span className='price'>{service.price}</span>
                    <span className='price-label'>TTC</span>
                  </div>
                  <div className='duration-tag'>
                    <span className='duration'>⏱ {service.duration}</span>
                  </div>
                </div>
                <Link to='/rendez-vous' className='book-button'>
                  <span>📅</span>
                  Réserver maintenant
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='process'>
        <div className='container'>
          <div className='section-header'>
            <h2>Comment se déroule le contrôle ?</h2>
            <p>Un processus simple et transparent en 3 étapes</p>
          </div>
          <div className='process-steps'>
            <div className='step'>
              <div className='step-icon'>
                <div className='step-number'>1</div>
              </div>
              <div className='step-content'>
                <h3>Accueil & Vérification</h3>
                <p>
                  Présentation de vos documents et vérification de votre
                  identité dans notre espace d'accueil moderne
                </p>
              </div>
            </div>
            <div className='step-connector'></div>
            <div className='step'>
              <div className='step-icon'>
                <div className='step-number'>2</div>
              </div>
              <div className='step-content'>
                <h3>Contrôle Technique</h3>
                <p>
                  Inspection complète de votre véhicule par nos techniciens
                  certifiés avec équipements de dernière génération
                </p>
              </div>
            </div>
            <div className='step-connector'></div>
            <div className='step'>
              <div className='step-icon'>
                <div className='step-number'>3</div>
              </div>
              <div className='step-content'>
                <h3>Résultat & Conseils</h3>
                <p>
                  Remise du procès-verbal, explications détaillées et conseils
                  personnalisés pour votre véhicule
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='cta-section'>
        <div className='container'>
          <div className='cta-content'>
            <h2>Prêt à réserver votre contrôle ?</h2>
            <p>
              Prenez rendez-vous dès maintenant et bénéficiez de notre expertise
            </p>
            <Link to='/rendez-vous' className='btn-primary-large'>
              Réserver en ligne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
