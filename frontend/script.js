const backToTopButton = document.getElementById('back-to-top');

// Affiche/masque le bouton selon le défilement
window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// Ajoute un comportement de retour en haut
backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


document.addEventListener('DOMContentLoaded', () => {
    const packPersonnalite = document.getElementById('pack-personnalite');
    const packHistoire = document.getElementById('pack-histoire');
    const packImage = document.getElementById('pack-image');

    const contenuPersonnalite = [
        "Section 'Notre histoire' : texte et photo à votre choix.",
        "Thème préconçu ajusté (minimaliste, floral ou chic).",
        "Design mobile-friendly pour une consultation optimale sur tous les appareils.",
        "Bonus : Assistance pour choisir les éléments visuels (couleurs, icônes)."
    ];

    const contenuHistoire = [
        "Création de sections uniques :",
        "Notre histoire : timeline interactive avec photos et descriptions des moments marquants.",
        "Livre d’or : espace pour que vos invités laissent des messages personnalisés.",
        "Liste de cadeaux interactive avec liens directs vers les boutiques.",
        "Galerie photo dynamique (jusqu’à 100 photos) avec possibilité de tri par catégories.",
        "Design de boutons et icônes sur mesure pour harmoniser le site.",
        "Bonus : Vidéo d'introduction en page d'accueil (fournie par le couple)."
    ];

    const contenuImage = [
        "Création de pages spéciales :",
        "Section privée avec accès sécurisé (contenus exclusifs pour les invités, comme planning détaillé).",
        "Page dédiée aux remerciements avec intégration de vidéos ou diaporamas.",
        "Interactions avancées :",
        "Notifications automatiques pour les RSVP.",
        "Suivi des réponses des invités en temps réel (tableau de bord pour les mariés).",
        "Galerie photo illimitée avec diaporama et téléchargement pour les invités.",
        "Ajout d'une playlist intégrée pour partager votre ambiance musicale avec les invités.",
        "Adaptation multilingue pour les mariages internationaux.",
        "Bonus : Suggestions personnalisées d’agencement et conseils pour optimiser l’expérience utilisateur."
    ];

    // Fonction pour ajouter du contenu au survol
    function ajouterContenu(pack, contenu) {
        // Ajouter uniquement si le contenu n'a pas déjà été ajouté
        if (!pack.classList.contains('contenu-ajoute')) {
            const ul = pack.querySelector('ul');
            contenu.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-check" style="color: #e0cf7f;"></i> ${item}`;
                ul.appendChild(li);
            });
            // Marquer que le contenu a été ajouté
            pack.classList.add('contenu-ajoute');
        }
    }

    // Fonction pour masquer le contenu ajouté
    function masquerContenu(pack) {
        const ul = pack.querySelector('ul');
        const items = ul.querySelectorAll('.extra-contenu'); // Sélectionner uniquement les éléments ajoutés
        items.forEach(item => {
            item.style.display = 'none'; // Masquer le contenu ajouté
        });
    }

    // Gestion des événements pour chaque div
    [packPersonnalite, packHistoire, packImage].forEach(pack => {
        pack.addEventListener('mouseover', () => {
            const contenu = pack === packPersonnalite ? contenuPersonnalite :
                pack === packHistoire ? contenuHistoire : contenuImage;
            ajouterContenu(pack, contenu);
        });

        pack.addEventListener('mouseleave', () => {
            masquerContenu(pack);
        });
    });
});

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Récupérer les données du formulaire
    const formData = {
        name: document.getElementById('nom').value,
        surname: document.getElementById('prenom').value,
        telephone: document.getElementById('telephone').value,
        email: document.getElementById('email').value,
        date: document.getElementById('wedding-date').value,
        offer: document.getElementById('pack-choice').value,
        message: document.getElementById('message').value,
    };

    try {
        // Envoyer les données au serveur

        console.log('Données envoyées au backend :', formData);

        const response = await fetch('http://localhost:3001/submit-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Formulaire envoyé avec succès !');
            console.log(result);
        } else {
            const error = await response.json();
            alert('Erreur : ' + error.message);
        }
    } catch (err) {
        console.error('Erreur lors de l\'envoi du formulaire :', err);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
});
