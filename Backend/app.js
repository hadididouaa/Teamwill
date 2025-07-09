require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { sequelize } = require('./db/models');
const db = require('./db/models');

const createFirstAdminUser = require('./utils/createFirstAdminUser');
require('./utils/cron');


const multer = require('multer');



const path = require('path');





const app = express();


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());



const userRoute = require('./routes/userRoute'); 

const otpRoutes = require('./routes/otpRoutes');
const chatRoutes = require("./routes/chatRoutes");
const questionnaireRoute = require('./routes/questionnaireRoute');
const messageRoutes = require('./routes/messageRoutes');
const initializeSocket = require('./utils/socket');
app.use('/api/messages', messageRoutes);
app.use('/message_attachments', express.static(path.join(__dirname, 'public', 'message_attachments')));
// ******************* Static File Middleware *******************
// Serve static files from 'assets/uploads' directory (PDFs and other docs)
app.use('/uploads', express.static(path.join(__dirname, 'assets', 'uploads'))); // For PDFs or other uploaded files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/documents', express.static(path.join(__dirname, 'assets', 'documents')));
// ******************* Middleware  of the translation model *******************
app.use((req, res, next) => {
    req.lang = req.query.lang || req.headers['accept-language']?.split(',')[0].split('-')[0] || 'fr';
    next();
});
// Error handler for multer (upload img)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message.includes('Seuls les fichiers')) {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});
// ******************* HEAD ROUTES *******************
// ... other middleware and routes
app.use("/api/chat", chatRoutes);
app.use('/users', userRoute);
app.use('/otp', otpRoutes);
app.use('/questionnaires', questionnaireRoute); 



app.use('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: 'Page not found',
    });
});

const PORT = process.env.APP_PORT || 4000;
app.get('/', (req, res) => {
    res.redirect('/signin');
});
// ... (tout votre code existant jusqu'à app.listen)


const server = app.listen(PORT, async () => {
  console.log(`Server up & running on port ${PORT}`);
  await createFirstAdminUser();
});

const initSocket = require('./utils/socket');
const io = initSocket(server);
app.set('io', io);