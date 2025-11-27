import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { statsChartOutline, calendarOutline, peopleOutline } from 'ionicons/icons';
import { useEffect, useState, useCallback } from 'react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Customers from './pages/Customers';
import { authService } from './services/api';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = useCallback(() => {
    const authenticated = authService.isAuthenticated();
    console.log('Vérification auth:', authenticated); // Debug
    setIsAuthenticated(authenticated);
  }, []);

  useEffect(() => {
    checkAuth();

    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      console.log('Storage changed, re-checking auth'); // Debug
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Écouter un événement personnalisé pour la connexion
    const handleLogin = () => {
      console.log('Login event received'); // Debug
      checkAuth();
    };
    
    window.addEventListener('login', handleLogin as EventListener);

    // Écouter l'événement authChanged pour mettre à jour immédiatement
    const handleAuthChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('🎯 Auth changed event received:', customEvent.detail); // Debug
      const authenticated = customEvent.detail?.authenticated ?? authService.isAuthenticated();
      console.log('🔄 Mise à jour auth:', authenticated); // Debug
      setIsAuthenticated(authenticated);
    };
    
    window.addEventListener('authChanged', handleAuthChanged as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login', handleLogin as EventListener);
      window.removeEventListener('authChanged', handleAuthChanged as EventListener);
    };
  }, [checkAuth]);

  const handleLoginSuccess = () => {
    console.log('Login success callback'); // Debug
    // Forcer la vérification immédiate
    setTimeout(() => {
      checkAuth();
    }, 100);
  };

  // Afficher un écran de chargement pendant la vérification
  if (isAuthenticated === null) {
    return (
      <IonApp>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #c174f2 100%)'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h2>AUTOSUR</h2>
            <p>Chargement...</p>
          </div>
        </div>
      </IonApp>
    );
  }

  // Si non authentifié, afficher la page de login
  if (!isAuthenticated) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="*">
              <Login onLoginSuccess={handleLoginSuccess} />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }

  // Si authentifié, afficher l'application avec les tabs
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/dashboard">
              <Dashboard />
            </Route>
            <Route exact path="/planning">
              <Planning />
            </Route>
            <Route exact path="/customers">
              <Customers />
            </Route>
            <Route exact path="/">
              <Redirect to="/dashboard" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom" color="light">
            <IonTabButton tab="dashboard" href="/dashboard">
              <IonIcon icon={statsChartOutline} />
              <IonLabel>Tableau de bord</IonLabel>
            </IonTabButton>
            <IonTabButton tab="planning" href="/planning">
              <IonIcon icon={calendarOutline} />
              <IonLabel>Planning</IonLabel>
            </IonTabButton>
            <IonTabButton tab="customers" href="/customers">
              <IonIcon icon={peopleOutline} />
              <IonLabel>Clients</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
