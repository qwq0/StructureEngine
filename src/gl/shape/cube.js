import { ScenesObject } from "../ScenesObject.js";
import { glslProgram } from "../shader/glslProgram.js";

var cubeVer = new Float32Array([
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,

    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,

    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,

    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,

    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,

    0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5
]);
var cubeTexOff = new Float32Array([
    1 / 3, 0,
    0, 0,
    0, 1 / 2,
    1 / 3, 0,
    0, 1 / 2,
    1 / 3, 1 / 2,

    1 / 3, 1 / 2,
    0, 1 / 2,
    1 / 3, 1,
    0, 1 / 2,
    0, 1,
    1 / 3, 1,

    2 / 3, 1 / 2,
    2 / 3, 0,
    1 / 3, 0,
    2 / 3, 1 / 2,
    1 / 3, 0,
    1 / 3, 1 / 2,

    1 / 3, 1 / 2,
    1 / 3, 1,
    2 / 3, 1 / 2,
    1 / 3, 1,
    2 / 3, 1,
    2 / 3, 1 / 2,

    1, 1 / 2,
    1, 0,
    2 / 3, 0,
    1, 1 / 2,
    2 / 3, 0,
    2 / 3, 1 / 2,

    2 / 3, 1 / 2,
    2 / 3, 1,
    1, 1 / 2,
    2 / 3, 1,
    1, 1,
    1, 1 / 2
]);
var cubeProgram = null;

/**
 * @returns {ScenesObject}
 */
export function create_cube(gl, tex)
{
    var cube = new ScenesObject();
    if (!cubeProgram)
        cubeProgram = new glslProgram(gl, `#version 300 es
            precision highp float;
            
            in vec4 a_position;
            in vec2 a_texcoord;
            uniform mat4 u_matrix;
            
            out vec2 v_texcoord;
            
            void main() {
                gl_Position = u_matrix * a_position;
                v_texcoord = a_texcoord;
            }
            `, `#version 300 es
            precision highp float;
            
            in vec2 v_texcoord;
            uniform sampler2D u_texture;
            
            out vec4 outColor;
            
            void main() {
                outColor = texture(u_texture, v_texcoord);
            }
        `);
    cube.faces = {
        ver: cubeVer,
        verLen: Math.floor(cubeVer.length / 3),
        tex: tex,
        texOff: cubeTexOff
    };
    cube.program = cubeProgram;
    return cube;
}