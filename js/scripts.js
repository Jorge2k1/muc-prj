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
        if ($(this).scrollTop() > 100) {
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

function scroll() {
    $(window).scroll(function() {
        var scrollPosition = $(this).scrollTop();
        var windowHeight = $(window).height();

        var transparentEnd = 38;
        var blackEnd = 100;

        var blackEndPercentage = blackEnd - ((scrollPosition / windowHeight) * (blackEnd - transparentEnd));
        var transparentStartPercentage = Math.max(0, transparentEnd - ((scrollPosition / windowHeight) * transparentEnd));

        blackEndPercentage = Math.max(blackEndPercentage, 0);
        transparentStartPercentage = Math.min(transparentStartPercentage, transparentEnd);

        $('.global').css('background-image', `linear-gradient(to bottom, black ${transparentStartPercentage}%,  #013220 ${blackEndPercentage}%)`);

        if(blackEndPercentage <= transparentEnd - 19) { 
            $('.front').addClass('white-text'); 
        } else {
            $('.front').removeClass('white-text'); 
        }
    });
}
$(document).ready(function() {
    scroll();
});
