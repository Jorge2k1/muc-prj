import { auth, db } from '../src/firestone.js';
import { getDoc, doc, arrayUnion, updateDoc, arrayRemove } from "firebase/firestore";

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

// Función para cargar la página de la universidad
function loadUniversityPage(uniId) {
    const formattedUniId = uniId.replace(/\s+/g, '_');
    const routePath = `./${formattedUniId}.html`;
    console.log(`Cargando información de la universidad: ${formattedUniId}`);
    fetch(routePath)
      .then(response => response.text())
      .then(html => {
        document.getElementById('content').innerHTML = html;
        console.log(`Universidad ${formattedUniId} cargada con éxito.`);
        // Mostrar el botón de adjuntar perfil si el usuario es un coach
        auth.onAuthStateChanged(user => {
          if (user) {
            const userRef = doc(db, "users", user.uid);
            getDoc(userRef).then(docSnapshot => {
                if (docSnapshot.exists() && docSnapshot.data().userType === "coach") {
                    const attachProfileButton = document.createElement('button');
                    attachProfileButton.textContent = 'Adjuntar Perfil';
                    attachProfileButton.classList.add('btn', 'btn-secondary');
                    attachProfileButton.id = 'attachProfileButton'; // Asignar ID
                    attachProfileButton.onclick = () => {
                        attachProfileToUniversity(user.uid, uniId);
                    };
                    document.querySelector('.info').appendChild(attachProfileButton);
                }
                loadCoachLabels(uniId);
            }).catch(error => {
              console.error('Error al obtener datos del usuario:', error);
              loadCoachLabels(uniId);
            });
          } else {
            loadCoachLabels(uniId);
          }
        });
      })
      .catch(error => {
        console.error('Error al cargar la página de la universidad:', error);
        alert('Universidad no encontrada. Por favor, verifica el ID.');
      });
}

// Función para adjuntar el perfil del coach a la universidad

function attachProfileToUniversity(coachId, uniId) {
    const uniRef = doc(db, "universityId", uniId);
    updateDoc(uniRef, {
        coaches: arrayUnion(coachId)
    }).then(() => {
        console.log('Perfil del coach adjuntado a la universidad con éxito.');
        displayCoachLabel(coachId, uniId);
    }).catch(error => {
        console.error('Error al adjuntar el perfil del coach a la universidad:', error);
        alert('Error al adjuntar el perfil. Por favor, intente de nuevo.');
    });
}

// Función para eliminar el perfil del coach de la universidad
function detachProfileFromUniversity(coachId, uniId) {
    const uniRef = doc(db, "universityId", uniId);
    updateDoc(uniRef, {
        coaches: arrayRemove(coachId)
    }).then(() => {
        console.log('Perfil del coach eliminado de la universidad con éxito.');
        const labelElement = document.getElementById(`coach-${coachId}`);
        if (labelElement) {
            labelElement.remove();
        }
    }).catch(error => {
        console.error('Error al eliminar el perfil del coach de la universidad:', error);
        alert('Error al eliminar el perfil. Por favor, intente de nuevo.');
    });
}

// Función para mostrar la etiqueta del coach
function displayCoachLabel(coachId, uniId) {
    const userRef = doc(db, "users", coachId);
    getDoc(userRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
            const coachName = docSnapshot.data().username;
            const coachLabel = document.createElement('span');
            coachLabel.textContent = `#${coachName}`;
            coachLabel.classList.add('badge', 'badge-info', 'etiqueta');
            coachLabel.id = `coach-${coachId}`;
            coachLabel.onclick = () => {
                window.location.href = `./profile.html?uid=${coachId}`;
            };
            const detachButton = document.createElement('button');
            detachButton.textContent = 'X';
            detachButton.classList.add('btn', 'btn-danger', 'btn-sm', 'ml-2');
            detachButton.onclick = (e) => {
                e.stopPropagation();
                detachProfileFromUniversity(coachId, uniId);
            };
            coachLabel.appendChild(detachButton);
            document.querySelector('.info').appendChild(coachLabel);
        }
    }).catch(error => {
        console.error('Error al obtener datos del coach:', error);
    });
}

// Función para cargar y mostrar todas las etiquetas de coaches adheridas a la universidad

function loadCoachLabels(uniId) {
    const uniRef = doc(db, "universityId", uniId);
    getDoc(uniRef).then(docSnapshot => {
        if (docSnapshot.exists()) {
            const coaches = docSnapshot.data().coaches || [];
            coaches.forEach(coachId => {
                displayCoachLabel(coachId, uniId);
            });
        }
    }).catch(error => {
        console.error('Error al obtener datos de la universidad:', error);
    });
}

// Función para añadir una universidad a la lista de favoritos del usuario
function saveUniversityToFavorites(universityId) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    console.log("culiao")
    return updateDoc(userRef, {
        universities: arrayUnion(universityId)
    }).then(() => {
        console.log('Universidad añadida a favoritos');
    }).catch(error => {
        console.error('Error al añadir universidad a favoritos:', error);
        alert('Error al añadir a favoritos. Por favor, intente de nuevo.');
    });
}

export { checkUniversity, loadUniversityPage, saveUniversityToFavorites };
