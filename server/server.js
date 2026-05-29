const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'services.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const CONVERSATIONS_FILE = path.join(__dirname, 'conversations.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const DEFAULT_IMAGE = 'https://i.pravatar.cc/100?img=4';
const JWT_SECRET = 'servlocal_secret_2026';
const ADMIN_EMAIL = 'Marckley.lindor14@gmail.com';
const ADMIN_PASSWORD = 'Jesula1982';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ---------- Helpers JSON ----------
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
function validateServiceInput(body) {
  const errors = [];
  const { title, category, description, city } = body || {};
  if (!title || !String(title).trim()) errors.push('title est requis');
  else if (String(title).trim().length < 2) errors.push('title doit contenir au moins 2 caractères');
  if (!category || !String(category).trim()) errors.push('category est requise');
  else if (String(category).trim().length < 2) errors.push('category doit contenir au moins 2 caractères');
  if (!description || !String(description).trim()) errors.push('description est requise');
  else if (String(description).trim().length < 10) errors.push('description doit contenir au moins 10 caractères');
  if (!city || !String(city).trim()) errors.push('city est requise');
  if (body.price != null && body.price !== '') {
    const price = Number(body.price);
    if (isNaN(price) || price < 0) errors.push('price doit être un nombre positif');
  }
  return errors;
}

// ---------- Middleware auth ----------
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
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Accès admin requis.' });
    }
    next();
  });
}

// ---------- Upload Cloudinary ----------
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoyé.' });
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'myra-services' },
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
          { folder: 'myra-services' },
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

// ---------- Profil utilisateur ----------
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, photo } = req.body;
    const users = await readJSON(USERS_FILE);
    const index = users.findIndex(u => u._id === req.user.id);
    if (index === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    if (name) users[index].name = name;
    if (photo) users[index].photo = photo;
    await writeJSON(USERS_FILE, users);
    res.json({
      id: users[index]._id,
      name: users[index].name,
      email: users[index].email,
      photo: users[index].photo || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// ---------- Routes services ----------
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
app.post('/api/services', async (req, res) => {
  try {
    const errors = validateServiceInput(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation échouée', details: errors });
    const services = await readJSON(DATA_FILE);
    const users = await readJSON(USERS_FILE);
    const currentUser = users.find(u => u._id === req.user.id);
    const body = req.body;
    const newService = {
      _id: nextId(services),
      title: String(body.title).trim(),
      category: String(body.category).trim(),
      description: String(body.description).trim(),
      city: String(body.city).trim(),
      price: body.price != null && body.price !== '' ? String(body.price) : '',
      providerName: currentUser ? currentUser.name : 'Anonyme',
      image: currentUser?.photo || DEFAULT_IMAGE,
      gallery: body.gallery || [],
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    services.push(newService);
    await writeJSON(DATA_FILE, services);
    res.status(201).json(newService);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});
app.put('/api/services/:id', async (req, res) => { /* inchangé mais inclure city */ });
app.delete('/api/services/:id', async (req, res) => { /* inchangé */ });

// ---------- Auth ----------
app.post('/api/auth/register', async (req, res) => { /* inchangé */ });
app.post('/api/auth/login', async (req, res) => { /* inchangé */ });
app.get('/api/auth/me', authenticateToken, async (req, res) => { /* inchangé */ });

// ---------- Reviews, Bookings, Messages, Admin, Cities, Notifications (inchangé) ----------
// ... (garder tout le reste identique à la version précédente)

// Healthcheck
app.get('/', (req, res) => res.status(200).send('OK'));

// 404 & Error handler
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} non trouvée` }));
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err.message);
  res.status(500).json({ error: 'Erreur interne' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Myra démarré sur le port ${PORT}`);
});