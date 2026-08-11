const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

let resend = null;
let FROM_EMAIL = 'Myra <notifications@resend.dev>';
if (process.env.RESEND_API_KEY) {
  resend = new (require('resend').Resend)(process.env.RESEND_API_KEY);
  FROM_EMAIL = process.env.FROM_EMAIL || 'Myra <notifications@resend.dev>';
}

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'services.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const CONVERSATIONS_FILE = path.join(__dirname, 'conversations.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const DEFAULT_IMAGE = 'https://i.pravatar.cc/100?img=4';
const JWT_SECRET = process.env.JWT_SECRET || 'servlocal_secret_2026';
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
  : ['Marckley.lindor14@gmail.com'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Jesula1982';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const allowedOrigins = [
  /\.vercel\.app$/,
  'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') return pattern === origin;
      return pattern.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par CORS'));
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Trop de requêtes, réessayez plus tard.' }
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives, réessayez plus tard.' }
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

async function readJSON(filePath) {
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.promises.writeFile(filePath, '[]', 'utf8');
      return [];
    }
    throw err;
  }
}
async function writeJSON(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}
function nextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map(s => Number(s._id) || 0)) + 1;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
}

function authenticateAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!ADMIN_EMAILS.includes(req.user.email)) {
      return res.status(403).json({ error: 'Accès admin requis.' });
    }
    next();
  });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seuls JPEG et PNG sont acceptés.'));
    }
  }
});

app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoyé.' });
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'myra-services', format: 'jpg' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    const result = await streamUpload();
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Erreur Cloudinary:', error);
    res.status(500).json({ error: 'Échec de l\'upload.' });
  }
});

app.post('/api/upload-gallery', authenticateToken, upload.array('gallery', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Aucun fichier envoyé.' });
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'myra-services', format: 'jpg' },
          (error, result) => {
            if (result) resolve(result.secure_url);
            else reject(error);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });
    const urls = await Promise.all(uploadPromises);
    res.json({ urls });
  } catch (error) {
    console.error('Erreur Cloudinary (galerie):', error);
    res.status(500).json({ error: 'Échec de l\'upload de la galerie.' });
  }
});

const validateService = [
  body('title').trim().isLength({ min: 2 }).withMessage('Le titre doit contenir au moins 2 caractères.'),
  body('category').trim().notEmpty().withMessage('La catégorie est requise.'),
  body('description').trim().isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caractères.'),
  body('city').trim().notEmpty().withMessage('La ville est requise.'),
  body('price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif.'),
  body('type').optional().isIn(['offer', 'demand']).withMessage('Le type doit être offer ou demand.')
];

app.get('/api/services', async (req, res) => {
  try { res.json(await readJSON(DATA_FILE)); } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});
app.get('/api/services/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'ID invalide' });
    const services = await readJSON(DATA_FILE);
    const service = services.find(s => Number(s._id) === id);
    if (!service) return res.status(404).json({ error: 'Service non trouvé' });
    res.json(service);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/services', authenticateToken, validateService, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
  }
  try {
    const services = await readJSON(DATA_FILE);
    const users = await readJSON(USERS_FILE);
    const currentUser = users.find(u => u._id === req.user.id);
    if (!currentUser) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    const body = req.body;
    const newService = {
      _id: nextId(services),
      title: body.title.trim(),
      category: body.category.trim(),
      description: body.description.trim(),
      city: body.city.trim(),
      price: body.price != null && body.price !== '' ? String(body.price) : '',
      providerName: currentUser.name,
      providerId: currentUser._id,
      image: currentUser?.photo || DEFAULT_IMAGE,
      gallery: body.gallery || [],
      type: body.type || 'offer',
      verified: currentUser.verificationStatus === 'verified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    services.push(newService);
    await writeJSON(DATA_FILE, services);
    res.status(201).json(newService);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.put('/api/services/:id', authenticateToken, validateService, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
  }
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'ID invalide' });
    const services = await readJSON(DATA_FILE);
    const index = services.findIndex(s => Number(s._id) === id);
    if (index === -1) return res.status(404).json({ error: 'Service non trouvé' });
    const body = req.body;
    services[index] = {
      ...services[index],
      title: body.title.trim(),
      category: body.category.trim(),
      description: body.description.trim(),
      city: body.city.trim(),
      price: body.price != null && body.price !== '' ? String(body.price) : services[index].price,
      providerName: body.providerName || services[index].providerName,
      image: body.image || services[index].image,
      gallery: body.gallery || services[index].gallery,
      type: body.type || services[index].type,
      updatedAt: new Date().toISOString()
    };
    await writeJSON(DATA_FILE, services);
    res.json(services[index]);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.delete('/api/services/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'ID invalide' });
    const services = await readJSON(DATA_FILE);
    const index = services.findIndex(s => Number(s._id) === id);
    if (index === -1) return res.status(404).json({ error: 'Service non trouvé' });
    services.splice(index, 1);
    await writeJSON(DATA_FILE, services);
    res.json({ message: 'Service supprimé' });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/auth/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Le nom est requis.'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
  }
  try {
    const { name, email, password } = req.body;
    const users = await readJSON(USERS_FILE);
    if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: nextId(users),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    await writeJSON(USERS_FILE, users);
    res.status(201).json({ message: 'Compte créé avec succès' });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/auth/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('password').notEmpty().withMessage('Mot de passe requis.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
  }
  try {
    const { email, password } = req.body;
    if (ADMIN_EMAILS.includes(email) && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: 0, name: 'Admin', email: email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: 0, name: 'Admin', email: email, isAdmin: true } });
    }

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: ADMIN_EMAILS.includes(user.email) } });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (ADMIN_EMAILS.includes(req.user.email)) return res.json({ id: 0, name: 'Admin', email: req.user.email, isAdmin: true });
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ id: user._id, name: user.name, email: user.email, photo: user.photo || null, isAdmin: false });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis.' });
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (user && resend) {
      const resetToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [user.email],
        subject: 'Réinitialisation de votre mot de passe Myra',
        html: `<p>Bonjour ${user.name},</p>
               <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous (valable 1h) :</p>
               <a href="${resetLink}">Réinitialiser mon mot de passe</a>
               <p>Si vous n'avez pas fait cette demande, ignorez ce message.</p>`
      });
    }
    res.json({ message: 'Si cette adresse est associée à un compte, vous recevrez un email.' });
  } catch (error) {
    console.error('Erreur forgot-password:', error);
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token et nouveau mot de passe requis.' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await readJSON(USERS_FILE);
    const index = users.findIndex(u => u._id === decoded.id && u.email === decoded.email);
    if (index === -1) return res.status(400).json({ error: 'Token invalide.' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[index].password = hashedPassword;
    await writeJSON(USERS_FILE, users);
    res.json({ message: 'Mot de passe mis à jour. Vous pouvez vous connecter.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expiré.' });
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.get('/api/services/:id/reviews', async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const reviews = await readJSON(REVIEWS_FILE);
    const serviceReviews = reviews.filter(r => r.serviceId === serviceId);
    const averageRating = serviceReviews.length
      ? (serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length).toFixed(1)
      : 0;
    res.json({ reviews: serviceReviews, averageRating: Number(averageRating) });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/services/:id/reviews', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit être un entier entre 1 et 5.'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Le commentaire ne doit pas dépasser 500 caractères.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
  }
  try {
    const serviceId = Number(req.params.id);
    const services = await readJSON(DATA_FILE);
    const service = services.find(s => Number(s._id) === serviceId);
    if (!service) return res.status(404).json({ error: 'Service non trouvé' });
    const reviews = await readJSON(REVIEWS_FILE);
    const alreadyReviewed = reviews.find(r => r.serviceId === serviceId && r.userId === req.user.id);
    if (alreadyReviewed) return res.status(409).json({ error: 'Vous avez déjà laissé un avis.' });
    const newReview = {
      _id: nextId(reviews),
      serviceId,
      userId: req.user.id,
      userName: req.user.name,
      rating: req.body.rating,
      comment: req.body.comment ? req.body.comment.trim() : '',
      createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    await writeJSON(REVIEWS_FILE, reviews);
    const serviceReviews = reviews.filter(r => r.serviceId === serviceId);
    const averageRating = (serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length).toFixed(1);
    res.status(201).json({ review: newReview, averageRating: Number(averageRating) });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await readJSON(BOOKINGS_FILE);
    res.json(bookings.filter(b => b.clientId === req.user.id));
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.get('/api/bookings/provider', authenticateToken, async (req, res) => {
  try {
    const bookings = await readJSON(BOOKINGS_FILE);
    res.json(bookings.filter(b => b.providerName === req.user.name));
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/services/:id/bookings', authenticateToken, [
  body('date').notEmpty().withMessage('La date est requise.'),
  body('timeSlot').notEmpty().withMessage('Le créneau est requis.'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message trop long.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
  try {
    const serviceId = Number(req.params.id);
    const services = await readJSON(DATA_FILE);
    const service = services.find(s => Number(s._id) === serviceId);
    if (!service) return res.status(404).json({ error: 'Service non trouvé' });
    const bookings = await readJSON(BOOKINGS_FILE);
    const newBooking = {
      _id: nextId(bookings),
      serviceId,
      serviceTitle: service.title,
      serviceCategory: service.category,
      providerName: service.providerName,
      providerId: service.providerId,
      clientId: req.user.id,
      clientName: req.user.name,
      date: req.body.date,
      timeSlot: req.body.timeSlot,
      message: req.body.message ? req.body.message.trim() : '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    await writeJSON(BOOKINGS_FILE, bookings);
    if (service.providerId && resend) {
      try {
        const users = await readJSON(USERS_FILE);
        const provider = users.find(u => u._id === service.providerId);
        if (provider && provider.email) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [provider.email],
            subject: `Nouvelle réservation pour "${service.title}"`,
            html: `<p>Bonjour ${provider.name},</p><p>Vous avez reçu une nouvelle réservation pour votre service <strong>${service.title}</strong>.</p><p>Date : ${req.body.date} (${req.body.timeSlot})</p>`
          });
        }
      } catch (emailErr) { console.error('Erreur envoi email prestataire:', emailErr); }
    }
    res.status(201).json(newBooking);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    if (!Number.isInteger(bookingId) || bookingId < 1) return res.status(400).json({ error: 'ID invalide' });
    const { status } = req.body;
    if (!status || !['confirmed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Statut invalide.' });
    const bookings = await readJSON(BOOKINGS_FILE);
    const index = bookings.findIndex(b => Number(b._id) === bookingId);
    if (index === -1) return res.status(404).json({ error: 'Réservation non trouvée' });
    if (bookings[index].providerName !== req.user.name) return res.status(403).json({ error: 'Non autorisé.' });
    bookings[index].status = status;
    await writeJSON(BOOKINGS_FILE, bookings);
    const booking = bookings[index];
    if (booking.clientId && resend) {
      try {
        const users = await readJSON(USERS_FILE);
        const client = users.find(u => u._id === booking.clientId);
        if (client && client.email) {
          const statusText = status === 'confirmed' ? 'confirmée' : 'refusée';
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [client.email],
            subject: `Votre réservation "${booking.serviceTitle}" a été ${statusText}`,
            html: `<p>Bonjour ${client.name},</p><p>Votre réservation pour <strong>${booking.serviceTitle}</strong> a été <strong>${statusText}</strong>.</p>`
          });
        }
      } catch (emailErr) { console.error('Erreur envoi email client:', emailErr); }
    }
    res.json(booking);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await readJSON(CONVERSATIONS_FILE);
    res.json(conversations.filter(c => c.participants.includes(req.user.id)));
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/conversations', authenticateToken, [
  body('recipientId').isInt().withMessage('ID du destinataire invalide.'),
  body('serviceId').isInt().withMessage('ID du service invalide.'),
  body('serviceTitle').trim().notEmpty().withMessage('Titre du service requis.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
  try {
    const { recipientId, recipientName, serviceId, serviceTitle } = req.body;
    const conversations = await readJSON(CONVERSATIONS_FILE);
    let conversation = conversations.find(c =>
      c.serviceId === serviceId &&
      c.participants.includes(req.user.id) &&
      c.participants.includes(recipientId)
    );
    if (!conversation) {
      conversation = {
        _id: nextId(conversations),
        participants: [req.user.id, recipientId],
        participantsNames: [req.user.name, recipientName],
        serviceId,
        serviceTitle,
        createdAt: new Date().toISOString()
      };
      conversations.push(conversation);
      await writeJSON(CONVERSATIONS_FILE, conversations);
    }
    res.status(201).json(conversation);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.get('/api/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const messages = await readJSON(MESSAGES_FILE);
    const conversationMessages = messages.filter(m => m.conversationId === conversationId);
    const conversations = await readJSON(CONVERSATIONS_FILE);
    const conversation = conversations.find(c => c._id === conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) return res.status(403).json({ error: 'Accès refusé.' });
    res.json(conversationMessages);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/conversations/:id/messages', authenticateToken, [
  body('text').trim().notEmpty().withMessage('Le message ne peut pas être vide.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation échouée', details: errors.array() });
  try {
    const conversationId = Number(req.params.id);
    const conversations = await readJSON(CONVERSATIONS_FILE);
    const conversation = conversations.find(c => c._id === conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) return res.status(403).json({ error: 'Accès refusé.' });
    const messages = await readJSON(MESSAGES_FILE);
    const newMessage = {
      _id: nextId(messages),
      conversationId,
      senderId: req.user.id,
      senderName: req.user.name,
      text: req.body.text.trim(),
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    await writeJSON(MESSAGES_FILE, messages);
    res.status(201).json(newMessage);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [services, users, reviews, bookings, conversations, messages] = await Promise.all([
      readJSON(DATA_FILE), readJSON(USERS_FILE), readJSON(REVIEWS_FILE),
      readJSON(BOOKINGS_FILE), readJSON(CONVERSATIONS_FILE), readJSON(MESSAGES_FILE)
    ]);
    res.json({
      totalServices: services.length,
      totalUsers: users.length,
      totalReviews: reviews.length,
      totalBookings: bookings.length,
      totalConversations: conversations.length,
      totalMessages: messages.length,
      services,
      users: users.map(u => ({ _id: u._id, name: u.name, email: u.email, createdAt: u.createdAt })),
      bookings
    });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.put('/api/admin/services/:id/verify', authenticateAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const services = await readJSON(DATA_FILE);
    const index = services.findIndex(s => Number(s._id) === id);
    if (index === -1) return res.status(404).json({ error: 'Service non trouvé' });
    services[index].verified = true;
    await writeJSON(DATA_FILE, services);
    res.json(services[index]);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.delete('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const services = await readJSON(DATA_FILE);
    const index = services.findIndex(s => Number(s._id) === id);
    if (index === -1) return res.status(404).json({ error: 'Service non trouvé' });
    services.splice(index, 1);
    await writeJSON(DATA_FILE, services);
    res.json({ message: 'Service supprimé par admin' });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const users = await readJSON(USERS_FILE);
    const index = users.findIndex(u => Number(u._id) === id);
    if (index === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    users.splice(index, 1);
    await writeJSON(USERS_FILE, users);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.post('/api/user/request-verification', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Document requis.' });
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'myra-verifications', format: 'jpg' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    const result = await streamUpload();
    const documentUrl = result.secure_url;
    const users = await readJSON(USERS_FILE);
    const index = users.findIndex(u => u._id === req.user.id);
    if (index === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    users[index].verificationStatus = 'pending';
    users[index].verificationDocument = documentUrl;
    await writeJSON(USERS_FILE, users);
    res.json({ message: 'Votre demande de vérification a bien été envoyée. Elle sera examinée par notre équipe.' });
  } catch (error) {
    console.error('Erreur demande vérification:', error);
    res.status(500).json({ error: 'Échec de l\'envoi de la demande.' });
  }
});

app.get('/api/admin/verification-requests', authenticateAdmin, async (req, res) => {
  try {
    const users = await readJSON(USERS_FILE);
    const requests = users.filter(u => u.verificationStatus === 'pending').map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      verificationDocument: u.verificationDocument,
      verificationStatus: u.verificationStatus
    }));
    res.json(requests);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.put('/api/admin/verify-user/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const users = await readJSON(USERS_FILE);
    const index = users.findIndex(u => u._id === userId);
    if (index === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    users[index].verificationStatus = 'verified';
    await writeJSON(USERS_FILE, users);
    res.json({ message: 'Utilisateur vérifié.' });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.put('/api/admin/reject-user/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const users = await readJSON(USERS_FILE);
    const index = users.findIndex(u => u._id === userId);
    if (index === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    users[index].verificationStatus = 'rejected';
    await writeJSON(USERS_FILE, users);
    res.json({ message: 'Vérification refusée.' });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

if (stripe) {
  app.post('/api/create-checkout-session', authenticateToken, async (req, res) => {
    try {
      const { serviceId, bookingId } = req.body;
      if (!serviceId || !bookingId) return res.status(400).json({ error: 'serviceId et bookingId requis.' });
      const services = await readJSON(DATA_FILE);
      const service = services.find(s => Number(s._id) === Number(serviceId));
      if (!service) return res.status(404).json({ error: 'Service non trouvé.' });
      const bookings = await readJSON(BOOKINGS_FILE);
      const booking = bookings.find(b => Number(b._id) === Number(bookingId));
      if (!booking) return res.status(404).json({ error: 'Réservation non trouvée.' });
      let amount = 0;
      if (service.price) {
        const parsed = parseFloat(service.price);
        if (!isNaN(parsed)) amount = Math.round(parsed * 100);
      }
      if (amount <= 0) return res.status(400).json({ error: 'Ce service n\'a pas de prix valide.' });
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: service.title, description: service.description?.substring(0, 200) },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'https://servlocal-app.vercel.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://servlocal-app.vercel.app'}/my-bookings`,
        metadata: { bookingId: String(bookingId), serviceId: String(serviceId), userId: String(req.user.id) },
      });
      res.json({ url: session.url });
    } catch (error) { res.status(500).json({ error: 'Impossible de créer la session de paiement.' }); }
  });

  app.get('/api/booking/confirm', async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id) return res.status(400).json({ error: 'session_id manquant.' });
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status !== 'paid') return res.status(400).json({ error: 'Paiement non confirmé.' });
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) return res.status(400).json({ error: 'Métadonnées manquantes.' });
      const bookings = await readJSON(BOOKINGS_FILE);
      const index = bookings.findIndex(b => Number(b._id) === Number(bookingId));
      if (index === -1) return res.status(404).json({ error: 'Réservation introuvable.' });
      bookings[index].paymentStatus = 'paid';
      bookings[index].status = 'confirmed';
      await writeJSON(BOOKINGS_FILE, bookings);
      res.redirect(`${process.env.FRONTEND_URL || 'https://servlocal-app.vercel.app'}/payment-success?booking_id=${bookingId}&status=paid`);
    } catch (error) { res.status(500).json({ error: 'Erreur interne.' }); }
  });
} else {
  app.post('/api/create-checkout-session', (req, res) => res.status(503).json({ error: 'Paiement non configuré.' }));
  app.get('/api/booking/confirm', (req, res) => res.status(503).json({ error: 'Paiement non configuré.' }));
}

app.get('/api/cities', async (req, res) => {
  try {
    const services = await readJSON(DATA_FILE);
    const cities = [...new Set(services.map(s => s.city).filter(Boolean))].sort();
    res.json(cities);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const bookings = await readJSON(BOOKINGS_FILE);
    const pendingProvider = bookings.filter(b => b.providerName === req.user.name && b.status === 'pending').length;
    const pendingClient = bookings.filter(b => b.clientId === req.user.id && b.status === 'pending').length;
    res.json({ pendingBookings: pendingProvider + pendingClient });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

app.get('/', (req, res) => res.status(200).send('OK'));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Le fichier est trop volumineux. Maximum 5 Mo.' });
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Type de fichier non autorisé. Seuls JPEG et PNG sont acceptés.') return res.status(400).json({ error: err.message });
  console.error('Erreur non gérée:', err.message);
  res.status(500).json({ error: 'Erreur interne' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Myra sécurisé démarré sur le port ${PORT}`);
});