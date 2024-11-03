const mod = {
    setStat(name, value) {
        $(`.${name}`).text(value)
    },
}

module.exports = mod