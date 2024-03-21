function chargeSite() {
        const ruta = window.location.hash.substring(1) || 'chats';
        const rutaPath = `./${ruta}.html`; 
        
        fetch(rutaPath)
            .then(response => response.text())
            .then(html => document.getElementById('content').innerHTML = html)
            .catch(error => console.log('Error al cargar la vista', error));
}
    
    window.addEventListener('hashchange', chargeSite);
    window.addEventListener('load', chargeSite);
console.log("cargado scriptsApp.js");