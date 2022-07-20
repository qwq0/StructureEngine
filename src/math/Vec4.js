import { Mat4 } from "./Mat4.js";

/**
 * 4轴向量类
 */
export class Vec4
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
 * 通过数组构造一个v4类
 * @param {Array<number>} a
 */
export function newV4(a)
{
    return new Vec4(a[0], a[1], a[2], a[3]);
}