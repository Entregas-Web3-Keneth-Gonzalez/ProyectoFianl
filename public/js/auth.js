// js/auth.js

function salir() {
    firebase.auth().signOut()
        .then(() => {
            window.location.href = "login.html";
        })
        .catch(error => {
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión: " + error.message);
        });
}