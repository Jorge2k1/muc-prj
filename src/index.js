// index.js
import { registerUser, loginUser, sendFriendRequest, getFriendRequests, acceptFriendRequest, findUserByUsername, auth } from '../src/firestone.js';
import { loadAndDisplayFiles, showSelectedFile, confirmFileUpload} from '../src/storage.js';
import { displayFriendList } from "../src/chat.js";
import { checkUniversity, loadUniversityPage, saveUniversityToFavorites  } from "../src/unis.js";
import { loadFavoriteUniversities } from "../src/inicio.js";
window.appState = window.appState || {}; 

// Listener registro
document.addEventListener('DOMContentLoaded', () => {
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
            window.location.href = 'main.html';
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

  // listener de inicio de sesión
  const loginForm = document.querySelector('.login form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = document.getElementById('mail').value;
      const password = document.getElementById('password').value;

      loginUser(email, password)
        .then(() => {
          console.log('Inicio de sesión exitoso');
          window.location.href = 'main.html';
        })
        .catch(error => {
          console.error('Error en el inicio de sesión:', error.message);
          alert('Las credenciales son incorrectas o el usuario no existe.');
        });
    });
  }

  // const lookUp = document.getElementById('lookUp');
  // if (lookUp) {
  //   lookUp.addEventListener('click', () => {
  //     const friendUsernameInput = document.getElementById('sendFriendRequest');


  //     if (friendUsernameInput.value) {
  //       findUserByUsername(friendUsernameInput.value).then(friendData => {
  //         console.log("Resultado de la consulta:", friendData); // Agrega este console.log

  //         if (friendData) {

  //           sendFriendRequest(auth.currentUser.uid, friendData.userId)
  //             .then(() => {
  //               console.log('solicitud enviada');
  //               friendUsernameInput.value = ''; // Limpia el campo después de agregar
  //             })
  //             .catch(error => {
  //               console.error('Error al añadir amigo:', error);
  //               alert('Error al añadir amigo. Por favor, intente de nuevo.');
  //             });
  //         } else {
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

  chargeSite();
});

window.addEventListener('hashchange', chargeSite);
window.addEventListener('load', chargeSite);

// carga dinámica de contenido
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
      if (callback) callback();
    })
    .catch(error => {
      console.error('Error al cargar la vista:', error);
      if (callback) callback(error);
    });

    const requestsButton = document.getElementById('requests');
    if (requestsButton) {
        requestsButton.addEventListener('click', () => {
            if (auth.currentUser) {
                getFriendRequests(auth.currentUser.uid, showFriendRequests);
            } else {
                console.log('Usuario no autenticado. Por favor, inicia sesión.');
            }
        });
    }
}

// document.addEventListener('DOMContentLoaded', () => {  
//   const lookUp = document.getElementById('lookUp');
//     if (lookUp) {
//       lookUp.addEventListener('click', () => {
//         const friendUsernameInput = document.getElementById('sendFriendRequest');
//         if (friendUsernameInput.value) {
//           findUserByUsername(friendUsernameInput.value).then(friendData => {
//             if (friendData) {
//               sendFriendRequest(auth.currentUser.uid, friendData.userId)
//                 .then(() => {
//                   console.log('Solicitud de amistad enviada correctamente.');
//                   friendUsernameInput.value = ''; // Limpia el campo después de agregar
//                 })
//                 .catch(error => {
//                   console.error('Error al enviar solicitud de amistad:', error);
//                   alert('Error al enviar solicitud. Por favor, intente de nuevo.');
//                 });
//             } else {
//               alert('Usuario no encontrado.');
//             }
//           }).catch(error => {
//             console.error('Error al buscar usuario:', error);
//             alert('Error al buscar usuario. Por favor, intente de nuevo.');
//           });
//         } else {
//           alert('Por favor, introduce un nombre de usuario.');
//         }
//       });
//     }
// });

// document.addEventListener('DOMContentLoaded', () => {  
//   const lookUp = document.getElementById('lookUp');
//   if (lookUp) {
//     lookUp.addEventListener('click', () => {
//       const inputElement = document.getElementById('sendFriendRequest');
//       const searchValue = inputElement.value.trim();

//       checkUniversity(searchValue).then(result => {
//         if (result.exists) {
//           // Carga la información de la universidad si el documento existe
//           loadUniversityPage(searchValue);
//         } else {
//           // Procede a buscar un nombre de usuario si no se encuentra la universidad
//           findUserByUsername(searchValue).then(friendData => {
//             if (friendData) {
//               sendFriendRequest(auth.currentUser.uid, friendData.userId)
//                 .then(() => {
//                   console.log('Solicitud de amistad enviada correctamente.');
//                   inputElement.value = ''; // Limpia el campo después de enviar
//                 })
//                 .catch(error => {
//                   console.error('Error al enviar solicitud de amistad:', error);
//                   alert('Error al enviar solicitud. Por favor, intente de nuevo.');
//                 });
//             } else {
//               alert('Usuario no encontrado.');
//             }
//           }).catch(error => {
//             console.error('Error al buscar usuario:', error);
//             alert('Error al buscar usuario. Por favor, intente de nuevo.');
//           });
//         }
//       });
//     });
//   }
// });
document.addEventListener('DOMContentLoaded', () => {
  const lookUp = document.getElementById('lookUp');
  const inputElement = document.getElementById('sendFriendRequest');

  // Función para manejar la lógica de búsqueda
  function handleSearch() {
      const searchValue = inputElement.value.trim();

      checkUniversity(searchValue).then(result => {
          if (result.exists) {
              // Carga la información de la universidad si el documento existe
              loadUniversityPage(searchValue);
          } else {
              // Procede a buscar un nombre de usuario si no se encuentra la universidad
              findUserByUsername(searchValue).then(friendData => {
                  if (friendData) {
                      sendFriendRequest(auth.currentUser.uid, friendData.userId)
                          .then(() => {
                              console.log('Solicitud de amistad enviada correctamente.');
                              inputElement.value = ''; // Limpia el campo después de enviar
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
          }
      });
  }

  // Evento click para el botón
  if (lookUp) {
      lookUp.addEventListener('click', handleSearch);
  }

  // Evento keypress para el campo de entrada
  if (inputElement) {
      inputElement.addEventListener('keypress', function(event) {
          if (event.key === "Enter") {
              event.preventDefault(); // Prevenir cualquier acción predeterminada
              handleSearch(); // Llama a la función de manejo de búsqueda
          }
      });
  }
});




// Función para mostrar las solicitudes de amistad en la interfaz de usuario
const showFriendRequests = (requestsDetails) => {
  console.log("Showing friend requests with details:", requestsDetails);
  const requestsContainer = document.getElementById('friendRequestsContainer');
  const requestsBadge = document.querySelector('#requests .badge');

  if (!requestsContainer || !requestsBadge) {
    console.error('DOM elements for displaying friend requests not found.');
    return; 
  }
  requestsContainer.innerHTML = '';
  requestsBadge.textContent = requestsDetails.length;
  requestsDetails.forEach((requestDetail) => {
    const requestElement = document.createElement('div');
    requestElement.classList.add('friendRequest');

    // muestra de la solicitud
    const requestText = document.createElement('div');
    requestText.textContent = `${requestDetail.username} ha solicitado seguirte`;
    requestText.classList.add('friendRequest-text'); // Asigna una clase para el texto
    requestElement.appendChild(requestText);

    // div para botones
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    // Botón para aceptar la solicitud y elminarla de la ui
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Aceptar';
    acceptButton.classList.add('btn', 'btn-success', 'btn-sm', 'mr-2');
    acceptButton.onclick = () => {
      acceptFriendRequest(auth.currentUser.uid, requestDetail.id)
        .then(() => {
          alert('¡Amigo agregado correctamente!');
          requestElement.remove();
          requestsBadge.textContent = parseInt(requestsBadge.textContent) - 1;
        })
        .catch(console.error);
    };

    // Botón para rechazar la solicitud
    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Rechazar';
    rejectButton.classList.add('btn', 'btn-danger', 'btn-sm');
    rejectButton.onclick = () => {
      // aun tengo q gestionar el rechazo de la soli
    };

    // añadimos los botones al contenedor de botones
    buttonContainer.appendChild(acceptButton);
    buttonContainer.appendChild(rejectButton);

    requestElement.appendChild(requestText);

    requestElement.appendChild(acceptButton);
    requestElement.appendChild(rejectButton);
    requestElement.appendChild(buttonContainer);

    requestsContainer.appendChild(requestElement);
  });

  if (requestsDetails.length === 0) {
    requestsContainer.innerHTML = '<div class="p-2">¡Esto está algo solitario!</div>';
  }
};


// Inicialización de la página de recursos
function initResourcesPage() {
  console.log("Página de recursos cargada.");
  //listener para mostrar la subida de recursos
  const fileUploader = document.getElementById('fileUploader');
  loadAndDisplayFiles(auth.currentUser.uid);
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
      }
  });
}

// Asegurarse de que cuando se carga la sección de inicio se ejecutan estas funciones
// document.addEventListener('DOMContentLoaded', () => {
//   console.log("oleeee");

//     if (window.location.hash === '#/inicio') {
//       console.log("no se crea el dom");
//         loadFavoriteUniversities(); // Llamada a la función para cargar las universidades guardadas
//     }

// });
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM completamente cargado");
  
  // Verifica y carga universidades si ya estamos en "inicio" al cargar la página
  if (window.location.hash === '#/inicio') {
      console.log("Cargando universidades favoritas desde DOMContentLoaded...");
      loadFavoriteUniversities();
  }

  // Añade un listener para hashchange dentro de DOMContentLoaded para manejar cambios futuros
  window.addEventListener('hashchange', () => {
      console.log("Cambio de hash detectado:", window.location.hash);
      if (window.location.hash === '#/inicio') {
          console.log("Cargando universidades favoritas desde hashchange...");
          loadFavoriteUniversities();
      }
  });
});



// Suponiendo que 'content' es un contenedor que ya existe cuando se carga la página
document.getElementById('content').addEventListener('click', function(event) {
  if (event.target.id === 'saveUniversityButton') {
      const universityId = document.getElementById('uniName').textContent; // Asumimos que el ID es el nombre de la universidad
      saveUniversityToFavorites(universityId);
  }
});

function initializeChatListeners() {
  console.log("Chat inicializado.");
  displayFriendList(); 
}

window.onload = () => {
  window.dispatchEvent(new Event('firebase-loaded'));
};

export { chargeSite, initResourcesPage, initializeChatListeners, showFriendRequests };
