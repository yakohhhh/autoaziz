import React from 'react';
import './Services.css';

const Services: React.FC = () => {
  const services = [
    {
      title: 'Contrôle Technique Périodique',
      description:
        'Contrôle obligatoire tous les 2 ans pour les véhicules de plus de 4 ans',
      price: '70€',
      duration: '30 min',
    },
    {
      title: 'Contre-Visite',
      description:
        'Vérification des réparations effectuées suite à un contrôle défavorable',
      price: '25€',
      duration: '15 min',
    },
    {
      title: 'Contrôle Pollution',
      description: 'Vérification des émissions polluantes de votre véhicule',
      price: '40€',
      duration: '20 min',
    },
    {
      title: 'Contrôle pour Véhicules de Collection',
      description: 'Contrôle spécialisé pour les véhicules de plus de 30 ans',
      price: '80€',
      duration: '45 min',
    },
  ];

  return (
    <div className='services'>
      <section className='services-header'>
        <h1>Nos Services</h1>
        <p>Des prestations de qualité pour tous types de véhicules</p>
      </section>

      <section className='services-list'>
        {services.map((service, index) => (
          <div key={index} className='service-card'>
            <h2>{service.title}</h2>
            <p className='description'>{service.description}</p>
            <div className='service-details'>
              <span className='price'>{service.price}</span>
              <span className='duration'>⏱ {service.duration}</span>
            </div>
            <a href='/rendez-vous' className='book-button'>
              Réserver
            </a>
          </div>
        ))}
      </section>

      <section className='process'>
        <h2>Comment se déroule le contrôle ?</h2>
        <div className='process-steps'>
          <div className='step'>
            <div className='step-number'>1</div>
            <h3>Accueil</h3>
            <p>
              Présentation de vos documents et vérification de votre identité
            </p>
          </div>
          <div className='step'>
            <div className='step-number'>2</div>
            <h3>Contrôle</h3>
            <p>
              Inspection complète de votre véhicule par nos techniciens
              certifiés
            </p>
          </div>
          <div className='step'>
            <div className='step-number'>3</div>
            <h3>Résultat</h3>
            <p>Remise du procès-verbal et explications détaillées</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
