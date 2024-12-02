// js/authState.js

// Referencias a los elementos del menú
const navLogin = document.getElementById('navLogin');
const navRegister = document.getElementById('navRegister');
const navLogout = document.getElementById('navLogout');
const userPhoto = document.getElementById('userPhoto');

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        navLogin.style.display = 'none';
        navRegister.style.display = 'none';
        navLogout.style.display = 'block';

        if (user.isAnonymous) {
            // Mostrar "Invitado" en lugar de la foto
            userPhoto.style.display = 'none';
            const guestLabel = document.createElement('span');
            guestLabel.id = 'guestLabel';
            guestLabel.classList.add('navbar-text', 'text-white', 'mx-2');
            guestLabel.textContent = 'Invitado';
            navLogout.parentNode.insertBefore(guestLabel, navLogout);
        } else {
            // Mostrar foto de usuario
            const uid = user.uid;
            firebase.firestore().collection('users').doc(uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        if (userData.photoURL) {
                            userPhoto.src = userData.photoURL;
                            userPhoto.style.display = 'block';
                        }
                    }
                })
                .catch(error => console.error('Error al obtener datos del usuario:', error));
        }
    } else {
        navLogin.style.display = 'block';
        navRegister.style.display = 'block';
        navLogout.style.display = 'none';
        userPhoto.style.display = 'none';
        const guestLabel = document.getElementById('guestLabel');
        if (guestLabel) {
            guestLabel.remove();
        }
    }
});