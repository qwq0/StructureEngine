/**
 * BVH树上的节点类
 */
export class BVHnode
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
     * 包围半径 绝对长度
     * 以中心坐标做球形包围
     * 不受缩放影响
     * @type {number}
     */
    r = 0;

    /**
     * 优化过
     * 操作时标记为 假
     * 优化过标记为 真
     * @type {boolean}
     */
    optimized = false;

    /**
     * 子节点-0
     * @type {BVHnode}
     */
    s0 = null;
    /**
     * 子节点-1
     * @type {BVHnode}
     */
    s1 = null;
    /**
     * 子节点-2
     * @type {BVHnode}
     */
    s2 = null;
    /**
     * 子节点-3
     * @type {BVHnode}
     */
    s3 = null;
    /**
     * 节点重量
     * 表示包括当前节点和其子节点的节点总数
     * 即以当前节点为根的子树大小
     * @type {number}
     */
    q = null;

    /**
     * 此物体的渲染对象
     * @type {import("../gl/ScenesObject").ScenesObject}
     */
    renderObj = null;

    /**
     * 此物体的物理对象
     * @type {object}
     */
    physicsObj = null;
}