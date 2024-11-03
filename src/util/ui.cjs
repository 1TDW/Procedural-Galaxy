/*let activeStat = null

$(".menus").children().on("click", function() {
    if (activeStat) {
        activeStat.removeClass("active")
    }

    if (activeStat != $(this)) {
        $(this).addClass("active")
        activeStat = $(this)
    }
})*/

$(".menu").on("click", function() {
    $(this).toggleClass("active")
})

$(".menu > *:not(.title)").on("click", function(event) {
    event.stopPropagation()
})