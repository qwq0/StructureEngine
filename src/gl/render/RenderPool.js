import { ObjFaces } from "../scene/ObjFaces.js";

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
 * 实例化vao标志
 * 将vao绑定到ObjFaces上
 */
export const instanceVaoSymbol = Symbol("vaoSymbol");
/**
 * 实例化vaoUsed标志
 * 将 vao最后一次被使用的毫秒时间戳 绑定到ObjFaces上
 */
export const instanceVaoUsedSymbol = Symbol("vaoUsedSymbol");

/**
 * 渲染池类
 * 多个渲染器类共享一个渲染池类
 * 通常一个引擎上下文对应一个渲染池类
 * 
 * 管理webgl2接口的资源如:
 *  + vao对象
 *  + 着色器程序
 * 
 * (此类基于webgl渲染)
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
     * 对应一般物体的面
     * 缓存带有vao标志的ObjFaces
     * @private
     * @type {Set<ObjFaces>}
     */
    vaoSet = new Set();
    /**
     * 对于实例化渲染的物体的面
     * 缓存带有vao标志的ObjFaces
     * @private
     * @type {Set<ObjFaces>}
     */
    instanceVaoSet = new Set();

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
        this.vaoSet.forEach(o => // 检查vao缓存集合中超时的物体
        {
            if (o[vaoUsedSymbol] + 5000 < timeStamp) // 已经达到超时时间未被使用
            {
                o[vaoSymbol] = null; // 释放vao
                this.vaoSet.delete(o); // 解除记录
            }
        });
        this.instanceVaoSet.forEach(o => // 检查实例化vao缓存集合中超时的物体
        {
            if (o[instanceVaoUsedSymbol] + 5000 < timeStamp) // 已经达到超时时间未被使用
            {
                o[instanceVaoSymbol] = null; // 释放vao
                this.instanceVaoSet.delete(o); // 解除记录
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
            this.vaoSet.add(faces);
            return (faces[vaoSymbol] = genVao(this.gl, faces));
        }
    }

    /**
     * 获取实例化物体的vao
     * 若vao不存在将自动创建
     * @param {ObjFaces} faces
     * @param {number} timeStamp 当前毫秒时间戳
     * @returns {WebGLVertexArrayObject}
     */
    getInstanceVao(faces, timeStamp)
    {
        faces[instanceVaoUsedSymbol] = timeStamp; // 更新vao被使用时间戳
        if (faces[instanceVaoSymbol]) // 存在vao
            return faces[instanceVaoSymbol];
        else // 生成vao
        {
            this.instanceVaoSet.add(faces);
            return (faces[instanceVaoSymbol] = genVao(this.gl, faces));
        }
    }
}

/**
 * 通过物体的面数据生成生成vao
 * 不会将vao绑定到物体面数据中
 * @param {WebGL2RenderingContext} gl
 * @param {ObjFaces} faces
 * @returns {WebGLVertexArrayObject}
 */
function genVao(gl, faces)
{
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

    return vao;
}