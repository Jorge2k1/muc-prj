// firestone.js
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  setDoc,
  getDoc, 
  doc, 
  arrayUnion, 
  serverTimestamp,
  updateDoc,
  onSnapshot,
  runTransaction,
  deleteField
 } from "firebase/firestore";
 import { showFriendRequests } from "./index.js";
 import { generateChatId } from "./chat.js";

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
const db = getFirestore(app);
const storage = getStorage(app);

// Funciones relacionadas con la autenticación y gestión de usuarios
// const registerUser = (email, password, username) => {
//   return createUserWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//       updateProfile(userCredential.user, {
//         displayName: username,
//       });
//       return setDoc(doc(db, "users", userCredential.user.uid), {
//         username: username,
//         friends: [],
//       });
//     });
// };
const registerUser = (email, password, username) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Aquí es donde asignas el UID del usuario como el ID del documento.
      const uid = userCredential.user.uid; // El UID único del usuario.
      return setDoc(doc(db, "users", uid), {
        username: username,
        friends: [],
        friendRequests: [] // Puedes iniciar este array aquí si quieres.
      });
    });
};
const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// const addFriend = (currentUserId, friendUsername) => {
//   const userRef = doc(db, "users", currentUserId);
//   return updateDoc(userRef, {
//     friends: arrayUnion(friendUsername)
//   });
// };
// En firestone.js
// ...

// Enviar solicitud de amistad
// ...

// Función para enviar una solicitud de amistad
const sendFriendRequest = (currentUserId, friendUserId) => {
  const friendUserRef = doc(db, "users", friendUserId);
  console.log("el user autenticado es", currentUserId);
  return updateDoc(friendUserRef, {
    // Añadir el ID del usuario actual al array de solicitudes de amistad del usuario amigo
   
    friendRequests: arrayUnion(currentUserId)
  });
};

// En firestone.js o el archivo donde manejas las llamadas a Firestore
// En firestone.js
// Función para obtener las solicitudes de amistad
const getFriendRequests = (userId, callback) => {
  const userRef = doc(db, "users", userId);
  console.log(userId);
  console.log(userRef);
  getDoc(userRef)
    .then((docSnapshot) => {
      console.log(docSnapshot.data());
      console.log("veremos si existe");
      if (docSnapshot.exists()) {
        console.log("aqui ya no");

        const userData = docSnapshot.data();
        const requestsUserIds = userData.friendRequests || [];

        // Obtener detalles para cada ID de usuario en el array de solicitudes de amistad
        const requestsDetailsPromises = requestsUserIds.map((requesterUserId) => {
          return getDoc(doc(db, "users", requesterUserId)).then(userDocSnapshot => ({
            id: requesterUserId,
            ...userDocSnapshot.data()
          }));
        });
        console.log("Solicitudes de amistad User IDs:", requestsUserIds);

        Promise.all(requestsDetailsPromises)
          .then(requestsDetails => {
            callback(requestsDetails);
          })
          .catch(error => {
            console.error("Error al obtener los detalles de las solicitudes de amistad:", error);
            callback([]);
          });

      } else {
        // No existe documento para el usuario, entonces no hay solicitudes
        console.log("deffff no");

        callback([]);
      }
    })
    .catch((error) => {
      console.error("Error al obtener solicitudes de amistad:", error);
      callback([]);
    });
};

// Función para aceptar una solicitud de amistad
// Asegúrate de que has importado `deleteField` de Firestore si lo necesitas.
const acceptFriendRequest = (currentUserId, requestingUserId) => {
  // Generar el chatId común para ambos usuarios
  const chatId = generateChatId(currentUserId, requestingUserId);
  
  // Crear el chat común en la colección de chats si aún no existe
  const chatRef = doc(db, "chats", chatId);
  const currentUserRef = doc(db, "users", currentUserId);
  const requestingUserRef = doc(db, "users", requestingUserId);

  return db.runTransaction((transaction) => {
    return transaction.get(currentUserRef).then((currentUserDoc) => {
      if (!currentUserDoc.exists) {
        throw new Error("Document does not exist!");
      }

      transaction.set(chatRef, {}, { merge: true });
      transaction.update(currentUserRef, {
        friends: arrayUnion(requestingUserId),
        chats: arrayUnion(chatId),
        // Este es un cambio crítico: debes quitar el ID del amigo de las solicitudes pendientes.
        friendRequests: arrayRemove(requestingUserId) 
      });
      transaction.update(requestingUserRef, {
        friends: arrayUnion(currentUserId),
        chats: arrayUnion(chatId)
      });
    });
  });
};


// ...


// ...

const findUserByUsername = (username) => {
  return getDocs(query(collection(db, "users"), where("username", "==", username)))
    .then((querySnapshot) => querySnapshot.empty ? null : {
      userId: querySnapshot.docs[0].id,
      username: querySnapshot.docs[0].data().username
    });
};

// Observador de mutaciones para esperar a que el DOM esté listo
const observer = new MutationObserver((mutations, obs) => {
  const requestsContainer = document.getElementById('friendRequestsContainer');
  if (requestsContainer) {
    obs.disconnect(); // Detener el observador si el contenedor está presente
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // El usuario está autenticado y puedes acceder a user.uid
        getFriendRequests(user.uid, showFriendRequests);
      } else {
        // El usuario no está autenticado o ha cerrado sesión
        console.log('El usuario no está autenticado');
        // Manejar casos en los que no hay usuario autenticado
      }
    }); 
  }
});

// Opciones de configuración para el observador
const observerOptions = {
  childList: true,
  subtree: true
};

// Inicia la observación
observer.observe(document.body, observerOptions);


export { auth, db, storage, registerUser, loginUser, sendFriendRequest, getFriendRequests, acceptFriendRequest, findUserByUsername };
