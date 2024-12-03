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

document.addEventListener("DOMContentLoaded", () => {
    const packs = document.querySelectorAll(".pack123");
    let activePack = null;

    packs.forEach(pack => {
        const btnEnSavoirPlus = pack.querySelector(".btn-en-savoir-plus");
        const btnNousContacter = pack.querySelector(".btn-nous-contacter");

        // Ouvrir la div en grand
        btnEnSavoirPlus.addEventListener("click", () => {
            if (activePack) return; // Empêche l'ouverture de plusieurs divs
            pack.classList.add("open");
            document.body.classList.add("overlay");
            activePack = pack;
        });

        // Fermer la div en cliquant en dehors
        document.addEventListener("click", (event) => {
            if (!activePack) return;
            if (!pack.contains(event.target)) {
                pack.classList.remove("open");
                document.body.classList.remove("overlay");
                activePack = null;
            }
        });
    });
});
