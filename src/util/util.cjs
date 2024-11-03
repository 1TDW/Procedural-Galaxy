const mod = {
    getShaderType() {
        return $(".shader-options > input:checked").attr("id")
    },
}

module.exports = mod