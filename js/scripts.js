document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.global');
    const sections = document.querySelectorAll('section'); // Asegúrate de que tus secciones tengan este tag o ajusta el selector.

    function adjustSectionsPadding() {
        const headerHeight = header.offsetHeight;
        sections.forEach(section => {
            section.style.paddingTop = `${headerHeight * 4}px`;
            section.style.marginTop = `-${headerHeight}px`;
        });
    }

    function scrollSuave() {
        document.querySelectorAll('.menu a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                const headerHeight = header.offsetHeight;
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - headerHeight,
                    });
                }
            });
        });
    }

    function adjustHeader() {
        window.addEventListener('scroll', function() {
            const scrollPos = window.scrollY;
            const headMenuElements = document.querySelectorAll('.head, .menu, .global');
            
            if (scrollPos > 200) {
                headMenuElements.forEach(el => el.classList.add('scrolled'));
            } else {
                headMenuElements.forEach(el => el.classList.remove('scrolled'));
            }
            adjustSectionsPadding(); // Ajusta el padding cada vez que el header cambia de tamaño
        });
    }

    adjustSectionsPadding(); // Inicial ajuste cuando la página carga
    scrollSuave();
    adjustHeader();
});


$(document).ready(function() {
    function gatherTop() {
        $(window).scroll(function() {
            if ($(this).scrollTop() > 100) {
                $('.head, .menu, .global').addClass('scrolled');
            } else {
                $('.head, .menu, .global').removeClass('scrolled');
            }
        });
    }
    function scroll() {
        $(window).scroll(function() {
            var scrollPosition = $(this).scrollTop();
            var windowHeight = $(window).height();

            // Ajuste de fondo existente
            var transparentEnd = 38;
            var blackEnd = 100;
            var blackEndPercentage = blackEnd - ((scrollPosition / windowHeight) * (blackEnd - transparentEnd));
            var transparentStartPercentage = Math.max(0, transparentEnd - ((scrollPosition / windowHeight) * transparentEnd));
            blackEndPercentage = Math.max(blackEndPercentage, 0);
            transparentStartPercentage = Math.min(transparentStartPercentage, transparentEnd);

            $('.global').css('background-image', `linear-gradient(to bottom, black ${transparentStartPercentage}%,  #013220 ${blackEndPercentage}%)`);

            // Ajuste de la altura de .global
            if (scrollPosition > 100) {
                $('.global').css('height', '200px');
            } else {
                $('.global').css('height', '100vh');
            }

            // Cambio de color del texto
            if (blackEndPercentage <= transparentEnd - 19) {
                $('.front').addClass('white-text');
            } else {
                $('.front').removeClass('white-text');
            }
        });
    }

    // Función para Mostrar y ocultar el menú lateral
    function toggleSideMenu() {
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
    gatherTop();
    scroll();
});
