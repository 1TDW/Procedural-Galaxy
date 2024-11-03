class Mesh {
    constructor(points = []) {
        this.points = points
    }

    push(...data) {
        this.points.push(...data)
    }
}

Mesh.from = function(points) {
    return new Mesh(points)
}

Mesh.circleWithSides = function(sides) {
    const mesh = new Mesh()

    // Generate array of sin - cos pairs
    for (let i = 0; i < sides; ++i) {
        const theta = i / sides * 2 * Math.PI
        const x = Math.sin(theta)
        const y = Math.cos(theta)

        const theta2 = (i + 1) / sides * 2 * Math.PI
        const x2 = Math.sin(theta2)
        const y2 = Math.cos(theta2)
        
        mesh.push(x, y, x2, y2, 0, 0)
    }

    return mesh
}

module.exports = Mesh