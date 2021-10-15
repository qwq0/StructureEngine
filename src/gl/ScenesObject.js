/**
 * 场景中的物体
 */
export class ScenesObject
{
    /**
     * 相对坐标x
     * @type {number}
     */
    x = 0;
    /**
     * 相对坐标y
     * @type {number}
     */
    y = 0;
    /**
     * 相对坐标z
     * @type {number}
     */
    z = 0;
    /**
     * 相对x轴旋转(单位:弧度)
     * @type {number}
     */
    rx = 0;
    /**
     * 相对y轴旋转(单位:弧度)
     * @type {number}
     */
    ry = 0;
    /**
     * 相对z轴旋转(单位:弧度)
     * @type {number}
     */
    rz = 0;
    /**
     * 相对x轴缩放
     * @type {number}
     */
    sx = 1;
    /**
     * 相对y轴缩放
     * @type {number}
     */
    sy = 1;
    /**
     * 相对z轴缩放
     * @type {number}
     */
    sz = 1;
    /**
     * 绘制此物体使用的着色器组(渲染程序)
     * @type {import("./shader/glslProgram").glslProgram}
     */
    program = null;
    /**
     * 面数据
     * @type {{
     *  ver: Array<Float32Array>, // 顶点相对坐标(每个顶点3个, 每个面9个(每个面3个顶点))
     *  verLen: number, // 顶点相对坐标数组中点的个数(每3个元素1个顶点)
     *  tex: import("./util/texture").Texture, // 纹理
     *  texOff: Array<Float32Array> // 纹理偏移(每个材质坐标2个, 每个面4个(每个面2个材质坐标))
     * }}
     */
    faces = null;
    /**
     * 子节点
     * @type {Array<ScenesObject>}
     * @todo 兼容map Map<string, ScenesObject>
     */
    c = null;

    /**
     * [渲染时] 此物体的vao对象
     * @type {WebGLVertexArrayObject}
     */
    vao = null;
    /**
     * [渲染时] 此物体的缓冲区
     * 用于释放内存使用
     * @type {WebGLBuffer}
     */
    buffer = null;
    /**
     * [渲染时] 此物体矩阵在着色器中的位置
     * @type {WebGLUniformLocation}
     */
    matrixLoc = null;
}