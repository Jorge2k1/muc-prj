import { auth, db, storage } from '../src/firestone.js';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Función para guardar los datos del perfil
export const saveUserProfile = (name, bio, skills, imageUrl) => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, {
            username: name,
            bio: bio,
            skills: skills,
            imageUrl: imageUrl // Guardar la URL de la imagen en Firestore
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
            if (userData.imageUrl) {
                document.getElementById('profileImage').src = userData.imageUrl;
            }
        } else {
            console.log("No se encontraron datos del usuario");
        }
    }).catch((error) => {
        console.error("Error al cargar el perfil: ", error);
    });
};

// Función para manejar la subida de imagen
const uploadImage = (file, callback) => {
    const user = auth.currentUser;
    if (user && file) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        uploadBytes(storageRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
                callback(url);
            });
        }).catch((error) => {
            console.error("Error al subir la imagen: ", error);
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const applyChangesButton = document.getElementById('applyChanges');
    const imageUploadInput = document.getElementById('imageUpload');
    const profileImage = document.getElementById('profileImage');
    console.log("esto es", profileImage);
    if (profileImage) {
        console.log("Elemento 'profileImage' encontrado");
        profileImage.addEventListener('click', function() {
            imageUploadInput.click();
        });
    } else {
        console.error("Elemento 'profileImage' no encontrado en DOMContentLoaded");
    }

    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.getElementById('profileImage');
                    if (img) {
                        img.src = e.target.result;
                        console.log("Imagen de perfil actualizada en la vista previa");
                    } else {
                        console.error("Elemento 'profileImage' no encontrado en el manejador de FileReader");
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (applyChangesButton) {
        applyChangesButton.addEventListener('click', function() {
            const name = document.getElementById('nombre').value;
            const bio = document.getElementById('biografia').value;
            const skills = document.getElementById('aptitudes').value;

            const file = imageUploadInput.files[0];
            if (file) {
                uploadImage(file, (url) => {
                    saveUserProfile(name, bio, skills, url);
                });
            } else {
                const currentImageUrl = document.getElementById('profileImage').src;
                saveUserProfile(name, bio, skills, currentImageUrl);
            }
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
