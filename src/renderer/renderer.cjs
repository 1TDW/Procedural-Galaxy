const Mesh = require("./mesh.cjs")
const twgl = require("twgl.js")
const util = require("../util/util.cjs")

import VERT_SHADER from "./glsl/vert.glsl"
import FRAG_SHADER from "./glsl/frag.glsl"

import BG_VERT_SHADER from "./glsl/bg-vert.glsl"
import BG_FRAG_SHADER from "./glsl/bg-frag.glsl"

class Renderer {
    constructor(canvas) {
        this.gl = canvas.getContext("webgl") || canvas.getContext("expiremental-webgl")
        
        twgl.addExtensionsToContext(this.gl)
        this.ext = this.gl.getExtension('ANGLE_instanced_arrays');
        if (!this.ext) {
            throw new Error('ANGLE_instanced_arrays not supported');
        }

        this.programInfo = twgl.createProgramInfo(this.gl, [VERT_SHADER, FRAG_SHADER])
        this.bgProgramInfo = twgl.createProgramInfo(this.gl, [BG_VERT_SHADER, BG_FRAG_SHADER])

        this.data = []
    }

    bindCamera(camera) {
        this.camera = camera
    }

    bindData(data) {
        this.data = data
    }

    bindBgData() {
        const { x: left, y: top } = this.camera.screenSpaceToCoord(0, 0)
        const { x: right, y: bottom } = this.camera.screenSpaceToCoord(innerWidth, innerHeight)

        this.bgData = {
            position: {
                numComponents: 2,
                data: [
                    left, top,
                    left, bottom,
                    right, bottom,

                    right, bottom,
                    right, top,
                    left, top,
                ]
            }
        }
    }

    bindInfo(info) {
        this.info = info
    }

    getShaderType() {
        const shaderType = util.getShaderType()

        switch (shaderType) {
            case "realistic":
                return 1
            case "black-white":
                return 2
            case "xy":
                return 3
        }
    }

    render() {
        this.gl.canvas.width = innerWidth
        this.gl.canvas.height = innerHeight

        //twgl.resizeCanvasToDisplaySize(this.gl.canvas)
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        this.renderStars()

        if (this.info.lod > 1) {
            this.bindBgData()
            this.renderBg()
        }
    }

    renderStars() {
        const shaderType = this.getShaderType()

        const uniforms = {
            resolution: [innerWidth, innerHeight],
            camera: [this.camera.x, this.camera.y, this.camera.z],
            shaderType,
        }

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this.data)
        this.vertexArrayInfo = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo)

        this.gl.useProgram(this.programInfo.program)
        twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.vertexArrayInfo)
        twgl.setUniforms(this.programInfo, uniforms)
        this.ext.drawArraysInstancedANGLE(this.gl.TRIANGLES, 0, this.data.points.data.length / 2, this.data.size.data.length)
    }

    renderBg() {
        const shaderType = this.getShaderType()

        const uniforms = {
            resolution: [innerWidth, innerHeight],
            camera: [this.camera.x, this.camera.y, this.camera.z],
            shaderType,
            lod: this.info.lod,
        }

        this.bgBufferInfo = twgl.createBufferInfoFromArrays(this.gl, this.bgData)

        this.gl.useProgram(this.bgProgramInfo.program);
        twgl.setBuffersAndAttributes(this.gl, this.bgProgramInfo, this.bgBufferInfo);
        twgl.setUniforms(this.bgProgramInfo, uniforms);
        twgl.drawBufferInfo(this.gl, this.bgBufferInfo);
    }
}

module.exports = Renderer