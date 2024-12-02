// js/listResearch.js

// Inicializa Firestore
const db = firebase.firestore();
const researchListDiv = document.getElementById("researchList");

// Función para cargar las investigaciones aplicando filtros
function loadResearchList() {
    const filterTopic = document.getElementById("filterTopic").value.trim().toLowerCase();
    const filterDegree = document.getElementById("filterDegree").value.trim().toLowerCase();

    let query = db.collection("researchWorks");

    // Aplicar filtros si están presentes
    if (filterTopic && filterDegree) {
        query = query.where("areaLowerCase", "==", filterTopic).where("academicDegreeLowerCase", "==", filterDegree);
    } else if (filterTopic) {
        query = query.where("areaLowerCase", "==", filterTopic);
    } else if (filterDegree) {
        query = query.where("academicDegreeLowerCase", "==", filterDegree);
    }

    // Ordenar por fecha de creación
    query.orderBy("createdAt", "desc").get()
        .then(snapshot => {
            researchListDiv.innerHTML = ""; // Limpiar el contenido previo
            if (snapshot.empty) {
                researchListDiv.innerHTML = "<p>No se encontraron investigaciones con los filtros aplicados.</p>";
                return;
            }
            snapshot.forEach(doc => {
                const research = doc.data();
                const authorPhotoURL = research.authorPhotoURL || 'default_profile.png';
                const authorName = research.authorName || 'Autor desconocido';

                // Obtener valoración promedio
                db.collection("researchWorks").doc(doc.id).collection("comments").get()
                    .then(commentsSnapshot => {
                        let totalRating = 0;
                        let ratingsCount = 0;

                        commentsSnapshot.forEach(commentDoc => {
                            const commentData = commentDoc.data();
                            totalRating += commentData.rating;
                            ratingsCount++;
                        });

                        let averageRating = ratingsCount > 0 ? (totalRating / ratingsCount).toFixed(1) : "Sin valoraciones";

                        // Agregar la investigación al DOM
                        const researchCard = `
                            <div class="col-md-4">
                                <div class="card mb-4 shadow-sm">
                                    <img src="${authorPhotoURL}" class="card-img-top" alt="Foto del autor">
                                    <div class="card-body">
                                        <h5 class="card-title">${research.title}</h5>
                                        <p class="card-text">${research.description.substring(0, 100)}...</p>
                                        <p class="card-text"><strong>Área:</strong> ${research.area}</p>
                                        <p class="card-text"><strong>Grado Académico:</strong> ${research.academicDegree}</p>
                                        <p class="card-text"><strong>Autor:</strong> ${authorName}</p>
                                        <p class="card-text"><strong>Valoración:</strong> ${averageRating} / 5</p>
                                        <a href="researchDetails.html?id=${doc.id}" class="btn btn-primary">Ver detalles</a>
                                    </div>
                                </div>
                            </div>
                        `;
                        researchListDiv.insertAdjacentHTML('beforeend', researchCard);
                    })
                    .catch(error => console.error("Error al obtener comentarios:", error));
            });
        })
        .catch(error => {
            console.error("Error al cargar investigaciones:", error);
            if (error.code === 'failed-precondition') {
                alert("Error: Es posible que necesites crear un índice en Firestore para usar estos filtros.");
            }
        });
}

// Función para limpiar los filtros
function clearFilters() {
    document.getElementById("filterTopic").value = '';
    document.getElementById("filterDegree").value = '';
    loadResearchList();
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", loadResearchList);