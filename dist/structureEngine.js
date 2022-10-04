/**
 * Structure Engine
 * @link https://github.com/qwq0/StructureEngine
 * @copyright StructureEngine authors (qwq0(qwq_yahu) & ndzda)
 * @license MIT
 */
const structureEngineInfo = Object.freeze({
    /** 引擎字符串版本号 */
    version: "1.0",
    /** 引擎版本编号 */
    versionNumber: 1
});

/**
 * [gl]物体的面数据
 * 此类的名称应为ObjMesh
 */
class ObjFaces
{
    /**
     * 顶点相对坐标向量
     * 每个顶点3个(1个向量)
     * (无索引时)每个面9个(每个面3个顶点)
     * @type {Float32Array}
     */
    pos = null;
    /**
     * 顶点索引数组
     * 可以没有此数组
     * 每个面3个
     * @type {Uint32Array}
     */
    ind = null;
    /**
     * 法线方向向量
     * 每个顶点3个(1个向量)
     * (无索引时)每个面9个(每个面3个顶点)
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
     * 纹理坐标向量
     * 每个顶点2个(1个向量)
     * (无索引时)每个面6个(每个面3个纹理坐标)
     * @type {Float32Array}
     */
    texPos = null;
    /**
     * 此物体的渲染模式
     * 例如 gl.TRIANGLES
     * 暂时仅支持gl.TRIANGLES
     * @type {number}
     */
    mode = 0;
    /**
     * 此物体被遮挡
     * 当物体实例化渲染时无效
     * 当关闭遮挡剔除时不会被更新且无效
     * @type {boolean}
     */
    occluded = false;

    /**
     * @param {Float32Array | Array<number>} pos
     * @param {import("../texture/Texture").Texture} tex
     * @param {Float32Array | Array<number>} texPos
     * @param {Float32Array | Array<number>} normal
     * @param {number} [mode]
     * @param {Uint32Array | Array<number>} [ind]
     */
    constructor(pos, tex, texPos, normal, mode = WebGL2RenderingContext.TRIANGLES, ind = null)
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
        if (ind)
        {
            if (ind instanceof Uint32Array)
                this.ind = ind;
            else
                this.ind = new Uint32Array(ind);
        }
    }

    /**
     * 转换使用索引数组的面信息
     * [!] 不建议使用
     * @param {Float32Array | Array<number>} pos
     * @param {import("../texture/Texture").Texture} tex
     * @param {Float32Array | Array<number>} texPos
     * @param {Float32Array | Array<number>} normal
     * @param {number} mode
     * @param {Uint32Array | Array<number>} ind
     */
    static convertInd(pos, tex, texPos, normal, mode, ind)
    {
        var nPos = new Float32Array(ind.length * 3);
        var nTexPos = new Float32Array(ind.length * 2);
        var nNormal = new Float32Array(ind.length * 3);
        ind.forEach((/** @type {number} */ o, /** @type {number} */ i) =>
        {
            [nPos[i * 3 + 0], nPos[i * 3 + 1], nPos[i * 3 + 2]] = [pos[o * 3 + 0], pos[o * 3 + 1], pos[o * 3 + 2]];
            [nTexPos[i * 2 + 0], nTexPos[i * 2 + 1]] = [texPos[o * 2 + 0], texPos[o * 2 + 1]];
            [nNormal[i * 3 + 0], nNormal[i * 3 + 1], nNormal[i * 3 + 2]] = [normal[o * 3 + 0], normal[o * 3 + 1], normal[o * 3 + 2]];
        });
        var ret = new ObjFaces(nPos, tex, nTexPos, nNormal, mode);
        return ret;
    }
}

/**
 * vao标志
 * 将vao绑定到ObjFaces上
 */
const vaoSymbol = Symbol("vaoSymbol");
/**
 * vaoUsed标志
 * 将 vao最后一次被使用的毫秒时间戳 绑定到ObjFaces上
 */
const vaoUsedSymbol = Symbol("vaoUsedSymbol");
/**
 * 实例化vao标志
 * 将vao绑定到ObjFaces上
 */
const instanceVaoSymbol = Symbol("vaoSymbol");
/**
 * 实例化vaoUsed标志
 * 将 vao最后一次被使用的毫秒时间戳 绑定到ObjFaces上
 */
const instanceVaoUsedSymbol = Symbol("vaoUsedSymbol");

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
class RenderPool
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

/**
 * 3*3矩阵类
 */
class Mat3
{
    /**
     * 矩阵原始数据
     * 数组长度为9
     * @type {Array<number>}
     */
    a = null;

    /**
     * 使用数组作为参数以包装为矩阵
     * 缺省参数创建单位矩阵(左上到右下对角线为1 其余为0)
     * @param {Array<number>} [arr]
     */
    constructor(arr)
    {
        if (arr)
        {
            this.a = arr;
        }
        else
        {
            this.a = [ // 新矩阵
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
            ];
        }
    }

    /**
     * 复制矩阵
     * @returns {Mat3}
     */
    copy()
    {
        return new Mat3(this.a.slice());
    }

    /**
     * 矩阵乘法(反向)
     * 不会改变原矩阵
     * 注意 此乘法与一般矩阵乘法的ab相反
     * 此函数为b*a 也就是矩阵变换乘
     * c[i][j] = sum(a[k][j] + b[i][k])
     * @param {Mat3} matrix
     * @returns {Mat3}
     */
    multiply(matrix)
    {
        var a = this.a;
        var b = matrix.a;
        var ret = [
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ];
        for (var i = 0; i < 3; i++)
            for (var j = 0; j < 3; j++)
                ret[i * 3 + j] = a[0 * 3 + j] * b[i * 3 + 0] + a[1 * 3 + j] * b[i * 3 + 1] + a[2 * 3 + j] * b[i * 3 + 2];
        return new Mat3(ret);
    }

    /**
     * 矩阵求逆
     * 不会改变原矩阵
     * @returns {Mat3}
     */
    inverse()
    {
        var a = this.a;
        var m00 = a[0 * 3 + 0], m01 = a[0 * 3 + 1], m02 = a[0 * 3 + 2],
            m10 = a[1 * 3 + 0], m11 = a[1 * 3 + 1], m12 = a[1 * 3 + 2],
            m20 = a[2 * 3 + 0], m21 = a[2 * 3 + 1], m22 = a[2 * 3 + 2];
        var d = 1.0 / (m00 * m11 * m22 + m01 * m12 * m20 + m02 * m10 * m21 - m00 * m12 * m21 - m01 * m10 * m22 - m02 * m11 * m20);
        return new Mat3([
            d * (m11 * m22 - m12 * m21),
            d * (-m01 * m22 + m02 * m21),
            d * (m01 * m12 - m02 * m11),

            d * (-m10 * m22 + m12 * m20),
            d * (m00 * m22 - m02 * m20),
            d * (-m00 * m12 + m02 * m10),

            d * (m10 * m21 - m11 * m20),
            d * (-m00 * m21 + m01 * m20),
            d * (m00 * m11 - m01 * m10)
        ]);
    }

    /**
     * 矩阵转置
     * 不会改变原矩阵
     * @returns {Mat3}
     */
    transpose()
    {
        var a = this.a;
        return new Mat3([
            a[0 * 3 + 0], a[1 * 3 + 0], a[2 * 3 + 0],
            a[0 * 3 + 1], a[1 * 3 + 1], a[2 * 3 + 1],
            a[0 * 3 + 2], a[1 * 3 + 2], a[2 * 3 + 2]
        ]);
    }

    /**
     * 创建零矩阵(全部为0)
     * @returns {Mat3}
     */
    static zero()
    {
        return new Mat3([
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ]);
    }
}

/**
 * 4轴向量类
 */
class Vec4
{
    /**
     * 向量中的第个1值
     * @type {number}
     */
    x;
    /**
     * 向量中的第个2值
     * @type {number}
     */
    y;
    /**
     * 向量中的第个3值
     * @type {number}
     */
    z;
    /**
     * 向量中的第个4值
     * @type {number}
     */
    w;

    /**
     * @param {number} [x]
     * @param {number} [y]
     * @param {number} [z]
     * @param {number} [w]
     */
    constructor(x = 0, y = 0, z = 0, w = 1)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * 乘Mat4矩阵
     * (向量 乘 矩阵)
     * @param {Mat4} m
     */
    mulM4(m)
    {
        var a = m.a;
        return new Vec4(
            (this.x * a[0]) + (this.y * a[4]) + (this.z * a[8]) + (this.w * a[12]),
            (this.x * a[1]) + (this.y * a[5]) + (this.z * a[9]) + (this.w * a[13]),
            (this.x * a[2]) + (this.y * a[6]) + (this.z * a[10]) + (this.w * a[14]),
            (this.x * a[3]) + (this.y * a[7]) + (this.z * a[11]) + (this.w * a[15])
        );
    }

    /**
     * 向量乘标量
     * @param {number} a
     * @returns {Vec4}
     */
    mulNum(a)
    {
        return new Vec4(this.x * a, this.y * a, this.z * a, this.w * a);
    }

    /**
     * 向量相加
     * 不改变原向量
     * @param {Vec4} v
     * @returns {Vec4}
     */
    add(v)
    {
        return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    /**
     * 向量相减
     * 不改变原向量
     * @param {Vec4} v
     * @returns {Vec4}
     */
    sub(v)
    {
        return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }

    /**
     * 归一化(使向量长度为1 不改变方向)
     * 不改变原向量
     * @returns {Vec4}
     */
    normalize()
    {
        var multiple = 1 / Math.hypot(this.x, this.y, this.z, this.w);
        if (multiple != Infinity)
            return new Vec4(
                this.x * multiple,
                this.y * multiple,
                this.z * multiple,
                this.w * multiple
            );
        else
            return new Vec4();
    }

    /**
     * 取三维向量的模(长度)
     * 只使用xyz
     */
    getV3Len()
    {
        return Math.hypot(this.x, this.y, this.z);
    }
}

/**
 * 4*4矩阵类
 */
class Mat4
{
    /**
     * 矩阵原始数据
     * 数组长度为16
     * @type {Array<number>}
     */
    a = null;

    /**
     * 使用数组作为参数以包装为矩阵
     * 缺省参数创建单位矩阵(左上到右下对角线为1 其余为0)
     * @param {Array<number>} [arr]
     */
    constructor(arr)
    {
        if (arr)
        {
            this.a = arr;
        }
        else
        {
            this.a = [ // 新矩阵
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        }
    }

    /**
     * 复制矩阵
     * @returns {Mat4}
     */
    copy()
    {
        return new Mat4(this.a.slice());
    }

    /**
     * 矩阵乘法(反向)
     * 不会改变原矩阵
     * 注意 此乘法与一般矩阵乘法的ab相反
     * 此函数为b*a 也就是矩阵变换乘
     * c[i][j] = sum(a[k][j] + b[i][k])
     * @param {Mat4} matrix
     * @returns {Mat4}
     */
    multiply(matrix)
    {
        var a = this.a;
        var b = matrix.a;
        var ret = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];
        for (var i = 0; i < 4; i++)
            for (var j = 0; j < 4; j++)
                ret[i * 4 + j] = a[0 * 4 + j] * b[i * 4 + 0] + a[1 * 4 + j] * b[i * 4 + 1] + a[2 * 4 + j] * b[i * 4 + 2] + a[3 * 4 + j] * b[i * 4 + 3];
        return new Mat4(ret);
    }

    /**
     * 矩阵求逆
     * 不会改变原矩阵
     * @returns {Mat4}
     */
    inverse()
    {
        var a = this.a;
        var m00 = a[0 * 4 + 0], m01 = a[0 * 4 + 1], m02 = a[0 * 4 + 2], m03 = a[0 * 4 + 3],
            m10 = a[1 * 4 + 0], m11 = a[1 * 4 + 1], m12 = a[1 * 4 + 2], m13 = a[1 * 4 + 3],
            m20 = a[2 * 4 + 0], m21 = a[2 * 4 + 1], m22 = a[2 * 4 + 2], m23 = a[2 * 4 + 3],
            m30 = a[3 * 4 + 0], m31 = a[3 * 4 + 1], m32 = a[3 * 4 + 2], m33 = a[3 * 4 + 3];
        var k0 = m22 * m33, k1 = m32 * m23, k2 = m12 * m33, k3 = m32 * m13;
        var k4 = m12 * m23, k5 = m22 * m13, k6 = m02 * m33, k7 = m32 * m03;
        var k8 = m02 * m23, k9 = m22 * m03, k10 = m02 * m13, k11 = m12 * m03;
        var k12 = m20 * m31, k13 = m30 * m21, k14 = m10 * m31, k15 = m30 * m11;
        var k16 = m10 * m21, k17 = m20 * m11, k18 = m00 * m31, k19 = m30 * m01;
        var k20 = m00 * m21, k21 = m20 * m01, k22 = m00 * m11, k23 = m10 * m01;
        var t0 = (k0 * m11 + k3 * m21 + k4 * m31) - (k1 * m11 + k2 * m21 + k5 * m31);
        var t1 = (k1 * m01 + k6 * m21 + k9 * m31) - (k0 * m01 + k7 * m21 + k8 * m31);
        var t2 = (k2 * m01 + k7 * m11 + k10 * m31) - (k3 * m01 + k6 * m11 + k11 * m31);
        var t3 = (k5 * m01 + k8 * m11 + k11 * m21) - (k4 * m01 + k9 * m11 + k10 * m21);
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
        return new Mat4([
            d * t0,
            d * t1,
            d * t2,
            d * t3,

            d * ((k1 * m10 + k2 * m20 + k5 * m30) - (k0 * m10 + k3 * m20 + k4 * m30)),
            d * ((k0 * m00 + k7 * m20 + k8 * m30) - (k1 * m00 + k6 * m20 + k9 * m30)),
            d * ((k3 * m00 + k6 * m10 + k11 * m30) - (k2 * m00 + k7 * m10 + k10 * m30)),
            d * ((k4 * m00 + k9 * m10 + k10 * m20) - (k5 * m00 + k8 * m10 + k11 * m20)),

            d * ((k12 * m13 + k15 * m23 + k16 * m33) - (k13 * m13 + k14 * m23 + k17 * m33)),
            d * ((k13 * m03 + k18 * m23 + k21 * m33) - (k12 * m03 + k19 * m23 + k20 * m33)),
            d * ((k14 * m03 + k19 * m13 + k22 * m33) - (k15 * m03 + k18 * m13 + k23 * m33)),
            d * ((k17 * m03 + k20 * m13 + k23 * m23) - (k16 * m03 + k21 * m13 + k22 * m23)),

            d * ((k14 * m22 + k17 * m32 + k13 * m12) - (k16 * m32 + k12 * m12 + k15 * m22)),
            d * ((k20 * m32 + k12 * m02 + k19 * m22) - (k18 * m22 + k21 * m32 + k13 * m02)),
            d * ((k18 * m12 + k23 * m32 + k15 * m02) - (k22 * m32 + k14 * m02 + k19 * m12)),
            d * ((k22 * m22 + k16 * m02 + k21 * m12) - (k20 * m12 + k23 * m22 + k17 * m02))
        ]);
    }

    /**
     * 矩阵转置
     * 不会改变原矩阵
     * @returns {Mat4}
     */
    transpose()
    {
        var a = this.a;
        return new Mat4([
            a[0 * 4 + 0], a[1 * 4 + 0], a[2 * 4 + 0], a[3 * 4 + 0],
            a[0 * 4 + 1], a[1 * 4 + 1], a[2 * 4 + 1], a[3 * 4 + 1],
            a[0 * 4 + 2], a[1 * 4 + 2], a[2 * 4 + 2], a[3 * 4 + 2],
            a[0 * 4 + 3], a[1 * 4 + 3], a[2 * 4 + 3], a[3 * 4 + 3]
        ]);
    }

    /**
     * 创建零矩阵(全部为0)
     * @returns {Mat4}
     */
    static zero()
    {
        return new Mat4([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);
    }

    /**
     * 透视投影矩阵
     * 此矩阵将使用向量的w
     * z将不是线性变化的
     * 使用此矩阵纹理将正确映射
     * @param {number} fov 对角线视角场(单位:弧度)
     * @param {number} aspect 视口垂直长度与水平长度的比例
     * @param {number} near 视锥最近处
     * @param {number} far 视锥最远处
     * @returns {Mat4}
     */
    static perspective(fov, aspect, near, far)
    {
        var f = 1 / Math.tan(fov * 0.5);
        var rangeInv = 1.0 / (near - far);

        return new Mat4([
            Math.sqrt(1 + (aspect * aspect)) * f, 0, 0, 0,
            0, Math.sqrt(1 + 1 / (aspect * aspect)) * f, 0, 0,
            0, 0, 1 + 2 * far * rangeInv, -1, // 1 + ((2far) / (near - far))
            0, 0, near * far * rangeInv * 2, 0 // near * far * 2 / (near - far)
        ]); // Z = 2 * (0.5 + far + near * far / z) / (near - far)
    }

    /**
     * 坐标转换矩阵(正交投影)
     *  将以原点为中心
     *  面朝-z方向深度为d的
     *  xy方向长度分别为wh坐标
     *  转换为opengl(-1到1)坐标系
     * @param {number} w 宽
     * @param {number} h 高
     * @param {number} d 深
     * @returns {Mat4}
     */
    static projection(w, h, d)
    {
        return new Mat4([
            2 / w, 0, 0, 0,
            0, 2 / h, 0, 0,
            0, 0, -2 / d, 0,
            0, 0, -1, 1
        ]);
    }

    /**
     * 四元数转矩阵
     * 按照左手螺旋定则方向旋转
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     * @returns {Mat4}
     */
    static quaternionLH(x, y, z, w)
    {
        return new Mat4([
            1 - 2 * (y * y + z * z),
            2 * (x * y - w * z),
            2 * (x * z + w * y),
            0,

            2 * (x * y + w * z),
            1 - 2 * (x * x + z * z),
            2 * (y * z - w * x),
            0,

            2 * (x * z - w * y),
            2 * (y * z + w * x),
            1 - 2 * (x * x + y * y),
            0,

            0,
            0,
            0,
            1
        ]);
    }

    /**
     * 四元数转矩阵
     * 按照右手螺旋定则方向旋转
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     * @returns {Mat4}
     */
    static quaternionRH(x, y, z, w)
    {
        return new Mat4([
            1 - 2 * (y * y + z * z),
            2 * (x * y + w * z),
            2 * (x * z - w * y),
            0,

            2 * (x * y - w * z),
            1 - 2 * (x * x + z * z),
            2 * (y * z + w * x),
            0,

            2 * (x * z + w * y),
            2 * (y * z - w * x),
            1 - 2 * (x * x + y * y),
            0,

            0,
            0,
            0,
            1
        ]);
    }

    /*
        部分矩阵变换经过优化
        可能提高效率 实际性能表现未经测试
    */

    /**
     * 平移矩阵
     * 将改变原矩阵
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Mat4}
     */
    translation(x, y, z)
    {
        this.a[3 * 4 + 0] +=
            x * this.a[0 * 4 + 0] +
            y * this.a[1 * 4 + 0] +
            z * this.a[2 * 4 + 0];
        this.a[3 * 4 + 1] +=
            x * this.a[0 * 4 + 1] +
            y * this.a[1 * 4 + 1] +
            z * this.a[2 * 4 + 1];
        this.a[3 * 4 + 2] +=
            x * this.a[0 * 4 + 2] +
            y * this.a[1 * 4 + 2] +
            z * this.a[2 * 4 + 2];
        this.a[3 * 4 + 3] +=
            x * this.a[0 * 4 + 3] +
            y * this.a[1 * 4 + 3] +
            z * this.a[2 * 4 + 3];
        return this;
    }
    /**
     * 绕x轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} rx
     */
    rotateX(rx)
    {
        var a = this.a;
        /*
            1, 0,  0, 0,
            0, c,  s, 0,
            0, -s, c, 0,
            0, 0,  0, 1
        */
        var cosX = Math.cos(rx),
            sinX = Math.sin(rx),
            l0 = a[1 * 4 + 0],
            l1 = a[1 * 4 + 1],
            l2 = a[1 * 4 + 2],
            l3 = a[1 * 4 + 3],
            r0 = a[2 * 4 + 0],
            r1 = a[2 * 4 + 1],
            r2 = a[2 * 4 + 2],
            r3 = a[2 * 4 + 3];
        a[1 * 4 + 0] = l0 * cosX + r0 * sinX;
        a[1 * 4 + 1] = l1 * cosX + r1 * sinX;
        a[1 * 4 + 2] = l2 * cosX + r2 * sinX;
        a[1 * 4 + 3] = l3 * cosX + r3 * sinX;
        a[2 * 4 + 0] = r0 * cosX - l0 * sinX;
        a[2 * 4 + 1] = r1 * cosX - l1 * sinX;
        a[2 * 4 + 2] = r2 * cosX - l2 * sinX;
        a[2 * 4 + 3] = r3 * cosX - l3 * sinX;
    }
    /**
     * 绕y轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} ry
     */
    rotateY(ry)
    {
        var a = this.a;
        /*
            c, 0, -s, 0,
            0, 1, 0,  0,
            s, 0, c,  0,
            0, 0, 0,  1
        */
        var cosY = Math.cos(ry),
            sinY = Math.sin(ry),
            l0 = a[0 * 4 + 0],
            l1 = a[0 * 4 + 1],
            l2 = a[0 * 4 + 2],
            l3 = a[0 * 4 + 3],
            r0 = a[2 * 4 + 0],
            r1 = a[2 * 4 + 1],
            r2 = a[2 * 4 + 2],
            r3 = a[2 * 4 + 3];
        a[0 * 4 + 0] = l0 * cosY - r0 * sinY;
        a[0 * 4 + 1] = l1 * cosY - r1 * sinY;
        a[0 * 4 + 2] = l2 * cosY - r2 * sinY;
        a[0 * 4 + 3] = l3 * cosY - r3 * sinY;
        a[2 * 4 + 0] = r0 * cosY + l0 * sinY;
        a[2 * 4 + 1] = r1 * cosY + l1 * sinY;
        a[2 * 4 + 2] = r2 * cosY + l2 * sinY;
        a[2 * 4 + 3] = r3 * cosY + l3 * sinY;
    }
    /**
     * 绕z轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} rz
     */
    rotateZ(rz)
    {
        var a = this.a;
        /*
            c,  s, 0, 0,
            -s, c, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        */
        var cosZ = Math.cos(rz),
            sinZ = Math.sin(rz),
            l0 = a[0 * 4 + 0],
            l1 = a[0 * 4 + 1],
            l2 = a[0 * 4 + 2],
            l3 = a[0 * 4 + 3],
            r0 = a[1 * 4 + 0],
            r1 = a[1 * 4 + 1],
            r2 = a[1 * 4 + 2],
            r3 = a[1 * 4 + 3];
        a[0 * 4 + 0] = l0 * cosZ + r0 * sinZ;
        a[0 * 4 + 1] = l1 * cosZ + r1 * sinZ;
        a[0 * 4 + 2] = l2 * cosZ + r2 * sinZ;
        a[0 * 4 + 3] = l3 * cosZ + r3 * sinZ;
        a[1 * 4 + 0] = r0 * cosZ - l0 * sinZ;
        a[1 * 4 + 1] = r1 * cosZ - l1 * sinZ;
        a[1 * 4 + 2] = r2 * cosZ - l2 * sinZ;
        a[1 * 4 + 3] = r3 * cosZ - l3 * sinZ;
    }
    /**
     * 旋转矩阵(旋转顺序ZYX)
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {Mat4}
     */
    rotateZYX(rx, ry, rz)
    {
        this.rotateZ(rz);
        this.rotateY(ry);
        this.rotateX(rx);
        return this;
    }
    /**
     * 旋转矩阵(旋转顺序XYZ)
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {Mat4}
     */
    rotateXYZ(rx, ry, rz)
    {
        this.rotateX(rx);
        this.rotateY(ry);
        this.rotateZ(rz);
        return this;
    }
    /**
     * 旋转矩阵(旋转顺序ZXY)
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {Mat4}
     */
    rotateZXY(rx, ry, rz)
    {
        this.rotateZ(rz);
        this.rotateX(rx);
        this.rotateY(ry);
        return this;
    }
    /**
     * 旋转矩阵(旋转顺序YXZ)
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {Mat4}
     */
    rotateYXZ(rx, ry, rz)
    {
        this.rotateY(ry);
        this.rotateX(rx);
        this.rotateZ(rz);
        return this;
    }
    /**
     * 旋转矩阵(根据四元数旋转(右手螺旋))
     * 不会改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @param {number} rw
     * @returns {Mat4}
     */
    rotateQuatRH(rx, ry, rz, rw)
    {
        return this.multiply(Mat4.quaternionRH(rx, ry, rz, rw));
    }

    /**
     * 缩放矩阵
     * 将改变原矩阵
     * @param {number} sx
     * @param {number} sy
     * @param {number} sz
     * @returns {Mat4}
     */
    scale(sx, sy, sz)
    {
        for (var i = 0; i < 4; i++)
        {
            this.a[0 * 4 + i] *= sx;
            this.a[1 * 4 + i] *= sy;
            this.a[2 * 4 + i] *= sz;
        }
        return this;
    }

    /**
     * 乘v4向量
     * (矩阵 乘 向量)
     * @param {Vec4} v
     */
    mulV4(v)
    {
        var a = this.a;
        return new Vec4(
            (v.x * a[0]) + (v.y * a[1]) + (v.z * a[2]) + (v.w * a[3]),
            (v.x * a[4]) + (v.y * a[5]) + (v.z * a[6]) + (v.w * a[7]),
            (v.x * a[8]) + (v.y * a[9]) + (v.z * a[10]) + (v.w * a[11]),
            (v.x * a[12]) + (v.y * a[13]) + (v.z * a[14]) + (v.w * a[15])
        );
    }

    /**
     * 取左上角的Mat3矩阵
     * 新矩阵不会影响原矩阵
     * @returns {Mat3}
     */
    ltMat3()
    {
        var a = this.a;
        return new Mat3([
            a[0 * 4 + 0], a[0 * 4 + 1], a[0 * 4 + 2],
            a[1 * 4 + 0], a[1 * 4 + 1], a[1 * 4 + 2],
            a[2 * 4 + 0], a[2 * 4 + 1], a[2 * 4 + 2]
        ]);
    }
}

/**
 * 3轴向量类
 */
class Vec3
{
    /**
     * 向量中的第个1值
     * @type {number}
     */
    x;
    /**
     * 向量中的第个2值
     * @type {number}
     */
    y;
    /**
     * 向量中的第个3值
     * @type {number}
     */
    z;

    /**
     * @param {number} [x]
     * @param {number} [y]
     * @param {number} [z]
     */
    constructor(x = 0, y = 0, z = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * 归一化(使向量长度为1 不改变方向)
     * 不改变原向量
     * @returns {Vec3}
     */
    normalize()
    {
        var multiple = 1 / Math.hypot(this.x, this.y, this.z);
        if (multiple != Infinity)
            return new Vec3(
                this.x * multiple,
                this.y * multiple,
                this.z * multiple
            );
        else
            return new Vec3();
    }

    /**
     * 向量点乘
     * 不改变原向量
     * @param {Vec3} v
     * @returns {number}
     */
    dot(v)
    {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * 向量相加
     * 不改变原向量
     * @param {Vec3} v
     * @returns {Vec3}
     */
    add(v)
    {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * 向量相减
     * 不改变原向量
     * @param {Vec3} v
     * @returns {Vec3}
     */
    sub(v)
    {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * 向量叉乘
     * 不改变原向量
     * @param {Vec3} v
     * @returns {Vec3}
     */
    cross(v)
    {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    /**
     * 向量乘标量
     * @param {number} a
     * @returns {Vec3}
     */
    mulNum(a)
    {
        return new Vec3(this.x * a, this.y * a, this.z * a);
    }

    /**
     * 取三维向量的模(长度)
     * @returns {number}
     */
    len()
    {
        return Math.hypot(this.x, this.y, this.z);
    }

    /**
     * 乘以一个Mat4矩阵左上角的3*3矩阵
     * (向量 乘 矩阵)
     * @param {Mat4} m
     * @returns {Vec3}
     */
    mulPartOfM4(m)
    {
        var a = m.a;
        return new Vec3(
            (this.x * a[0]) + (this.y * a[4]) + (this.z * a[8]),
            (this.x * a[1]) + (this.y * a[5]) + (this.z * a[9]),
            (this.x * a[2]) + (this.y * a[6]) + (this.z * a[10])
        );
    }

    /**
     * 补全为Vec4后乘Mat4矩阵
     * 返回前三维组成的Vec3
     * 等效于与Mat4矩阵左上角Mat3相乘
     * (向量 乘 矩阵)
     * @param {Mat4} m
     * @returns {Vec3}
     */
    v4MulM4(m)
    {
        var a = m.a;
        return new Vec3(
            (this.x * a[0]) + (this.y * a[4]) + (this.z * a[8]) + a[12],
            (this.x * a[1]) + (this.y * a[5]) + (this.z * a[9]) + a[13],
            (this.x * a[2]) + (this.y * a[6]) + (this.z * a[10]) + a[14]
        );
    }

    /**
     * 取三维向量的模(长度)的平方
     * @returns {number}
     */
    lenSq()
    {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * 取两个向量的夹角
     * 单位为弧度
     * @param {Vec3} v
     * @returns {number}
     */
    angleTo(v)
    {
        var productOfLen = Math.sqrt(this.lenSq() + v.lenSq());
        if (productOfLen != 0)
            return Math.acos(this.dot(v) / productOfLen);
        else
            return Math.PI * 0.5;
    }

    /**
     * 欧拉角到方向向量
     * 单位弧度
     * [!]此方法可能存在错误
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Vec3}
     */
    static EulerToDirection(x, y, z)
    {
        return new Vec3(
            -((Math.cos(y) * Math.sin(x) * Math.sin(z)) + (Math.sin(y) * Math.cos(z))),
            (Math.cos(y) * Math.cos(z)) - (Math.sin(y) * Math.sin(x) * Math.sin(z)),
            Math.cos(x) * Math.sin(z)
        );
    }
}
/**
 * 通过数组构造一个v3类
 * @param {Array<number>} a
 */
function newV3(a)
{
    return new Vec3(a[0], a[1], a[2]);
}

/*
    文件引用自nFrame
*/

/**
 * 正向遍历数组   
 * 在回调中返回不为false或void的值主动结束遍历   
 * 主动结束遍历 并返回true   
 * 未主动结束遍历完全部内容 返回false   
 * @template T
 * @param {ArrayLike<T>} o
 * @param {function(T, number):(boolean | void)} callback
 * @returns {boolean}
 */
function forEach(o, callback)
{
    if (!o)
        return false;
    for (var i = 0, Li = o.length; i < Li; i++)
        if (o[i] != undefined && callback(o[i], i))
            return true;
    return false;
}

/**
 * 物体唯一编号计数
 * @type {number}
 */
var snCount = 0;
/**
 * 场景中的物体
 *  物体可以有需要渲染的面
 *  或不绑定面作为中间节点
 *  物体可以绑定到 相机 灯光 粒子
 */
class SceneObject
{
    /**
     * 坐标x(相对)
     * @package
     * @type {number}
     */
    x = 0;
    /**
     * 坐标y(相对)
     * @package
     * @type {number}
     */
    y = 0;
    /**
     * 坐标z(相对)
     * @package
     * @type {number}
     */
    z = 0;
    /**
     * 四元数x(相对旋转)
     * @package
     * @type {number}
     */
    rx = 0;
    /**
     * 四元数y(相对旋转)
     * @package
     * @type {number}
     */
    ry = 0;
    /**
     * 四元数z(相对旋转)
     * @package
     * @type {number}
     */
    rz = 0;
    /**
     * 四元数w(相对旋转)
     * @package
     * @type {number}
     */
    rw = 1;
    /**
     * x轴缩放(相对)
     * @package
     * @type {number}
     */
    sx = 1;
    /**
     * y轴缩放(相对)
     * @package
     * @type {number}
     */
    sy = 1;
    /**
     * z轴缩放(相对)
     * @package
     * @type {number}
     */
    sz = 1;

    /**
     * 世界矩阵
     * @package
     * @type {Mat4}
     */
    wMat = new Mat4();

    /**
     * 局部矩阵
     * @private
     * @type {Mat4}
     */
    lMat = new Mat4();

    /**
     * 子节点
     * @package
     * @type {Array<SceneObject>}
     */
    c = null;

    /**
     * 父节点
     * @package
     * @type {SceneObject}
     */
    parent = null;

    /**
     * 物体所在的场景
     * @package
     * @type {import("./Scene").Scene}
     */
    scene = null;

    /**
     * 绘制此物体使用的着色器组(渲染程序)
     * 此属性暂时未使用
     * @package
     * @type {import("../shader/GlslProgram").GlslProgram}
     */
    program = null;

    /**
     * 物体id
     * @package
     * @type {string}
     */
    id = "";

    /**
     * 物体的唯一编号
     * 正常时为非负整数
     * 与worker中的对应
     * @package
     * @type {number}
     */
    sn = -1;

    /**
     * [gl]面数据
     * @package
     * @type {import("./ObjFaces").ObjFaces}
     */
    faces = null;

    /**
     * 附加数据
     * 如物理引擎的数据等
     * @package
     * @type {Object<symbol | string, any>}
     */
    addi = {};

    /**
     * 包围球半径
     * 包围球中心为局部原点
     * @package
     * @type {number}
     */
    boundingSphereR = -1;

    /**
     * 矩阵需要更新
     * 防止反复计算没有移动的物体
     * @package
     * @type {boolean}
     */
    needUpdate = true;

    /**
     * setPosition回调
     * @package
     * @type {function(SceneObject): void}
     */
    spCB = null;


    constructor()
    {
        this.sn = snCount++;
        this.updateCMat();
    }


    /**
     * 遍历设置物体所在的场景
     * 若此节点的场景不需要改变则不继续向下
     * @package
     * @param {import("./Scene").Scene} scene
     */
    setScene(scene)
    {
        if (this.scene == scene) // 无需向下
            return;
        if (this.scene)
        { // 清除原区域中的关联
            scene.snMap.delete(this.sn);
            if (this.id)
                this.scene.idMap.delete(this.id);
        }
        this.scene = scene;
        if (scene)
        { // 在新区域中建立关联
            scene.snMap.set(this.sn, this);
            if (this.id)
                scene.idMap.set(this.id, this);
        }
        if (this.c) // 遍历子节点
            forEach(this.c, (o) => { o.setScene(scene); });
    }

    /**
     * 添加子节点
     * @param {SceneObject} o
     */
    addChild(o)
    {
        if (!this.c)
            this.c = [];
        o.setScene(this.scene);
        o.parent = this;
        o.needUpdate = true;
        this.c.push(o);
    }

    /**
     * 从所在场景中删除此节点
     */
    remove()
    {
        var parentC = this.parent.c;
        for (var i = 0, Li = parentC.length; i < Li; i++)
            if (parentC[i] == this)
            {
                parentC.splice(i, 1);
                break;
            }
        this.setScene(null);
    }

    /**
     * 更新世界矩阵
     * 若此物体需要更新
     * @package
     */
    updateCMat()
    {
        if (this.needUpdate) // 需要更新
        {
            this.lMat = new Mat4().
                translation(this.x, this.y, this.z). // 平移
                rotateQuatRH(this.rx, this.ry, this.rz, this.rw). // 旋转
                scale(this.sx, this.sy, this.sz); // 缩放
            if (this.parent)
                this.wMat = this.parent.wMat.multiply(this.lMat);
            else // 根节点
                this.wMat = this.lMat;
        }
        if (this.c) // 递归子节点
            this.c.forEach(o =>
            {
                if (this.needUpdate) // 若此节点需要更新
                    o.needUpdate = true; // 子节点也需要更新
                o.updateCMat();
            });
        this.needUpdate = false; // 标记无需更新
    }

    /**
     * 获取世界坐标
     * 需要先更新矩阵
     * @returns {Vec3} xyz为坐标
     */
    getWorldPos()
    {
        var wMat = this.wMat;
        return new Vec3(wMat.a[12], wMat.a[13], wMat.a[14]);
    }

    /**
     * 获取世界视图投影矩阵
     * 只包含旋转和缩放没有平移
     * 需要先更新矩阵
     * @returns {Mat4}
     */
    getWorldViewProjectionMat()
    {
        var ret = this.wMat.copy();
        ret.a[12] = ret.a[13] = ret.a[14] = 0;
        return ret;
    }

    /**
     * 更新当前物体的面的包围球
     * 需要先更新矩阵
     * @package
     */
    updateBoundingSphere()
    {
        if (this.boundingSphereR < 0) // 若没有生成包围圈
        {
            var pos = this.faces.pos;
            var wvpMat = this.getWorldViewProjectionMat();
            var maxR = 0; // 未缩放前的包围球大小
            for (var i = 0; i < pos.length; i += 3) // 枚举每个顶点 取距离局部原点的最大距离
                maxR = Math.max(maxR, Math.hypot(pos[i], pos[i + 1], pos[i + 2]));
            var scaling = Math.max(
                Math.hypot(wvpMat.a[0], wvpMat.a[4], wvpMat.a[8]),
                Math.hypot(wvpMat.a[1], wvpMat.a[5], wvpMat.a[9]),
                Math.hypot(wvpMat.a[2], wvpMat.a[6], wvpMat.a[10])
            ); // 缩放比例
            this.boundingSphereR = maxR * scaling;
        }
    }

    /**
     * 设置坐标
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.needUpdate = true;
        if (this.spCB)
            this.spCB(this);
    }

    /**
     * 设置旋转(四元数)
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @param {number} rw
     */
    setRotation(rx, ry, rz, rw)
    {
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.rw = rw;
        this.needUpdate = true;
        if (this.spCB)
            this.spCB(this);
    }

    /**
     * 设置缩放
     * @param {number} sx
     * @param {number} sy
     * @param {number} sz
     */
    setScale(sx, sy, sz)
    {
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.needUpdate = true;
    }
}

/**
 * [gl]glsl着色器程序封装
 * 包括一个顶点着色器和一个片段着色器
 */
class GlslProgram
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * @type {WebGLProgram}
     */
    progra = null;

    /**
     * uniform变量表
     * uniform名 到 uniform位置 映射
     * @type {Object<string, WebGLUniformLocation>}
     */
    unif = Object.create(null);

    /**
     * @param {WebGL2RenderingContext} gl webgl上下文
     * @param {string} vertexShader 顶点着色器源码
     * @param {string} fragmentShader 片段着色器源码
     */
    constructor(gl, vertexShader, fragmentShader)
    {
        this.gl = gl;
        this.progra = gl.createProgram(); // 创建渲染程序

        gl.attachShader(this.progra, // 绑定顶点着色器
            createShader(gl, vertexShader, gl.VERTEX_SHADER) // 编译顶点着色器
        );
        gl.attachShader(this.progra, // 绑定片段着色器
            createShader(gl, fragmentShader, gl.FRAGMENT_SHADER) // 编译片段着色器
        );

        gl.linkProgram(this.progra); // 链接渲染程序

        if (!gl.getProgramParameter(this.progra, gl.LINK_STATUS)) // 如果获取不到链接状态
        {
            var info = gl.getProgramInfoLog(this.progra);
            throw "Could not link WebGL program:\n" + info;
        }
    }

    /**
     * 使用一个渲染程序(切换到此渲染程序)
     */
    use()
    {
        this.gl.useProgram(this.progra);
    }

    /**
     * 删除一个渲染程序(释放内存)
     */
    deleteProgram()
    {
        this.gl.deleteProgram(this.progra);
    }

    /**
     * 设置着色器的uniform Matrix4值(32位浮点数)
     * @param {string} name 
     * @param {Float32Array | Array<number>} value 
     */
    uniformMatrix4fv(name, value)
    {
        if (this.unif[name] === undefined)
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniformMatrix4fv(this.unif[name], false, value);
    }

    /**
     * 设置着色器的uniform Matrix3值(32位浮点数)
     * @param {string} name 
     * @param {Float32Array | Array<number>} value 
     */
    uniformMatrix3fv(name, value)
    {
        if (this.unif[name] === undefined)
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniformMatrix3fv(this.unif[name], false, value);
    }

    /**
     * 设置着色器的uniform Matrix4值(32位浮点数)
     * 开启转置
     * @param {string} name 
     * @param {Float32Array | Array<number>} value 
     */
    uniformMatrix4fv_tr(name, value)
    {
        if (this.unif[name] === undefined)
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniformMatrix4fv(this.unif[name], true, value);
    }

    /**
     * 设置着色器的3维向量值(32位浮点数)
     * @param {string} name
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    uniform3f(name, x, y, z)
    {
        if (this.unif[name] === undefined)
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniform3f(this.unif[name], x, y, z);
    }

    /**
     * 设置着色器的4维向量值(32位浮点数)
     * @param {string} name
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     */
    uniform4f(name, x, y, z, w)
    {
        if (this.unif[name] === undefined)
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniform4f(this.unif[name], x, y, z, w);
    }
}

/**
 * 创建(编译)一个着色器
 * @param {WebGL2RenderingContext} gl webgl上下文
 * @param {string} sourceCode 着色器源码
 * @param {number} type 着色器类型 gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER
 * @returns {WebGLShader}
 */
function createShader(gl, sourceCode, type)
{
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))  // 如果获取不到编译状态
    {
        var info = gl.getShaderInfoLog(shader);
        throw "Could not compile WebGL program:\n" + info;
    }
    return shader;
}

/**
 * 实例化绘图
 * 使用实例化方法一次绘制多个带有相同面数据的物体
 *  + 此方法不会绘制子节点
 *  + 此方法不会检查绘制物体面数据是否相同
 * @param {WebGL2RenderingContext} gl
 * @param {Array<SceneObject>} objeArr 绘制的物体列表
 * @param {Render} render
 */
function instantiatedDraw(gl, objeArr, render)
{
    // TODO 优化实例化绘图
    let program = render.scene.ct.shaderProgramManage.getProgram(["color", "instantiated"]);
    program.use(); // 切换着色器组(渲染程序)
    program.uniformMatrix4fv("u_cameraMatrix", render.cMat.a); // 设置相机矩阵
    gl.colorMask(true, true, true, true); // 允许写入颜色
    gl.depthMask(true); // 允许写入深度

    var faces = objeArr[0].faces; // 面数据

    {
        gl.bindVertexArray(render.pool.getInstanceVao(faces, Date.now())); // 绑定顶点数组(切换当前正在操作的顶点数组)

        const matrixData = new Float32Array(objeArr.length * 16); // 每个物体一个矩阵 一个矩阵16个浮点数

        objeArr.forEach((/** @type {{ wMat: { a: ArrayLike<number>; }; }} */ o, /** @type {number} */ i) => matrixData.set(o.wMat.a, i * 16)); // 设置矩阵数据

        const matrixLoc = gl.getAttribLocation(program.progra, "u_worldMatrix");
        const matrixBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);

        const bytesPerMatrix = 4 * 16;
        for (let i = 0; i < 4; i++)
        {
            const loc = matrixLoc + i;
            gl.enableVertexAttribArray(loc);

            const offset = i * 16;
            gl.vertexAttribPointer(
                loc,
                4,
                gl.FLOAT,
                false,
                bytesPerMatrix,
                offset,
            );

            gl.vertexAttribDivisor(loc, 1);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);
    }

    if (faces.tex) // 如果有纹理
        faces.tex.bindTexture(0); // 绑定纹理
    gl.drawArraysInstanced(faces.mode, 0, faces.posLen, objeArr.length); // 绘制数据(实例化绘制多个物体)
}

/**
 * 视锥剔除判断
 * @param {import("../scene/SceneObject").SceneObject} obje 物体
 * @param {Vec3} bsPos 物体的包围球中心相对相机坐标(不含投影)
 * @param {number} fov 相机的(对角线)角视场 单位为弧度
 * @returns {boolean} 返回true则剔除
 */
function coneCull(obje, bsPos, fov)
{
    obje.updateBoundingSphere(); // 更新包围球半径
    /*
        ndzda推导的球与圆锥不相交的保守剔除原始判断公式
        圆锥沿着z轴向负方向扩展
        if (arccos(-z / len(x, y, z)) - Fov / 2 < Math.PI / 2)
            (sin(arccos(-z / len(x, y, z)) - Fov / 2) * len(x, y, z) >= r) or (z >= r)
        else
            len(x, y, z) >= r;
    */
    if (bsPos.z >= obje.boundingSphereR)
        return true;
    var bsLen = bsPos.len(); // 球心和原点距离
    var angle = Math.acos(-bsPos.z / bsLen) - fov * 0.5; // 原点到球心与圆锥在对应方向母线的夹角
    if (angle < Math.PI / 2)
        return (Math.sin(angle) * bsLen >= obje.boundingSphereR);
    else
        return bsLen >= obje.boundingSphereR;
}

/**
 * 遮挡剔除查询标志
 * 将 遮挡查询使用的WebGLQuery 绑定到ObjFaces上
 */
const querySymbol = Symbol("querySymbol");
/**
 * 遮挡剔除查询正在进行标志
 * 将 遮挡查询是否正在进行boolean 绑定到ObjFaces上
 */
const queryInProgressSymbol = Symbol("queryInProgressSymbol");
/**
 * 遮挡剔除判断
 * 在执行遮挡剔除判断前应该按照近到远排序
 * 注意: 此遮挡判断方案在大多数场景中并不能起到优化作用
 * 注意: 执行此函数会关闭颜色和深度写入
 * @param {import("../scene/SceneObject").SceneObject} obje
 * @param {WebGL2RenderingContext} gl
 * @param {Mat4} cMat
 */
function occlusionCull(obje, gl, cMat)
{
    var boundingBoxProgram = obje.scene.ct.program.white;
    var faces = obje.faces;

    gl.colorMask(false, false, false, false); // 关闭颜色写入
    gl.depthMask(false); // 关闭深度缓冲写入

    boundingBoxProgram.use(); // 使用绘制包围体的着色器
    gl.bindVertexArray(faces.vao); // 绑定对象顶点数组(或包围体顶点数组)
    boundingBoxProgram.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
    boundingBoxProgram.uniformMatrix4fv("u_cameraMatrix", cMat.a); // 设置相机矩阵

    if (faces[queryInProgressSymbol] && gl.getQueryParameter(faces[querySymbol], gl.QUERY_RESULT_AVAILABLE)) // 查询已进行 且 结果可用
    {
        faces.occluded = !gl.getQueryParameter(faces[querySymbol], gl.QUERY_RESULT); // 获取遮挡结果
        faces[queryInProgressSymbol] = false; // 设置为查询未进行
    }
    if (!faces[queryInProgressSymbol]) // 查询未进行
    {
        if (!faces[querySymbol]) // 没有webgl查询对象则创建
            faces[querySymbol] = gl.createQuery();
        gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, faces[querySymbol]); // 启动异步查询 保守查询遮挡
        gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制顶点 此处绘制的内容将被查询
        gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE); // 结束查询
        faces[queryInProgressSymbol] = true; // 设置为查询进行中
    }

    return faces.occluded;
}

/**
 * 渲染器封装类
 * (此类基于webgl渲染)
 * Renderer
 */
class Render
{
    /**
     * 渲染池
     * 所有渲染器类共用
     * @type {RenderPool}
     */
    pool = null;

    /**
     * 渲染列表
     * 通过场景树生成得到
     * 若成员为一个数组 表示有相同的面数据 将进行实例化渲染
     * @type {Array<SceneObject | Array<SceneObject>>}
     */
    rList = [];

    /**
     * 绑定的webgl上下文
     * @private
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 当前渲染器使用的着色器
     * @type {GlslProgram}
     */
    program = null;

    /**
     * 相机投影矩阵
     *  + 含变换坐标到相对相机坐标
     *  + 含投影矩阵
     * @type {Mat4}
     */
    cMat = new Mat4();

    /**
     * 绑定的场景
     * @package
     * @type {import("../scene/Scene").Scene}
     */
    scene = null;

    /**
     * 判断函数
     * 渲染时对于每个遍历到的物体调用进行判断
     * 要求返回一个标志位整数表示判断结果
     *  + &1 不渲染此物体的面
     *  + &2 不遍历此物体的子节点
     * @type {function(SceneObject) : number}
     */
    judge = null;

    /**
     * 开启遮挡剔除
     * 通常不建议开启 可能使性能降低
     * @type {boolean}
     */
    occlusion = false;


    /**
     * @param {import("../scene/Scene").Scene} scene
     * @param {GlslProgram} program
     */
    constructor(scene, program)
    {
        this.scene = scene;
        this.gl = scene.gl;
        this.program = program;
        this.pool = scene.ct.renderPool;
    }

    /**
     * 执行渲染
     * @param {function(GlslProgram): void} [cb] 切换着色器后调用此回调
     */
    render(cb)
    {
        this.scene.obje.updateCMat(); // 更新场景中物体的矩阵
        trRList(this.scene.obje, this.rList, this.judge); // 得到渲染列表
        this.draw(cb); // 绘制图像
        this.pool.clear(Date.now()); // 清理缓存
    }


    /**
     * 绘图
     * 将渲染列表中的物体绘制出来
     * 不遍历子节点
     * @private
     * @param {function(GlslProgram): void} [cb] 切换着色器后调用此回调
     */
    draw(cb)
    {
        var gl = this.gl;

        gl.colorMask(true, true, true, true); // 允许写入颜色
        gl.depthMask(true); // 允许写入深度
        gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // 清除画布颜色和深度缓冲区

        this.program.use(); // 切换着色器组(渲染程序)
        this.program.uniformMatrix4fv("u_cameraMatrix", this.cMat.a); // 设置相机矩阵
        if (cb)
            cb(this.program);

        this.rList.forEach(obje => // 遍历渲染列表
        {
            if (obje instanceof SceneObject) // 单个物体
            {
                if (this.occlusion && occlusionCull(obje, gl, this.cMat)) // 遮挡剔除
                    return;
                this.program.use(); // 切换着色器组(渲染程序)
                gl.colorMask(true, true, true, true); // 允许写入颜色
                gl.depthMask(true); // 允许写入深度

                var faces = obje.faces; // 面数据

                this.program.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
                this.program.uniformMatrix3fv("u_normalMatrix", obje.wMat.ltMat3().inverse().transpose().a); // 设置法线矩阵
                if (faces.tex) // 如果有纹理
                    faces.tex.bindTexture(0); // 绑定纹理
                gl.bindVertexArray(this.pool.getVao(faces, Date.now())); // 绑定顶点数组(切换当前正在操作的顶点数组)
                if (faces.ind)
                    gl.drawElements(faces.mode, faces.ind.length, gl.UNSIGNED_INT, 0); // 绘制数据(使用索引数组)
                else
                    gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制数据
            }
            else // 实例化绘图
                instantiatedDraw(gl, obje, this);
        });
    }
}

/**
 * 遍历场景树
 * 获取渲染列表
 * @param {SceneObject} sObj 场景树根节点
 * @param {Array<SceneObject | Array<SceneObject>>} rList 将自动清空此数组 将结果放入此数组
 * @param {function(SceneObject):number} [judge] 判定函数 按照Render类中judge的描述
 */
function trRList(sObj, rList, judge)
{
    rList.length = 0; // 清空渲染列表

    /**
     * 实例化map
     * 面数据 到 使用此面数据的物体列表
     * @type {Map<ObjFaces, Array<SceneObject>>}
    */
    var instanceMap = new Map();
    /**
     * 遍历
     * @param {SceneObject} obje 
     */
    const tr = (obje) =>
    {
        /**
         * 标志位
         * 用于阻止一些操作
         */
        var flag = (judge ? judge(obje) : 0);

        var faces = obje.faces; // 面数据
        if ((!(flag & 1)) && faces) // 如果有 面数据
        {
            var instanceArr = instanceMap.get(faces);
            if (!instanceArr)
                instanceMap.set(faces, (instanceArr = []));
            instanceArr.push(obje);
        }

        if ((!(flag & 2)) && obje.c) // 递归子节点
            obje.c.forEach(tr);
    };
    tr(sObj);

    instanceMap.forEach(o =>
    {
        if (o.length == 1)
            rList.push(o[0]);
        else if (o.length > 1)
            rList.push(o); // 实例化绘图
        // o.forEach(e => { rList.push(e); });
    });
}

/**
 * 纹理类
 */
class Texture
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 纹理对象
     * @type {WebGLTexture}
     */
    tex = null;

    /**
     * 创建纹理
     * 默认颜色纹理为 1*1-纯色-rgb(0,255,255)
     * @param {WebGL2RenderingContext} gl
     * @param {WebGLTexture} [texture] 纹理对象 传递以进行封装
     */
    constructor(gl, texture)
    {
        this.gl = gl;
        if (!texture)
        { // 默认纹理
            texture = gl.createTexture(); // 创建纹理
            gl.bindTexture(gl.TEXTURE_2D, texture); // 绑定纹理(切换正在操作为当前纹理)
            gl.texImage2D( // 图片未加载完成时的纹理
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.RGBA, // 纹理颜色组件
                1, // 宽
                1, // 高
                0, // 边框宽度(遗留属性,必须为0)
                gl.RGBA, // 数据格式
                gl.UNSIGNED_BYTE, // 数据类型
                new Uint8Array([0, 255, 255, 255]) // 图像源
            ); // 填充初始色
        }
        this.tex = texture;
    }

    /**
     * 通过图像的url创建纹理
     * @param {WebGL2RenderingContext} gl
     * @param {string} url
     * @returns {Texture}
     */
    static fromImageUrl(gl, url)
    {
        var ret = new Texture(gl);
        var image = new Image();
        image.src = url; // 加载图片
        image.addEventListener("load", () => // 图片加载完
        {
            gl.bindTexture(gl.TEXTURE_2D, ret.tex); // 绑定纹理(切换正在操作为当前纹理)
            gl.texImage2D( // 将纹理设置为此图片
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.RGBA, // 纹理颜色组件
                gl.RGBA, // 数据格式
                gl.UNSIGNED_BYTE, // 数据类型
                image // 图像源
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); // 设置镜像重复
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT); // 设置镜像重复
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // mipmap设置(绘制的面大于贴图时)只选取1个像素
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // mipmap设置(绘制的面大于贴图时)混合原贴图的4个像素
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // mipmap设置(绘制的面小于贴图时)混合两个贴图每个选取4个像素
            gl.generateMipmap(gl.TEXTURE_2D); // 生成mipmap纹理
        });
        return ret;
    }

    /**
     * 通过视频的url创建纹理
     * @param {WebGL2RenderingContext} gl
     * @param {string} url
     * @returns {Texture}
     */
    static fromVideoUrl(gl, url)
    {
        var ret = new Texture(gl);
        var video = document.createElement("video");
        video.src = url; // 加载视频
        video.addEventListener("loadeddata", () => // 视频加载完
        {
            video.play();
            gl.bindTexture(gl.TEXTURE_2D, ret.tex); // 绑定纹理(切换正在操作为当前纹理)
            gl.texImage2D( // 将纹理设置为此视频
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.RGBA, // 纹理颜色组件
                gl.RGBA, // 数据格式
                gl.UNSIGNED_BYTE, // 数据类型
                video // 图像源
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); // 设置镜像重复
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT); // 设置镜像重复
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // mipmap设置(绘制的面大于贴图时)只选取1个像素
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // mipmap设置(绘制的面大于贴图时)混合原贴图的4个像素
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // mipmap设置(绘制的面小于贴图时)混合两个贴图每个选取4个像素
            gl.generateMipmap(gl.TEXTURE_2D); // 生成mipmap纹理
            var updateTexture = () => // 更新纹理
            {
                gl.bindTexture(gl.TEXTURE_2D, ret.tex); // 绑定纹理(切换正在操作为当前纹理)
                gl.texImage2D( // 将纹理设置为此视频
                    gl.TEXTURE_2D, // 二维纹理贴图
                    0, // 基本图形等级
                    gl.RGBA, // 纹理颜色组件
                    gl.RGBA, // 数据格式
                    gl.UNSIGNED_BYTE, // 数据类型
                    video // 图像源
                );
                gl.generateMipmap(gl.TEXTURE_2D); // 重新生成mipmap纹理
            };
            var intervalId = setInterval(updateTexture, 25);
            video.addEventListener("ended", () => { clearInterval(intervalId); });
        });
        return ret;
    }

    /**
     * 绑定纹理(到指定编号的纹理单元)
     * @param {number} ind
     */
    bindTexture(ind)
    {
        this.gl.activeTexture(this.gl.TEXTURE0 + ind); // 使用第ind纹理单元
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex); // 绑定纹理(切换正在操作为当前纹理)
    }
}

/**
 * 渲染到纹理
 * 帧缓冲区封装
 */
class Render2Texture
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /** 纹理宽度 @type {number} */
    textureWidth = 0;
    /** 纹理高度 @type {number} */
    textureHeight = 0;

    /**
     * 帧缓冲区
     * @type {WebGLFramebuffer}
    */
    frameBuffer = null;

    /**
     * 颜色纹理
     * @type {Texture}
     */
    colorTex = null;
    /**
     * 深度纹理
     * @type {Texture}
     */
    depthTex = null;

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {number} textureWidth
     * @param {number} textureHeight
     * @param {boolean} useColorTexture 使用颜色缓冲
     * @param {boolean} useDepthTexture 使用深度缓冲
     */
    constructor(gl, textureWidth, textureHeight, useColorTexture = true, useDepthTexture = true)
    {
        this.gl = gl;
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;

        var frameBuffer = gl.createFramebuffer(); // 创建帧缓冲
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer); // 绑定帧缓冲
        this.frameBuffer = frameBuffer;

        if (useColorTexture)
        { // 颜色
            let colorTexture = gl.createTexture(); // 创建颜色纹理
            gl.bindTexture(gl.TEXTURE_2D, colorTexture); // 绑定颜色纹理
            gl.texImage2D(
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.RGBA, // 纹理颜色组件
                textureWidth, // 宽
                textureHeight, // 高
                0, // 边框宽度(遗留属性,必须为0)
                gl.RGBA, // 数据格式
                gl.UNSIGNED_BYTE, // 数据类型
                null // 图像源
            );

            // 设置过滤 不需要使用贴图
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.framebufferTexture2D( // 附加纹理为第一个颜色附件
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                colorTexture,
                0
            );

            this.colorTex = new Texture(gl, colorTexture);
        }

        if (useDepthTexture)
        { // 深度缓冲
            let depthTexture = gl.createTexture(); // 创建深度纹理
            gl.bindTexture(gl.TEXTURE_2D, depthTexture); // 绑定深度纹理
            gl.texImage2D(
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.DEPTH_COMPONENT32F, // 纹理颜色组件
                textureWidth, // 宽
                textureHeight, // 高
                0, // 边框宽度(遗留属性,必须为0)
                gl.DEPTH_COMPONENT, // 数据格式
                gl.FLOAT, // 数据类型
                null // 图像源
            );

            // 设置过滤 不需要使用贴图
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.framebufferTexture2D( // 将深度纹理附加到缓冲帧
                gl.FRAMEBUFFER,
                gl.DEPTH_ATTACHMENT,
                gl.TEXTURE_2D,
                depthTexture,
                0
            );

            this.depthTex = new Texture(gl, depthTexture);
        }
    }

    /**
     * 绑定到此帧缓冲区
     * 之后的渲染将在此帧缓冲区执行
     */
    bindFramebuffer()
    {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.viewport(0, 0, this.textureWidth, this.textureHeight);
    }

    /**
     * 绘制此帧缓冲区到屏幕
     * 可用于调试
     * 仅绘制颜色缓冲区
     * 禁用抗锯齿
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @param {number} [srcX0]
     * @param {number} [srcY0]
     * @param {number} [srcX1]
     * @param {number} [srcY1]
     */
    drawToScreen(x0, y0, x1, y1, srcX0 = 0, srcY0 = 0, srcX1 = this.textureWidth, srcY1 = this.textureHeight)
    {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.viewport(0, 0, this.textureWidth, this.textureHeight);
        this.gl.blitFramebuffer(
            srcX0, srcY0, srcX1, srcY1,
            x0, y0, x1, y1,
            this.gl.COLOR_BUFFER_BIT, this.gl.NEAREST
        );
    }
}

/**
 * 角度转弧度因数
 * @type {number}
 */
const degToRad = Math.PI / 180;

/**
 * 相机类
 * 透视投影相机
 * 需要绑定到 场景类 和 webgl上下文
 */
class Camera
{
    /**
     * 相机坐标x
     * @type {number}
     */
    x = 0;
    /**
     * 相机坐标y
     * @type {number}
     */
    y = 0;
    /**
     * 相机坐标z
     * @type {number}
     */
    z = 0;
    /**
     * 相机x轴旋转
     * @type {number}
     */
    rx = 0;
    /**
     * 相机y轴旋转
     * @type {number}
     */
    ry = 0;
    /**
     * 相机z轴旋转
     * @type {number}
     */
    rz = 0;
    /**
     * 相机视角场
     * 单位为弧度
     * 对角线fov
     * @type {number}
     */
    fov = degToRad * 125;
    /**
     * 视锥最近面距离
     * @type {number}
     */
    near = 0.1;
    /**
     * 视锥最远面距离
     * @type {number}
     */
    far = 5000;



    /**
     * 不含投影的相机矩阵
     * 仅变换坐标到相对相机坐标 不含投影矩阵
     * @private
     * @type {Mat4}
     */
    npMat = new Mat4();

    /**
     * 相机投影矩阵
     *  + 含变换坐标到相对相机坐标
     *  + 含投影矩阵
     * @private
     * @type {Mat4}
     */
    cMat = new Mat4();

    /**
     * 判断函数
     * 渲染时对于每个遍历到的物体调用进行判断
     * 要求返回一个标志位整数表示判断结果
     *  + &1 不渲染此物体的面
     *  + &2 不遍历此物体的子节点
     * @type {function(import("../scene/SceneObject").SceneObject): number}
     */
    judge = null;

    /**
     * 灯光列表
     * @type {Array<Light>}
     */
    lights = [];


    /**
     * @param {import("../scene/Scene").Scene} scene
     */
    constructor(scene)
    {
        this.scene = scene;
        this.gl = scene.gl;


        this.render = new Render(scene, scene.ct.shaderProgramManage.getProgram(["color"]));
        this.render.judge = (obje =>
        {
            if (obje.faces)
            {
                var worldPos = obje.getWorldPos(); // 世界坐标
                var cameraSpatialPos = worldPos.v4MulM4(this.npMat); // 相机(不包含投影)空间坐标 (相对相机坐标)
                if (coneCull(obje, cameraSpatialPos, this.fov)) // 视锥剔除
                    return 1;
                if (cameraSpatialPos.len() > 1000) // 远距离剔除
                    return 1;
            }
            return 0;
        });
    }

    /**
     * 绘制场景
     * 先进行一些设置 然后调用递归渲染
     */
    draw()
    {
        this.npMat = new Mat4(). // 新矩阵
            rotateZXY(-this.rx, -this.ry, -this.rz). // 反向旋转
            translation(-this.x, -this.y, -this.z); // 反向平移
        this.cMat = Mat4.perspective(this.fov, this.gl.canvas.clientHeight / this.gl.canvas.clientWidth, this.near, this.far). // 透视投影矩阵
            rotateZXY(-this.rx, -this.ry, -this.rz). // 反向旋转
            translation(-this.x, -this.y, -this.z); // 反向平移
        this.render.cMat = this.cMat; // 设置渲染器的相机矩阵

        this.gl.enable(this.gl.CULL_FACE); // (三角形方向)面剔除
        this.gl.cullFace(this.gl.BACK); // 剔除背面 渲染正面
        this.render.render(program => // 渲染
        { // 设置着色器uniform
            program.uniform3f("u_viewPos", this.x, this.y, this.z); // 视点坐标(相机坐标)
            this.gl.uniform1i(this.gl.getUniformLocation(program.progra, "u_texture"), 0);  // 纹理单元 0
            this.gl.uniform1i(this.gl.getUniformLocation(program.progra, "u_texS"), 1);  // 纹理单元 1
            if (this.lights[0])
            {
                this.lights[0].shadowTex.depthTex.bindTexture(1); // 绑定阴影贴图
                program.uniformMatrix4fv("u_lightMat", this.lights[0].cMat.a); // 设置灯光投影
                program.uniform3f("u_lightPos", this.x, this.y, this.z); // 设置灯光坐标
            }
        });
    }
}

/**
 * 场景类
 * 需要绑定到 本引擎上下文(包括webgl上下文)
 * 记录场景中的 物体 灯光 粒子
 */
class Scene
{
    /**
     * 物体树
     * 此对象为根节点
     * @type {SceneObject}
     */
    obje = null;
    /**
     * 场景中物体id与物品对象的对应map
     * @package
     * @type {Map<string, SceneObject>}
     */
    idMap = new Map();
    /**
     * 场景中物体sn与物品对象的对应map
     * @package
     * @type {Map<number, SceneObject>}
     */
    snMap = new Map();
    /**
     * 绑定的webgl上下文
     * @package
     * @type {WebGL2RenderingContext}
     */
    gl = null;
    /**
     * 绑定的引擎上下文
     * @package
     * @type {import("../SEContext").SEContext}
     */
    ct = null;

    /**
     * @param {import("../SEContext").SEContext} ct
     */
    constructor(ct)
    {
        this.ct = ct;
        this.gl = ct.gl;
        
        this.obje = new SceneObject();
        this.obje.scene = this;
    }

    /**
     * 添加物体
     * @param {SceneObject} o
     */
    addChild(o)
    {
        this.obje.addChild(o);
    }

    createCamera()
    {
        return new Camera(this);
    }
}

/**
 * 着色器使用到的变量信息
 * ShaderBuilderUse
 */
class SBUse
{
    /**
     * 此函数需要的uniform参数列表
     * 参数名到参数类型的映射
     * @type {Map<string, import("./SBStatement").SBStatement>}
     */
    uniform = new Map();
    /**
     * 此函数需要的in参数列表
     * 参数名到参数类型的映射
     * @type {Map<string, import("./SBStatement").SBStatement>}
     */
    in = new Map();
    /**
     * 此函数需要的out参数列表
     * 参数名到参数类型的映射
     * @type {Map<string, import("./SBStatement").SBStatement>}
     */
    out = new Map();
    /**
     * 引用的函数名集合
     * @type {Set<string>}
     */
    referenceFunction = new Set();

    /**
     * 复制此SBUse
     * @returns {SBUse}
     */
    copy()
    {
        var ret = new SBUse();
        ret.mix(this);
        return ret;
    }

    /**
     * 将另一个SBUse的需求混合到此SBUse
     * 会改变此SBUse
     * @param {SBUse} a
     */
    mix(a)
    {
        mixMap(this.uniform, a.uniform);
        mixMap(this.in, a.in);
        mixMap(this.out, a.out);
        a.referenceFunction.forEach(o => { this.referenceFunction.add(o); });
    }

    /**
     * 添加uniform参数
     * @param {string} name 参数名
     * @param {import("./SBStatement").SBStatement} statement 参数定义语句
     */
    addUniform(name, statement)
    {
        this.uniform.set(name, statement);
    }

    /**
     * 添加in参数
     * @param {string} name 参数名
     * @param {import("./SBStatement").SBStatement} statement 参数定义语句
     */
    addIn(name, statement)
    {
        this.in.set(name, statement);
    }

    /**
     * 添加out参数
     * @param {string} name 参数名
     * @param {import("./SBStatement").SBStatement} statement 参数定义语句
     */
    addOut(name, statement)
    {
        this.out.set(name, statement);
    }

    /**
     * 添加引用的函数
     * @param {string} functionName
     */
    addReferenceFunction(functionName)
    {
        this.referenceFunction.add(functionName);
    }
}

/**
 * 将b混合到a
 * @param {Map} a
 * @param {Map} b
 */
function mixMap(a, b)
{
    b.forEach((value, key) =>
    {
        var v = a.get(key);
        if (v == undefined)
            a.set(key, value);
        else if (v != value)
            throw "SBUse(ShaderBuilderUse) error: An error occurred while mixing requirements";
    });
}

/**
 * 着色器构建器语句
 * ShaderBuilderStatement
 */
class SBStatement
{
    /**
     * 前缀字符串
     * @type {string}
     */
    prefixString = "";
    /**
     * 后缀字符串
     * @type {string}
     */
    postfixString = "";
    /**
     * 表达式
     * @type {SBENode}
     */
    contentNode = null;
    /**
     * SBUse对象
     * 仅包含当前节点信息
     * 不继承子节点
     * @type {SBUse}
     */
    use = null;

    /**
     * 获取此语句的字符串
     * 不包括结尾分号
     * @returns {string}
     */
    getStr()
    {
        return this.prefixString + (this.contentNode ? this.contentNode.getStr() : "") + this.postfixString;
    }

    /**
     * 获取SBUse对象
     * 将遍历子节点
     * @returns {SBUse}
     */
    getUse()
    {
        var ret = new SBUse();
        ret.mix(this.contentNode.getUse());
        if (this.use)
            ret.mix(this.use);
        return ret;
    }

    /**
     * 定义变量
     * @param {"float"|"int"|"bool"|"vec4"|"vec3"|"vec2"|"mat4"|"mat3"|"mat2"|"imat4"|"ivec4"|"sampler2D"|"samplerCube"} type 类型
     * @param {string} name 变量名
     * @param {SBENode} [initValue] 初始值
     * @returns {SBStatement}
     */
    static defineVariable(type, name, initValue) 
    {
        var ret = new SBStatement();
        ret.prefixString = `${type} ${name}`;
        if (initValue)
        {
            ret.prefixString += "=";
            ret.contentNode = initValue;
        }
        return ret;
    }

    /**
     * 定义常量
     * @param {`${("float"|"int"|"bool"|"vec4"|"vec3"|"vec2"|"mat4"|"mat3"|"mat2"|"imat4"|"ivec4")}${(""|"[]"|`[${number}]`)}`} type 类型
     * @param {string} name 常量名
     * @param {SBENode} initValue 初始值
     * @returns {SBStatement}
     */
    static defineConst(type, name, initValue) 
    {
        var ret = new SBStatement();
        ret.prefixString = `const ${type} ${name}`;
        if (initValue)
        {
            ret.prefixString += "=";
            ret.contentNode = initValue;
        }
        return ret;
    }

    /**
     * 直接使用表达式字符串创建ShaderBStatement
     * shaderRawStatement
     * @param {Array<string | SBENode>} code
     * @returns {SBStatement}
     */
    static raw(...code)
    {
        var ret = new SBStatement();
        ret.contentNode = SBENode.raw(...code);
        return ret;
    }

    /**
     * 使用SBENode对象创建ShaderBStatement
     * @param {SBENode} node
     * @returns {SBStatement}
     */
    static node(node)
    {
        var ret = new SBStatement();
        ret.contentNode = node;
        return ret;
    }

    /**
     * 定义全局参数
     * @param {string} type 类型
     * @param {string} name 常量名
     * @param {"uniform" | "in" | "out"} paramType 参数类型
     * @param {number} [location] 位置
     * @returns {SBStatement}
     */
    static defineGlobalParameter(type, name, paramType, location) 
    {
        var ret = new SBStatement();
        ret.prefixString = `${(location != undefined ? `layout (location=${location}) ` : "")}${paramType} ${type} ${name}`;
        return ret;
    }
}

/**
 * 着色器表达式运算符字符串生成函数
 * 此表生成glsl语法的着色器字符串
 */
const operatorTable = {
    // 空白
    "": () => "",
    // 直接进行字符串拼接
    "raw": (/** @type {Array<string>} */ ...a) => a.join(""),
    // 加
    "+": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}+${b})`,
    // 减
    "-": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}-${b})`,
    // 乘
    "*": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}*${b})`,
    // 除以
    "/": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}/${b})`,
    // 求余
    "%": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}%${b})`,
    // 赋值
    "=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}=${b})`,
    // 赋值加
    "+=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}+=${b})`,
    // 赋值减
    "-=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}-=${b})`,
    // 赋值乘
    "*=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}*=${b})`,
    // 赋值除以
    "/=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}/=${b})`,
    // 赋值求余
    "%=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}%=${b})`,
    // 执行函数
    "()": (/** @type {string} */ a, /** @type {Array<string>} */ ...param) => a + "(" + param.join(",") + ")",
    // 获取结构体的部分
    ".": (/** @type {string} */ a, /** @type {string} */ key) => a + "." + key,
    // 获取数组的元素
    "[]": (/** @type {string} */ a, /** @type {string} */ index) => `${a}[${index}]`,
    // 大于
    ">": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}>${b})`,
    // 小于
    "<": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}<${b})`,
    // 大于或等于
    ">=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}>=${b})`,
    // 小于或等于
    "<=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}<=${b})`,
    // 相等
    "==": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}==${b})`,
    // 不相等
    "!=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}!=${b})`,
    // 逻辑取反
    "!": (/** @type {string} */ a) => `(!${a})`,
    // 逻辑或
    "||": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}||${b})`,
    // 逻辑与
    "&&": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}&&${b})`,
    // 逻辑异或
    "^^": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}^^${b})`,
    // 条件(三目)运算
    "?:": (/** @type {string} */ condition, /** @type {string} */ ifTrue, /** @type {string} */ ifFalse) => `(${condition}?${ifTrue}:${ifFalse})`,
    // 构造数组
    "ConstructArray": (/** @type {string} */ type, /** @type {Array<string>} */ ...elements) => `(${type}[](${elements.join(",")}))`,
};


/**
 * 着色器构建器表达式树的节点
 * ShaderBuilderExpressionNode
 */
class SBENode
{
    /**
     * 运算符
     * @type {keyof operatorTable}
     */
    operator = "";
    /**
     * 子节点
     * @type {Array<SBENode | string>}
     */
    child = null;
    /**
     * SBUse对象
     * 仅包含当前节点信息
     * 不继承子节点
     * @type {SBUse}
     */
    use = null;

    /**
     * @param {keyof operatorTable} operator
     * @param {Array<SBENode | string>} [child]
     */
    constructor(operator, child = [])
    {
        this.operator = operator;
        this.child = child;
    }

    /**
     * 递归获取字符串
     * @returns {string}
     */
    getStr()
    {
        return operatorTable[this.operator](...this.child.map(o =>
        {
            if (typeof (o) == "string")
                return o;
            else if (o instanceof SBENode)
                return o.getStr();
            else
                throw "SBENode(ShaderBuilderExpressionNode) error: getStr error";
        }));
    }

    /**
     * 获取SBUse对象
     * 将遍历子节点
     * @returns {SBUse}
     */
    getUse()
    {
        var ret = new SBUse();
        if (this.child)
            this.child.forEach(o =>
            {
                if (o instanceof SBENode)
                {
                    ret.mix(o.getUse());
                }
            });
        if (this.use)
            ret.mix(this.use);
        return ret;
    }

    /**
     * 加
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    add(a) { return new SBENode("+", [this, a]); }
    /**
     * 减
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    sub(a) { return new SBENode("-", [this, a]); }
    /**
     * 乘
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    mul(a) { return new SBENode("*", [this, a]); }
    /**
     * 除以
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    div(a) { return new SBENode("/", [this, a]); }
    /**
     * 赋值
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    assign(a) { return new SBENode("=", [this, a]); }
    /**
     * 逻辑或
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    or(a) { return new SBENode("||", [this, a]); }
    /**
     * 逻辑与
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    and(a) { return new SBENode("&&", [this, a]); }
    /**
     * 条件(三目)运算
     * @param {SBENode | string} ifTrue
     * @param {SBENode | string} ifFalse
     * @returns {SBENode}
     */
    condition(ifTrue, ifFalse) { return new SBENode("?:", [this, ifTrue, ifFalse]); }
    /**
     * 获取成员(获取结构体的部分)
     * @param {string} memberName
     * @returns {SBENode}
     */
    getMember(memberName) { return new SBENode(".", [this, memberName]); }
    /**
     * 自定义运算符
     * @param {keyof operatorTable} operator
     * @param {Array<SBENode | string>} param
     * @returns {SBENode}
     */
    o(operator, ...param)
    {
        if (!operatorTable[operator])
            throw "SBENode(ShaderBuilderExpressionNode) error: An operator that does not exist or cannot be used was used";
        return new SBENode(operator, param);
    }
    /**
     * 直接使用表达式字符串生成节点
     * @param {Array<string | SBENode>} code
     */
    static raw(...code)
    {
        return new SBENode("raw", code);
    }
    /**
     * 构造数组
     * @param {"float" | "int" | "bool" | "vec4" | "vec3" | "vec2" | "mat4" | "mat3" | "mat2" | "imat4" | "ivec4"} type
     * @param {Array<SBENode | string>} elements
     */
    static constructArray(type, elements)
    {
        return new SBENode("ConstructArray", [type, ...elements]);
    }
    /**
     * 调用函数
     * @param {string} name
     * @param {Array<SBENode | string>} param
     */
    static callFunc(name, ...param)
    {
        var ret = new SBENode("()", [name, ...param]);
        ret.use = new SBUse();
        ret.use.addReferenceFunction(name);
        return ret;
    }
    /**
     * in变量节点
     * @param {string} name
     * @param {string} type
     * @returns {SBENode}
     */
    static in(name, type, local)
    {
        var ret = new SBENode("raw", [name]);
        ret.use = new SBUse();
        ret.use.addIn(name, SBStatement.defineGlobalParameter(type, name, "in", local));
        return ret;
    }
    /**
     * out变量节点
     * @param {string} name
     * @param {string} type
     * @returns {SBENode}
     */
    static out(name, type)
    {
        var ret = new SBENode("raw", [name]);
        ret.use = new SBUse();
        ret.use.addOut(name, SBStatement.defineGlobalParameter(type, name, "out"));
        return ret;
    }
    /**
     * uniform变量节点
     * @param {string} name
     * @param {string} type
     * @returns {SBENode}
     */
    static uniform(name, type)
    {
        var ret = new SBENode("raw", [name]);
        ret.use = new SBUse();
        ret.use.addUniform(name, SBStatement.defineGlobalParameter(type, name, "uniform"));
        return ret;
    }
    /**
     * 获取调用函数的SBENode的构造器
     * @param {string} functionName
     * @returns {function(...(SBENode | string)): SBENode} 构造器 传递调用函数使用的参数
     */
    static callFunction(functionName)
    {
        return SBENode.callFunc.bind(this, functionName);
    }
}

/**
 * 着色器构建器片段
 * 片段通常为一个代码块
 * 片段可包含多个语句
 * 片段可包含子片段
 * ShaderBuilderPart
 */
class SBPart
{
    /**
     * 此片段中的内容
     * @type {Array<SBStatement | SBPart>}
     */
    content = [];

    /**
     * 此片段使用的SBUse列表
     * 仅包含当前节点信息
     * 不继承子节点
     * @type {Array<SBUse>}
     */
    useArr = [];

    /**
     * 代码块
     * 非代码块不会生成大括号
     * @type {boolean}
     */
    codeBlock = false;

    /**
     * 获取此片段的字符串
     * @returns {string}
     */
    getStr()
    {
        var strArr = [];
        this.content.forEach(o =>
        {
            if (o instanceof SBStatement)
                return strArr.push(o.getStr() + ";");
            else if (o instanceof SBPart)
                return strArr.push(o.getStr());
            else
                throw "ShaderBPart(ShaderBuilderPart) error: getStr error";
        });
        var ret = strArr.join("\n");
        if (ret == "")
            return "";
        else if (this.codeBlock)
            return "{\n" + ret + "\n}";
        else
            return ret;
    }

    /**
     * 设置片段内容
     * @param {Array<SBStatement | SBPart | SBENode | SBUse>} partContent
     */
    setPart(partContent)
    {
        this.content = [];
        partContent.forEach(o =>
        {
            if (o instanceof SBStatement || o instanceof SBPart)
                this.content.push(o);
            else if (o instanceof SBENode)
                this.content.push(SBStatement.node(o));
            else if (o instanceof SBUse)
                this.useArr.push(o);
            else
                throw "ShaderBPart(ShaderBuilderPart) error: setPart error";
        });
    }

    /**
     * 获取SBUse对象
     * 将遍历子节点
     * @returns {SBUse}
     */
    getUse()
    {
        var ret = new SBUse();
        this.content.forEach(o =>
        {
            ret.mix(o.getUse());
        });
        this.useArr.forEach(o =>
        {
            ret.mix(o);
        });
        return ret;
    }

    /**
     * 通过片段内容创建片段
     * @param {Array<SBStatement | SBPart | SBENode | SBUse>} partContent
     * @returns {SBPart}
     */
    static createPart(partContent)
    {
        var ret = new SBPart();
        ret.setPart(partContent);
        return ret;
    }
}

/**
 * 着色器构建器的函数
 * ShaderBuilderFunction
 */
class SBFunction
{
    /**
     * 函数名
     * 函数定义中的函数名
     * @type {string}
     */
    name = "";
    /**
     * 函数参数定义
     * 一个语句数组 每个语句为一个变量声明
     * @type {Array<SBStatement>}
     */
    paramArr = [];
    /**
     * 函数返回值类型
     * @type {"void"|"float"|"int"|"bool"|"vec4"|"vec3"|"vec2"|"mat4"|"mat3"|"mat2"|"imat4"|"imat3"|"imat2"}
     */
    returnValueType = "void";
    /**
     * 函数的片段
     * 此片段不用标记为代码块
     * @type {SBPart}
     */
    part = null;
    /**
     * SBUse对象
     * 仅包含当前节点信息
     * 不继承子节点
     * @type {SBUse}
     */
    use = new SBUse();

    /**
     * @param {string} name
     */
    constructor(name)
    {
        this.name = name;
    }

    /**
     * 设置函数片段
     * @param {SBPart} part
     */
    setPart(part)
    {
        this.part = part;
    }

    /**
     * 获取此函数定义字符串
     * @returns {string}
     */
    getStr()
    {
        return `${this.returnValueType} ${this.name}(${this.paramArr.map(o => o.getStr()).join(",")})\n{\n${this.part.getStr()}\n}`;
    }

    /**
     * 获取SBUse对象
     * 将遍历子节点
     * @returns {SBUse}
     */
    getUse()
    {
        var ret = new SBUse();
        ret.mix(this.part.getUse());
        ret.mix(this.use);
        return ret;
    }
}

/**
 * 着色器生成器标志类
 * 使用不同标志以构建不同着色器
 * ShaderBuilderFlag
 */
class SBFlag
{
    /**
     * 标志表
     * 标志名到标志编号的映射
     * @type {Map<string, number>}
     */
    flagMap = new Map();

    /**
     * 标志表计数
     * @type {number}
     */
    flagMapSNCount = 0;

    /**
     * 标志集合
     * 当前标记的标志编号集合
     * @type {Set<number>}
     */
    flagStateSet = new Set();

    /**
     * 添加标志
     * @param {Array<string>} flags 添加标志名列表
     */
    addFlags(flags)
    {
        flags.forEach(o =>
        {
            var flagSN = this.flagMap.get(o);
            if (flagSN != undefined)
                this.flagStateSet.add(flagSN);
            else
                throw "SBFlag(ShaderBuilderFlag) error: an undefined flag name was used";
        });
    }

    /**
     * 设置标志
     * 这会清除之前设置的标志
     * @param {Array<string>} flags 设置此标志名列表
     */
    setFlags(flags)
    {
        this.flagStateSet.clear();
        this.addFlags(flags);
    }

    /**
     * 获取当前标志状态包含的标志编号数组
     * @returns {Array<number>}
     */
    getFlagSNArr()
    {
        /** @type {Array<number>} */
        var ret = [];
        this.flagStateSet.forEach(o => { ret.push(o); });
        ret.sort();
        return ret;
    }

    /**
     * 获取当前标志状态的描述字符串
     * 相同标志状态的描述字符串相同
     * @returns {string}
     */
    getDescribeString()
    {
        return this.getFlagSNArr().map(o => o.toString(36)).join("-");
    }

    /**
     * 定义可使用的标志名
     * @param {string} flagName
     * @returns {number} 标志编号
     */
    defineFlagName(flagName)
    {
        var ret = this.flagMap.get(flagName);
        if (ret == undefined)
            this.flagMap.set(flagName, (ret = this.flagMapSNCount++));
        return ret;
    }

    /**
     * 按照flag分支
     * @template {SBENode | SBStatement | SBPart} T
     * @param {string} flagName
     * @param {T} ifTrue
     * @param {T} ifFalse
     * @returns {T}
     */
    ifFlag(flagName, ifTrue, ifFalse)
    {
        var flagSN = this.defineFlagName(flagName);
        return (new Proxy(ifTrue, {
            get: (_target, property) =>
            {
                var targetThis = (this.flagStateSet.has(flagSN) ? ifTrue : ifFalse);
                var ret = targetThis[property];
                return ret;
            },
            set: (_target, property, value) =>
            {
                (this.flagStateSet.has(flagSN) ? ifTrue : ifFalse)[property] = value;
                return true;
            }
        }));
    }
}

/**
 * 着色器构建器
 * 此类不保证构造的着色器的安全性
 */
class ShaderBuilder
{
    /**
     * 顶点着色器函数map
     * 函数标识符到函数片段
     * @type {Map<string, SBFunction>}
     */
    functionMap = new Map();

    /**
     * 标志
     * @type {SBFlag}
     */
    flag = new SBFlag();

    constructor()
    { }

    /**
     * 设置函数
     * @param {string} name 函数标识符
     * @param {SBFunction} sbfObj
     */
    setFunction(name, sbfObj)
    {
        this.functionMap.set(name, sbfObj);
    }

    /**
     * 构建glsl着色器(一对着色器)
     * @param {WebGL2RenderingContext} gl
     * @param {string} vertexMainFunctionName
     * @param {string} fragmentMainFunctionName
     * @returns {GlslProgram}
     */
    buildGlslProgram(gl, vertexMainFunctionName, fragmentMainFunctionName)
    {
        /**
         * 获取单个glsl着色器字符串(顶点或片段)
         * @param {string} mainFunctionName
         */
        const getGlslShaderStr = (mainFunctionName) =>
        {
            /**
             * 已经使用的函数集合
             * @type {Set<SBFunction>}
             */
            var functionSet = new Set();
            var allUse = new SBUse();

            /**
             * 遍历需要的函数
             * @param {string} nowFunctionName
             */
            const trFunction = (nowFunctionName) =>
            {
                var nowFunction = this.functionMap.get(nowFunctionName);
                if ((!nowFunction) || functionSet.has(nowFunction))
                    return;
                functionSet.add(nowFunction);

                var nowUse = nowFunction.getUse();
                allUse.mix(nowUse);

                if (nowUse.referenceFunction) // 若有引用其他函数 则遍历
                    nowUse.referenceFunction.forEach(trFunction);
            };
            trFunction(mainFunctionName);

            return ([
                "#version 300 es",
                "precision highp float;",

                (() => // 定义uniform
                {
                    var ret = [];
                    allUse.uniform.forEach(o => { ret.push(o.getStr() + ";"); });
                    return ret;
                })(),
                (() => // 定义in
                {
                    var ret = [];
                    allUse.in.forEach(o => { ret.push(o.getStr() + ";"); });
                    return ret;
                })(),
                (() => // 定义out
                {
                    var ret = [];
                    allUse.out.forEach(o => { ret.push(o.getStr() + ";"); });
                    return ret;
                })(),

                (() => // 除主函数外其他函数的定义
                {
                    var ret = [];
                    functionSet.forEach(o =>
                    {
                        if (o.name != "main")
                            ret.push(o.getStr());
                    });
                    return ret.reverse(); // 反转数组 先定义被引用的
                })(),

                this.functionMap.get(mainFunctionName).getStr() // 主函数定义
            ]).flat(Infinity).join("\n");
        };
        var vertexStr = getGlslShaderStr(vertexMainFunctionName); // 顶点着色器字符串
        var fragmentStr = getGlslShaderStr(fragmentMainFunctionName); // 片段着色器字符串
        console.log(`glsl builder:\n\n${addLineNumber(vertexStr)}\n\n${addLineNumber(fragmentStr)}`);
        return (new GlslProgram(gl, vertexStr, fragmentStr)); // 编译为glsl着色程序
    }
}

/**
 * 为字符串添加行号
 * 用于调试输出
 * @param {string} str
 */
function addLineNumber(str)
{
    var arr = str.split("\n");
    var fillLength = arr.length.toString().length;
    return arr.map((o, i) => (i + 1).toString().padStart(fillLength, "0") + " | " + o).join("\n");
}

/**
 * vec3采样偏移方向向量
 */
SBStatement.defineConst("vec3[]", "sampleOffsetDirectionsV3", SBENode.constructArray("vec3", [
    SBENode.callFunc("vec3", "1.0", "1.0", "0.0"),
    SBENode.callFunc("vec3", "-1.0", "1.0", "0.0"),
    SBENode.callFunc("vec3", "1.0", "-1.0", "0.0"),
    SBENode.callFunc("vec3", "-1.0", "-1.0", "0.0"),

    SBENode.callFunc("vec3", "0.0", "1.0", "1.0"),
    SBENode.callFunc("vec3", "0.0", "-1.0", "1.0"),
    SBENode.callFunc("vec3", "0.0", "1.0", "-1.0"),
    SBENode.callFunc("vec3", "0.0", "-1.0", "-1.0"),

    SBENode.callFunc("vec3", "1.0", "0.0", "1.0"),
    SBENode.callFunc("vec3", "-1.0", "0.0", "1.0"),
    SBENode.callFunc("vec3", "1.0", "0.0", "-1.0"),
    SBENode.callFunc("vec3", "-1.0", "0.0", "-1.0"),

    SBENode.callFunc("vec3", "1.0", "1.0", "1.0"),
    SBENode.callFunc("vec3", "1.0", "1.0", "-1.0"),
    SBENode.callFunc("vec3", "1.0", "-1.0", "1.0"),
    SBENode.callFunc("vec3", "1.0", "-1.0", "-1.0"),
    SBENode.callFunc("vec3", "-1.0", "1.0", "1.0"),
    SBENode.callFunc("vec3", "-1.0", "1.0", "-1.0"),
    SBENode.callFunc("vec3", "-1.0", "-1.0", "1.0"),
    SBENode.callFunc("vec3", "-1.0", "-1.0", "-1.0")
]));


var sampleOffsetDirectionsV2Array = [
    SBENode.callFunc("vec2", "1.0", "0.0"),
    SBENode.callFunc("vec2", "-1.0", "0.0"),

    SBENode.callFunc("vec2", "0.0", "1.0"),
    SBENode.callFunc("vec2", "0.0", "-1.0"),

    SBENode.callFunc("vec2", "1.0", "1.0"),
    SBENode.callFunc("vec2", "1.0", "-1.0"),
    SBENode.callFunc("vec2", "-1.0", "1.0"),
    SBENode.callFunc("vec2", "-1.0", "-1.0"),
];
/**
 * vec2采样偏移方向向量
 */
const sampleOffsetDirectionsV2 = SBStatement.defineConst("vec2[]", "sampleOffsetDirectionsV2",
SBENode.constructArray("vec2", sampleOffsetDirectionsV2Array));
/**
 * vec2采样偏移采样数量
 */
const sampleOffsetDirectionsV2Length = SBENode.raw(sampleOffsetDirectionsV2Array.length.toString());

/**
 * 设置预设着色器到着色器生成器
 * @param {ShaderBuilder} builder
 */
function presetShader(builder)
{
    let normalize = SBENode.callFunction("normalize");

    {
        let vertexMainFunction = new SBFunction("main"); // 顶点着色器
        builder.setFunction("vertexMain", vertexMainFunction);

        let u_normalMatrix = SBENode.uniform("u_normalMatrix", "mat3"); // 物体的法线矩阵
        let u_cameraMatrix = SBENode.uniform("u_cameraMatrix", "mat4"); // 物体的相机矩阵(包括投影矩阵)
        let u_worldMatrix = builder.flag.ifFlag("instantiated",
            SBENode.in("u_worldMatrix", "mat4"), SBENode.uniform("u_worldMatrix", "mat4")); // 物体的世界矩阵
        let a_position = SBENode.in("a_position", "vec4", 0); // 变化前的顶点坐标
        let a_texcoord = SBENode.in("a_texcoord", "vec2", 1); // 纹理坐标
        let a_normal = SBENode.in("a_normal", "vec3", 2); // 变化前的法线
        let v_texcoord = SBENode.out("v_texcoord", "vec2"); // 纹理坐标
        let v_thisPos = SBENode.out("v_thisPos", "vec3"); // 当前顶点的世界坐标
        let v_normal = SBENode.out("v_normal", "vec3"); // 法线
        let u_lightMat = SBENode.uniform("u_lightMat", "mat4"); // 灯光矩阵
        let v_lightP = SBENode.out("v_lightP", "vec4"); // 顶点在灯光视图中的坐标

        vertexMainFunction.setPart(SBPart.createPart([
            SBENode.raw("gl_Position").assign(u_cameraMatrix.mul(u_worldMatrix.mul(a_position))), // 转换到视图中坐标

            // 当需要渲染颜色时
            builder.flag.ifFlag("color", SBPart.createPart([
                v_texcoord.assign(a_texcoord), // 纹理坐标 (插值)
                v_thisPos.assign(u_worldMatrix.mul(a_position).getMember("xyz")), // 顶点世界坐标 (插值)
                v_normal.assign(normalize(u_normalMatrix.mul(a_normal))), // 法线 (插值)
                v_lightP.assign(u_lightMat.mul(u_worldMatrix).mul(a_position)) // 顶点在灯光视图中的坐标
            ]), SBPart.createPart([]))
        ]));
    }

    {
        let fragmentMainFunction = new SBFunction("main"); // 片段着色器
        builder.setFunction("fragmentMain", fragmentMainFunction);

        let v_texcoord = SBENode.in("v_texcoord", "vec2"); // 纹理坐标
        let v_thisPos = SBENode.in("v_thisPos", "vec3"); // 当前片段的世界坐标
        let v_normal = SBENode.in("v_normal", "vec3"); // 法线
        let u_texture = SBENode.uniform("u_texture", "sampler2D"); // 颜色纹理
        let u_viewPos = SBENode.uniform("u_viewPos", "vec3"); // 视点的世界坐标
        let u_lightPos = SBENode.uniform("u_lightPos", "vec3"); // 灯光的世界坐标
        let outColor = SBENode.out("outColor", "vec4"); // 输出颜色
        let v_lightP = SBENode.in("v_lightP", "vec4"); // 物体在灯光视图中的坐标
        let u_texS = SBENode.uniform("u_texS", "sampler2D"); // 阴影贴图

        let dot = SBENode.callFunction("dot");
        let max = SBENode.callFunction("max");
        let reflect = SBENode.callFunction("reflect");
        let pow = SBENode.callFunction("pow");

        fragmentMainFunction.setPart(builder.flag.ifFlag("color", SBPart.createPart([ // 不渲染颜色将使用空片段着色器
            SBStatement.defineVariable("vec3", "normal", normalize(v_normal)), // 法线(归一化)

            SBStatement.defineVariable("vec3", "lightP", v_lightP.getMember("xyz").div(v_lightP.getMember("w"))), // 物体在灯光视图中的坐标 归一化w

            // 将[-1到1]坐标变换为[0到1](纹理坐标)
            SBENode.raw("lightP.xy = lightP.xy * 0.5 + 0.5"),

            sampleOffsetDirectionsV2,

            SBStatement.defineVariable("vec3", "lightDir", normalize(v_thisPos.sub(u_lightPos))), // 灯光方向向量
            SBStatement.defineVariable("float", "diffLight", max(dot("normal", "-lightDir"), "0.0")), // 平行光漫反射
            SBStatement.defineVariable("float", "reflLight",
                pow(max(dot(reflect(normalize(u_viewPos.sub(v_thisPos)), "normal"), "lightDir"), "0.0"), "5.0")), // 平行光镜面反射
            SBStatement.defineVariable("float", "factorLight", // 阴影
                SBENode.raw("lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0") // xy在贴图范围内
                    .and("lightP.z>=-1.0 && lightP.z<=1.0") // z在贴图范围内
                    .and(SBENode.raw(SBENode.callFunc("texture", u_texS, "lightP.xy").getMember("r"),
                        " <= lightP.z * 0.5 + 0.5")) // 实际深度更大 则在阴影内
                    .condition("0.0", "1.0")
            ),
            SBStatement.raw("for(int i=0;i<", sampleOffsetDirectionsV2Length, ";i++){",
                SBENode.raw("factorLight+=",
                    SBENode.raw("lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0") // xy在贴图范围内
                        .and("lightP.z>=-1.0 && lightP.z<=1.0") // z在贴图范围内
                        .and(SBENode.raw(SBENode.callFunc("texture", u_texS, SBENode.raw("lightP.xy").add("sampleOffsetDirectionsV2[i] * 0.0007")).getMember("r"),
                            " <= lightP.z * 0.5 + 0.5")) // 实际深度更大 则在阴影内
                        .condition("0.0", "1.0")), ";}"),
            SBENode.raw("factorLight /= ", SBENode.callFunc("float", sampleOffsetDirectionsV2Length), " + 1.0"),
            SBStatement.defineVariable("float", "lightResult", SBENode.raw("0.35 + (diffLight * 0.7 + reflLight * 0.18) * factorLight")), // 光的总影响


            outColor.assign(
                SBENode.callFunc("vec4", SBENode.callFunc("texture", u_texture, v_texcoord).getMember("rgb").mul("lightResult"), "1.0")), // 最终颜色
        ]), SBPart.createPart([])));
    }
}

/**
 * 着色器程序管理
 * 管理着色器生成与缓存
 */
class ShaderProgramManage
{
    /**
     * 绑定的webgl上下文
     * @private
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 着色器生成器
     * @package
     * @type {ShaderBuilder}
     */
    builder = null;
    /**
     * 标志
     * @package
     * @type {SBFlag}
     */
    flag = null;
    /**
     * 着色器程序表
     * 标志描述字符串 到 着色器程序对象 的映射
     * @package
     * @type {Map<string, GlslProgram>}
     */
    programMap = new Map();

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.gl = gl;
        this.builder = new ShaderBuilder();
        this.flag = this.builder.flag;
    }

    /**
     * 获取着色器程序 通过标志数组
     * @param {Array<string>} flagsArr
     * @returns {GlslProgram}
     */
    getProgram(flagsArr)
    {
        this.flag.setFlags(flagsArr);
        var describeStr = this.flag.getDescribeString();
        var ret = this.programMap.get(describeStr);
        if (ret)
            return ret;
        else
        {
            this.programMap.set(describeStr, ret = this.builder.buildGlslProgram(this.gl, "vertexMain", "fragmentMain"));
            return ret;
        }
    }

    /**
     * 获取着色器程序 通过标志描述字符串
     * 必须先调用getProgram
     * @param {string} describeStr
     */
    getProgramByDescribe(describeStr)
    {
        var ret = this.programMap.get(describeStr);
        if (ret)
            return ret;
        else
            throw "ShaderProgramManage: getProgramByDescribe error";
    }
}

/**
 * Structure Engine的上下文
 * 封装webgl2上下文
 * 此类将储存各种状态
 * 通过调用此上下文的方法以更方便的进行操作
 */
class SEContext
{
    /**
     * 绑定的webgl上下文
     * @package
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * canvas对象
     * @package
     * @type {HTMLCanvasElement}
     */
    canvas = null;

    /**
     * 渲染池对象
     * 通常此上下文的所有渲染器共用此渲染池
     * @package
     * @type {RenderPool}
     */
    renderPool = null;

    /**
     * 渲染池对象
     * 通常此上下文的所有渲染器共用此渲染池
     * @package
     * @type {ShaderProgramManage}
     */
    shaderProgramManage = null;

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {HTMLCanvasElement} canvas
     */
    constructor(gl, canvas)
    {
        this.gl = gl;
        this.canvas = canvas;

        this.renderPool = new RenderPool(gl);
        this.shaderProgramManage = new ShaderProgramManage(gl);
        presetShader(this.shaderProgramManage.builder); // 预设着色器
    }

    /**
     * 创建场景
     * @returns {Scene}
     */
    createScene()
    {
        return new Scene(this);
    }

    /**
     * 清除帧缓冲绑定
     * 渲染到可视画布(canvas)
     * 也可用于初始化视口
     * @package
     */
    clearFramebuffer()
    {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 创建渲染到纹理
     * @package
     * @param {number} textureWidth
     * @param {number} textureHeight
     * @returns {Render2Texture}
     */
    createRender2Texture(textureWidth, textureHeight)
    {
        return new Render2Texture(this.gl, textureWidth, textureHeight);
    }
}

/**
 * 初始化画板(canvas)
 * 返回Structure Engine上下文
 * @param {HTMLCanvasElement} canvas
 * @param {number} scale
 * @returns {SEContext}
 */
function initContext(canvas, scale = 1)
{
    var gl = canvas.getContext("webgl2");
    canvas.width = Math.floor(canvas.clientWidth * window.devicePixelRatio * scale);
    canvas.height = Math.floor(canvas.clientHeight * window.devicePixelRatio * scale);
    // TODO 将此处gl操作移动到SEContext
    gl.viewport(0, 0, canvas.width, canvas.height);
    // gl.enable(gl.CULL_FACE); // (三角形方向)面剔除
    gl.enable(gl.DEPTH_TEST); // 深度测试(z-buffer)
    gl.clearColor(0.2, 0.2, 0.2, 1);
    return new SEContext(gl, canvas);
}

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

/**
 * 相同纹理对应相同实例
 * @type {Map<import("../texture/Texture").Texture, ObjFaces>}
 */
var instanceMap = new Map();
/**
 * @param {import("../texture/Texture").Texture} tex
 * @returns {SceneObject}
 */
function create_cube(tex)
{
    var obje = new SceneObject();

    var faces = instanceMap.get(tex);
    if (!faces)
        instanceMap.set(tex, (faces = new ObjFaces(cubeVer, tex, cubeTexOff, cubeNormal, WebGL2RenderingContext.TRIANGLES)));
    obje.faces = faces;
    return obje;
}

/**
 * 纹理表
 * 管理纹理 避免重复载入
 */
class TextureTable
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * url对应的纹理
     * @type {Map<string, Texture>}
     */
    texMap = new Map();

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.gl = gl;
    }

    /**
     * 通过图像的url获得纹理
     * @param {string} url
     * @returns {Texture}
     */
    fromUrl(url)
    {
        var ret = this.texMap.get(url);
        if (!ret)
        {
            ret = Texture.fromImageUrl(this.gl, url);
            this.texMap.set(url, ret);
        }
        return ret;
    }
}

/**
 * MtlC类中的单个材质的封装
 */
class MtlCMaterial
{
    /**
     * 镜面反射度
     * @type {number}
     */
    shininess;

    /**
     * 环境色
     * @type {Array<number>}
     */
    ambient;

    /**
     * 漫反射色
     * @type {Array<number>}
     */
    diffuse;

    /**
     * 高光色
     * @type {Array<number>}
     */
    specular;

    /**
     * 发光色
     * @type {Array<number>}
     */
    emissive;

    /**
     * 光密度
     * @type {number}
     */
    opticalDensity;

    /**
     * 透明度(不透明度)
     * @type {number}
     */
    opacity;

    /**
     * 照明类型
     * @type {number}
     */
    illum;

    /**
     * 漫反射颜色贴图
     * @type {string}
     */
    diffuseMap;

    /**
     * 镜面反射度标量贴图
     * @type {string}
     */
    specularMap;

    /**
     * 法线贴图
     * @type {string}
     */
    normalMap;

}

/**
 * 对mtl文件的封装
 */
class MtlC
{
    /**
     * 材质map
     * @type {Map<string, MtlCMaterial>}
     */
    materialMap = new Map();

    /**
     * 从mtl字符串解析
     * @param {string} srcStr
     * @param {string} [folderPath]
     * @returns {MtlC}
     */
    static fromString(srcStr, folderPath = "")
    {
        var ret = new MtlC();
        var arr = srcStr.split("\n");

        /**
         * 解析贴图指令的参数
         * @todo 处理可选项参数
         * @param {Array<string>} args
         * @returns {string}
         */
        function parseMapArgs(args)
        {
            return args.join(" ");
        }

        /**
         * 当前材质
         * @type {MtlCMaterial}
         */
        var material = null;
        for (var oInd = 0; oInd < arr.length; oInd++)
        {
            var oStr = arr[oInd].trim();
            if (oStr == "" || oStr[0] == "#")
                continue;
            var parts = oStr.split(/\s+/);
            var type = parts.shift();

            switch (type)
            {
                case "newmtl": // 定义新材质
                    material = new MtlCMaterial();
                    ret.materialMap.set(parts[0], material);
                    break;
                case "Ns": // 镜面反射度
                    material.shininess = parseFloat(parts[0]);
                    break;
                case "Ka": // 环境色
                    material.ambient = parts.map(parseFloat);
                    break;
                case "Kd": // 漫反射色
                    material.diffuse = parts.map(parseFloat);
                    break;
                case "Ks": // 高光色
                    material.specular = parts.map(parseFloat);
                    break;
                case "Ke": // 发光色
                    material.emissive = parts.map(parseFloat);
                    break;
                case "Ni": // 光密度
                    material.opticalDensity = parseFloat(parts[0]);
                    break;
                case "d": // 透明度(不透明度)
                    material.opacity = parseFloat(parts[0]);
                    break;
                case "illum": // 照明类型
                    material.illum = parseInt(parts[0]);
                    break;
                case "map_Kd": // 漫反射颜色贴图
                    material.diffuseMap = folderPath + parseMapArgs(parts);
                    break;
                case "map_Ns": // 镜面反射度标量贴图
                    material.specularMap = folderPath + parseMapArgs(parts);
                    break;
                case "map_Bump": // 凹凸贴图(法线贴图)
                    material.normalMap = folderPath + parseMapArgs(parts);
                    break;
                default:
                    console.warn("unhandled type in mtl:", type);
            }
        }
        return ret;
    }
}

/**
 * ObjC类中(相同材质的)一些面封装
 */
class ObjCFaces
{
    /**
     * 顶点坐标
     * 每个顶点3个(1个向量)
     * 每个面9个(每个面3个顶点)
     * @type {Array<number>}
     */
    pos = [];

    /**
     * 纹理坐标
     * @type {Array<number>}
     */
    texPos = [];

    /**
     * 法线方向
     * @type {Array<number>}
     */
    norm = [];

    /**
     * 漫反射颜色贴图
     * @type {string}
     */
    tex = "";
}

/**
 * 多顶点的物体模型封装
 * (对wavefrontObj的封装)
 */
class ObjC
{
    /**
     * 顶点坐标数组
     * @type {Array<Array<number>>}
     */
    positions = [];

    /**
     * 纹理坐标数组
     * @type {Array<Array<number>>}
     */
    texcoords = [];

    /**
     * 法线方向数组
     * @type {Array<Array<number>>}
     */
    normals = [];

    /**
     * 面
     * @type {Array<ObjCFaces>}
     */
    faces = [];

    /**
     * 关联的mtl
     * @type {MtlC}
     */
    mtl = null;


    constructor()
    {
        // 由于WavefrontObj中索引从1开始所以将第0个位置占用
        this.positions.push([0, 0, 0]);
        this.normals.push([0, 0, 0]);
        this.texcoords.push([0, 0]);
    }

    /**
     * 以此模型创建物体
     * @returns {SceneObject}
     * @param {WebGL2RenderingContext} gl
     */
    createSceneObject(gl)
    {
        var ret = new SceneObject();
        var texTab = new TextureTable(gl); // 防止生成获取相同url的纹理
        forEach(this.faces, o =>
        {
            var obj = new SceneObject();
            obj.faces = new ObjFaces(o.pos, texTab.fromUrl(o.tex), o.texPos, o.norm);
            ret.addChild(obj);
        });
        return ret;
    }

    /**
     * 从WavefrontObj字符串解析
     * @param {string} srcStr
     * @param {string} [folderPath]
     * @returns {Promise<ObjC>}
     */
    static async fromWavefrontObj(srcStr, folderPath = "")
    {
        var ret = new ObjC();
        var arr = srcStr.split("\n");

        var faces = new ObjCFaces();

        /** @type {Map<number | string, Vec3>} */
        var defaultNormalMap = new Map();
        /** @type {Array<[number, number | string]>} */
        var defaultNormalList = [];
        /**
         * 添加面
         * @param {[string, string, string]} vert 三个顶点索引 每个顶点索引为一个包含多索引的字符串
         */
        function addFace(vert)
        {
            var positionsInd = [-1, -1, -1];
            /** @type {Array<Vec3>} */
            var positions = [null, null, null];
            var texcoords = [null, null, null];
            var normals = [null, null, null];
            for (var i = 0; i < 3; i++)
            {
                var parts = vert[i].split("/");
                if (parts[0]) // 顶点索引
                {
                    var objInd = parseInt(parts[0]);
                    positions[i] = newV3(ret.positions[
                        positionsInd[i] = (objInd + (objInd >= 0 ? 0 : ret.positions.length))
                    ]);
                }
                else
                    positions[i] = new Vec3();
                if (parts[1]) // 纹理索引
                {
                    var objInd = parseInt(parts[1]);
                    texcoords[i] = ret.texcoords[objInd + (objInd >= 0 ? 0 : ret.texcoords.length)];
                }
                if (parts[2]) // 法线索引
                {
                    var objInd = parseInt(parts[2]);
                    normals[i] = ret.normals[objInd + (objInd >= 0 ? 0 : ret.normals.length)];
                }
            }
            var vec1 = positions[1].sub(positions[0]); // 三角形的一条边向量
            var vec2 = positions[2].sub(positions[1]); // 三角形的另一条边向量
            var defaultNormal = vec1.cross(vec2).normalize().mulNum(Math.PI - vec1.angleTo(vec2)); // 默认法线向量乘夹角作为倍率
            for (var i = 0; i < 3; i++)
            {
                if (positions[i])
                    faces.pos.push(positions[i].x, positions[i].y, positions[i].z);
                else
                    faces.pos.push(0, 0, 0);
                if (texcoords[i])
                    faces.texPos.push(...texcoords[i]);
                else
                    faces.texPos.push(0, 0);
                if (normals[i])
                    faces.norm.push(...normals[i]);
                else
                { // 缺省法线
                    var key = positionsInd[i];
                    defaultNormalMap.set(key,
                        defaultNormal.add(
                            defaultNormalMap.has(key) ? defaultNormalMap.get(key) : new Vec3()
                        )
                    );
                    defaultNormalList.push([faces.norm.length, key]);
                    faces.norm.push(0, 0, 0);
                }
            }
        }
        /**
         * 设置缺省的法线
         */
        function setDefaultNormal()
        {
            forEach(defaultNormalList, o =>
            {
                var ind = o[0];
                var defaultNormal = defaultNormalMap.get(o[1]).normalize(); // 默认法线向量
                faces.norm[ind] = defaultNormal.x;
                faces.norm[ind + 1] = defaultNormal.y;
                faces.norm[ind + 2] = defaultNormal.z;
            });
            defaultNormalList.length = 0;
            defaultNormalMap.clear();
        }

        for (var oInd = 0; oInd < arr.length; oInd++)
        { // 解析单行指令
            var oStr = arr[oInd].trim();
            if (oStr == "" || oStr[0] == "#")
                continue;
            var parts = oStr.split(/\s+/);
            var type = parts.shift();

            switch (type)
            {
                case "v": // 顶点坐标
                    ret.positions.push(parts.slice(0, 3).map(parseFloat));
                    if (parts.length > 3) // 非标准情况 顶点声明中附带顶点颜色
                        console.warn("type v with color");
                    break;
                case "vt": // 纹理坐标
                    ret.texcoords.push(parts.map(parseFloat));
                    break;
                case "vn": // 法线坐标
                    ret.normals.push(parts.map(parseFloat));
                    break;
                case "f": // 面
                    var trianNum = parts.length - 2;
                    for (var i = 0; i < trianNum; i++)
                    {
                        addFace([parts[0], parts[i + 1], parts[i + 2]]);
                    }
                    break;
                case "mtllib": // 关联mtl文件
                    ret.mtl = MtlC.fromString(await (await fetch(folderPath + parts[0])).text(), folderPath);
                    break;
                case "usemtl": // 使用材质(在mtl中定义)
                    // 处理之前的面
                    setDefaultNormal();
                    if (faces.pos.length > 0)
                        ret.faces.push(faces);
                    // 新的面
                    faces = new ObjCFaces();
                    var material = ret.mtl.materialMap.get(parts[0]);
                    faces.tex = material.diffuseMap;
                    break;
                default:
                    console.warn("unhandled type in obj:", type);
            }
        }

        setDefaultNormal();
        ret.faces.push(faces);

        return ret;
    }
}

/**
 * 键盘对应表
 */
var table = {
    "~": "`",
    "!": "1",
    "@": "2",
    "#": "3",
    "$": "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
    "_": "-",
    "+": "=",
    "{": "[",
    "}": "]",
    "|": "\\",
    "\"": "\'",
    ":": ";",
    "<": ",",
    ">": ".",
    "?": "/"
};
var capitalA = "A".charCodeAt(0);
var lowercaseA = "a".charCodeAt(0);
for (var i = 0; i < 26; i++)
    table[String.fromCharCode(capitalA + i)] = String.fromCharCode(lowercaseA + i);

/**
 * 按键数据
 * 当发生键盘事件时传递
 * 包含按键和按下状态等数据
 */
class keyData
{
    /**
     * 键名
     */
    key = "";
    /**
     * 当前此指针是否处于按下状态
     */
    hold = false;
    /**
     * 当前指针是否正在按下(按下事件)
     */
    pressing = false;
    constructor(key, hold, pressing)
    {
        this.key = key;
        this.hold = hold;
        this.pressing = pressing;
    }
}

/**
 * 键盘 事件处理
 * @param {HTMLElement} element
 * @param {function(keyData, KeyboardEvent):void} callBack
 */
function keyboardBind(element, callBack)
{
    element.addEventListener("keydown", e => callBack(new keyData(
        (table[e.key] ? table[e.key] : e.key),
        true,
        true
    ), e));
    element.addEventListener("keyup", e => callBack(new keyData(
        (table[e.key] ? table[e.key] : e.key),
        false,
        false
    ), e));
}

/**
 * 键盘操作的封装
 */
class KeyboardMap
{
    /**
     * 按键状态表
     * 存在则为按下
     * @type {Set<string>}
     */
    keySet = new Set();
    /**
     * 按下回调map
     * @type {Map<string, function(import("./keyData").keyData) : void>}
     */
    downCB = new Map();
    /**
     * 弹起回调map
     * @type {Map<string, function(import("./keyData").keyData) : void>}
     */
    upCB = new Map();
    /**
     * 监听器函数
     * 调用此函数以模拟键盘操作
     * @type {function(import("./keyData").keyData, KeyboardEvent): void}
     */
    listener = null;

    /**
     * 接管元素的键盘操作
     * @param {HTMLElement} e 默认为 document.body
     */
    constructor(e = document.body)
    {
        keyboardBind(e, this.listener = ((e, ke) =>
        {
            if (ke.target instanceof HTMLElement && ke.target.tagName == "INPUT")
                return;
            var key = e.key;
            if (e.hold)
            {
                if (!this.keySet.has(key))
                {
                    this.keySet.add(key);
                    let cb = this.downCB.get(key);
                    if (cb)
                        cb(e);
                }
            }
            else
            {
                if (this.keySet.has(key))
                {
                    this.keySet.delete(e.key);
                    let cb = this.upCB.get(key);
                    if (cb)
                        cb(e);
                }
            }
        }));
    }

    /**
     * 获取按键状态
     * @param {string} key 
     * @returns {boolean} true为按下
     */
    get(key)
    {
        return this.keySet.has(key);
    }

    /**
     * 绑定按下事件
     * 注意: 一个按键多次绑定Down会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下时触发
     */
    bindDown(key, callback)
    {
        this.downCB.set(key, callback);
    }

    /**
     * 绑定弹起事件
     * 注意: 一个按键多次绑定Up会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键弹起时触发
     */
    bindUp(key, callback)
    {
        this.upCB.set(key, callback);
    }

    /**
     * 绑定按键事件
     * 注意: 一个按键多次绑定会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下或弹起时触发
     */
    bind(key, callback)
    {
        this.bindDown(key, callback);
        this.bindUp(key, callback);
    }

    /**
     * 绑定多个按键
     * 注意: 一个按键多次绑定会解除前一次绑定的回调
     * @param {Array<string>} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下或弹起时触发
     */
    bindArray(key, callback)
    {
        key.forEach(o => { this.bind(o, callback); });
    }
}

/**
 * 指针数据
 * 当发生鼠标或触摸事件时传递
 * 包含指针坐标和按下状态等数据
 */
class pointerData
{
    x = 0; y = 0; // 当前指针位置
    vx = 0; vy = 0; // 指针位置和上次位置的变化
    sx = 0; sy = 0; // 此指针的起始位置
    hold = false; // 当前此指针是否处于按下状态
    pressing = false; // 当前指针是否正在按下(按下事件)
    constructor(x, y, vx, vy, sx, sy, hold, pressing)
    {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.sx = sx;
        this.sy = sy;
        this.hold = hold;
        this.pressing = pressing;
    }
}

/**
 * 触摸(拖拽) 事件处理
 * @param {HTMLElement} element 
 * @param {function(pointerData):void} callBack
 */
function touchBind(element, callBack)
{
    element.addEventListener("touchstart", e => touchStart(e), {
        capture: false,
        passive: false
    });
    element.addEventListener("touchmove", e => touchMove(e), {
        capture: false,
        passive: true
    });
    element.addEventListener("touchend", e => touchEnd(e), {
        capture: false,
        passive: true
    });

    var ogTouches = [];
    /**
     * 通过标识符取触摸点数据索引
     * @param {any} id
     * @returns {number}
     */
    function getTouchesInd(id)
    {
        var ret = -1;
        ogTouches.forEach((o, i) =>
        {
            if (id == o.id)
                ret = i;
        });
        return ret;
    }
    /**
     * 触摸处理函数(按下)
     * @param {TouchEvent} e 
     */
    function touchStart(e)
    {
        if (e.cancelable)
            e.preventDefault();
        forEach(e.touches, o =>
        {
            var t = {
                id: o.identifier,
                sx: o.clientX,
                sy: o.clientY,
                x: o.clientX,
                y: o.clientY
            };
            ogTouches.push(t);
            callBack(new pointerData(
                t.x, t.y,
                0, 0,
                t.sx, t.sy,
                true, true
            ));
        });
    }
    /**
     * 触摸处理函数(移动)
     * @param {TouchEvent} e 
     */
    function touchMove(e)
    {
        forEach(e.touches, o =>
        {
            var ind = getTouchesInd(o.identifier);
            if (ind > -1)
            {
                var t = ogTouches[ind];
                var vx = o.clientX - t.x;
                var vy = o.clientY - t.y;
                t.x = o.clientX;
                t.y = o.clientY;
                callBack(new pointerData(
                    t.x, t.y,
                    vx, vy,
                    t.sx, t.sy,
                    true, false
                ));
            }
        });
    }
    /**
     * 触摸处理函数(松开)
     * @param {TouchEvent} e 
     */
    function touchEnd(e)
    {
        forEach(e.touches, o =>
        {
            var ind = getTouchesInd(o.identifier);
            if (ind > -1)
            {
                var t = ogTouches[ind];
                ogTouches.splice(ind, 1);
                var vx = o.clientX - t.x;
                var vy = o.clientY - t.y;
                t.x = o.clientX;
                t.y = o.clientY;
                callBack(new pointerData(
                    t.x, t.y,
                    vx, vy,
                    t.sx, t.sy,
                    false, false
                ));
            }
        });
    }
}

export { Camera, KeyboardMap, ObjC, Scene, Texture, create_cube, initContext, keyboardBind, structureEngineInfo, touchBind };
//# sourceMappingURL=structureEngine.js.map
