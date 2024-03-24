
//////////////////////////////////
// FIREBASE //////////////////////////////////
//////////////////////////////////
import '../js/scripts'; 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDoc,
  getDocs,
  setDoc, 
  doc, 
  arrayUnion, 
  updateDoc 
} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBpI0Dfq56oUexIsDu8Jn3yya5TyTcVL94",
  authDomain: "mucproject-070723.firebaseapp.com",
  projectId: "mucproject-070723",
  storageBucket: "mucproject-070723.appspot.com",
  messagingSenderId: "330836170033",
  appId: "1:330836170033:web:5dbc537644c8ea6ce04c10",
  measurementId: "G-NK595W90GJ"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);


if (document.querySelector('.register form')) {

  document.querySelector('.register form').addEventListener('submit', function(event) {
      event.preventDefault(); 

      const newMail = document.getElementById('newMail').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmP').value;
      const newUsername = document.getElementById('newUsername').value; // Añadido aquí para obtener el valor de 'newUsername'
    
      if (newPassword === confirmNewPassword) {
          createUserWithEmailAndPassword(auth, newMail, newPassword)
              .then((userCredential) => {

                  console.log("Usuario registrado exitosamente:", userCredential.user);
                  console.log(newUsername);
                  const updateUserProfile = (user, newUsername) => {
                      updateProfile(userCredential.user, {
                        displayName: newUsername,
                      }).then(() => {
                        console.log("Perfil actualizado", userCredential.user.displayName);
                      }).catch((error) => {
                          console.error("Error al actualizar el perfil del usuario:", error);
                      });
                  }
                  updateUserProfile(userCredential.user, newUsername);
                  console.log("hola");
                  setDoc(doc(db, "users", userCredential.user.uid), {
                    username: newUsername,
                    friends: [], // Arreglo de amigos vacío inicialmente
                  }).then(() => {
                      console.log("Documento del usuario creado con éxito en Firestore");
                      getDoc(doc(db, "users", userCredential.user.uid)).then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                          console.error("Documento del usuario recuperado de Firestore:", docSnapshot.data());
                        } else {
                          console.log("No se encontró el documento del usuario después de crearlo.");
                        }
                      });
                  }).catch((error) => {
                      console.error("Error al crear el documento del usuario en Firestore:", error);
                  });
                  //window.location.href = 'main.html'; // Redirección después de registro exitoso
              })
              .catch((error) => {
                  console.error("Error al registrar el usuario:", error);
              });
      } else {
          alert("Contraseñas no iguales");
      }
  });
}
if (document.querySelector('.login form')) {
  document.querySelector('.login form').addEventListener('submit', function(event) {
    event.preventDefault();

    const mail = document.getElementById('mail').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, mail, password)
        .then((userCredential) => {
            console.log("Usuario conectado exitosamente:", userCredential.user);
            window.location.href = 'main.html'; 
        })
        .catch((error) => {
            console.error("Revisa tus datos", error); 
            alert("Las credenciales son incorrectas o el usuario no existe.");

        });
  });
}

function addFriend(currentUserId, friendUsername) {
  const userRef = doc(db, "users", currentUserId);

  updateDoc(userRef, {
    // Añade el nombre de usuario a un array de strings, no como un objeto.
    friends: arrayUnion(friendUsername)
  })
  .then(() => {
      console.log("Amigo añadido correctamente.");
  })
  .catch((error) => {
      console.error("Error al añadir amigo:", error);
  });
}


function findUserByUsername(username) {
  console.log("Buscando usuario:", username);
  return getDocs(query(collection(db, "users"), where("username", "==", username)))
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        // Suponiendo que 'username' es único y solo encontrará un documento
        return querySnapshot.docs[0].data().username; // Retorna el nombre de usuario encontrado
      } else {
        console.log("Usuario no encontrado.");
        return null;
      }
    }).catch((error) => {
      console.error("Error al buscar usuario:", error);
      return null;
    });
}



// Emitir un evento personalizado cuando Firebase y todas las funciones estén listas
window.dispatchEvent(new Event('firebase-loaded'));

function chargeSite() {
  const ruta = window.location.hash.substring(1) || 'chats';
  const rutaPath = `./${ruta}.html`; 

  fetch(rutaPath)
      .then(response => response.text())
      .then(html => {
          document.getElementById('content').innerHTML = html;
          // Verifica que estás en la ruta correcta y luego inicializa los listeners
          if (ruta === 'chats') {
              initializeChatListeners();
          }
      })
      .catch(error => console.error('Error al cargar la vista', error));
}

// Nueva función para inicializar los event listeners de chat.html
function initializeChatListeners() {
  const addFriendButton = document.getElementById('addFriendButton');
  if (addFriendButton) {
      addFriendButton.addEventListener('click', function() {
          //console.log("Por favor, introduce un nombre de usuario.");
          const friendUsername = document.getElementById('addFriend').value; // Asume que tienes este input en tu HTML
            if (friendUsername) {
              findUserByUsername(friendUsername).then((friendUsername) => {
                if (friendUsername) {
                  const currentUserId = auth.currentUser.uid;
                  addFriend(currentUserId, friendUsername); // Pasa el nombre de usuario directamente
                } else {
                  console.log("Usuario no encontrado.");
                }
              });
            } else {
                console.log("Por favor, introduce un nombre de usuario.");
            }
      });
  }
}

// Espera a que el DOM esté completamente cargado antes de llamar a chargeSite
document.addEventListener('DOMContentLoaded', () => {
  // Verifica si estás en la página de 'chats' inmediatamente después de que el DOM se cargue
  chargeSite();
});

// Agrega tus event listeners para cargar el contenido dinámicamente
window.addEventListener('hashchange', chargeSite);
window.addEventListener('load', chargeSite);

// Asegúrate de que todas tus funciones se definan antes de disparar el evento 'firebase-loaded'
window.onload = () => {
  window.dispatchEvent(new Event('firebase-loaded'));
};

