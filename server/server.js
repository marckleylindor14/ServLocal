const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');

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

// Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Myra <notifications@resend.dev>';

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

app.put('/api/user/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis.' });
    const users = await readJSON(USERS_FILE);
    const index = users.findIndex(u => u._id === req.user.id);
    if (index === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const isMatch = await bcrypt.compare(currentPassword, users[index].password);
    if (!isMatch) return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[index].password = hashedPassword;
    await writeJSON(USERS_FILE, users);
    res.json({ message: 'Mot de passe mis à jour.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne' });
  }
});

app.get('/api/user/stats', authenticateToken, async (req, res) => {
  try {
    const [services, bookings] = await Promise.all([
      readJSON(DATA_FILE),
      readJSON(BOOKINGS_FILE)
    ]);
    const userId = req.user.id;
    const userName = req.user.name;
    const myServices = services.filter(s => s.providerName === userName);
    const bookingsReceived = bookings.filter(b => b.providerName === userName);
    const bookingsMade = bookings.filter(b => b.clientId === userId);
    res.json({
      totalServices: myServices.length,
      bookingsReceived: bookingsReceived.length,
      bookingsMade: bookingsMade.length,
      pendingReceived: bookingsReceived.filter(b => b.status === 'pending').length,
      confirmedReceived: bookingsReceived.filter(b => b.status === 'confirmed').length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// ---------- Stripe ----------
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
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: service.title,
              description: service.description?.substring(0, 200),
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'https://servlocal-app.vercel.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://servlocal-app.vercel.app'}/my-bookings`,
      metadata: {
        bookingId: String(bookingId),
        serviceId: String(serviceId),
        userId: String(req.user.id),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: 'Impossible de créer la session de paiement.' });
  }
});

app.get('/api/booking/confirm', async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id manquant.' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Paiement non confirmé.' });
    }

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return res.status(400).json({ error: 'Métadonnées manquantes.' });

    const bookings = await readJSON(BOOKINGS_FILE);
    const index = bookings.findIndex(b => Number(b._id) === Number(bookingId));
    if (index === -1) return res.status(404).json({ error: 'Réservation introuvable.' });

    bookings[index].paymentStatus = 'paid';
    bookings[index].status = 'confirmed';
    await writeJSON(BOOKINGS_FILE, bookings);

    res.redirect(`${process.env.FRONTEND_URL || 'https://servlocal-app.vercel.app'}/payment-success?booking_id=${bookingId}&status=paid`);
  } catch (error) {
    console.error('Erreur confirmation Stripe:', error);
    res.status(500).json({ error: 'Erreur interne.' });
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
app.post('/api/services', authenticateToken, async (req, res) => {
  try {
    const errors = validateServiceInput(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation échouée', details: errors });
    const services = await readJSON(DATA_FILE);
    const users = await readJSON(USERS_FILE);
    const currentUser = users.find(u => u._id === req.user.id);
    if (!currentUser) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    const body = req.body;
    const newService = {
      _id: nextId(services),
      title: String(body.title).trim(),
      category: String(body.category).trim(),
      description: String(body.description).trim(),
      city: String(body.city).trim(),
      price: body.price != null && body.price !== '' ? String(body.price) : '',
      providerName: currentUser.name,
      providerId: currentUser._id,   // <-- on stocke l'ID du prestataire
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
app.put('/api/services/:id', authenticateToken, async (req, res) => {
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
      providerId: services[index].providerId, // on conserve l'ID initial
      image: body.image || services[index].image,
      gallery: body.gallery || services[index].gallery,
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

// ---------- Routes auth ----------
app.post('/api/auth/register', async (req, res) => { /* identique à la version précédente, je l'inclus pour être complet */
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
app.post('/api/auth/login', async (req, res) => { /* identique */
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

// ---------- Réinitialisation de mot de passe ----------
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis.' });
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    // On renvoie toujours un succès pour ne pas indiquer si l'email existe
    if (user) {
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
app.get('/api/auth/me', authenticateToken, async (req, res) => { /* identique */
  try {
    if (req.user.email === ADMIN_EMAIL) return res.json({ id: 0, name: 'Admin', email: ADMIN_EMAIL });
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ id: user._id, name: user.name, email: user.email, photo: user.photo || null });
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

// ---------- Routes avis ---------- (inchangées)
app.get('/api/services/:id/reviews', async (req, res) => { /* omis pour brièveté, conserver le code précédent */ });
app.post('/api/services/:id/reviews', authenticateToken, async (req, res) => { /* omis */ });

// ---------- Routes réservation (avec emails) ----------
app.get('/api/bookings', authenticateToken, async (req, res) => { /* inchangé */ });
app.get('/api/bookings/provider', authenticateToken, async (req, res) => { /* inchangé */ });
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
      providerId: service.providerId,
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
    // Route temporaire pour obtenir un token de reset sans email
app.post('/api/auth/forgot-password-direct', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis.' });
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    const resetToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    res.json({ token: resetToken, link: resetLink });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne' });
  }
});

    // --- Envoyer un email au prestataire ---
    if (service.providerId) {
      try {
        const users = await readJSON(USERS_FILE);
        const provider = users.find(u => u._id === service.providerId);
        if (provider && provider.email) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [provider.email],
            subject: `Nouvelle réservation pour "${service.title}"`,
            html: `<p>Bonjour ${provider.name},</p>
                   <p>Vous avez reçu une nouvelle réservation pour votre service <strong>${service.title}</strong>.</p>
                   <p>Date : ${date} (${timeSlot})</p>
                   ${message ? `<p>Message : ${message}</p>` : ''}
                   <p>Connectez-vous à Myra pour la confirmer ou la refuser.</p>`
          });
          console.log('Email prestataire envoyé à', provider.email);
        }
      } catch (emailErr) {
        console.error('Erreur envoi email prestataire:', emailErr);
        // On ne bloque pas la réponse
      }
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

    // --- Envoyer un email au client ---
    if (booking.clientId) {
      try {
        const users = await readJSON(USERS_FILE);
        const client = users.find(u => u._id === booking.clientId);
        if (client && client.email) {
          const statusText = status === 'confirmed' ? 'confirmée' : 'refusée';
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [client.email],
            subject: `Votre réservation "${booking.serviceTitle}" a été ${statusText}`,
            html: `<p>Bonjour ${client.name},</p>
                   <p>Votre réservation pour <strong>${booking.serviceTitle}</strong> a été <strong>${statusText}</strong>.</p>
                   ${status === 'confirmed' ? '<p>Vous pouvez maintenant contacter le prestataire via la messagerie.</p>' : '<p>N\'hésitez pas à rechercher un autre créneau.</p>'}
                   <p>À bientôt sur Myra !</p>`
          });
          console.log('Email client envoyé à', client.email);
        }
      } catch (emailErr) {
        console.error('Erreur envoi email client:', emailErr);
      }
    }

    res.json(booking);
  } catch (error) { res.status(500).json({ error: 'Erreur interne' }); }
});

// ---------- Routes messagerie ---------- (inchangées, les garder telles quelles)
// ...

// ---------- Routes admin ---------- (inchangées)
// ...

// ---------- Villes ----------
app.get('/api/cities', async (req, res) => { /* inchangé */ });

// ---------- Notifications ----------
app.get('/api/notifications', authenticateToken, async (req, res) => { /* inchangé */ });

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