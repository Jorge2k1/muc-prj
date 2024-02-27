function scrollSuave() {
    $('.menu a').click(function(event) {
        event.preventDefault();
        
        var target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 1000);
        }
    });
}

$(document).ready(function() {
    scrollSuave();
});

function gatherTop() {
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) { // Cambiar 100 por la cantidad de desplazamiento en píxeles que deseas
            $('.head').addClass('scrolled');
            $('.menu').addClass('scrolled');
            $('.global').addClass('scrolled');

        } else {
            $('.head').removeClass('scrolled');
            $('.menu').removeClass('scrolled');
            $('.global').removeClass('scrolled');
        }
    });
}

$(document).ready(function() {
    gatherTop();
});
 