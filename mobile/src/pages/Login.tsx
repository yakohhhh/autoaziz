import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/react';
import { lockClosedOutline, mailOutline, carOutline } from 'ionicons/icons';
import { authService } from '../services/api';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 handleLogin appelé'); // Debug
    
    if (!email || !password) {
      console.log('⚠️ Champs vides'); // Debug
      setError('Veuillez remplir tous les champs');
      return;
    }

    console.log('🔵 Début de la connexion...'); // Debug
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(email, password);
      console.log('✅ Login réussi:', result); // Debug
      
      // Vérification immédiate du localStorage
      const storedToken = localStorage.getItem('authToken');
      console.log('🔍 Token dans localStorage après login:', storedToken);

      if (!storedToken && result.token) {
        console.warn('⚠️ Token non trouvé dans localStorage, tentative de sauvegarde manuelle');
        localStorage.setItem('authToken', result.token);
      }

      // Forcer la mise à jour de l'état d'authentification dans App.tsx
      // On dispatch un événement personnalisé avec un délai pour que localStorage soit bien écrit
      setTimeout(() => {
        console.log('🔄 Dispatch événement login'); // Debug
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: true } }));
      }, 50);
      
      // Appeler le callback
      onLoginSuccess();
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-container">
          {/* Logo et Titre */}
          <div className="login-header">
            <div className="logo-icon">
              <IonIcon icon={carOutline} />
            </div>
            <h1 className="app-title">AUTOSUR</h1>
            <p className="app-subtitle">Application Mobile Patron</p>
          </div>

          {/* Card de connexion */}
          <IonCard className="login-card">
            <IonCardContent>
              <form onSubmit={handleLogin}>
                <div className="form-title">
                  <h2>Connexion</h2>
                  <p>Accédez à votre espace de gestion</p>
                </div>

                {error && (
                  <div className="error-message">
                    <IonText color="danger">{error}</IonText>
                  </div>
                )}

                <IonItem className="input-item" lines="none">
                  <IonIcon icon={mailOutline} slot="start" color="primary" />
                  <IonInput
                    type="email"
                    placeholder="Email"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value!)}
                    disabled={loading}
                    required
                  />
                </IonItem>

                <IonItem className="input-item" lines="none">
                  <IonIcon icon={lockClosedOutline} slot="start" color="primary" />
                  <IonInput
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value!)}
                    disabled={loading}
                    required
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <IonSpinner name="crescent" />
                      <span style={{ marginLeft: '8px' }}>Connexion...</span>
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </IonButton>

                <div className="demo-credentials">
                  <p className="demo-title">🔑 Identifiants de démonstration</p>
                  <p className="demo-info">
                    <strong>Email:</strong> admin@autosur.com<br />
                    <strong>Mot de passe:</strong> admin123
                  </p>
                </div>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Footer */}
          <div className="login-footer">
            <p>© 2025 AutoSur - Gestion de Garage</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
