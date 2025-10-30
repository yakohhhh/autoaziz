-- Migration 008: Synchroniser actualStatus avec status pour les rendez-vous existants
-- Date: 2025-10-30
-- Description: Met à jour actualStatus pour refléter le status actuel des rendez-vous

-- Mettre à jour actualStatus pour qu'il corresponde à status
-- Cela permet d'avoir des statistiques cohérentes
UPDATE appointments
SET "actualStatus" = status
WHERE "actualStatus" IS NULL
  AND status IN ('completed', 'cancelled', 'no_show');

-- Pour les rendez-vous en attente ou confirmés, on ne met pas actualStatus
-- car ils ne sont pas encore "réalisés"
UPDATE appointments
SET "actualStatus" = NULL
WHERE status IN ('pending', 'confirmed', 'pending_verification')
  AND "actualStatus" IS NOT NULL;

-- Afficher un résumé
SELECT 
  status,
  "actualStatus",
  COUNT(*) as count
FROM appointments
WHERE "deletedAt" IS NULL
GROUP BY status, "actualStatus"
ORDER BY status, "actualStatus";
