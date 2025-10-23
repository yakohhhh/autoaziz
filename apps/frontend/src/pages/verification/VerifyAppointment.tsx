import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './VerifyAppointment.css';

interface VerificationResponse {
  success: boolean;
  message: string;
}

const VerifyAppointment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>(
    'email'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [autoVerifying, setAutoVerifying] = useState<boolean>(false);

  useEffect(() => {
    // Récupère les paramètres de l'URL si disponibles
    const urlAppointmentId = searchParams.get('id');
    const urlCode = searchParams.get('code');

    if (urlAppointmentId && urlCode) {
      setAppointmentId(urlAppointmentId);
      setVerificationCode(urlCode);
      setAutoVerifying(true);
      // Vérifie automatiquement avec le code de l'URL
      handleAutoVerification(urlAppointmentId, urlCode);
    }
  }, [searchParams]);

  const handleAutoVerification = async (id: string, code: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: parseInt(id),
          verificationCode: code,
          verificationType: 'email', // Par défaut depuis l'URL
        }),
      });

      const data: VerificationResponse = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur lors de la vérification. Veuillez réessayer.',
      });
    } finally {
      setLoading(false);
      setAutoVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/appointments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: parseInt(appointmentId),
          verificationCode,
          verificationType,
        }),
      });

      const data: VerificationResponse = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur lors de la vérification. Veuillez réessayer.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!appointmentId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/appointments/${appointmentId}/resend-code`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setResult({
          success: true,
          message: 'Code de vérification renvoyé avec succès !',
        });
      } else {
        setResult({
          success: false,
          message: 'Erreur lors du renvoi du code.',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur lors du renvoi du code.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (autoVerifying) {
    return (
      <div className='verify-appointment-container'>
        <div className='verify-card'>
          <div className='loading-spinner'></div>
          <p>Vérification automatique en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='verify-appointment-container'>
      <div className='verify-card'>
        <h1>Vérifier votre rendez-vous</h1>
        <p className='subtitle'>
          Entrez le code de vérification que vous avez reçu par email ou SMS
        </p>

        <form onSubmit={handleSubmit} className='verify-form'>
          <div className='form-group'>
            <label htmlFor='appointmentId'>ID du rendez-vous</label>
            <input
              type='number'
              id='appointmentId'
              value={appointmentId}
              onChange={e => setAppointmentId(e.target.value)}
              required
              placeholder="Entrez l'ID de votre rendez-vous"
            />
          </div>

          <div className='form-group'>
            <label htmlFor='verificationCode'>Code de vérification</label>
            <input
              type='text'
              id='verificationCode'
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              required
              placeholder='Entrez le code à 6 chiffres'
              maxLength={6}
            />
          </div>

          <div className='form-group'>
            <label>Type de vérification</label>
            <div className='radio-group'>
              <label className='radio-label'>
                <input
                  type='radio'
                  value='email'
                  checked={verificationType === 'email'}
                  onChange={e => setVerificationType(e.target.value as 'email')}
                />
                Code reçu par email
              </label>
              <label className='radio-label'>
                <input
                  type='radio'
                  value='phone'
                  checked={verificationType === 'phone'}
                  onChange={e => setVerificationType(e.target.value as 'phone')}
                />
                Code reçu par SMS
              </label>
            </div>
          </div>

          <button type='submit' disabled={loading} className='verify-btn'>
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>

        {appointmentId && (
          <button
            onClick={handleResendCode}
            disabled={loading}
            className='resend-btn'
          >
            Renvoyer le code
          </button>
        )}

        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            <p>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAppointment;
