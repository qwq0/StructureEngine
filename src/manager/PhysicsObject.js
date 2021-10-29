/**
 * 物体的物理属性
 */
export class PhysicsObject
{
    /**
     * 物体的碰撞体
     * (每个顶点3个,描述一个三维凸包)
     * @type {Array<number> | Float32Array}
     */
    collision = null;

    /**
     * 移动速度 x轴
     * 基于绝对坐标
     * @type {number}
     */
    sx = 0;
    /**
     * 移动速度 y轴
     * 基于绝对坐标
     * @type {number}
     */
    sy = 0;
    /**
     * 移动速度 z轴
     * 基于绝对坐标
     * @type {number}
     */
    sz = 0;
    /**
     * 旋转速度 沿x轴
     * 基于绝对坐标
     * @type {number}
     */
    rx = 0;
    /**
     * 旋转速度 沿y轴
     * 基于绝对坐标
     * @type {number}
     */
    ry = 0;
    /**
     * 旋转速度 沿z轴
     * 基于绝对坐标
     * @type {number}
     */
    rz = 0;
    
    /**
     * 质量
     * @type {number}
     */
    quality = 0;
    /**
     * 连动
     * 设置为真表示此节点作用将改变父节点属性
     */
    linkage = false;
}