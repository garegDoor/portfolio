$(document).ready(function(){
    $("a").on('click', function(event) {
        if (this.hash !== "") {
        event.preventDefault();
        var hash = this.hash;
        $('body,html').animate({
        scrollTop: $(hash).offset().top
        }, 1200, function(){
        window.location.hash = hash;
        });
        } 
    });

    const carousel = document.getElementById("hero-carousel");
    const slides = document.querySelectorAll(".hero-slide");

    let current_slide = 0;

    // in milliseconds
    const slideDuration = 6000;

    function nextSlide() {
        current_slide++;

        // return to the first slide if we've reached the end
        if (current_slide >= slides.length) {
            current_slide = 0;
        }

        carousel.style.transform = "translateX(-" + (current_slide * 100) + "%)";
        
    }

    setInterval(nextSlide, slideDuration);
});


window.onscroll = function(){
if ((window.innerWidth >= 900)){

    if(document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        $(".hero-slide").addClass("zoomed");
    }else{
        $(".hero-slide").removeClass("zoomed");     
    }
}
};

setTimeout(function(){
    $("#loading").addClass("animated fadeOut");
    setTimeout(function(){
      $("#loading").removeClass("animated fadeOut");
      $("#loading").css("display","none");
    },800);
},1450);