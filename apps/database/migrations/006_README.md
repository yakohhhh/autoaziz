# Migration 006 - Correction contrainte source

## Problème résolu
Cette migration corrige l'erreur `chk_source_valid` qui empêchait la création de rendez-vous manuels avec certaines valeurs de source.

## Erreur avant migration
```
ConnectorError: new row for relation "appointments" violates check constraint "chk_source_valid"
```

## Changements
1. **Suppression** de l'ancienne contrainte restrictive
2. **Ajout** d'une nouvelle contrainte acceptant les valeurs:
   - `'online'` - RDV pris via le formulaire en ligne
   - `'phone'` - RDV pris par téléphone
   - `'manual'` - RDV pris manuellement (au centre)
   - `'web'` - Alias pour 'online' (legacy)
   - `'walk-in'` - Client qui vient sans RDV
   - `'admin'` - RDV créé depuis l'interface admin

3. **Nettoyage** des valeurs existantes
4. **Index** ajouté pour optimiser les requêtes

## Application de la migration

### Option 1: Avec Docker (recommandé)
```bash
cd /home/depop/delivery/part-time/autoaziz
./scripts/apply-migration-006.sh
```

### Option 2: Connexion directe PostgreSQL
```bash
cd /home/depop/delivery/part-time/autoaziz
psql -U autoaziz -d autoaziz -f apps/database/migrations/006_fix_source_constraint.sql
```

### Option 3: Via Docker Compose
```bash
cd /home/depop/delivery/part-time/autoaziz
docker-compose exec database psql -U autoaziz -d autoaziz -f /docker-entrypoint-initdb.d/006_fix_source_constraint.sql
```

## Vérification
Après application, vous pouvez vérifier que la contrainte est correcte :

```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'chk_source_valid';
```

## Impact
- ✅ Les RDV manuels peuvent maintenant être créés depuis l'interface admin
- ✅ Les RDV téléphoniques sont supportés
- ✅ Rétrocompatibilité maintenue avec 'web' et 'online'
- ✅ Pas de perte de données
