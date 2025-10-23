# 🚀 Guide de Démarrage - Nouvelle Architecture

## 📖 Documentation Complète
Consultez [NEW_ARCHITECTURE.md](./NEW_ARCHITECTURE.md) pour une documentation complète de la restructuration.

---

## 🎯 Changements Importants

### ✅ Ce qui a changé

1. **Pages organisées par contexte**
   - `pages/public/` - Pages publiques
   - `pages/admin/` - Pages admin
   - `pages/auth/` - Pages d'authentification
   - `pages/verification/` - Pages de vérification

2. **Composants organisés par fonction**
   - `components/layout/` - Navbar, Footer
   - `components/common/` - Modal, AnimatedBackground
   - `components/calendar/` - WeeklyCalendar
   - `components/auth/` - ProtectedRoute

3. **Nouveaux dossiers ajoutés**
   - `hooks/` - Hooks personnalisés (useAuth, useFetch)
   - `contexts/` - Contexts React (AuthContext)
   - `services/` - Services API centralisés
   - `types/` - Types TypeScript
   - `constants/` - Constantes de l'application

4. **Imports simplifiés**
   ```typescript
   // Avant
   import Navbar from './components/Navbar';
   import Footer from './components/Footer';
   
   // Après
   import { Navbar, Footer } from './components';
   ```

### ❌ Ce qui a été supprimé

- `PlanningDashboard.tsx` - Doublon de AdminPlanning.tsx

---

## 🛠️ Comment Utiliser

### Importer des Composants
```typescript
// Depuis le barrel export principal
import { Navbar, Footer, Modal, WeeklyCalendar } from '@/components';

// Ou depuis des sous-modules spécifiques
import { Navbar, Footer } from '@/components/layout';
import { Modal } from '@/components/common';
```

### Importer des Pages
```typescript
import { Home, Services, AdminDashboard } from '@/pages';
```

### Utiliser les Hooks
```typescript
import { useAuth, useFetch } from '@/hooks';

const MyComponent = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const { data, loading, error } = useFetch('/api/appointments');
  
  // ...
};
```

### Utiliser le Context
```typescript
import { useAuthContext } from '@/contexts';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuthContext();
  
  // ...
};
```

### Utiliser les Services
```typescript
import { appointmentService, authService } from '@/services';

// Récupérer des données
const appointments = await appointmentService.getAll();

// Créer un rendez-vous
await appointmentService.create({
  customerName: 'John Doe',
  email: 'john@example.com',
  // ...
});

// Authentification
const { access_token, user } = await authService.login({
  email: 'admin@example.com',
  password: 'password',
});
```

### Utiliser les Types
```typescript
import { Appointment, AppointmentStatus, User } from '@/types';

const appointment: Appointment = {
  id: 1,
  customerName: 'John Doe',
  // ...
};
```

### Utiliser les Constantes
```typescript
import { ROUTES, TIME_SLOTS, APPOINTMENT_STATUS_LABELS } from '@/constants';

// Navigation
navigate(ROUTES.ADMIN_DASHBOARD);

// Affichage des créneaux horaires
TIME_SLOTS.map(slot => <option value={slot}>{slot}</option>);

// Labels de statut
const statusLabel = APPOINTMENT_STATUS_LABELS[appointment.status];
```

---

## 📝 Conventions de Nommage

### Fichiers
- **Composants React** : `PascalCase.tsx` (ex: `Navbar.tsx`)
- **Hooks** : `camelCase.ts` avec préfixe `use` (ex: `useAuth.ts`)
- **Services** : `camelCase.service.ts` (ex: `api.service.ts`)
- **Types** : `camelCase.types.ts` (ex: `appointment.types.ts`)
- **Constantes** : `camelCase.constants.ts` (ex: `app.constants.ts`)
- **Styles** : Même nom que le composant `.css` (ex: `Navbar.css`)
- **Barrel Exports** : `index.ts`

### Exports
- **Composants** : Export par défaut + export nommé via barrel
- **Hooks/Services/Types** : Export nommé uniquement
- **Constantes** : Export nommé uniquement

---

## 🔧 Configuration Path Aliases (Optionnel)

Pour utiliser `@/` au lieu de chemins relatifs, ajoutez ceci dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/components": ["components"],
      "@/pages": ["pages"],
      "@/hooks": ["hooks"],
      "@/contexts": ["contexts"],
      "@/services": ["services"],
      "@/types": ["types"],
      "@/constants": ["constants"],
      "@/utils": ["utils"],
      "@/styles": ["styles"]
    }
  }
}
```

---

## 🎨 Structure Visuelle

```
apps/frontend/src/
│
├── 📄 App.tsx                    # Point d'entrée
├── 📄 index.tsx                  # Bootstrap React
│
├── 📁 components/                # Composants réutilisables
│   ├── 📁 layout/               # 🎨 Mise en page
│   ├── 📁 common/               # 🔧 Communs
│   ├── 📁 calendar/             # 📅 Calendrier
│   ├── 📁 auth/                 # 🔐 Auth
│   └── 📄 index.ts
│
├── 📁 pages/                     # Pages de l'application
│   ├── 📁 public/               # 🌐 Publiques
│   ├── 📁 admin/                # 👨‍💼 Admin
│   ├── 📁 auth/                 # 🔑 Auth
│   ├── 📁 verification/         # ✅ Vérif
│   └── 📄 index.ts
│
├── 📁 hooks/                     # 🪝 Hooks personnalisés
├── 📁 contexts/                  # 🌍 Contexts React
├── 📁 services/                  # 🌐 Services API
├── 📁 types/                     # 📝 Types TypeScript
├── 📁 constants/                 # 🔢 Constantes
├── 📁 utils/                     # 🛠️ Utilitaires
└── 📁 styles/                    # 🎨 Styles globaux
```

---

## 🚦 Checklist Développement

Avant d'ajouter une nouvelle fonctionnalité :

- [ ] Le composant est-il réutilisable ? → `components/common/`
- [ ] C'est une page ? → `pages/{public|admin|auth|verification}/`
- [ ] Besoin de logique réutilisable ? → Créer un hook dans `hooks/`
- [ ] Besoin d'un état global ? → Créer un context dans `contexts/`
- [ ] Besoin d'appels API ? → Ajouter dans `services/`
- [ ] Nouveaux types ? → Ajouter dans `types/`
- [ ] Nouvelles constantes ? → Ajouter dans `constants/`
- [ ] N'oubliez pas d'ajouter l'export dans `index.ts`

---

## 📚 Exemples de Code

### Créer un nouveau composant
```typescript
// components/common/Button.tsx
import React from 'react';
import './Button.css';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;
```

```typescript
// components/common/index.ts
export { default as Modal } from './Modal';
export { default as AnimatedBackground } from './AnimatedBackground';
export { default as Button } from './Button'; // ← Ajouter l'export
```

### Créer un nouveau hook
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};
```

```typescript
// hooks/index.ts
export { useAuth } from './useAuth';
export { useFetch } from './useFetch';
export { useLocalStorage } from './useLocalStorage'; // ← Ajouter l'export
```

---

## 🎉 Avantages de la Nouvelle Architecture

✅ **Organisation claire** - Chaque fichier a sa place  
✅ **Imports simplifiés** - Barrel exports partout  
✅ **Réutilisabilité** - Hooks et services centralisés  
✅ **Typage fort** - Types TypeScript centralisés  
✅ **Maintenabilité** - Structure prévisible  
✅ **Scalabilité** - Facile d'ajouter de nouvelles fonctionnalités  
✅ **Collaboration** - Structure standard facilite le travail en équipe  

---

## 🆘 Besoin d'Aide ?

Consultez :
- [NEW_ARCHITECTURE.md](./NEW_ARCHITECTURE.md) - Documentation complète
- [PLANNING_SYSTEM_GUIDE.md](./PLANNING_SYSTEM_GUIDE.md) - Guide du système de planning
- [QUICK_START_BOOKING.md](./QUICK_START_BOOKING.md) - Guide du système de réservation

---

**Date de création :** 23 Octobre 2025  
**Version :** 2.0  
**Auteur :** Restructuration complète de l'architecture
