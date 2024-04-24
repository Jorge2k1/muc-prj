// index.js
import { registerUser, loginUser, sendFriendRequest, getFriendRequests, acceptFriendRequest, findUserByUsername, auth, db, storage } from '../src/firestone.js';
import { deleteFile, loadAndDisplayFiles, showSelectedFile, confirmFileUpload} from '../src/storage.js';
import { displayFriendList } from "../src/chat.js";
import { serverTimestamp } from 'firebase/firestore'; 
import { onAuthStateChanged } from "firebase/auth";


window.appState = window.appState || {}; // Esto asegura que no sobreescribes el objeto si ya existe

// onAuthStateChanged(auth, user => {
//   if (user) {
//     // User is signed in
//     console.log("vamos a obtener las solis");
//     getFriendRequests(user.uid, showFriendRequests);

//   } else {
//     // User is signed out
//     console.log('No user is signed in.');
//     // Handle what you want to do when there is no user signed in.
//   }
// });


document.addEventListener('DOMContentLoaded', () => {
  // Configura el listener de registro
  const registerForm = document.querySelector('.register form');
  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = document.getElementById('newMail').value;
      const password = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmP').value;
      const username = document.getElementById('newUsername').value;

      if (password === confirmPassword) {
        registerUser(email, password, username)
          .then(() => {
            console.log('Usuario registrado con éxito');
            window.location.href = 'main.html'; // Redirección después del registro
          })
          .catch(error => {
            console.error('Error al registrar el usuario:', error.message);
            alert('Error al registrar. Por favor, intente de nuevo.');
          });
      } else {
        alert('Las contraseñas no coinciden.');
      }
    });
  }

  // Configura el listener de inicio de sesión
  const loginForm = document.querySelector('.login form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = document.getElementById('mail').value;
      const password = document.getElementById('password').value;

      loginUser(email, password)
        .then(() => {
          console.log('Inicio de sesión exitoso');
          window.location.href = 'main.html'; // Redirección después del inicio de sesión
        })
        .catch(error => {
          console.error('Error en el inicio de sesión:', error.message);
          alert('Las credenciales son incorrectas o el usuario no existe.');
        });
    });
  }

  // Configura el listener para agregar amigos
  // const addFriendButton = document.getElementById('addFriendButton');
  // if (addFriendButton) {
  //   addFriendButton.addEventListener('click', () => {
  //     const friendUsername = document.getElementById('addFriend').value;
  //     if (friendUsername) {
  //       findUserByUsername(friendUsername).then(username => {
  //         if (username) {
  //           addFriend(auth.currentUser.uid, username)
  //             .then(() => {
  //               console.log('Amigo añadido correctamente.');
  //             })
  //             .catch(error => {
  //               console.error('Error al añadir amigo:', error);
  //               alert('Error al añadir amigo. Por favor, intente de nuevo.');
  //             });
  //         } else {
  //           console.log('Usuario no encontrado.');
  //           alert('Usuario no encontrado.');
  //         }
  //       }).catch(error => {
  //         console.error('Error al buscar usuario:', error);
  //         alert('Error al buscar usuario. Por favor, intente de nuevo.');
  //       });
  //     } else {
  //       alert('Por favor, introduce un nombre de usuario.');
  //     }
  //   });
  // }

    // Ajusta el listener para manejar el objeto de usuario
  // Modificada para manejar el objeto con username y userId
  const addFriendButton = document.getElementById('addFriendButton');
  if (addFriendButton) {
    addFriendButton.addEventListener('click', () => {
      const friendUsernameInput = document.getElementById('sendFriendRequest');
      if (friendUsernameInput.value) {
        findUserByUsername(friendUsernameInput.value).then(friendData => {
          console.log("Resultado de la consulta:", friendData); // Agrega este console.log

          if (friendData) {

            sendFriendRequest(auth.currentUser.uid, friendData.userId)
              .then(() => {
                console.log('solicitud enviada');
                friendUsernameInput.value = ''; // Limpia el campo después de agregar
              })
              .catch(error => {
                console.error('Error al añadir amigo:', error);
                alert('Error al añadir amigo. Por favor, intente de nuevo.');
              });
          } else {
            alert('Usuario no encontrado.');
          }
        }).catch(error => {
          console.error('Error al buscar usuario:', error);
          alert('Error al buscar usuario. Por favor, intente de nuevo.');
        });
      } else {
        alert('Por favor, introduce un nombre de usuario.');
      }
    });
  }

  // Carga inicial de contenido
  chargeSite();
});

// Asegúrate de que la función chargeSite y otras funciones se manejen adecuadamente
window.addEventListener('hashchange', chargeSite);
window.addEventListener('load', chargeSite);

// Continúa con el resto del código como se planeó originalmente


// Carga dinámica de contenido
function chargeSite(callback) {
  const route = window.location.hash.substring(1) || 'chats';
  const routePath = `./${route}.html`;
  fetch(routePath)
    .then(response => response.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;
      if (route === '/resources') {  

        initResourcesPage();
      } else if (route === '/chats') {
        initializeChatListeners();
      }
      if (callback) callback();  // Llama al callback después de cargar el contenido y inicializar lo necesario
    })
    .catch(error => {
      console.error('Error al cargar la vista:', error);
      if (callback) callback(error);
    });

    const requestsButton = document.getElementById('requests');
    if (requestsButton) {
        requestsButton.addEventListener('click', () => {
            // Verifica si hay un usuario autenticado antes de hacer la llamada
            if (auth.currentUser) {
                getFriendRequests(auth.currentUser.uid, showFriendRequests);
            } else {
                console.log('Usuario no autenticado. Por favor, inicia sesión.');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
  // Asigna listener para agregar amigo
//   
  const addFriendButton = document.getElementById('addFriendButton');
    if (addFriendButton) {
      addFriendButton.addEventListener('click', () => {
        const friendUsernameInput = document.getElementById('sendFriendRequest');
        if (friendUsernameInput.value) {
          findUserByUsername(friendUsernameInput.value).then(friendData => {
            if (friendData) {
              sendFriendRequest(auth.currentUser.uid, friendData.userId)
                .then(() => {
                  console.log('Solicitud de amistad enviada correctamente.');
                  friendUsernameInput.value = ''; // Limpia el campo después de agregar
                })
                .catch(error => {
                  console.error('Error al enviar solicitud de amistad:', error);
                  alert('Error al enviar solicitud. Por favor, intente de nuevo.');
                });
            } else {
              alert('Usuario no encontrado.');
            }
          }).catch(error => {
            console.error('Error al buscar usuario:', error);
            alert('Error al buscar usuario. Por favor, intente de nuevo.');
          });
        } else {
          alert('Por favor, introduce un nombre de usuario.');
        }
      });
    }
  
//    const addFriendButton = document.getElementById('addFriendButton');
//   if (addFriendButton) {
//       console.log("Por favor, introduce un nombre de usuario.");
//       addFriendButton.addEventListener('click', function() {
//           console.log("Por favor, introduce un nombre de usuario.");
//           const friendUsername = document.getElementById('addFriend').value; // Asume que tienes este input en tu HTML
//           console.log(friendUsername);
//             if (friendUsername) {

//               findUserByUsername(friendUsername).then((friendUsername) => {
//                 console.log("llegamos aqui");
//                 if (friendUsername) {

//                   const currentUserId = auth.currentUser.uid;
//                   addFriend(currentUserId, friendUsername); // Pasa el nombre de usuario directamente
//                 } else {
//                   console.log("Usuario no encontrado tete");
//                 }
//               });
//             } else {
//                 console.log("nop");
//             }
//       });
//   }
// });
  
  // Añadiría aquí el código para manejar las solicitudes de amistad entrantes
  // Esto podría ser mostrar un modal o una sección en la interfaz de usuario con las solicitudes pendientes
});



// Función para mostrar las solicitudes en la UI
// const showFriendRequests = (requests) => {
//   const requestsContainer = document.getElementById('friendRequestsContainer');
//   requestsContainer.innerHTML = ''; // Limpiamos contenedor actual

//   requests.forEach((request) => {
//     const requestElement = document.createElement('div');
//     requestElement.classList.add('friendRequest');

//     const acceptButton = document.createElement('button');
//     acceptButton.textContent = 'Aceptar';
//     acceptButton.onclick = () => {
//       acceptFriendRequest(auth.currentUser.uid, request.id)
//         .then(() => {
//           alert('¡Amigo agregado correctamente!');
//           // Actualizar UI aquí si es necesario
//         }).catch(console.error);
//     };

//     const rejectButton = document.createElement('button');
//     rejectButton.textContent = 'Rechazar';
//     rejectButton.onclick = () => {
//       // Implementa rechazar solicitud aquí
//     };

//     requestElement.appendChild(document.createTextNode(request.username));
//     requestElement.appendChild(acceptButton);
//     requestElement.appendChild(rejectButton);

//     requestsContainer.appendChild(requestElement);
//   });
// };

// Función para mostrar las solicitudes en la UI
// Función para mostrar las solicitudes de amistad en la interfaz de usuario
// const showFriendRequests = (requestsDetails) => {
//   console.log("Showing friend requests with details:", requestsDetails);
//   const requestsContainer = document.getElementById('friendRequestsContainer');
//   const requestsBadge = document.querySelector('#requests .badge');

//   if (!requestsContainer || !requestsBadge) {
//     console.error('DOM elements for displaying friend requests not found.');
//     return; // Salir de la función si no se encuentran los elementos
//   }

//   // Limpiar contenedor actual
//   requestsContainer.innerHTML = '';
  
//   // Actualizar el número de solicitudes de amistad en el badge
//   requestsBadge.textContent = requestsDetails.length;

//   // Generar la UI para cada solicitud de amistad
//   requestsDetails.forEach((requestDetail) => {
//     const requestElement = document.createElement('div');
//     requestElement.classList.add('friendRequest');

//     // Botón para aceptar la solicitud
//     const acceptButton = document.createElement('button');
//     acceptButton.textContent = 'Aceptar';
//     acceptButton.classList.add('btn', 'btn-success', 'btn-sm', 'mr-2');
//     acceptButton.onclick = () => {
//       acceptFriendRequest(auth.currentUser.uid, requestDetail.id)
//         .then(() => {
//           alert('¡Amigo agregado correctamente!');
//           // Eliminar solicitud de la UI
//           requestElement.remove();
//           // Decrementar contador en el badge
//           requestsBadge.textContent = parseInt(requestsBadge.textContent) - 1;
//         })
//         .catch(console.error);
//     };

//     // Botón para rechaza
//     const rejectButton = document.createElement('button');
//     rejectButton.textContent = 'Rechazar';
//     rejectButton.classList.add('btn', 'btn-danger', 'btn-sm'); // Agregar clases de estilo
//     rejectButton.onclick = () => {
//       // Implementa la lógica para rechazar la solicitud aquí
//       // Por ejemplo, eliminar la solicitud de Firestore y actualizar la UI similarmente a como se hace en acceptButton.onclick
//     };

//     requestElement.appendChild(document.createTextNode(`Solicitud de: ${request.username}`));
//     requestElement.appendChild(acceptButton);
//     requestElement.appendChild(rejectButton);

//     requestsContainer.appendChild(requestElement);
//   });

//   // Si no hay solicitudes, muestra un mensaje
//   if (requests.length === 0) {
//     requestsContainer.innerHTML = '<div class="p-2">No hay solicitudes de amistad pendientes.</div>';
//   }
// };

// Función para mostrar las solicitudes de amistad en la interfaz de usuario
const showFriendRequests = (requestsDetails) => {
  console.log("Showing friend requests with details:", requestsDetails);
  const requestsContainer = document.getElementById('friendRequestsContainer');
  const requestsBadge = document.querySelector('#requests .badge');

  if (!requestsContainer || !requestsBadge) {
    console.error('DOM elements for displaying friend requests not found.');
    return; // Salir de la función si no se encuentran los elementos
  }

  // Limpiar contenedor actual
  requestsContainer.innerHTML = '';
  
  // Actualizar el número de solicitudes de amistad en el badge
  requestsBadge.textContent = requestsDetails.length;

  // Generar la UI para cada solicitud de amistad
  requestsDetails.forEach((requestDetail) => {
    const requestElement = document.createElement('div');
    requestElement.classList.add('friendRequest');

    // Botón para aceptar la solicitud
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Aceptar';
    acceptButton.classList.add('btn', 'btn-success', 'btn-sm', 'mr-2');
    acceptButton.onclick = () => {
      acceptFriendRequest(auth.currentUser.uid, requestDetail.id)
        .then(() => {
          alert('¡Amigo agregado correctamente!');
          // Eliminar solicitud de la UI
          requestElement.remove();
          // Decrementar contador en el badge
          requestsBadge.textContent = parseInt(requestsBadge.textContent) - 1;
        })
        .catch(console.error);
    };

    // Botón para rechazar
    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Rechazar';
    rejectButton.classList.add('btn', 'btn-danger', 'btn-sm');
    rejectButton.onclick = () => {
      // Aquí agregarías la lógica para rechazar la solicitud
    };

    // Asegúrate de usar el objeto correcto para obtener el nombre de usuario
    requestElement.appendChild(document.createTextNode(`Solicitud de: ${requestDetail.username}`));
    requestElement.appendChild(acceptButton);
    requestElement.appendChild(rejectButton);

    requestsContainer.appendChild(requestElement);
  });

  // Si no hay solicitudes, muestra un mensaje
  if (requestsDetails.length === 0) {
    requestsContainer.innerHTML = '<div class="p-2">No hay solicitudes de amistad pendientes.</div>';
  }
};


// Inicialización de la página de recursos
function initResourcesPage() {
  console.log("Página de recursos cargada.");
  // Listener para seleccionar archivos y mostrarlos
  const fileUploader = document.getElementById('fileUploader');

  if (fileUploader) {
      fileUploader.addEventListener('change', function(e) {
          if (!auth.currentUser) {
              console.error("Usuario no autenticado. Asegúrate de que el usuario haya iniciado sesión.");
              return;
          }
          window.appState.selectedFile = e.target.files[0];
          showSelectedFile(window.appState.selectedFile);  // Esta función mostrará el archivo en el DOM
          document.getElementById('confirmUploadButton').style.display = 'inline'; // Asume que este botón está en tu HTML
      });
  } else {
      console.error('fileUploader no se encontró en el DOM');
  }
  // Listener para confirmar la subida de archivos
  document.addEventListener('click', function(event) {
      if (event.target.classList.contains('confirm-upload')) {
          const fileName = event.target.getAttribute('data-name');
          const button = event.target;
          confirmFileUpload(auth.currentUser.uid, fileName, button, loadAndDisplayFiles);
          // Esta función manejará la subida del archivo
      }
  });
}

// Inicialización de los listeners de chat
function initializeChatListeners() {
  console.log("Chat inicializado.");
  displayFriendList(); // Llamar a la función para mostrar la lista de amigos
  // Aquí puedes añadir más listeners según sea necesario
}

// Disparar un evento cuando todo el JS haya cargado
window.onload = () => {
  window.dispatchEvent(new Event('firebase-loaded'));
};

// Exportamos funciones si es necesario para que puedan ser usadas en otros scripts
export { chargeSite, initResourcesPage, initializeChatListeners, showFriendRequests };
