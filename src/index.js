// index.js
import { registerUser, loginUser, sendFriendRequest, getFriendRequests, acceptFriendRequest, findUserByUsername, auth, loadUserProfile } from '../src/firestone.js';
import { loadAndDisplayFiles, showSelectedFile, confirmFileUpload} from '../src/storage.js';
import { displayFriendList } from "../src/chat.js";
import { checkUniversity, loadUniversityPage, saveUniversityToFavorites  } from "../src/unis.js";
import { loadFavoriteUniversities } from "../src/inicio.js";
window.appState = window.appState || {}; 
import { saveUserProfile } from '../src/profileConf.js';
import { onAuthStateChanged } from "firebase/auth"; // Asegúrate de importar esto

document.addEventListener('DOMContentLoaded', () => {
  // Listener para el formulario de registro
  const registerForm = document.querySelector('.register form');
  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const email = document.getElementById('newMail').value;
      const password = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmP').value;
      const username = document.getElementById('newUsername').value;
      const userType = document.getElementById('userType').value;

      if (password === confirmPassword) {
        registerUser(email, password, username, userType)
          .then(() => {
            console.log('Usuario registrado con éxito:');       
            console.log('Usuario current:', auth.currentUser);
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

  // Listener para el formulario de inicio de sesión
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
chargeSite();
});

window.addEventListener('hashchange', chargeSite);
window.addEventListener('load', chargeSite);

const getUserIdFromHash = () => {
  const hash = window.location.hash;
  const hashParams = new URLSearchParams(hash.substring(hash.indexOf('?') + 1));
  return hashParams.get('userId');
};

function chargeSite(callback) {
  const userIdFromHash = getUserIdFromHash();
  const userId = auth.currentUser.uid;

  const route = window.location.hash.substring(1) || 'inicio';
  let routePath = `./${route}.html`;

  if (route.startsWith('profile')) {
    routePath = './previewProfile.html';

  }

  fetch(routePath)
    .then(response => response.text())
    .then(html => {

      document.getElementById('content').innerHTML = html;
      onAuthStateChanged(auth, (user) => {
        if (user) {

          if (route === '/resources') {
            initResourcesPage();
          } else if (route === '/chats') {
            initializeChatListeners();
          } else if (route === '/empty'){
          } else if (route.startsWith('profile')) {
            if (userId) {
              loadUserProfile(userIdFromHash).then(userData => {
                document.getElementById('profilePic').src = userData.imageUrl || 'https://via.placeholder.com/110';
                document.getElementById('profileName').textContent = userData.username || 'Nombre del Usuario';
                document.getElementById('profileBio').textContent = userData.bio || 'Esta es la biografía del usuario...';
                document.getElementById('profileSkills').textContent = userData.skills || 'Esta son las aptitudes del usuario';
              });

              // Listener para el botón "Seguir"
              const followButton = document.getElementById('followButton');
              if (followButton) {
                followButton.addEventListener('click', () => {
                  if (auth.currentUser) {
                    console.log("la solicitud la está enviando", auth.currentUser.uid, "a", userId );
                    sendFriendRequest(auth.currentUser.uid, userIdFromHash)
                      .then(() => {
                        alert('Solicitud de amistad enviada.');
                      })
                      .catch(error => {
                        console.error('Error al enviar la solicitud de amistad:', error);
                        alert('Error al enviar la solicitud de amistad. Por favor, intente de nuevo.');
                      });
                  } else {
                    alert('Debe iniciar sesión para enviar una solicitud de amistad.');
                  }
                });
              }
            }
          }
        } else {
          console.log("ni hay user autenticadoo")
        }
      });

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

document.addEventListener('DOMContentLoaded', () => {
  const lookUp = document.getElementById('lookUp');
  const inputElement = document.getElementById('sendFriendRequest');

  function handleSearch() {
    const searchValue = inputElement.value.trim();

    checkUniversity(searchValue).then(result => {
      if (result.exists) {
        loadUniversityPage(searchValue);
      } else {
        findUserByUsername(searchValue).then(friendData => {
          if (friendData) {
            window.location.hash = `profile?userId=${friendData.userId}`;
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

  if (lookUp) {
    lookUp.addEventListener('click', handleSearch);
  }

  if (inputElement) {
    inputElement.addEventListener('keypress', function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const profileConfigButton = document.querySelector('.profileConfig');
  const profileModal = document.getElementById('profileModal');

  profileConfigButton.addEventListener('click', function () {
      profileModal.style.display = 'flex';
  });

  profileModal.addEventListener('click', function (event) {
      if (event.target === profileModal) {
          profileModal.style.display = 'none';
      }
  });
});

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

    const requestText = document.createElement('div');
    requestText.textContent = `${requestDetail.username} ha solicitado seguirte`;
    requestText.classList.add('friendRequest-text');
    requestElement.appendChild(requestText);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const acceptButton = document.createElement('button');
    acceptButton.textContent     = 'Aceptar';
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


    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Rechazar';
    rejectButton.classList.add('btn', 'btn-danger', 'btn-sm');
    rejectButton.onclick = () => {
      // aun tengo q gestionar el rechazo de la soli
    };


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

function initResourcesPage() {
  console.log("Página de recursos cargada.");
  const fileUploader = document.getElementById('fileUploader');
  loadAndDisplayFiles(auth.currentUser.uid);
  if (fileUploader) {
      console.log("se activa el listener, vaale?", fileUploader);
      console.log(auth.currentUser.uid);
      fileUploader.addEventListener('change', function(e) {
        console.log("se activa X 2 ENTRA");

          if (!auth.currentUser) {
              console.error("Usuario no autenticado. Asegúrate de que el usuario haya iniciado sesión.");
              return;
          }

          window.appState.selectedFile = e.target.files[0];
          showSelectedFile(window.appState.selectedFile);
          document.getElementById('confirmUploadButton').style.display = 'inline';
      });
  } else {
      console.error('fileUploader no se encontró en el DOM');
  }
  document.addEventListener('click', function(event) {
      if (event.target.classList.contains('confirm-upload')) {
          const fileName = event.target.getAttribute('data-name');
          const button = event.target;
          confirmFileUpload(auth.currentUser.uid, fileName, button, loadAndDisplayFiles);
      }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM completamente cargado");
  
  if (window.location.hash === '#/inicio') {
      console.log("Cargando universidades favoritas desde DOMContentLoaded...");
      loadFavoriteUniversities();
  }

  window.addEventListener('hashchange', () => {
      console.log("Cambio de hash detectado:", window.location.hash);
      if (window.location.hash === '#/inicio') {
          console.log("Cargando universidades favoritas desde hashchange...");
          loadFavoriteUniversities();
      }
  });
});

document.getElementById('content').addEventListener('click', function(event) {
  if (event.target.id === 'saveUniversityButton') {
      const universityId = document.getElementById('uniName').textContent;
      saveUniversityToFavorites(universityId);
  }
});

function initializeChatListeners() {
  console.log("Chat inicializado.");
  console.log('Usuario current:', auth.currentUser.uid);
   displayFriendList();
}


document.addEventListener('DOMContentLoaded', () => {
  const applyChangesButton = document.getElementById('applyChanges');
  
  if (applyChangesButton) {
      applyChangesButton.addEventListener('click', () => {
          const name = document.getElementById('nombre').value;
          const bio = document.getElementById('biografia').value;
          const skills = document.getElementById('aptitudes').value;

          saveUserProfile(name, bio, skills);
      });
  }

  onAuthStateChanged(auth, (user) => {
      if (user) {
          loadUserProfile(user.uid);
      } else {
          console.log('El usuario no está autenticado');
      }
  });
});

const loadProfile = () => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  console.log("UserId obtenido de la URL:", userId);

  if (userId) {
    loadUserProfile(userId).then(userData => {
      if (userData) {
        console.log("Datos del usuario:", userData);
        document.getElementById('profilePic').src = userData.profilePic || 'https://via.placeholder.com/110';
        document.getElementById('profileName').textContent = userData.username || 'Nombre del Usuario';
        document.getElementById('profileBio').textContent = userData.bio || 'Esta es la biografía';
        const skillsList = document.getElementById('profileSkills');
        skillsList.innerHTML = '';
        (userData.skills || []).forEach(skill => {
          const li = document.createElement('li');
          li.textContent = skill;
          skillsList.appendChild(li);
        });
      } else {
        console.error("No se encontraron datos para el usuario con id:", userId);
      }
    }).catch(error => {
      console.error('Error al cargar el perfil del usuario:', error);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
});

window.onload = () => {
  window.dispatchEvent(new Event('firebase-loaded'));
};

export { chargeSite, initResourcesPage, initializeChatListeners, showFriendRequests };
