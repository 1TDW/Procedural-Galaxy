class Timer {
    constructor() {
        this.start()
    }

    start() {
        this.startTime = performance.now()
    }

    stop() {
        return this.lap()
    }

    lapse() {
        const time = this.lap()
        this.startTime = performance.now()
        
        return time
    }

    lap() {
        return Number((performance.now() - this.startTime).toFixed(1))
    }
}

module.exports = Timer