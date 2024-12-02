// Inicializa Firestore
const db = firebase.firestore();

// Obtener el ID de la investigación desde la URL
const urlParams = new URLSearchParams(window.location.search);
const researchId = urlParams.get("id");

if (!researchId) {
    alert("No se encontró la investigación.");
    window.location.href = "index.html";
}

// Variables globales
let currentUser;

// Verificar si el usuario está autenticado
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loadResearchDetails();
    } else {
        alert("Debes iniciar sesión para ver los detalles de la investigación.");
        window.location.href = "login.html";
    }
});

// Función para cargar los detalles de la investigación
function loadResearchDetails() {
    db.collection("researchWorks").doc(researchId).get()
        .then(doc => {
            if (doc.exists) {
                const research = doc.data();

                // Mostrar los datos de la investigación
                document.getElementById("researchTitle").innerText = research.title;
                document.getElementById("researchArea").innerText = `Área: ${research.area}`;
                document.getElementById("researchDescription").innerText = research.description;
                document.getElementById("researchConclusions").innerText = research.conclusions;
                document.getElementById("researchRecommendations").innerText = research.recommendations;

                // Mostrar el enlace al PDF
                const pdfLink = document.getElementById("researchPDF");
                pdfLink.href = research.pdfURL;

                // Mostrar las imágenes
                const imagesContainer = document.getElementById("researchImages");
                imagesContainer.innerHTML = "";
                research.imageURLs.forEach(url => {
                    const img = document.createElement("img");
                    img.src = url;
                    img.classList.add("img-thumbnail", "m-2");
                    img.style.width = "200px";
                    imagesContainer.appendChild(img);
                });

                // Cargar comentarios
                loadComments();
            } else {
                alert("No se encontró la investigación.");
                window.location.href = "index.html";
            }
        })
        .catch(error => console.error("Error al cargar los detalles de la investigación:", error));
}

// Función para cargar los comentarios
function loadComments() {
    const commentsList = document.getElementById("commentsList");
    db.collection("researchWorks").doc(researchId).collection("comments").orderBy("createdAt", "desc")
        .onSnapshot(snapshot => {
            commentsList.innerHTML = ""; // Limpiar comentarios previos
            let totalRating = 0;
            let ratingsCount = 0;

            snapshot.forEach(doc => {
                const commentData = doc.data();
                totalRating += commentData.rating;
                ratingsCount++;

                // Crear elemento para el comentario
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("card", "mb-3");

                // Obtener información del usuario que hizo el comentario
                db.collection("users").doc(commentData.userId).get()
                    .then(userDoc => {
                        const userData = userDoc.data();
                        commentDiv.innerHTML = `
                            <div class="card-body">
                                <h5 class="card-title">${userData.fullName}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">Valoración: ${'★'.repeat(commentData.rating)}${'☆'.repeat(5 - commentData.rating)}</h6>
                                <p class="card-text">${commentData.comment}</p>
                                <p class="card-text"><small class="text-muted">${commentData.createdAt ? new Date(commentData.createdAt.toDate()).toLocaleString() : ''}</small></p>
                            </div>
                        `;
                        commentsList.appendChild(commentDiv);
                    })
                    .catch(error => console.error("Error al obtener datos del usuario:", error));
            });

            // Calcular y mostrar valoración promedio
            const averageRatingDiv = document.getElementById("averageRating");
            if (ratingsCount > 0) {
                const averageRating = (totalRating / ratingsCount).toFixed(1);
                averageRatingDiv.innerHTML = `<strong>Valoración promedio:</strong> ${averageRating} / 5`;
            } else {
                averageRatingDiv.innerHTML = "Sin valoraciones aún.";
            }
        }, error => console.error("Error al cargar comentarios:", error));
}

// Función para enviar un comentario
function submitComment(event) {
    event.preventDefault();

    const rating = parseInt(document.getElementById("rating").value);
    const commentText = document.getElementById("commentText").value;

    if (!rating || !commentText) {
        alert("Por favor, completa todos los campos del comentario.");
        return;
    }

    const commentData = {
        userId: currentUser.uid,
        rating: rating,
        comment: commentText,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("researchWorks").doc(researchId).collection("comments").add(commentData)
        .then(() => {
            alert("Comentario agregado exitosamente.");
            document.getElementById("commentForm").reset();
        })
        .catch(error => {
            console.error("Error al agregar comentario:", error);
            alert("Error al agregar comentario: " + error.message);
        });
}

// Agregar evento al formulario de comentarios
document.getElementById("commentForm").addEventListener("submit", submitComment);
