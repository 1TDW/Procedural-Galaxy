const Mesh = require("../renderer/mesh.cjs")

const CIRCLE_MESH = Mesh.circleWithSides(16)

const MAX_LOD = 8

const data = {
    lodLevel: 0,

    stars: [],

    starRenderData: {
        points: {
            numComponents: 2,
            data: CIRCLE_MESH.points,
        },
        position: {
            numComponents: 2,
            data: [],
            divisor: 1,
        },
        size: {
            numComponents: 1,
            data: [],
            divisor: 1,
        },
    },

    starRenderDataTyped: {
        points: {
            numComponents: 2,
            data: CIRCLE_MESH.points,
        },
        position: {
            numComponents: 2,
            data: new Float32Array(0),
            divisor: 1,
        },
        size: {
            numComponents: 1,
            data: new Float32Array(0),
            divisor: 1,
        },
    }
}

for (let i = 0; i < MAX_LOD; ++i) {
    data.stars.push({
        start: {
            x: 0,
            y: 0,
        },
        end: {
            x: 0,
            y: 0,
        },

        starsPerGrid: i * 2,

        width() {
            return this.end.x - this.start.x
        },

        height() {
            return this.end.y - this.start.y
        },
    })
}

const mod = {
    update() {
        if (data.requestUpdate) {
            data.starRenderDataTyped.position.data = new Float32Array(data.starRenderData.position.data)
            data.starRenderDataTyped.size.data = new Float32Array(data.starRenderData.size.data)

            data.requestUpdate = false
        }
    },

    getData() {
        //return data.starRenderDataTyped
        return data.starRenderData
    },

    getInfo() {
        return {
            lod: data.lodLevel
        }
    },

    spliceStars(lodLevel, start, width, newStars = []) {
        data.requestUpdate = true

        let offset = 0

        for (let lod = 0; lod < lodLevel; ++lod) {
            const starData = this.getStarLOD(lod)

            offset += (starData.width() * starData.height()) * starData.starsPerGrid
        }

        const starData = this.getStarLOD(lodLevel)

        width *= starData.starsPerGrid
        start *= starData.starsPerGrid
        start += offset

        const positionData = data.starRenderData.position.data
        const sizeData = data.starRenderData.size.data

        if (newStars.length === 0) {
            positionData.splice(start * 2, width * 2)
            sizeData.splice(start, width)

            return
        }

        const positions = new Array(newStars.length * 2)
        const sizes = new Array(newStars.length)

        for (let i = 0; i < newStars.length; ++i) {
            const [x, y] = newStars[i].position
            const size = newStars[i].size

            positions[i * 2] = x
            positions[i * 2 + 1] = y
            sizes[i] = (size)
        }

        positionData.splice(start * 2, width * 2, ...positions)
        sizeData.splice(start, width, ...sizes)
    },

    removeStarRows(lodLevel, startY, height) {
        const starData = this.getStarLOD(lodLevel)

        const columnHeight = starData.height()

        // MUST BE IN REVERSE
        let index = starData.width()
        while (index--) {
            this.spliceStars(lodLevel, index * columnHeight + startY, height)   
        }

        if (startY === 0) {
            starData.start.y += height
        } else {
            starData.end.y -= height
        }
    },

    addStarRows(lodLevel, startY, newStars) {
        const starData = this.getStarLOD(lodLevel)

        const columnHeight = starData.height()

        let height = newStars.length / starData.width()

        // MUST BE IN REVERSE
        let index = starData.width()
        while (index--) {
            const sliceStart = index * height
            const sliceEnd = sliceStart + height

            this.spliceStars(lodLevel, index * columnHeight + startY, 0, newStars.slice(sliceStart, sliceEnd))
        }

        height /= starData.starsPerGrid

        if (startY === 0) {
            starData.start.y -= height
        } else {
            starData.end.y += height
        }
    },

    removeStarColumns(lodLevel, startX, width) {
        const starData = this.getStarLOD(lodLevel)

        const columnHeight = starData.height()

        this.spliceStars(lodLevel, startX * columnHeight, width * columnHeight)

        if (startX === 0) {
            starData.start.x += width
        } else {
            starData.end.x -= width
        }
    },

    addStarColumns(lodLevel, startX, newStars) {
        const starData = this.getStarLOD(lodLevel)

        const columnHeight = starData.height()

        this.spliceStars(lodLevel, startX * columnHeight, 0, newStars)

        const width = newStars.length / columnHeight / starData.starsPerGrid

        if (startX === 0) {
            starData.start.x -= width
        } else {
            starData.end.x += width
        }
    },

    // -------

    getStarLOD(lodLevel) {
        return data.stars[lodLevel]
    },

    setLodLevel(lodLevel) {
        data.lodLevel = lodLevel
    },

    MAX_LOD,

    data
}

module.exports = mod