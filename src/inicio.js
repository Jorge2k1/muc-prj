import { auth, db, storage } from '../src/firestone.js';
import { getDoc, doc, updateDoc, arrayRemove } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

window.removeUniversityFromFavorites = removeUniversityFromFavorites;

// Function to load favorite universities
function loadFavoriteUniversities() {
    console.log("no va");
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

// Function to fetch the university image URL from Firebase Storage
function getUniversityImageUrl(universityId) {
    const storageRef = ref(storage, `universityLogo/${universityId.replace(/\s+/g, '').toLowerCase()}Logo.png`);
    return getDownloadURL(storageRef).then(url => {
        return url;
    }).catch(error => {
        console.error('Error al obtener la URL de la imagen:', error);
        return 'default-image-url.png'; // Return a default image URL in case of error
    });
}
//hacer la misma para el header!!!
// Function to fetch the university header image URL from Firebase Storage
function getUniversityHeaderImageUrl(universityId) {
    const formattedUniversityId = universityId.replace(/\s+/g, '').toLowerCase();
    const storageRef = ref(storage, `universityHeader/${formattedUniversityId}Header.png`);
    return getDownloadURL(storageRef).then(url => {
        return url;
    }).catch(error => {
        console.error('Error al obtener la URL de la imagen del encabezado:', error);
        return 'default-header-url.png'; // Return a default header URL in case of error
    });
}

// Function to create a university card and add it to the DOM
function createUniversityCard(universityId) {
    Promise.all([getUniversityImageUrl(universityId), getUniversityHeaderImageUrl(universityId)]).then(([logoUrl, headerUrl]) => {
        const cardHtml = `
            <div class="card align-items-start" id="uniCard" alt="${universityId}" 
            style="background-image: url('${headerUrl}');
            background: linear-gradient(rgba(218, 218, 218, 0.543), rgba(0, 0, 0, 0.423))
            , url('${headerUrl}'); ">
                    <img src="${logoUrl}" alt="${universityId}" id="cardImg" class="card-img-top">
                <div class="cardText">
                    <h5 class="card-title">${universityId}</h5>
                    <p class="card-text">Pulsa para revisar la información de la universidad</p>
                </div>
                <button onclick="removeUniversityFromFavorites('${universityId}')" class="btn btn-danger">Eliminar</button>
            </div>
        `;

        const container = document.getElementById('universitiesContainer'); // Assuming you have a container with this ID in inicio.html
        container.innerHTML += cardHtml; // Add the card to the container
    });
}


// Function to remove a university from favorites
function removeUniversityFromFavorites(universityId) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    updateDoc(userRef, {
        universities: arrayRemove(universityId)
    }).then(() => {
        console.log('Universidad eliminada de favoritos');
        removeUniversityCard(universityId); // Assuming this function is also correctly defined
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

export { loadFavoriteUniversities, createUniversityCard, removeUniversityFromFavorites };
