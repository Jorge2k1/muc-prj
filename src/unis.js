//unis.js
import { auth, db } from '../src/firestone.js';
import { 
    getDoc, 
    doc, 
    arrayUnion, 
    updateDoc,
} from "firebase/firestore";

// Función para verificar si un nombre corresponde a una universidad en Firestore
function checkUniversity(name) {
    const uniRef = doc(db, "universityId", name); // Referencia al documento en Firestore
    return getDoc(uniRef)
      .then(docSnapshot => {
          if (docSnapshot.exists()) {
            return { exists: true, data: docSnapshot.data() }; // Retorna datos si el documento existe
          } else {
            return { exists: false }; // Retorna falso si no existe
          }
      })
      .catch(error => {
          console.error('Error al buscar en Firestore:', error);
          alert('Error al acceder a la base de datos. Por favor, intente de nuevo.');
          return { exists: false };
      });
  }



// Función para cargar la página de la universidad, asumiendo que tienes una vista HTML específica para cada una
function loadUniversityPage(uniId) {
    const routePath = `./unis.html`;
    console.log(`Cargando información de la universidad: ${uniId}`);
    fetch(routePath)
      .then(response => response.text())
      .then(html => {
        document.getElementById('content').innerHTML = html;
        console.log(`Universidad ${uniId} cargada con éxito.`);
      })
      .catch(error => {
        console.error('Error al cargar la página de la universidad:', error);
        alert('Universidad no encontrada. Por favor, verifica el ID.');
      });
}
// Función para añadir una universidad a la lista de favoritos del usuario
function saveUniversityToFavorites(universityId) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    return updateDoc(userRef, {
        universities: arrayUnion(universityId)
    }).then(() => {
        console.log('Universidad añadida a favoritos');
    }).catch(error => {
        console.error('Error al añadir universidad a favoritos:', error);
        alert('Error al añadir a favoritos. Por favor, intente de nuevo.');
    });
}

export { checkUniversity, loadUniversityPage, saveUniversityToFavorites}