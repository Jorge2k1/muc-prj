
function setupChatEventListeners() {

    var lookUp = document.getElementById('lookUp');
    if (lookUp) {
        lookUp.addEventListener('click', function() {
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

    const ruta = window.location.hash.substring(1) || 'inicio';
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

window.firebaseLoaded = false;
window.addEventListener('firebase-loaded', () => {
    window.firebaseLoaded = true;
});
