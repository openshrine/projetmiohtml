require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mailgun = require('mailgun-js'); // Assurez-vous que Mailgun est installé : npm install mailgun-js
const { body, validationResult } = require('express-validator');

// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://miomariage:89fdrFz5mr77Ch6w@mio.n31s6.mongodb.net/?retryWrites=true&w=majority&appName=Mio', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connexion à la base de données MongoDB réussie');
}).catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Définir un modèle Mongoose pour le formulaire
const formSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    telephone: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    offer: { type: String, required: true },
    message: { type: String, required: true },
});

const FormData = mongoose.model('FormData', formSchema);

// Configuration de Mailgun
const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY, // Clé API de Mailgun dans le fichier .env
    domain: process.env.MAILGUN_DOMAIN, // Domaine Mailgun dans le fichier .env
});

// Route pour recevoir et sauvegarder les données du formulaire
app.post('/submit-form', [
    body('name').not().isEmpty().withMessage('Le nom est requis'),
    body('surname').not().isEmpty().withMessage('Le prénom est requis'),
    body('telephone')
        .matches(/^\d{10}$/)
        .withMessage('Le numéro de téléphone doit être composé de 10 chiffres'),
    body('date').not().isEmpty().withMessage('La date est requise'),
    body('offer').not().isEmpty().withMessage('L\'offre doit être choisie'),
    body('email').isEmail().withMessage('L\'email doit être valide'),
    body('message').not().isEmpty().withMessage('Le message est requis'),
], async (req, res) => {
    console.log('Données reçues depuis le frontend :', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Erreurs de validation :', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, surname, telephone, date, offer, email, message } = req.body;
    console.log({ name, surname, telephone, date, offer, email, message });

    try {
        console.log('Tentative de sauvegarde dans MongoDB...');
        const newFormData = new FormData({ name, surname, email, telephone, date, offer, message });
        await newFormData.save();
        console.log('Données sauvegardées avec succès !');

        const mailData = {
            from: process.env.MAILGUN_SENDER, // Adresse expéditeur configurée dans .env
            to: 'mio.mariage@gmail.com', // Adresse email qui reçoit les messages
            subject: 'Nouveau message posté sur Mio !',
            text: `
            Nom : ${surname}
            Prénom : ${name}
            Téléphone : ${telephone}
            Email : ${email}
            Date : ${date}
            Offre : ${offer}
            Message : ${message}
        `,
        };

        mg.messages().send(mailData, (error, body) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'email :', error);
                return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email', error: error.message });
            }
            console.log('Email envoyé avec succès :', body);
            res.json({ message: 'Formulaire reçu et email envoyé avec succès', data: req.body });
        });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données :', error);
        res.status(500).json({ message: 'Erreur lors de la sauvegarde des données', error: error.message });
    }
});

// Utiliser helmet pour ajouter des headers de sécurité
app.use(helmet());

// Limiter les requêtes pour éviter les attaques par force brute
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: 'Trop de requêtes envoyées depuis cette adresse IP, veuillez réessayer plus tard.',
});

// Appliquer le limiteur sur toutes les routes
app.use(limiter);

// Lancer le serveur
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Le serveur est en écoute sur le port ${PORT}`);
});
