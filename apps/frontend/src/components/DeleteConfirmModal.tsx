import React, { useState } from 'react';
import './DeleteConfirmModal.css';

interface DeleteConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  itemName: string;
  onConfirm: (reason: string, note: string) => Promise<void>;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  show,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('Veuillez sélectionner une raison');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(reason, note);
      // Reset
      setReason('');
      setNote('');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='delete-modal-overlay' onClick={onCancel}>
      <div className='delete-modal-content' onClick={e => e.stopPropagation()}>
        <div className='delete-modal-header'>
          <h2>🗑️ {title}</h2>
          <button className='close-btn' onClick={onCancel}>
            ×
          </button>
        </div>

        <div className='delete-modal-body'>
          <div className='delete-warning'>
            <p>{message}</p>
            <strong>{itemName}</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='form-group-delete'>
              <label>
                Raison de la suppression <span className='required'>*</span>
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                className='delete-select'
              >
                <option value=''>Sélectionner une raison</option>
                <option value='error'>❌ Erreur de saisie</option>
                <option value='absent'>🚫 Client absent</option>
                <option value='late'>⏰ Client en retard</option>
                <option value='duplicate'>📋 Doublon</option>
                <option value='cancelled_by_client'>
                  📞 Annulé par le client
                </option>
                <option value='other'>📝 Autre raison</option>
              </select>
            </div>

            <div className='form-group-delete'>
              <label>Note complémentaire (optionnel)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder='Détails supplémentaires...'
                className='delete-textarea'
              />
            </div>

            <div className='delete-modal-actions'>
              <button
                type='button'
                onClick={onCancel}
                className='btn-cancel-delete'
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type='submit'
                className='btn-confirm-delete'
                disabled={loading}
              >
                {loading ? '⏳ Suppression...' : '🗑️ Confirmer la suppression'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
