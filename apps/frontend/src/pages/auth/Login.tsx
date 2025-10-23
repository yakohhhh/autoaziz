import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await axios.post('/api/auth/login', { email, password });

      // Simulation pour le développement
      if (email === 'admin@autosur.com' && password === 'admin123') {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('authToken', 'mock-token-123');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', 'Administrateur');

        // Rediriger vers le dashboard
        navigate('/admin/dashboard');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <div className='login-header'>
          <h1>AUTOSUR</h1>
          <p>Tableau de bord administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className='login-form'>
          {error && <div className='error-message'>{error}</div>}

          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='admin@autosur.com'
              required
              autoComplete='email'
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Mot de passe</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              required
              autoComplete='current-password'
            />
          </div>

          <button type='submit' className='login-button' disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className='login-footer'>
          <p>Accès réservé au personnel autorisé</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
