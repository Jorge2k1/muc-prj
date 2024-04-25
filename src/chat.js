// chats.js
import { auth, db } from './firestone.js';
import { collection, addDoc, doc, getDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";

let unsubscribeFromCurrentChat = null;

// Genera un ID de chat único basado en los ID de los dos usuarios
function generateChatId(userId1, userId2) {
  const ids = [userId1, userId2].sort();
  return ids.join('-');
}

// function displayFriendList() {
//     if (!auth.currentUser) {
//       console.error("No se puede mostrar la lista de amigos: usuario no autenticado.");
//       return;
//     }
  
//     const userId = auth.currentUser.uid;
//     const userRef = doc(db, "users", userId);
//     getDoc(userRef)
//       .then(function(docSnapshot) {
//         if (docSnapshot.exists()) {
//           const userData = docSnapshot.data();
//           const friends = userData.friends || [];
//           const friendsListElement = document.getElementById('chatList');
//           friendsListElement.innerHTML = ''; // Limpiar la lista actual
          
//           friends.forEach(function(friendUsername, userId ) {
//             const friendElement = document.createElement('div');
//             friendElement.classList.add('friend');
//             friendElement.textContent = friendUsername;
//             // Aquí podrías añadir un manejador de eventos para iniciar el chat
//             friendElement.addEventListener('click', function() {
//               openChatWindow(friendUsername, userId);
//             });
  
//             friendsListElement.appendChild(friendElement);
//           });
//         } else {
//           console.log("Documento del usuario no encontrado.");
//         }
//       })
//       .catch(function(error) {
//         console.error("Error al cargar la lista de amigos:", error);
//       });
//   }

// Envía un mensaje al Firestore

// function displayFriendList() {
//   if (!auth.currentUser) {
//       console.error("No se puede mostrar la lista de amigos: usuario no autenticado.");
//       return;
//   }

//   const userId = auth.currentUser.uid;
//   const userRef = doc(db, "users", userId);
//   getDoc(userRef)
//       .then(function(docSnapshot) {
//           if (docSnapshot.exists()) {
//               const userData = docSnapshot.data();
//               const friends = userData.friends || []; // Asegúrate de que friends es un array de objetos con 'username' y 'userId'
//               const friendsListElement = document.getElementById('chatList');
//               friendsListElement.innerHTML = ''; // Limpiar la lista actual

//               friends.forEach(function(friend) {
//                   const friendElement = document.createElement('div');
//                   friendElement.classList.add('friend');
//                   friendElement.textContent = friend.username; // Asegúrate de que cada amigo tiene una propiedad 'username'
//                   friendElement.addEventListener('click', function() {
//                       openChatWindow(friend.username, friend.userId); // Asegúrate de que cada amigo tiene una propiedad 'userId'
//                   });
//                   friendsListElement.appendChild(friendElement);
//               });
//           } else {
//               console.log("Documento del usuario no encontrado.");
//           }
//       })
//       .catch(function(error) {
//           console.error("Error al cargar la lista de amigos:", error);
//       });
// }

function displayFriendList() {
  if (!auth.currentUser) {
      console.error("No se puede mostrar la lista de amigos: usuario no autenticado.");
      return;
  }

  const userId = auth.currentUser.uid;
  const userRef = doc(db, "users", userId);
  getDoc(userRef)
      .then(docSnapshot => {
          if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              const friendIds = userData.friends || []; // Suponiendo que friends es ahora un array de IDs
              const friendDetailsPromises = friendIds.map(friendId => 
                  getDoc(doc(db, "users", friendId))
              );

              Promise.all(friendDetailsPromises).then(friendDocs => {
                  const friendsListElement = document.getElementById('chatList');
                  friendsListElement.innerHTML = ''; // Limpiar la lista actual

                  friendDocs.forEach(doc => {
                      const friendData = doc.data();
                      const friendElement = document.createElement('div');
                      friendElement.classList.add('friend');
                      friendElement.textContent = friendData.username;
                      friendElement.addEventListener('click', () => {
                          openChatWindow(friendData.username, doc.id);
                      });
                      friendsListElement.appendChild(friendElement);
                  });
              });
          } else {
              console.log("Documento del usuario no encontrado.");
          }
      })
      .catch(error => {
          console.error("Error al cargar la lista de amigos:", error);
      });
}




function sendMessageToFirestore(currentUserId, friendUserId, messageText) {
    console.log(friendUserId);
    const chatId = generateChatId(currentUserId, friendUserId);
    console.log(chatId);
    const messagesRef = collection(db, 'chats', chatId, 'messageText');
  
    addDoc(messagesRef, {
      text: messageText,
      sentBy: currentUserId,
      timestamp: serverTimestamp()
    }).then(() => {
      console.log('Mensaje enviado con éxito');
    }).catch(error => {
      console.error('Error al enviar mensaje:', error);
    });
}

// Escucha los mensajes de un chat específico
// function listenForMessages(chatId) {
//     // Antes de establecer un nuevo listener, desuscribirse del chat actual si existe uno
//     if (unsubscribeFromCurrentChat) {
//       unsubscribeFromCurrentChat();
//     }
  
//     const messagesRef = collection(db, 'chats', chatId, 'messages');
//     const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
//     // Guardar la función de desuscripción para poder llamarla más tarde
//     unsubscribeFromCurrentChat = onSnapshot(q, (snapshot) => {
//       const chatMessagesDiv = document.querySelector('.chat-messages');
//       chatMessagesDiv.innerHTML = ''; // Limpia los mensajes anteriores
//       snapshot.docs.forEach((doc) => {
//         const message = doc.data();
//         displayMessage(message);
//       });
//     });
//   }
function listenForMessages(chatId) {
  if (unsubscribeFromCurrentChat) {
      unsubscribeFromCurrentChat();
  }

  const messagesRef = collection(db, 'chats', chatId, 'messageText');
  console.log("miralos mensajes", chatId );
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  unsubscribeFromCurrentChat = onSnapshot(q, (snapshot) => {
      const chatMessagesDiv = document.querySelector('.chat-messages');
      chatMessagesDiv.innerHTML = ''; // Limpiar mensajes anteriores
      snapshot.docs.forEach((doc) => {
          const message = doc.data();
          displayMessage(message);
      });
  }, error => {
      console.error('Error al escuchar mensajes:', error);
  });
}


// Muestra los mensajes en la interfaz de usuario
function displayMessage(message) {
    const chatMessagesDiv = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.textContent = message.text; // Asume que tienes CSS para esto
    chatMessagesDiv.appendChild(messageDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
  }

// Abre la ventana de chat
// function openChatWindow(friendUsername, friendUserId) {
//   const currentUserId = auth.currentUser.uid;
//   const chatId = generateChatId(currentUserId, friendUserId);
//   const chatContainer = document.getElementById('chatContainer');
//   chatContainer.innerHTML = '';

//   chatContainer.innerHTML = `
//     <div class="chat-modal">
//       <div class="chat-header">
//         <h5>Chat con ${friendUsername}</h5>
//         <button class="close-chat">Cerrar</button>
//       </div>
//       <div class="chat-messages"></div>
//       <div class="chat-input">
//         <input type="text" id="chatMessageInput" placeholder="Escribe un mensaje...">
//         <button id="sendChatMessage">Enviar</button>
//       </div>
//     </div>
//   `;

//   document.getElementById('sendChatMessage').addEventListener('click', () => {
//     const messageText = document.getElementById('chatMessageInput').value;
//     if (messageText.trim()) { // No enviar mensajes vacíos
//       console.log(friendUserId);
//       sendMessageToFirestore(currentUserId, friendUserId, messageText);
//       document.getElementById('chatMessageInput').value = ''; // Limpia el campo de texto
//     }
//   });


//   listenForMessages(chatId);

//   document.querySelector('.close-chat').addEventListener('click', () => {
//     chatContainer.innerHTML = '';
//   });
// }
function openChatWindow(friendUsername, friendUserId) {
  const currentUserId = auth.currentUser.uid;
  const chatId = generateChatId(currentUserId, friendUserId);

  const chatContainer = document.getElementById('chatContainer');
  chatContainer.innerHTML = `
      <div class="chat-modal">
          <div class="chat-header">
              <h5>Chat con ${friendUsername}</h5>
              <button class="close-chat">Cerrar</button>
          </div>
          <div class="chat-messages"></div>
          <div class="chat-input">
              <input type="text" id="chatMessageInput" placeholder="Escribe un mensaje...">
              <button id="sendChatMessage">Enviar</button>
          </div>
      </div>
  `;

  document.getElementById('sendChatMessage').addEventListener('click', () => {
      const messageText = document.getElementById('chatMessageInput').value;
      if (messageText.trim()) {
          sendMessageToFirestore(currentUserId, friendUserId, messageText);
          document.getElementById('chatMessageInput').value = '';
      }
  });

  listenForMessages(chatId);

  document.querySelector('.close-chat').addEventListener('click', () => {
      chatContainer.innerHTML = '';
      if (unsubscribeFromCurrentChat) {
          unsubscribeFromCurrentChat();
      }
  });
}


export { displayFriendList, openChatWindow, sendMessageToFirestore, generateChatId};
