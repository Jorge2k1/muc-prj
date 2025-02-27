// Importaciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
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
  deleteField,
  runTransaction,
  arrayRemove
 } from "firebase/firestore";
import { showFriendRequests } from "./index.js";
import { generateChatId } from "./chat.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpI0Dfq56oUexIsDu8Jn3yya5TyTcVL94",
  authDomain: "127.0.0.1",
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

// Función para registrar usuarios
const registerUser = (email, password, username, userType) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      const userDocRef = doc(db, "users", uid);
      const userDocData = {
        username: username,
        userType: userType,
        imageUrl: 'https://via.placeholder.com/110',
        friends: [],
        bio: '',
        skills: '',
        friendRequests: []
      };
      setDoc(userDocRef, userDocData);
      const uploadedFilesDocRef = doc(db, "uploadedFiles", uid);
      const uploadedFilesDocData = {
        files: [] 
      };
      return setDoc(uploadedFilesDocRef, uploadedFilesDocData);
    });
};

const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Función para enviar una solicitud de amistad
const sendFriendRequest = (currentUserId, friendUserId) => {
  const friendUserRef = doc(db, "users", friendUserId);
  console.log("el user autenticado es", currentUserId);
  return updateDoc(friendUserRef, {
    friendRequests: arrayUnion(currentUserId)
  });
};

export const loadUserProfile = async (uid) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
      return docSnap.data();
  } else {
      console.error("No se encontraron los datos del usuario");
      return null;
  }
};

// Función para obtener las solicitudes de amistad
const getFriendRequests = (userId, callback) => {
  const userRef = doc(db, "users", userId);
  console.log(userId);
  console.log(userRef);
  getDoc(userRef)
    .then((docSnapshot) => {
      console.log(docSnapshot.data());
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const requestsUserIds = userData.friendRequests || [];
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
        callback([]);
      }
    })
    .catch((error) => {
      console.error("Error al obtener solicitudes de amistad:", error);
      callback([]);
    });
};

const acceptFriendRequest = (currentUserId, requestingUserId) => {
  const chatId = generateChatId(currentUserId, requestingUserId);
  const chatRef = doc(db, "chats", chatId);
  const currentUserRef = doc(db, "users", currentUserId);
  const requestingUserRef = doc(db, "users", requestingUserId);

  return runTransaction(db, (transaction) => {
    return transaction.get(currentUserRef).then((currentUserDoc) => {
      if (!currentUserDoc.exists) {
        throw "Document does not exist!";
      }
      
      transaction.set(chatRef, {}, { merge: true });
      transaction.update(currentUserRef, {
        friends: arrayUnion(requestingUserId),
        chats: arrayUnion(chatId),
        friendRequests: arrayRemove(requestingUserId)
      });
      transaction.update(requestingUserRef, {
        friends: arrayUnion(currentUserId),
        chats: arrayUnion(chatId)
      });
    });
  }).then(() => {
    console.log("Transaction successfully committed!");
  }).catch((error) => {
    console.log("Transaction failed: ", error);
  });
};

const findUserByUsername = (username) => {
  return getDocs(query(collection(db, "users"), where("username", "==", username)))
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return null;
      } else {
        return {
          userId: querySnapshot.docs[0].id,
          username: querySnapshot.docs[0].data().username
        };
      }
    });
};

// Observador de mutaciones para esperar a que el DOM esté listo
/* si no tuviese este observador, las solis de amistad tratarían de cargarse
antes de que el DOM estuviese listo, y por tanto, ends up in an error */

const observer = new MutationObserver((mutations, obs) => {
  const requestsContainer = document.getElementById('friendRequestsContainer');
  if (requestsContainer) {
    obs.disconnect();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        getFriendRequests(user.uid, showFriendRequests);
      } else {
        console.log('El usuario no está autenticado');
      }
    }); 
  }
});

const observerOptions = {
  childList: true,
  subtree: true
};

observer.observe(document.body, observerOptions);

// Función para enviar correo de recuperación de contraseña
const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Correo de recuperación enviado a:", email);
  } catch (error) {
    console.error("Error al enviar el correo de recuperación:", error.message);
  }
};


// Manejar el envío del formulario de recuperación de contraseña
document.addEventListener('DOMContentLoaded', function() {
  updateProgressBar(0);
  document.getElementById('resetPasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    var email = document.getElementById('email').value;

    try {
      await sendPasswordReset(email);
      // Avanzar al siguiente paso
      console.log("Correo de recuperaion enviadooo");

      document.getElementById('step1').classList.remove('active');
      document.getElementById('step2').classList.add('active');
      updateProgressBar(50);
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error.message);
      alert('Hubo un error al enviar el correo de recuperación. Verifica el correo e intenta de nuevo.');
    }
  });

  document.getElementById('nextToStep3').addEventListener('click', function() {
    // Avanzar al siguiente paso
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    updateProgressBar(100);
  });

  document.getElementById('finish').addEventListener('click', function() {
    Swal.fire({
      title: 'Proceso completado',
      text: 'Tu contraseña ha sido restablecida con éxito.',
      icon: 'success',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      // Aquí podrías redirigir al usuario a la página de inicio de sesión u otra página
      window.location.href = 'login.html'; // Cambia '/login' a la ruta de tu página de inicio de sesión
    });
  });
  
});
  
function updateProgressBar(percent) {
  document.getElementById('progressBar').style.width = percent + '%';
  document.getElementById('progressBar').setAttribute('aria-valuenow', percent);
}

export { auth, db, storage, registerUser, loginUser, sendFriendRequest, getFriendRequests, acceptFriendRequest, findUserByUsername, sendPasswordReset };
