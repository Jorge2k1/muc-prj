// tutorial.js
export function startIntroJsTour() {
    const tourSteps = [
        {
            element: document.querySelector('d'),
            intro: "¡Bienvenido a Music University College! ¿Sabes cómo funciona?",
            position: 'bottom'
        },
        {
            element: document.querySelector('#link1'),
            intro: "En esta primera sección podrás consultar las universidades que vayas guardando",
            position: 'right'
        },
        {
            element: document.querySelector('#link2'),
            intro: "Puedes acceder a tus amistades y conversaciones, pulsando aquí",
            position: 'right'
        },
        {
            element: document.querySelector('#link3'),
            intro: "También dispones de un espacio donde guardar tus archivos en esta sección",
            position: 'right'
        },  
        {
            element: document.querySelector('#link4'),
            intro: "Esta es la sección para Y.",
            position: 'bottom'
        },   
    ];

    // Inicia el tutorial cuando se cargue la página
    const tour = introJs();
    tour.setOptions({
        steps: tourSteps,
        showProgress: true,
        exitOnOverlayClick: false
    });

    tour.start();
}
