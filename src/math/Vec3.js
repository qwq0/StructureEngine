/**
 * 3轴向量类
 */
export class Vec3
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
     * 只使用xyz
     * @returns {number}
     */
    len()
    {
        return Math.hypot(this.x, this.y, this.z);
    }

    /**
     * 取三维向量的模(长度)的平方
     * 只使用xyz
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
}
/**
 * 通过数组构造一个v3类
 * @param {Array<number>} a
 */
export function newV3(a)
{
    return new Vec3(a[0], a[1], a[2]);
}