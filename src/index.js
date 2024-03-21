
//////////////////////////////////
// FIREBASE //////////////////////////////////
//////////////////////////////////
import '../js/scripts'; 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { arrayUnion, updateDoc } from "firebase/firestore"; 

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
  function updateUserProfile(user, newUsername) {
      user.updateProfile({
        displayName: newUsername,
      }).then(() => {
        console.log("Perfil del usuario actualizado con el nombre de usuario:", newUsername);
      }).catch((error) => {
        console.error("Error al actualizar el perfil del usuario:", error);
      });
  }

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
                  updateUserProfile(userCredential.user, newUsername); // Modificado para pasar 'newUsername'
                  setDoc(doc(db, "users", userCredential.user.uid), {
                    username: newUsername,
                    friends: [] // Arreglo de amigos vacío inicialmente
                  }).then(() => {
                      console.log("Documento del usuario creado con éxito en Firestore");
                  }).catch((error) => {
                      console.error("Error al crear el documento del usuario en Firestore:", error);
                  });
                  window.location.href = 'main.html'; // Redirección después de registro exitoso
              })
              .catch((error) => {
                  console.error("Error al registrar el usuario:", error);
                  alert("El usuario ya registrado"); // Cambiado alert por console.error para mejor depuración
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

function addFriend(currentUserId, friendUid) {
  const userRef = doc(db, "users", currentUserId);
  updateDoc(userRef, {
      friends: arrayUnion(friendUid)
  })
  .then(() => {
      console.log("Amigo añadido correctamente.");
  })
  .catch((error) => {
      console.error("Error al añadir amigo: ", error);
  });
}

function findUserByUsername(username) {
  return db.collection("users").where("username", "==", username).get().then((querySnapshot) => {
      if (!querySnapshot.empty) {
          // Asumiendo que el nombre de usuario es único y solo encontrará un documento
          return querySnapshot.docs[0].id; // Retorna el UID del primer documento encontrado
      } else {
          console.log("Usuario no encontrado");
          return null;
      }
  }).catch((error) => {
      console.error("Error al buscar usuario:", error);
      return null;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM cargado y listo para usar.");
  console.log(document.getElementById('addFriendButton')); // Esto debería mostrarte el elemento o null

  document.getElementById('addFriendButton').addEventListener('click', () => {
    console.log("Por favor, introduce un nombre de usuario.");
    const friendUsername = document.getElementById('addFriend').value; // Asume que tienes este input en tu HTML
    if (friendUsername) {
        findUserByUsername(friendUsername).then((friendUid) => {
            if (friendUid) {
                const currentUserId = auth.currentUser.uid; // Asume que el usuario actual está autenticado
                addFriend(currentUserId, friendUid);
            } else {
                console.log("Usuario no encontrado.");
            }
        });
    } else {
        console.log("Por favor, introduce un nombre de usuario.");
    }
  });
});