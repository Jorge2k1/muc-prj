// function chargeSite() {
//         const ruta = window.location.hash.substring(1) || 'chats';
//         const rutaPath = `./${ruta}.html`; 
        
//         fetch(rutaPath)
//             .then(response => response.text())
//             .then(html => document.getElementById('content').innerHTML = html)
//             .catch(error => console.log('Error al cargar la vista', error));
        
// }

//     window.addEventListener('hashchange', chargeSite);
//     window.addEventListener('load', chargeSite);
// console.log("cargado scriptsApp.js");

function setupChatEventListeners() {

    var addFriendButton = document.getElementById('addFriendButton');
    if (addFriendButton) {
        addFriendButton.addEventListener('click', function() {
            const friendUsername = document.getElementById('addFriend').value;
            if (friendUsername) {
                findUserByUsername(friendUsername).then((friendUid) => {
                    if (friendUid) {
                        const currentUserId = auth.currentUser.uid;
                        addFriend(currentUserId, friendUid);
                    } else {
                        console.log("Usuario no encontrado.");
                    }
                });
            } else {
                console.log("Por favor, introduce un nombre de usuario.");
            }
        });
    } else {
        console.error("El botón 'Agregar Amigo' no se encontró en el DOM.");
    }
}
function chargeSite() {

    const ruta = window.location.hash.substring(1) || 'chats';
    const rutaPath = `./${ruta}.html`; 

    fetch(rutaPath)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            if (ruta === 'chats') {
                // Espera hasta que Firebase esté cargado antes de configurar los event listeners
                if (window.firebaseLoaded) {
                    console.log("Botón encontrado.");
                    setupChatEventListeners();
                } else {
                    window.addEventListener('firebase-loaded', setupChatEventListeners, { once: true });
                }
            }
        })
        .catch(error => console.error('Error al cargar la vista', error));
}

window.addEventListener('hashchange', chargeSite);
window.addEventListener('load', chargeSite);
console.log("cargado scriptsApp.js");

// Agregar una propiedad al objeto window para marcar si Firebase ya se cargó
window.firebaseLoaded = false;
window.addEventListener('firebase-loaded', () => {
    window.firebaseLoaded = true;
});

// function chargeSite() {
//     const ruta = window.location.hash.substring(1);
//     const rutaPath = `.${ruta}.html`; 

//     fetch(rutaPath)
//         .then(response => response.text())
//         .then(html => {
//             document.getElementById('content').innerHTML = html;

//             // Asegúrate de que esto solo se ejecute si estás en la ruta de 'chats'
//             if (ruta === "/chats") {
//                 // Ahora que el contenido se ha cargado, intenta vincular el event listener al botón.
//                 var addFriendButton = document.getElementById('addFriendButton');
//                 if (addFriendButton) {
//                     console.log("Botón encontrado.");
//                     // Si el botón existe, añade el event listener
//                     addFriendButton.addEventListener('click', function() {
//                         const friendUsername = document.getElementById('addFriend').value;
//                         if (friendUsername) {
//                             findUserByUsername(friendUsername).then((friendUid) => {
//                                 if (friendUid) {
//                                     const currentUserId = auth.currentUser.uid;
//                                     addFriend(currentUserId, friendUid);
//                                 } else {
//                                     console.log("Usuario no encontrado.");
//                                 }
//                             });
//                         } else {
//                             console.log("Por favor, introduce un nombre de usuario.");
//                         }
//                     });
//                 }
//             }
//         })
//         .catch(error => console.error('Error al cargar la vista', error));
// }

// window.addEventListener('hashchange', chargeSite);
// window.addEventListener('load', chargeSite);
// console.log("cargado scriptsApp.js");

// window.firebaseLoaded = false;
// window.addEventListener('firebase-loaded', () => {
//     window.firebaseLoaded = true;
// });
