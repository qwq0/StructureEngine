import { ObjFaces } from "../scene/ObjFaces.js";
import { SceneObject } from "../scene/SceneObject.js";

/**
 * vao标志
 * 将vao绑定到ObjFaces上
 */
export const vaoSymbol = Symbol("vaoSymbol");
/**
 * vaoUsed标志
 * 将 vao最后一次被使用的毫秒时间戳 绑定到ObjFaces上
 */
export const vaoUsedSymbol = Symbol("vaoUsedSymbol");
/**
 * 渲染池
 * (此类基于webgl渲染)
 *  + 管理渲染列表
 *  + 管理webgl2接口的资源
 */
export class RenderPool
{
    /**
     * 绑定的webgl上下文
     * @private
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 渲染列表
     * 通过场景树生成得到
     * 若成员为一个数组 表示有相同的面数据 将进行实例化渲染
     * @type {Array<SceneObject | Array<SceneObject>>}
     */
    rList = [];

    /**
     * 缓存带有vao标志的ObjFaces
     * @type {Set<ObjFaces>}
     */
    vaoSet = new Set();

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.gl = gl;
    }

    /**
     * 清理缓存
     * @param {number} timeStamp 当前毫秒时间戳
     */
    clear(timeStamp)
    {
        this.vaoSet.forEach(o =>
        {
            if (o[vaoUsedSymbol] + 5000 < timeStamp) // 已经达到超时时间未被使用
            {
                /**
                 * @type {WebGLVertexArrayObject}
                 */
                var vao = o[vaoSymbol];
                o[vaoSymbol] = null; // 释放vao
                this.vaoSet.delete(o); // 解除记录
                // console.log("free vao");
            }
        });
    }

    /**
     * 获取物体的vao
     * 若vao不存在将自动创建
     * @param {ObjFaces} faces
     * @param {number} timeStamp 当前毫秒时间戳
     * @returns {WebGLVertexArrayObject}
     */
    getVao(faces, timeStamp)
    {
        faces[vaoUsedSymbol] = timeStamp; // 更新vao被使用时间戳
        if (faces[vaoSymbol]) // 存在vao
            return faces[vaoSymbol];
        else // 生成vao
        {
            var gl = this.gl;
            let vao = gl.createVertexArray(); // 创建顶点数组
            gl.bindVertexArray(vao); // 绑定顶点数组(切换当前正在操作的顶点数组)


            // 初始化顶点数组
            // let positionAttributeLocation = gl.getAttribLocation(program.progra, "a_position"); // [着色器变量] 顶点坐标
            let positionAttributeLocation = 0; // [着色器变量] 顶点坐标

            let positionBuffer = gl.createBuffer(); // 创建缓冲区
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
            gl.bufferData(gl.ARRAY_BUFFER, faces.pos, gl.STATIC_DRAW); // 送入数据

            gl.enableVertexAttribArray(positionAttributeLocation); // 启用顶点属性数组(顶点坐标数组)

            gl.vertexAttribPointer( // 顶点属性指针
                positionAttributeLocation, // 到顶点坐标
                3, // 每个坐标为3个元素
                gl.FLOAT, // 浮点数(似乎应该是32位)
                false, // 归一化(规范化,正常化)
                0, // 坐标间间隔(无间隔)
                0 // 缓冲区偏移(从开头开始)
            );


            if (faces.tex) // 有纹理
            {
                // 初始化纹理坐标
                //let texcoordAttributeLocation = gl.getAttribLocation(program.progra, "a_texcoord"); // [着色器变量] 纹理坐标
                let texcoordAttributeLocation = 1; // [着色器变量] 纹理坐标

                let texcoordBuffer = gl.createBuffer(); // 创建缓冲区
                gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
                gl.bufferData(gl.ARRAY_BUFFER, faces.texPos, gl.STATIC_DRAW); // 送入数据

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
            // let normalAttributeLocation = gl.getAttribLocation(program.progra, "a_normal"); // [着色器变量] 法线向量
            let normalAttributeLocation = 2; // [着色器变量] 法线向量

            let normalBuffer = gl.createBuffer(); // 创建缓冲区
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
            gl.bufferData(gl.ARRAY_BUFFER, faces.normal, gl.STATIC_DRAW); // 送入数据

            gl.enableVertexAttribArray(normalAttributeLocation); // 启用顶点属性数组(法线向量数组)

            gl.vertexAttribPointer( // 顶点属性指针
                normalAttributeLocation, // 到法线向量
                3, // 每个坐标为3个元素
                gl.FLOAT, // 浮点数(似乎应该是32位)
                false, // 归一化(规范化,正常化)
                0, // 坐标间间隔(无间隔)
                0 // 缓冲区偏移(从开头开始)
            );

            if (faces.ind) // 有索引
            {
                let indexBuffer = gl.createBuffer(); // 创建缓冲区
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces.ind, gl.STATIC_DRAW); // 送入数据
            }

            this.vaoSet.add(faces);
            return (faces[vaoSymbol] = vao);
        }
    }
}