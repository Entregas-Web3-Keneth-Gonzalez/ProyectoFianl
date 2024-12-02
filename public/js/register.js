// Precargar datos si vienen desde un login social
document.addEventListener("DOMContentLoaded", () => {
    const socialUser = localStorage.getItem("socialUser");
    if (socialUser) {
        const { fullName, email, photoURL } = JSON.parse(socialUser);
        document.getElementById("fullName").value = fullName || "";
        document.getElementById("email").value = email || "";
        document.getElementById("email").readOnly = true; // Bloquear edición si es un usuario social
        if (photoURL) {
            const photoPreview = document.getElementById("photoPreview");
            photoPreview.src = photoURL;
            photoPreview.style.display = "block";
        }
        // Ocultar contraseña si el registro viene desde un login social
        document.getElementById("passwordContainer").style.display = "none";
    }
});

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
                    // Guardar datos en localStorage
                    localStorage.setItem("socialUser", JSON.stringify(socialUser));

                    Swal.fire({
                        icon: 'info',
                        title: 'Completa tu registro',
                        text: 'No encontramos una cuenta asociada a tu correo. Completa tu registro.',
                    }).then(() => {
                        window.location.href = "register.html"; // Redirigir al registro
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

// Función para registrar usuario manualmente
function registerUser() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const photoFile = document.getElementById("photo").files[0];

    if (!fullName || !email) {
        Swal.fire({
            icon: 'error',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios.',
        });
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;

            const saveToFirestore = (photoURL) => {
                firebase.firestore().collection("users").doc(user.uid).set({
                    fullName,
                    email,
                    photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Registro exitoso',
                        text: 'Usuario registrado con éxito. Redirigiendo al inicio...',
                    }).then(() => {
                        window.location.href = "index.html";
                    });
                }).catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al guardar datos',
                        text: error.message,
                    });
                });
            };

            if (photoFile) {
                const storageRef = firebase.storage().ref(`users/${user.uid}/profile.jpg`);
                storageRef.put(photoFile).then(snapshot => snapshot.ref.getDownloadURL())
                    .then(photoURL => saveToFirestore(photoURL))
                    .catch(error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al subir foto',
                            text: error.message,
                        });
                    });
            } else {
                saveToFirestore("default_profile.png");
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error en el registro',
                text: error.message,
            });
        });


    function saveUserData(user, photoFile) {
        const userRef = firebase.firestore().collection("users").doc(user.uid);

        userRef.get().then((doc) => {
            if (doc.exists) {
                Swal.fire({
                    icon: 'info',
                    title: 'Usuario ya registrado',
                    text: 'Este usuario ya está registrado. Redirigiendo al inicio...',
                }).then(() => {
                    window.location.href = "index.html";
                });
            } else {
                // Guardar información del usuario
                const saveToFirestore = (photoURL) => {
                    userRef.set({
                        fullName,
                        email,
                        photoURL,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    }).then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Registro exitoso',
                            text: 'Usuario registrado con éxito.',
                        }).then(() => {
                            localStorage.removeItem("socialUser");
                            window.location.href = "index.html";
                        });
                    }).catch((error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al guardar datos',
                            text: error.message,
                        });
                    });
                };

                if (photoFile) {
                    const storageRef = firebase.storage().ref(`users/${user.uid}/profile.jpg`);
                    storageRef.put(photoFile).then((snapshot) => snapshot.ref.getDownloadURL())
                        .then((photoURL) => saveToFirestore(photoURL))
                        .catch((error) => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error al subir foto',
                                text: error.message,
                            });
                        });
                } else {
                    const socialUser = JSON.parse(localStorage.getItem("socialUser"));
                    saveToFirestore(socialUser?.photoURL || "default_profile.png");
                }
            }
        });
    }
}