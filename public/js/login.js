function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Campos incompletos',
            text: 'Por favor, ingresa tu correo y contraseña.',
        });
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Redirigiendo al inicio...',
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.href = "index.html";
            });
        })
        .catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar sesión',
                text: error.message,
            });
        });
}

// Función para iniciar sesión con Google
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(async (result) => {
            const user = result.user;
            const userRef = firebase.firestore().collection("users").doc(user.uid);

            try {
                const doc = await userRef.get();

                if (doc.exists) {
                    // Usuario ya registrado, redirigir al index
                    Swal.fire({
                        icon: 'success',
                        title: 'Bienvenido',
                        text: 'Inicio de sesión exitoso. Redirigiendo al inicio...',
                    }).then(() => {
                        window.location.href = "index.html";
                    });
                } else {
                    // Usuario no registrado, redirigir al registro con datos precargados
                    const socialUser = {
                        fullName: user.displayName || "",
                        email: user.email || "",
                        photoURL: user.photoURL || "default_profile.png",
                    };

                    localStorage.setItem("socialUser", JSON.stringify(socialUser));

                    Swal.fire({
                        icon: 'info',
                        title: 'Completa tu registro',
                        text: 'No encontramos una cuenta asociada a tu correo. Completa tu registro.',
                    }).then(() => {
                        window.location.href = "register.html";
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al verificar usuario',
                    text: error.message,
                });
            }
        })
        .catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar sesión con Google',
                text: error.message,
            });
        });
}

// Función para iniciar sesión como invitado
function loginAsGuest() {
    firebase.auth().signInAnonymously()
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Modo invitado',
                text: 'Redirigiendo al inicio...',
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.href = "index.html";
            });
        })
        .catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar como invitado',
                text: error.message,
            });
        });
}
