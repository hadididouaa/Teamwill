require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { sequelize } = require('./db/models');
const db = require('./db/models');
const createFirstAdminUser = require('./utils/createFirstAdminUser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('./utils/cron');
const router = express.Router();

const app = express();





// Middleware CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Middleware pour la langue
app.use((req, res, next) => {
  req.lang = req.query.lang || req.headers['accept-language']?.split(',')[0].split('-')[0] || 'fr';
  next();
});

// Middleware pour servir les fichiers statiques
app.use('/message_attachments', express.static(path.join(__dirname, 'public', 'message_attachments')));
app.use('/uploads', express.static(path.join(__dirname, 'assets', 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/documents', express.static(path.join(__dirname, 'assets', 'documents')));

// Gestion des erreurs Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('Seuls les fichiers')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// Routes
const userRoute = require('./routes/userRoute');
const otpRoutes = require('./routes/otpRoutes');
const chatRoutes = require('./routes/chatRoutes');
const questionnaireRoute = require('./routes/questionnaireRoute');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/users', userRoute);
app.use('/otp', otpRoutes);
app.use('/questionnaires', questionnaireRoute);

app.post('/api/generate-jitsi-token', async (req, res) => {
  try {
    const { roomName, userId, username, avatarUrl } = req.body;

    // Validation des paramètres
    if (!roomName || !userId || !username) {
      return res.status(400).json({
        status: 'fail',
        message: 'Paramètres requis manquants'
      });
    }

    // Validation du nom de salle (avec espaces autorisés)
    const roomNameRegex = /^[a-zA-Z0-9-_\s]{1,64}$/;
    if (!roomNameRegex.test(roomName)) {
      return res.status(400).json({ 
        error: 'Format de salle invalide. Utilisez seulement : lettres, chiffres, tirets, underscores et espaces (max 64 caractères)'
      });
    }

  const keyPath = process.env.JITSI_PRIVATE_KEY_PATH || path.resolve(__dirname, '..', 'config', 'jitsi.key');

// Add better error messaging
if (!fs.existsSync(keyPath)) {
  console.error('Jitsi private key missing. Please:');
  console.error('1. Generate key: openssl genrsa -out config/jitsi.key 2048');
  console.error('2. Set JITSI_PRIVATE_KEY_PATH in .env');
  return res.status(500).json({ 
    error: 'Server misconfiguration - missing Jitsi private key' 
  });
}

    let privateKey;
    try {
      privateKey = fs.readFileSync(keyPath, 'utf8')
        .replace(/\r\n/g, '\n')
        .trim();
      
      if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----') || 
          !privateKey.endsWith('-----END PRIVATE KEY-----')) {
        throw new Error('Format de clé privée invalide');
      }
    } catch (err) {
      console.error('Erreur de lecture de la clé:', err);
      throw new Error('Échec du chargement de la clé privée');
    }

    // Configuration Jitsi
    if (!process.env.JITSI_APP_ID) {
      throw new Error('Configuration JITSI_APP_ID manquante');
    }

    const [appId, tenant] = process.env.JITSI_APP_ID.split('/');

    // Nettoyage du nom de salle (remplace les espaces par des underscores)
    const cleanRoomName = roomName.replace(/\s+/g, '_');

    // Payload JWT
    const payload = {
      aud: 'jitsi',
      iss: appId,
      sub: appId,
      room: cleanRoomName, // Utilise le nom nettoyé
      context: {
        user: {
          id: userId.toString(),
          name: username,
          avatar: avatarUrl || '',
          moderator: 'true',
          email: `${username.replace(/\s+/g, '_')}@${tenant || 'example.com'}`.toLowerCase()
        },
        features: {
          livestreaming: 'true',
          recording: 'true',
          transcription: 'true',
          "outbound-call": 'true'
        }
      },
      exp: Math.floor(Date.now() / 1000) + 7200,
      nbf: Math.floor(Date.now() / 1000) - 10,
      iat: Math.floor(Date.now() / 1000)
    };

    // Génération du token
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      header: {
        kid: process.env.JITSI_APP_ID,
        typ: 'JWT',
        alg: 'RS256'
      }
    });

    res.json({ 
      status: 'success', 
      token,
      domain: process.env.JITSI_DOMAIN || '8x8.vc',
      cleanRoomName // Retourne le nom nettoyé pour le client
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      status: 'error',
      message: 'Échec de génération du token',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
    });                                                                   
// Redirection de la racine
app.get('/', (req, res) => {
  res.redirect('/signin');
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Page not found',
  });
});

// Démarrage du serveur
const PORT = process.env.APP_PORT || 4000;
const server = app.listen(PORT, async () => {
  console.log(`Server up & running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await createFirstAdminUser();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});

// Initialisation de Socket.IO
const initSocket = require('./utils/socket');
const io = initSocket(server);
app.set('io', io);

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});
