# 🔐 Auto Aziz - Configuration GitHub Secrets pour CI/CD

## ⚠️ **SECRETS REQUIS POUR LA CI/CD**

Voici tous les secrets GitHub que vous devez configurer pour que la CI/CD fonctionne complètement :

### 📍 **Comment configurer les secrets :**
1. Allez sur votre repository GitHub
2. Settings → Secrets and variables → Actions
3. Cliquez sur "New repository secret"
4. Ajoutez chaque secret ci-dessous

---

## 🚀 **SECRETS DE DÉPLOIEMENT (Optionnels)**

*Ces secrets ne sont nécessaires que si vous voulez le déploiement automatique sur un serveur de production :*

### 🔑 **SSH_PRIVATE_KEY**
```
Clé SSH privée pour se connecter à votre serveur de production
```
**Comment l'obtenir :**
```bash
# Sur votre serveur de production
ssh-keygen -t rsa -b 4096 -C "github-actions@autoaziz.com"
cat ~/.ssh/id_rsa  # Copiez le contenu COMPLET (avec -----BEGIN/END-----)
```

### 🖥️ **HOST**
```
Adresse IP ou nom de domaine de votre serveur
Exemple: 192.168.1.100 ou autoaziz.com
```

### 👤 **USERNAME**
```
Nom d'utilisateur SSH pour se connecter au serveur
Exemple: root ou ubuntu ou aziz
```

---

## 🔧 **CONFIGURATION SIMPLIFIÉE**

Si vous voulez **juste les tests et builds** (sans déploiement), voici une version simplifiée de la CI/CD :

### Option 1 : CI/CD Sans Déploiement
Supprimez les sections `deploy` du fichier `.github/workflows/ci-cd.yml`

### Option 2 : CI/CD Basique
Gardez seulement :
- ✅ Tests ESLint
- ✅ Tests unitaires  
- ✅ Builds
- ✅ Audit de sécurité

---

## 🎯 **RECOMMANDATION POUR DÉBUTER**

Pour commencer, vous pouvez :

1. **Tester la CI/CD basique** (sans secrets) :
   - Push votre code
   - La CI/CD testera : ESLint, builds, tests
   - Le déploiement échouera (normal sans secrets)

2. **Configurer les secrets plus tard** quand vous aurez un serveur de production

---

## 🔄 **CONFIGURATION AUTOMATIQUE**

Utilisez notre script pour choisir votre configuration :

```bash
./setup-ci-cd.sh
```

### Options disponibles :
1. **CI/CD Simplifiée** : Tests + Builds (aucun secret requis)
2. **CI/CD Complète** : Avec déploiement automatique (secrets requis)
3. **Guide détaillé** : Documentation complète des secrets

---

## 📝 **EXEMPLE DE CONFIGURATION**

### Pour commencer immédiatement :
```bash
# Lancez le script de configuration
./setup-ci-cd.sh

# Choisissez l'option 1 (CI/CD Simplifiée)
# Puis pushez votre code
git add .
git commit -m "feat: ajout CI/CD simplifiée"
git push origin main
```

### Pour la production plus tard :
```bash
# Configurez vos secrets sur GitHub
# Puis relancez le script et choisissez l'option 2
./setup-ci-cd.sh
```