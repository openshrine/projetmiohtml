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