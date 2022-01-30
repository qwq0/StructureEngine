/**
 * 场景中的物体
 */
export class ScenesObject
{
    /**
     * 坐标x(相对)
     * @type {number}
     */
    x = 0;
    /**
     * 坐标y(相对)
     * @type {number}
     */
    y = 0;
    /**
     * 坐标z(相对)
     * @type {number}
     */
    z = 0;
    /**
     * 四元数x(相对旋转)
     * @type {number}
     */
    rx = 0;
    /**
     * 四元数y(相对旋转)
     * @type {number}
     */
    ry = 0;
    /**
     * 四元数z(相对旋转)
     * @type {number}
     */
    rz = 0;
    /**
     * 四元数w(相对旋转)
     * @type {number}
     */
    rw = 1;
    /**
     * x轴缩放(相对)
     * @type {number}
     */
    sx = 1;
    /**
     * y轴缩放(相对)
     * @type {number}
     */
    sy = 1;
    /**
     * z轴缩放(相对)
     * @type {number}
     */
    sz = 1;

    /**
     * 绘制此物体使用的着色器组(渲染程序)
     * @type {import("./shader/glslProgram").glslProgram}
     */
    program = null;
    
    /**
     * 子节点
     * @type {Array<ScenesObject>}
     * @todo 兼容map Map<string, ScenesObject>
     */
    c = null;

    /**
     * 此物体的vao对象
     * @type {WebGLVertexArrayObject}
     */
    vao = null;

    /**
     * 此物体的渲染模式
     * 例如 gl.TRIANGLES
     * @type {number}
     */
    mode = 0;

    /**
     * 面数据
     * @type {{
     *  ver: Float32Array, // 顶点相对坐标向量(每个顶点3个(1个向量), 每个面9个(每个面3个顶点))
     *  normal: Float32Array, // 法线向量(每个顶点3个(1个向量), 每个面9个(每个面3个顶点))
     *  verLen: number, // 顶点相对坐标数组中点的个数(每3个元素(每个向量)1个顶点)
     *  tex: import("./util/texture").Texture, // 纹理
     *  texOff: Float32Array // 纹理偏移向量(每个顶点2个(1个向量), 每个面6个(每个面3个纹理坐标))
     * }}
     */
    faces = null;
    
    /**
     * [渲染时] 此物体的缓冲区
     * 用于释放内存使用
     * @type {WebGLBuffer}
     */
    buffer = null;
}