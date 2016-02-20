$(document).ready(function(){
    $("#left").click(function(){
        console.log('left');

    });
});

$(document).ready(function(){
    $("#right").click(function(){
        console.log('right');
        var leftPos = $('.fluid').scrollLeft();
        console.log(leftPos);
        $('.fluid').animate({
            scrollLeft: leftPos + 266
        }, 800);
    });
});
