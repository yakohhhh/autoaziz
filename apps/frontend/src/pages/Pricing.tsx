import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const pricingPlans = [
    {
      id: 'standard',
      name: 'Contrôle Standard',
      price: '70',
      duration: '30 min',
      popular: true,
      icon: '🔍',
      features: [
        'Contrôle complet de votre véhicule',
        '124 points de contrôle réglementaires',
        'Procès-verbal immédiat',
        'Conseils personnalisés gratuits',
        'Garantie qualité 100%',
      ],
    },
    {
      id: 'counter-visit',
      name: 'Contre-Visite',
      price: '25',
      duration: '15 min',
      popular: false,
      icon: '🔧',
      features: [
        'Vérification des réparations effectuées',
        'Valable dans les 2 mois suivants',
        'Nouveau procès-verbal si conforme',
        'Conseils pour la mise en conformité',
      ],
    },
    {
      id: 'pollution',
      name: 'Contrôle Pollution',
      price: '40',
      duration: '20 min',
      popular: false,
      icon: '🌱',
      features: [
        'Test des émissions polluantes',
        'Mesure CO, HC, NOx et opacité',
        'Rapport détaillé avec recommandations',
        'Conseils environnementaux',
      ],
    },
    {
      id: 'collection',
      name: 'Véhicules de Collection',
      price: '80',
      duration: '45 min',
      popular: false,
      icon: '🏆',
      features: [
        'Contrôle spécialisé +30ans',
        'Expertise adaptée aux anciens',
        'Certificat de conformité',
        'Accompagnement personnalisé',
      ],
    },
  ];

  return (
    <div className='pricing'>
      <section className='pricing-header'>
        <div className='header-background'>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
        </div>
        <div className={`header-content ${isVisible ? 'fade-in' : ''}`}>
          <div className='pricing-badge'>
            💎 Prix transparents, qualité garantie
          </div>
          <h1>Tarifs & Services</h1>
          <p>
            Des prix justes et transparents pour tous vos besoins de contrôle
            technique
          </p>
        </div>
      </section>

      <section className='pricing-content'>
        <div className='container'>
          <div className='section-header'>
            <h2>Choisissez votre formule</h2>
            <p>Tous nos tarifs sont TTC, sans frais cachés</p>
          </div>

          <div className='pricing-grid'>
            {pricingPlans.map(plan => (
              <div
                key={plan.id}
                className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              >
                {plan.popular && (
                  <div className='popular-badge'>⭐ Le plus demandé</div>
                )}
                <div className='card-header'>
                  <div className='service-icon'>{plan.icon}</div>
                  <h3>{plan.name}</h3>
                  <div className='price-display'>
                    <span className='price'>{plan.price}€</span>
                    <span className='price-suffix'>TTC</span>
                  </div>
                  <div className='duration-badge'>⏱ {plan.duration}</div>
                </div>

                <div className='card-body'>
                  <ul className='features-list'>
                    {plan.features.map((feature, index) => (
                      <li key={index}>
                        <span className='check-icon'>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='card-footer'>
                  <Link to='/rendez-vous' className='book-btn'>
                    <span>📅</span>
                    Réserver maintenant
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='payment-info'>
        <div className='container'>
          <div className='payment-card'>
            <div className='payment-icon'>💳</div>
            <h3>Moyens de paiement acceptés</h3>
            <div className='payment-methods'>
              <div className='payment-method'>
                <span className='icon'>💵</span>
                <span>Espèces</span>
              </div>
              <div className='payment-method'>
                <span className='icon'>💳</span>
                <span>Carte bancaire</span>
              </div>
              <div className='payment-method'>
                <span className='icon'>📄</span>
                <span>Chèque</span>
              </div>
              <div className='payment-method'>
                <span className='icon'>📱</span>
                <span>Paiement mobile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='faq-section'>
        <div className='container'>
          <div className='section-header'>
            <h2>Questions Fréquentes</h2>
            <p>Tout ce que vous devez savoir sur le contrôle technique</p>
          </div>

          <div className='faq-grid'>
            <div className='faq-item'>
              <div className='faq-icon'>📅</div>
              <h3>Quand faire mon contrôle technique ?</h3>
              <p>
                Premier contrôle dans les 6 mois avant le 4ème anniversaire de
                votre véhicule, puis tous les 2 ans. Nous vous envoyons des
                rappels automatiques !
              </p>
            </div>

            <div className='faq-item'>
              <div className='faq-icon'>📋</div>
              <h3>Quels documents apporter ?</h3>
              <p>
                Carte grise du véhicule et pièce d'identité du propriétaire.
                C'est tout ! Nous nous occupons du reste.
              </p>
            </div>

            <div className='faq-item'>
              <div className='faq-icon'>🔧</div>
              <h3>Contrôle défavorable ?</h3>
              <p>
                Pas de panique ! Vous avez 2 mois pour effectuer les réparations
                et revenir pour la contre-visite à prix réduit.
              </p>
            </div>

            <div className='faq-item'>
              <div className='faq-icon'>⏰</div>
              <h3>Combien de temps ça prend ?</h3>
              <p>
                Entre 15 et 45 minutes selon le type de contrôle. Vous pouvez
                attendre confortablement dans notre espace d'accueil.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='cta-section'>
        <div className='container'>
          <div className='cta-content'>
            <h2>Prêt à réserver votre contrôle ?</h2>
            <p>Prenez rendez-vous en ligne en quelques clics</p>
            <Link to='/rendez-vous' className='btn-primary-large'>
              Réserver en ligne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
