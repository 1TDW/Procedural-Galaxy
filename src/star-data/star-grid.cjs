const data = require("./data.cjs")
const FastRandom = require('fast-random');

const MAX_LOD = data.MAX_LOD
const MIN_SIZE_EXP = 8

let iter = 0

const mod = {
    generateViewportStars(camera) {
        let exactLodLevel = Math.max(0, Math.log2(camera.z / 10))

        let minLodLevel = Math.max(0, Math.floor(exactLodLevel))

        data.setLodLevel(exactLodLevel)

        for (let lodLevel = 0; lodLevel < MAX_LOD; ++lodLevel) {
            if (lodLevel < MAX_LOD - minLodLevel) {
                this.generateViewportStarsLOD(camera, lodLevel)
            } else {
                // If outside of LOD then delete all
                const starData = data.getStarLOD(lodLevel)

                data.spliceStars(lodLevel, 0, starData.width() * starData.height())

                starData.start.x = 0
                starData.start.y = 0
                starData.end.x = 0
                starData.end.y = 0
            }
        }
    },

    generateViewportStarsLOD(camera, lodLevel) {
        const gridSize = 2 ** (MAX_LOD - lodLevel + MIN_SIZE_EXP)
        const starData = data.getStarLOD(lodLevel)

        const { x: minX, y: minY } = camera.screenSpaceToCoord(0, 0)
        const { x: maxX, y: maxY } = camera.screenSpaceToCoord(innerWidth, innerHeight)

        const left = Math.floor(minX / gridSize)
        const right = Math.ceil(maxX / gridSize)
        const top = Math.ceil(maxY / gridSize)
        const bottom = Math.floor(minY / gridSize)

        const start = starData.start
        const end = starData.end

        if (top < start.y || bottom > end.y || left > end.x || right < start.x || starData.width() === 0 || starData.height() === 0) {
            const newStars = this.generateGrid(lodLevel, left, right, bottom, top)

            data.spliceStars(lodLevel, 0, starData.width() * starData.height(), newStars)

            start.x = left
            start.y = bottom

            end.x = right
            end.y = top

            return
        }

        if (top < end.y) {
            // If top is under old top, then shave off those rows
            data.removeStarRows(lodLevel, starData.height() - (end.y - top), end.y - top)
        } else if (top > end.y) {
            const newStars = this.generateGrid(lodLevel, start.x, end.x, end.y, top)

            data.addStarRows(lodLevel, starData.height(), newStars)
        }
        end.y = top

        if (bottom > start.y) {
            // If bottom is over old bottom, then shave off those rows
            data.removeStarRows(lodLevel, 0, bottom - start.y)
        } else if (bottom < start.y) {
            const newStars = this.generateGrid(lodLevel, start.x, end.x, bottom, start.y)

            data.addStarRows(lodLevel, 0, newStars)
        }
        start.y = bottom
        


        if (left > start.x) {
            data.removeStarColumns(lodLevel, 0, left - start.x)
        } else if (left < start.x) {
            const newStars = this.generateGrid(lodLevel, left, start.x, start.y, end.y)

            data.addStarColumns(lodLevel, 0, newStars)
        }
        start.x = left

        if (right < end.x) {
            data.removeStarColumns(lodLevel, starData.width() - (end.x - right), end.x - right)
        } else if (right > end.x) {
            const newStars = this.generateGrid(lodLevel, end.x, right, start.y, end.y)

            data.addStarColumns(lodLevel, starData.width(), newStars)
        }
        end.x = right
    },

    generateGrid(lodLevel, startX, endX, startY, endY) {
        const size = (endX - startX) * (endY - startY) * lodLevel * 2

        let newStars = new Array(size)

        let index = 0
        for (let x = startX; x < endX; ++x) {
            for (let y = startY; y < endY; ++y) {
                const stars = this.generateStarsInGrid(lodLevel, x, y)

                for (let i = 0; i < stars.length; ++i) {
                    newStars[index++] = stars[i]
                }
            }
        }

        return newStars
    },

    generateStarsInGrid(lodLevel, x, y) {
        const size = lodLevel * 2

        const gridSize = 2 ** (MAX_LOD - lodLevel + MIN_SIZE_EXP)
        const stars = new Array(size)

        const seed = gridSize + (y * 999 + x)
        const rng = FastRandom(seed)

        for (let i = 0; i < size; ++i) {
            const starX = (rng.nextFloat() + x) * gridSize
            const starY = (rng.nextFloat() + y) * gridSize
            const starSize = (rng.nextFloat() * gridSize + gridSize) / 2 ** MIN_SIZE_EXP

            stars[i] = {
                position: [starX, starY],
                size: starSize
            }
        }

        return stars
    },

    getStarAtCoord(x, y) {
        const positions = data.data.starRenderData.position.data
        const sizes = data.data.starRenderData.size.data

        for (let i = 0; i < sizes.length; ++i) {
            const star = {
                x: positions[i * 2],
                y: positions[i * 2 + 1],
                size: sizes[i],
            }

            const distance = Math.sqrt((x - star.x) ** 2 + (y - star.y) ** 2)

            if (distance < star.size) {
                return star
            }
        }

        return null
    },

    coordToId(x, y) {
        x = Number((x / 100).toFixed(1))
        y = Number((y / 100).toFixed(1))

        console.log(x, y)

        // Apply Cantor pairing function to x and y
        let uniqueInt = ((x + y) * (x + y + 1)) / 2 + y
        
        // Convert the unique integer to base-36 (or any base)
        return uniqueInt.toString(36).replace(".", "-") // Converts to base-36 string (0-9, a-z)
    },

    IdToCoord(id) {
        const n = parseInt(id.replace("-", "."), 36)

        let t = Math.floor((Math.sqrt(1 + 8 * n) - 1) / 2);
      
        let y = (n - (t * (t + 1)) / 2) * 100;
      
        let x = (t - y) * 100;
      
        return { x, y };
    },
}

module.exports = mod