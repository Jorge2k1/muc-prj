document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.global');
    const sections = document.querySelectorAll('section');
    const video = document.getElementById('defaultBackground1');
    const body = document.querySelector('body');

    function adjustSectionsPadding() {
        const headerHeight = header.offsetHeight;
        sections.forEach(section => {
            section.style.paddingTop = `${headerHeight}px`;
            section.style.marginTop = `-${headerHeight}px`;
        });
    }

    function scrollSuave() {
        document.querySelectorAll('.menu a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const headerHeight = header.offsetHeight;

                if (targetId === '#inicio') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    changeBackgroundColor('default');
                } else {
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - headerHeight,
                            behavior: 'smooth'
                        });
                        changeBackgroundColor(targetId);
                    }
                }
            });
        });
    }

    function changeBackgroundColor(sectionId) {
        body.classList.remove('section-acercade', 'section-servicio', 'section-contacto', 'section-contactanos');
        switch (sectionId) {
            case '#acercade':
                body.classList.add('section-acercade');
                break;
            case '#servicio':
                body.classList.add('section-servicio');
                break;
            case '#contacto':
                body.classList.add('section-contacto');
                break;
            case '#contactanos':
                body.classList.add('section-contactanos');
                break;
            default:
                break;
        }
    }

    function adjustHeader() {
        window.addEventListener('scroll', function() {
            const scrollPos = window.scrollY;
            if (scrollPos > 0) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            adjustSectionsPadding(); // Ajusta el padding cada vez que el header cambia de tamaño
        });
    }

    function scroll() {
        window.addEventListener('scroll', function() {
            var scrollPosition = window.scrollY;
            var windowHeight = window.innerHeight;

            // Ajuste de fondo existente
            var transparentEnd = 38;
            var blackEnd = 100;
            var blackEndPercentage = blackEnd - ((scrollPosition / windowHeight) * (blackEnd - transparentEnd));
            var transparentStartPercentage = Math.max(0, transparentEnd - ((scrollPosition / windowHeight) * transparentEnd));
            blackEndPercentage = Math.max(blackEndPercentage, 0);
            transparentStartPercentage = Math.min(transparentStartPercentage, transparentEnd);

            header.style.backgroundImage = `linear-gradient(to bottom, black ${transparentStartPercentage}%,  #013220 ${blackEndPercentage}%)`;

            // Cambio de opacidad del video
            var reductionSpeed = 9999999999; // Factor de rapidez de reducción de opacidad, mayor que 1 para una reducción más rápida
            var videoOpacity = 1 - (reductionSpeed * (scrollPosition / windowHeight));
            videoOpacity = Math.max(videoOpacity, 0); // Asegura que no sea negativo
            video.style.opacity = videoOpacity;

            // Cambio de color del texto
            if (blackEndPercentage <= transparentEnd - 19) {
                document.querySelector('.front').classList.add('white-text');
            } else {
                document.querySelector('.front').classList.remove('white-text');
            }

            // Cambio de fondo según la sección visible
            sections.forEach(section => {
                const sectionTop = section.offsetTop - header.offsetHeight;
                const sectionHeight = section.offsetHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    changeBackgroundColor(`#${section.id}`);
                }
            });
        });
    }

    function applySmoothTransformations() {
        document.querySelectorAll('.smooth-transform-section').forEach(section => {
            const img = section.querySelector('img');
            
            section.addEventListener('mouseenter', () => {
                if (img) {
                    img.style.transition = 'transform 0.5s ease';
                    img.style.transform = 'scale(1.1) translate(10px, -10px)';
                }
            });
    
            section.addEventListener('mouseleave', () => {
                if (img) {
                    img.style.transform = 'scale(1) translate(0, 0)';
                }
            });
        });
    }
    // Función para Mostrar y ocultar el menú lateral
    function toggleSideMenu() {
        console.log("de mometno funcion");
        var $friendRequestsContainer = $('#friendRequestsContainer');
        var $overlay = $('#overlay');
        var isMenuVisible = $friendRequestsContainer.css('right') === '0px';

        if (isMenuVisible) {
            $friendRequestsContainer.css('right', '-400px');
            $overlay.css('background-color', 'transparent'); // Hace el overlay transparente
        } else {
            $friendRequestsContainer.css('right', '0px');
            $overlay.css('background-color', 'rgba(0, 0, 0, 0.5)'); // Oscurece el overlay
        }
    }

    // Evento la función del menú lateral
    $('#requests').click(toggleSideMenu);

    // Evento para ocultar el menú lateral y el overlay cuando se hace clic en el overlay o fuera del menú
    $(document).on('click', function(event) {
        var $friendRequestsContainer = $('#friendRequestsContainer');
        var $overlay = $('#overlay');

        // Si se hace clic en el overlay o fuera del menú, y el menú está visible
        if (!$(event.target).closest('#friendRequestsContainer, #requests').length && $friendRequestsContainer.css('right') === '0px') {
            $friendRequestsContainer.css('right', '-350px');
            $overlay.css('background-color', 'transparent'); 
        }
    });
    scrollSuave();
    adjustHeader();
    scroll();
    adjustSectionsPadding(); // Asegúrate de llamar a esta función al inicio
    applySmoothTransformations(); // Llama a la función para aplicar transformaciones suaves
});
