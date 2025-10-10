import React from 'react';
import './Pricing.css';

const Pricing: React.FC = () => {
  return (
    <div className='pricing'>
      <section className='pricing-header'>
        <h1>Nos Tarifs</h1>
        <p>Des prix transparents et compétitifs</p>
      </section>

      <section className='pricing-content'>
        <div className='pricing-table'>
          <div className='pricing-card featured'>
            <div className='badge'>Le plus populaire</div>
            <h2>Contrôle Technique Standard</h2>
            <div className='price'>
              <span className='amount'>70€</span>
            </div>
            <ul className='features'>
              <li>✓ Contrôle complet de votre véhicule</li>
              <li>✓ 124 points de contrôle</li>
              <li>✓ Procès-verbal immédiat</li>
              <li>✓ Conseils personnalisés</li>
              <li>✓ Durée: ~30 minutes</li>
            </ul>
            <a href='/rendez-vous' className='cta-button'>
              Réserver
            </a>
          </div>

          <div className='pricing-card'>
            <h2>Contre-Visite</h2>
            <div className='price'>
              <span className='amount'>25€</span>
            </div>
            <ul className='features'>
              <li>✓ Vérification des réparations</li>
              <li>✓ Dans les 2 mois suivant le contrôle</li>
              <li>✓ Nouveau procès-verbal</li>
              <li>✓ Durée: ~15 minutes</li>
            </ul>
            <a href='/rendez-vous' className='cta-button'>
              Réserver
            </a>
          </div>

          <div className='pricing-card'>
            <h2>Contrôle Pollution</h2>
            <div className='price'>
              <span className='amount'>40€</span>
            </div>
            <ul className='features'>
              <li>✓ Test des émissions polluantes</li>
              <li>✓ Mesure CO, HC, NOx</li>
              <li>✓ Rapport détaillé</li>
              <li>✓ Durée: ~20 minutes</li>
            </ul>
            <a href='/rendez-vous' className='cta-button'>
              Réserver
            </a>
          </div>
        </div>

        <div className='info-box'>
          <h3>💳 Moyens de paiement acceptés</h3>
          <p>Espèces • Carte bancaire • Chèque</p>
        </div>

        <div className='faq'>
          <h2>Questions Fréquentes</h2>
          <div className='faq-item'>
            <h3>Quand dois-je faire mon contrôle technique ?</h3>
            <p>
              Le premier contrôle technique est obligatoire dans les 6 mois
              avant le 4ème anniversaire de votre véhicule, puis tous les 2 ans.
            </p>
          </div>
          <div className='faq-item'>
            <h3>Quels documents dois-je apporter ?</h3>
            <p>Carte grise du véhicule et pièce d'identité du propriétaire.</p>
          </div>
          <div className='faq-item'>
            <h3>Que se passe-t-il en cas de contre-visite ?</h3>
            <p>
              Vous avez 2 mois pour faire effectuer les réparations nécessaires
              et revenir pour la contre-visite.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
