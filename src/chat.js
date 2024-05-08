// chats.js
import { auth, db } from './firestone.js';
import { collection, addDoc, doc, getDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";

let unsubscribeFromCurrentChat = null;

// genero un ID de chat único basado en los ID de los dos usuarios
function generateChatId(userId1, userId2) {
  const ids = [userId1, userId2].sort();
  return ids.join('-');
}


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
              const friendIds = userData.friends || []; 
              const friendDetailsPromises = friendIds.map(friendId => 
                  getDoc(doc(db, "users", friendId))
              );

              Promise.all(friendDetailsPromises).then(friendDocs => {
                  const friendsListElement = document.getElementById('chatList');
                  friendsListElement.innerHTML = '';

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
  
function listenForMessages(chatId) {
    if (unsubscribeFromCurrentChat) {
        unsubscribeFromCurrentChat();
    }
    const currentUserId = auth.currentUser.uid;
    const messagesRef = collection(db, 'chats', chatId, 'messageText');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    unsubscribeFromCurrentChat = onSnapshot(q, (snapshot) => {
        const chatMessagesDiv = document.querySelector('.chat-messages');
        chatMessagesDiv.innerHTML = ''; 

        snapshot.docs.forEach((doc) => {
            const message = doc.data();
            const isCurrentUser = message.sentBy === currentUserId; 
            displayMessage(message, isCurrentUser);
        });
    }, error => {
        console.error('Error al escuchar mensajes:', error);
    });
}

function displayMessage(message, isCurrentUser) {
    const chatMessagesDiv = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    if (isCurrentUser) {
        messageDiv.classList.add('message', 'message-current-user');
    } else {
        messageDiv.classList.add('message', 'message-other-user');
    }

    messageDiv.textContent = message.text; 
    chatMessagesDiv.appendChild(messageDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}


function openChatWindow(friendUsername, friendUserId) {
  const currentUserId = auth.currentUser.uid;
  const chatId = generateChatId(currentUserId, friendUserId);

  const chatContainer = document.getElementById('chatContainer');
  chatContainer.innerHTML = `
    <div class="chat-container">
    <div class="chat-header">
        <h5>Chat con ${friendUsername}</h5>
        <button class="close-chat">Cerrar</button>
    </div>
        <div class="chat-messages">
        
            <!-- Los mensajes del chat se insertarán aquí -->
        </div>
    <div class="chat-input row no-gutters align-items-center">
        <div class="col-9">
            <input type="text" id="chatMessageInput" class="form-control" placeholder="Escribe un mensaje...">
        </div>
        <div class="col-3">
            <button id="sendChatMessage" class="btn btn-primary w-100">Enviar</button>
        </div>
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
  