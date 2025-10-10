#!/usr/bin/env node

/**
 * 🚀 Auto Aziz - Serveur Webhook GitHub
 * Écoute les événements GitHub et déclenche les déploiements
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'your-webhook-secret';
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || './deploy.sh';
const LOG_FILE = process.env.LOG_FILE || '/var/log/webhook.log';

// Fonction de logging
const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(LOG_FILE, logMessage);
};

// Vérification de la signature GitHub
const verifySignature = (payload, signature) => {
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

// Exécution du script de déploiement
const executeDeploy = () => {
    return new Promise((resolve, reject) => {
        log('🚀 Démarrage du déploiement...');
        
        exec(DEPLOY_SCRIPT, (error, stdout, stderr) => {
            if (error) {
                log(`❌ Erreur de déploiement: ${error.message}`);
                reject(error);
                return;
            }
            
            if (stderr) {
                log(`⚠️ Stderr: ${stderr}`);
            }
            
            log(`✅ Déploiement terminé: ${stdout}`);
            resolve(stdout);
        });
    });
};

// Serveur HTTP
const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/webhook') {
        res.statusCode = 404;
        res.end('Not Found');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            // Vérifier la signature
            const signature = req.headers['x-hub-signature-256'];
            if (!signature || !verifySignature(body, signature)) {
                log('❌ Signature invalide');
                res.statusCode = 401;
                res.end('Unauthorized');
                return;
            }

            // Parser le payload
            const payload = JSON.parse(body);
            const event = req.headers['x-github-event'];

            log(`📨 Événement reçu: ${event} de ${payload.repository?.full_name}`);

            // Traiter seulement les push sur main
            if (event === 'push' && payload.ref === 'refs/heads/main') {
                log(`📦 Push sur main détecté, commit: ${payload.head_commit?.id?.slice(0, 7)}`);
                
                try {
                    await executeDeploy();
                    res.statusCode = 200;
                    res.end('Deployment successful');
                } catch (error) {
                    log(`❌ Échec du déploiement: ${error.message}`);
                    res.statusCode = 500;
                    res.end('Deployment failed');
                }
            } else {
                log(`ℹ️ Événement ignoré: ${event} sur ${payload.ref}`);
                res.statusCode = 200;
                res.end('Event ignored');
            }

        } catch (error) {
            log(`❌ Erreur de traitement: ${error.message}`);
            res.statusCode = 400;
            res.end('Bad Request');
        }
    });
});

// Gestion des erreurs
server.on('error', (error) => {
    log(`❌ Erreur serveur: ${error.message}`);
});

// Démarrage du serveur
server.listen(PORT, () => {
    log(`🎯 Serveur webhook démarré sur le port ${PORT}`);
    log(`📋 Écoute des événements GitHub sur /webhook`);
    log(`📝 Logs sauvegardés dans ${LOG_FILE}`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
    log('🛑 Arrêt du serveur webhook...');
    server.close(() => {
        log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log('🛑 Interruption détectée, arrêt...');
    server.close(() => {
        log('✅ Serveur arrêté');
        process.exit(0);
    });
});