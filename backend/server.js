require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mailgun = require('mailgun-js')
const { body, validationResult } = require('express-validator');

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
    email: { type: String, required: true },
    telephone: { type: Number, required: true },
    date: { type: String, required: true },
    offer: { type: String, required: true },
    message: { type: String, required: true },
});

const FormData = mongoose.model('FormData', formSchema);

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, surname, telephone, date, offer, email, message } = req.body;

    try {
        const newFormData = new FormData({ name, surname, email, telephone, date, offer, message });
        await newFormData.save();

        const data = {
            from: process.env.MAILGUN_SENDER,
            to: 'mio.mariage@gmail.com', // Adresse email qui reçoit les messages
            subject: 'Nouveau message de formulaire',
            text: `Vous avez reçu un nouveau message de ${name} (${email}):
            
            Message : ${message}

            Téléphone : ${telephone}
            Date de l'événement : ${date}
            Offre choisie : ${offer}`,
        };

        mg.messages().send(data, (error, body) => {
            if (error) {
                console.error('Erreur Mailgun:', error);
                return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email', error: error.message });
            }
            console.log('Email envoyé:', body);
            res.json({ message: 'Formulaire reçu et email envoyé avec succès', data: req.body });
        });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
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