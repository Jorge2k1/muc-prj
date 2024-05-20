import { auth, db } from './firestone.js';  // Asegúrate de importar correctamente auth y db desde tu configuración de Firebase
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Función para guardar los datos del perfil
export const saveUserProfile = (name, bio, skills) => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, {
            username: name,
            bio: bio,
            skills: skills
        }).then(() => {
            console.log("Perfil actualizado correctamente");
            alert("Cambios aplicados exitosamente");
        }).catch((error) => {
            console.error("Error al actualizar el perfil: ", error);
        });
    } else {
        console.log("No hay usuario autenticado");
    }
};

// Función para cargar los datos del perfil
export const loadUserProfile = (uid) => {
    const userRef = doc(db, "users", uid);
    getDoc(userRef).then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            document.getElementById('nombre').value = userData.username || '';
            document.getElementById('biografia').value = userData.bio || '';
            document.getElementById('aptitudes').value = userData.skills || '';
        } else {
            console.log("No se encontraron datos del usuario");
        }
    }).catch((error) => {
        console.error("Error al cargar el perfil: ", error);
    });
};

document.addEventListener('DOMContentLoaded', function () {
    const applyChangesButton = document.getElementById('applyChanges');

    if (applyChangesButton) {
        applyChangesButton.addEventListener('click', function() {
            const name = document.getElementById('nombre').value;
            const bio = document.getElementById('biografia').value;
            const skills = document.getElementById('aptitudes').value;

            saveUserProfile(name, bio, skills);
        });
    }

    // Cargar datos del perfil al iniciar
    onAuthStateChanged(auth, function(user) {
        if (user) {
            loadUserProfile(user.uid);
        } else {
            console.log('El usuario no está autenticado');
        }
    });
});
