const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

app.use(cors());
app.use(express.json());

// Logging
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
    const body = req.body;
    const newService = {
      _id: nextId(services),
      title: String(body.title).trim(),
      category: String(body.category).trim(),
      description: String(body.description).trim(),
      city: String(body.city).trim(),
      price: body.price != null && body.price !== '' ? String(body.price) : '',
      providerName: body.providerName || 'Anonyme',
      image: body.image || DEFAULT_IMAGE,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    services.push(newService);
    await writeJSON(DATA_FILE, services);
    res.status(201).json(newService);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});
app.put('/api/services/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'ID invalide' });
    const errors = validateServiceInput(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation échouée', details: errors });
    const services = await readJSON(DATA_FILE);
    const index = services.findIndex(s => Number(s._id) === id);
    if (index === -1) return res.status(404).json({ error: 'Service non trouvé' });
    const body = req.body;
    services[index] = {
      ...services[index],
      title: String(body.title).trim(),
      category: String(body.category).trim(),
      description: String(body.description).trim(),
      city: String(body.city).trim(),
      price: body.price != null && body.price !== '' ? String(body.price) : services[index].price,
      providerName: body.providerName || services[index].providerName,
      image: body.image || services[index].image,
      updatedAt: new Date().toISOString()
    };
    await writeJSON(DATA_FILE, services);
    res.json(services[index]);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});
app.delete('/api/services/:id', async (req, res) => {
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

// ---------- Routes auth ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
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
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: 0, name: 'Admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: 0, name: 'Admin', email: ADMIN_EMAIL } });
    }

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.email === ADMIN_EMAIL) return res.json({ id: 0, name: 'Admin', email: ADMIN_EMAIL });
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

// ---------- Routes avis ----------
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
app.post('/api/services/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { rating, comment } = req.body;
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La note doit être un entier entre 1 et 5.' });
    }
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
      rating,
      comment: comment ? String(comment).trim() : '',
      createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    await writeJSON(REVIEWS_FILE, reviews);
    const serviceReviews = reviews.filter(r => r.serviceId === serviceId);
    const averageRating = (serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length).toFixed(1);
    res.status(201).json({ review: newReview, averageRating: Number(averageRating) });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

// ---------- Routes réservation ----------
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
app.post('/api/services/:id/bookings', authenticateToken, async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { date, timeSlot, message } = req.body;
    if (!date || !timeSlot) return res.status(400).json({ error: 'Date et créneau horaire requis.' });
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
      clientId: req.user.id,
      clientName: req.user.name,
      date,
      timeSlot,
      message: message ? String(message).trim() : '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    await writeJSON(BOOKINGS_FILE, bookings);
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
    res.json(bookings[index]);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

// ---------- Routes messagerie ----------
app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await readJSON(CONVERSATIONS_FILE);
    res.json(conversations.filter(c => c.participants.includes(req.user.id)));
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});
app.post('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const { recipientId, recipientName, serviceId, serviceTitle } = req.body;
    if (!recipientId || !recipientName || !serviceId || !serviceTitle) return res.status(400).json({ error: 'Informations manquantes.' });
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
app.post('/api/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const { text } = req.body;
    if (!text || !String(text).trim()) return res.status(400).json({ error: 'Message vide.' });
    const conversations = await readJSON(CONVERSATIONS_FILE);
    const conversation = conversations.find(c => c._id === conversationId);
    if (!conversation || !conversation.participants.includes(req.user.id)) return res.status(403).json({ error: 'Accès refusé.' });
    const messages = await readJSON(MESSAGES_FILE);
    const newMessage = {
      _id: nextId(messages),
      conversationId,
      senderId: req.user.id,
      senderName: req.user.name,
      text: String(text).trim(),
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    await writeJSON(MESSAGES_FILE, messages);
    res.status(201).json(newMessage);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

// ---------- Routes admin ----------
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

// ---------- Villes ----------
app.get('/api/cities', async (req, res) => {
  try {
    const services = await readJSON(DATA_FILE);
    const cities = [...new Set(services.map(s => s.city).filter(Boolean))].sort();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// ---------- Notifications ----------
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const bookings = await readJSON(BOOKINGS_FILE);
    const pendingProvider = bookings.filter(b => b.providerName === req.user.name && b.status === 'pending').length;
    const pendingClient = bookings.filter(b => b.clientId === req.user.id && b.status === 'pending').length;
    res.json({ pendingBookings: pendingProvider + pendingClient });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

// Healthcheck pour Railway
app.get('/', (req, res) => res.status(200).send('OK'))

// ---------- 404 & Error handler ----------
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} non trouvée` }));
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err.message);
  res.status(500).json({ error: 'Erreur interne' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Myra démarré sur le port ${PORT}`);
});