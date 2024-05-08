//inicio.js
import { auth, db } from '../src/firestone.js';
import { 
    getDoc, 
    doc, 
    updateDoc,
    arrayRemove
   } from "firebase/firestore";

window.removeUniversityFromFavorites = removeUniversityFromFavorites;

// Función para cargar las universidades guardadas
function loadFavoriteUniversities() {
     console.log("entramos gentee");
    const userRef = doc(db, "users", auth.currentUser.uid);
    getDoc(userRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            const universities = userData.universities || [];
            universities.forEach(universityId => {
                createUniversityCard(universityId);
            });
        }
    }).catch(error => {
        console.error('Error al cargar universidades favoritas:', error);
    });
}


// Función para crear una tarjeta de universidad y añadirla al DOM
function createUniversityCard(universityId) {
    // Suponemos que tienes una función para obtener la URL de la imagen basada en el ID de la universidad
    const imageUrl = getUniversityImageUrl(universityId);
    
    const cardHtml = `
        <div class="card m-2" style="width: 18rem;">
            <img src="${imageUrl}" class="card-img-top" alt="${universityId}">
            <div class="card-body">
                <h5 class="card-title">${universityId}</h5>
                <p class="card-text">Some details about the university or the course could go here.</p>
                <button onclick="removeUniversityFromFavorites('${universityId}')" class="btn btn-danger">Remove</button>
            </div>
        </div>
    `;

    const container = document.getElementById('universitiesContainer'); // Asumiendo que tienes un contenedor con este ID en inicio.html
    container.innerHTML += cardHtml; // Añade la tarjeta al contenedor
}

// Suponiendo que necesitas una función para obtener la imagen de la universidad
function getUniversityImageUrl(universityId) {
    // Aquí puedes añadir lógica para devolver una URL de imagen basada en el ID
    // Ejemplo estático, deberías ajustarlo a tu estructura o base de datos
    return `../img/universities/${universityId.replace(/\s+/g, '').toLowerCase()}.jpg`;
}

// Función para eliminar una universidad de los favoritos
function removeUniversityFromFavorites(universityId) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    updateDoc(userRef, {
        universities: arrayRemove(universityId)
    }).then(() => {
        console.log('Universidad eliminada de favoritos');
        removeUniversityCard(universityId); // Supongamos que esta función también está definida correctamente
    }).catch(error => {
        console.error('Error al eliminar universidad de favoritos:', error);
    });
}


function removeUniversityCard(universityId) {
    const card = document.querySelector(`.card img[alt="${universityId}"]`).parentNode.parentNode;
    if (card) {
        card.parentNode.removeChild(card);
    }
}



export { loadFavoriteUniversities, createUniversityCard, removeUniversityFromFavorites}