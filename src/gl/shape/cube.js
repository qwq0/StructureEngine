import { ObjFaces } from "../scene/ObjFaces.js";
import { SceneObject } from "../scene/SceneObject.js";
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
var cubeNormal = new Float32Array([
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0
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
 * @returns {SceneObject}
 * @param {WebGL2RenderingContext} gl
 * @param {import("../texture.js").Texture} tex
 */
export function create_cube(gl, tex)
{
    var obje = new SceneObject();
    if (!cubeProgram)
        cubeProgram = new glslProgram(gl,
            `#version 300 es
            precision highp float;

            in vec4 a_position;
            in vec3 a_normal;

            in vec2 a_texcoord;
            uniform mat4 u_cameraMatrix;
            uniform mat4 u_worldMatrix;
            
            out vec3 v_normal;
            out vec2 v_texcoord;
            out vec3 v_thisPos;
            
            void main() {
                mat4 u_matrix = u_cameraMatrix * u_worldMatrix;
                mat4 u_worldViewProjection = u_worldMatrix;
                u_worldViewProjection[3][0] = u_worldViewProjection[3][1] = u_worldViewProjection[3][2] = 0.0;
                u_worldViewProjection = transpose(inverse(u_worldViewProjection));

                gl_Position = u_matrix * a_position;
                v_normal = mat3(u_worldViewProjection) * a_normal;
                v_texcoord = a_texcoord;
                v_thisPos = (u_worldMatrix * a_position).xyz;
            }
            `,
            `#version 300 es
            precision highp float;
            
            in vec3 v_normal;
            in vec3 v_thisPos;

            in vec2 v_texcoord;
            uniform sampler2D u_texture;

            const vec3 lightDir = normalize(vec3(0.3, -0.3, 1)); // 灯光方向向量
            uniform vec3 u_viewPos;
            
            out vec4 outColor;
            
            void main() {
                vec3 normal = normalize(v_normal);
            
                float diffLight = max(dot(normal, -lightDir), 0.0);
                float reflLight = pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0);

                float lightResult = 0.75 + diffLight * 0.2 + reflLight * 0.08;
                outColor.a = 1.0;
                outColor.rgb = texture(u_texture, v_texcoord).rgb * lightResult;
                // discard;
            }
        `);
    var faces = obje.faces = new ObjFaces(cubeVer, tex, cubeTexOff, cubeNormal, gl.TRIANGLES);

    faces.update(gl, obje.program = cubeProgram);

    return obje;
}