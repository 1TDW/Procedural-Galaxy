const Camera = require("jscam")

const Renderer = require("./renderer/renderer.cjs")
const data = require("./star-data/data.cjs")
const starGrid = require("./star-data/star-grid.cjs")
const stat = require("./util/stat.cjs")
const Timer = require("./util/timer.cjs")

const canvas = document.querySelector(".viewport")

const camera = new Camera(canvas)

const renderer = new Renderer(canvas)

renderer.bindCamera(camera)

let tick = 0

let processTimeAvg = []
let renderTimeAvg = []

function update() {
    ++tick

    const timer = new Timer()

    starGrid.generateViewportStars(camera)

    processTimeAvg.push(timer.lapse())

    //data.update()

    renderer.bindData(data.getData())
    renderer.bindInfo(data.getInfo())
    renderer.render()

    renderTimeAvg.push(timer.lapse())

    if (tick % 10 == 0) {
        const processTime = processTimeAvg.reduce((sum, val) => sum + val, 0) / processTimeAvg.length
        processTimeAvg = []

        const renderTime = renderTimeAvg.reduce((sum, val) => sum + val, 0) / renderTimeAvg.length
        renderTimeAvg = []

        stat.setStat("process-time", Number(processTime.toFixed(1)))
        stat.setStat("render-time", Number(renderTime.toFixed(1)))
        stat.setStat("total-time", Number((processTime + renderTime).toFixed(1)))
        stat.setStat("fps", Number((1000 / (processTime + renderTime)).toFixed(1)))
        stat.setStat("lod", Math.floor(data.data.lodLevel))
    }

    /*if (tick % 600 == 0) {
        console.log(data.data)
    }*/

    requestAnimationFrame(update)
}
requestAnimationFrame(update)

$(".viewport").on("mousemove", function(event) {
    const { x, y } = camera.screenSpaceToCoord(event.pageX, event.pageY)
 
    stat.setStat("mouse-x", (x / 100).toFixed(data.data.lodLevel <= 2))
    stat.setStat("mouse-y", (-y / 100).toFixed(data.data.lodLevel <= 2))
})

$(".viewport").on("click", function(event) {
    const { x, y } = camera.screenSpaceToCoord(event.pageX, event.pageY)

    const star = starGrid.getStarAtCoord(x, y)

    if (star) {
        const id = starGrid.coordToId(star.x, star.y)

        stat.setStat("last-clicked-id", id)
    }
})

$("#find-input").on("input", function() {
    console.log("input")

    if ($(this).val() == "") {
        return
    }

    const { x, y } = starGrid.IdToCoord($(this).val())

    camera.x = x
    camera.y = y
})