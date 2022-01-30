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
 * @returns {ScenesObject}
 */
export function create_cube(gl, tex)
{
    var obje = new ScenesObject();
    if (!cubeProgram)
        cubeProgram = new glslProgram(gl,
            `#version 300 es
            precision highp float;

            in vec4 a_position;
            in vec3 a_normal;

            in vec2 a_texcoord;
            uniform mat4 u_matrix;
            uniform mat4 u_worldViewProjection;
            
            out vec3 v_normal;
            out vec2 v_texcoord;
            
            void main() {
                gl_Position = u_matrix * a_position;
                v_normal = mat3(u_worldViewProjection) * a_normal;
                v_texcoord = a_texcoord;
            }
            `,
            `#version 300 es
            precision highp float;
            
            in vec3 v_normal;

            in vec2 v_texcoord;
            uniform sampler2D u_texture;

            const vec3 lightPos = normalize(vec3(0.3, 0.3, 0.3));
            uniform vec3 viewPos;
            
            out vec4 outColor;
            
            void main() {
                vec3 normal = normalize(v_normal);
            
                float diffLight = dot(normal, lightPos);
                float reflLight = dot(viewPos, normal - lightPos);

                outColor.a = 1.0;
                outColor.rgb = texture(u_texture, v_texcoord).rgb * (max(0.0, diffLight) + max(0.0, reflLight) + 0.3);
            }
        `);
    obje.faces = {
        ver: cubeVer,
        verLen: Math.floor(cubeVer.length / 3),
        tex: tex,
        texOff: cubeTexOff,
        normal: cubeNormal
    };

    obje.program = cubeProgram;

    /*
     * 初始化(顶点数组,纹理数组)
     */
    if (!obje.vao) // 这个判断不是必须的
    {
        let vao = gl.createVertexArray(); // 创建顶点数组
        gl.bindVertexArray(vao); // 绑定顶点数组(切换当前正在操作的顶点数组)


        let positionBuffer = gl.createBuffer(); // 创建缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
        gl.bufferData(gl.ARRAY_BUFFER, obje.faces.ver, gl.STATIC_DRAW); // 送入数据

        // 初始化顶点数组
        let positionAttributeLocation = gl.getAttribLocation(obje.program.progra, "a_position"); // [着色器变量] 顶点坐标
        gl.enableVertexAttribArray(positionAttributeLocation); // 启用顶点属性数组(顶点坐标数组)
        gl.vertexAttribPointer( // 顶点属性指针
            positionAttributeLocation, // 到顶点坐标
            3, // 每个坐标为3个元素
            gl.FLOAT, // 浮点数(似乎应该是32位)
            false, // 归一化(规范化,正常化)
            0, // 坐标间间隔(无间隔)
            0 // 缓冲区偏移(从开头开始)
        );

        obje.vao = vao;

        if (obje.faces.tex) // 有纹理
        {
            // 初始化纹理坐标
            let texcoordAttributeLocation = gl.getAttribLocation(obje.program.progra, "a_texcoord"); // [着色器变量] 纹理坐标

            let texcoordBuffer = gl.createBuffer(); // 创建缓冲区
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
            gl.bufferData(gl.ARRAY_BUFFER, obje.faces.texOff, gl.STATIC_DRAW); // 送入数据

            gl.enableVertexAttribArray(texcoordAttributeLocation); // 启用顶点属性数组(纹理坐标数组)

            gl.vertexAttribPointer( // 顶点属性指针
                texcoordAttributeLocation, // 到纹理坐标
                2, // 每个坐标为2个元素
                gl.FLOAT, // 浮点数(似乎应该是32位)
                false, // 归一化(规范化,正常化)
                0, // 坐标间间隔(无间隔)
                0 // 缓冲区偏移(从开头开始)
            );
        }

        // 初始化法线向量
        let normalAttributeLocation = gl.getAttribLocation(obje.program.progra, "a_normal"); // [着色器变量] 法线向量

        let normalBuffer = gl.createBuffer(); // 创建缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
        gl.bufferData(gl.ARRAY_BUFFER, obje.faces.normal, gl.STATIC_DRAW); // 送入数据

        gl.enableVertexAttribArray(normalAttributeLocation); // 启用顶点属性数组(法线向量数组)

        gl.vertexAttribPointer( // 顶点属性指针
            normalAttributeLocation, // 到法线向量
            3, // 每个坐标为3个元素
            gl.FLOAT, // 浮点数(似乎应该是32位)
            false, // 归一化(规范化,正常化)
            0, // 坐标间间隔(无间隔)
            0 // 缓冲区偏移(从开头开始)
        );
    }

    return obje;
}