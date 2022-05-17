import { GlslProgram } from "../shader/GlslProgram.js";

/**
 * [gl]物体的面数据
 */
export class ObjFaces
{
    /**
     * 顶点相对坐标向量
     * 每个顶点3个(1个向量)
     * 每个面9个(每个面3个顶点)
     * @type {Float32Array}
     */
    pos = null;
    /**
     * 法线方向向量(每个顶点3个(1个向量), 每个面9个(每个面3个顶点))
     * @type {Float32Array}
     */
    normal = null;
    /**
     * 顶点相对坐标数组中点的个数(每3个元素(每个向量)1个顶点)
     * @type {number}
     */
    posLen = 0;
    /**
     * 纹理
     * @type {import("../texture/Texture").Texture}
     */
    tex = null;
    /**
     * 纹理坐标向量(每个顶点2个(1个向量), 每个面6个(每个面3个纹理坐标))
     * @type {Float32Array}
     */
    texPos = null;
    /**
     * 此物体的vao对象
     * @type {WebGLVertexArrayObject}
     */
    vao = null;
    /**
     * 此物体的渲染模式 例如 gl.TRIANGLES
     * @type {number}
     */
    mode = 0;

    /**
     * @param {Float32Array | Array<number>} pos
     * @param {import("../texture/Texture").Texture} tex
     * @param {Float32Array | Array<number>} texPos
     * @param {Float32Array | Array<number>} normal
     * @param {number} [mode]
     */
    constructor(pos, tex, texPos, normal, mode = WebGL2RenderingContext.TRIANGLES)
    {
        if (pos instanceof Float32Array)
            this.pos = pos;
        else
            this.pos = new Float32Array(pos);
        if (mode == WebGL2RenderingContext.TRIANGLES) // 三角形
            this.posLen = Math.floor(pos.length / 3);
        else
            throw "drawMode error";
        this.tex = tex;
        if (texPos instanceof Float32Array)
            this.texPos = texPos;
        else
            this.texPos = new Float32Array(texPos);
        if (normal instanceof Float32Array)
            this.normal = normal;
        else
            this.normal = new Float32Array(normal);
        this.mode = mode;
    }

    /**
     * 更新vao的值
     * @param {WebGL2RenderingContext} gl
     * @param {GlslProgram} program
     */
    update(gl, program)
    {
        let vao = gl.createVertexArray(); // 创建顶点数组
        gl.bindVertexArray(vao); // 绑定顶点数组(切换当前正在操作的顶点数组)


        let positionBuffer = gl.createBuffer(); // 创建缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
        gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.STATIC_DRAW); // 送入数据

        // 初始化顶点数组
        let positionAttributeLocation = gl.getAttribLocation(program.progra, "a_position"); // [着色器变量] 顶点坐标
        gl.enableVertexAttribArray(positionAttributeLocation); // 启用顶点属性数组(顶点坐标数组)
        gl.vertexAttribPointer( // 顶点属性指针
            positionAttributeLocation, // 到顶点坐标
            3, // 每个坐标为3个元素
            gl.FLOAT, // 浮点数(似乎应该是32位)
            false, // 归一化(规范化,正常化)
            0, // 坐标间间隔(无间隔)
            0 // 缓冲区偏移(从开头开始)
        );

        this.vao = vao;

        if (this.tex) // 有纹理
        {
            // 初始化纹理坐标
            let texcoordAttributeLocation = gl.getAttribLocation(program.progra, "a_texcoord"); // [着色器变量] 纹理坐标

            let texcoordBuffer = gl.createBuffer(); // 创建缓冲区
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
            gl.bufferData(gl.ARRAY_BUFFER, this.texPos, gl.STATIC_DRAW); // 送入数据

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
        let normalAttributeLocation = gl.getAttribLocation(program.progra, "a_normal"); // [着色器变量] 法线向量

        let normalBuffer = gl.createBuffer(); // 创建缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
        gl.bufferData(gl.ARRAY_BUFFER, this.normal, gl.STATIC_DRAW); // 送入数据

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
}