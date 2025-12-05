-- Migration: Add blocked_slots table
-- Description: Create table for managing blocked time slots in the admin planning

CREATE TABLE IF NOT EXISTS blocked_slots (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time VARCHAR(5) NOT NULL,
    reason TEXT,
    blocked_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    UNIQUE(date, time)
);

CREATE INDEX idx_blocked_slots_date ON blocked_slots(date);
CREATE INDEX idx_blocked_slots_deleted_at ON blocked_slots(deleted_at);

COMMENT ON TABLE blocked_slots IS 'Créneaux horaires bloqués par l''administrateur, indisponibles à la réservation';
COMMENT ON COLUMN blocked_slots.date IS 'Date du créneau bloqué';
COMMENT ON COLUMN blocked_slots.time IS 'Heure du créneau bloqué (format HH:MM)';
COMMENT ON COLUMN blocked_slots.reason IS 'Raison du blocage (congés, maintenance, etc.)';
COMMENT ON COLUMN blocked_slots.blocked_by IS 'Utilisateur ayant bloqué le créneau';
COMMENT ON COLUMN blocked_slots.deleted_at IS 'Date de suppression logique (NULL si actif)';
