/**
 * 4向量类
 */
export class v4
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
     * 乘m4矩阵
     * (向量 乘 矩阵)
     * @param {import("./m4").m4} m
     */
    mulM4(m)
    {
        var a = m.a;
        return new v4(
            (this.x * a[0]) + (this.y * a[4]) + (this.z * a[8]) + (this.w * a[12]),
            (this.x * a[1]) + (this.y * a[5]) + (this.z * a[9]) + (this.w * a[13]),
            (this.x * a[2]) + (this.y * a[6]) + (this.z * a[10]) + (this.w * a[14]),
            (this.x * a[3]) + (this.y * a[7]) + (this.z * a[11]) + (this.w * a[15])
        );
    }

    /**
     * 欧拉角到四元数
     * 旋转顺序ZYX
     * 单位为弧度
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    static Euler2Quaternion(x, y, z)
    {
        return new v4(
            Math.sin(x * 0.5) * Math.cos(y * 0.5) * Math.cos(z * 0.5) -
            Math.cos(x * 0.5) * Math.sin(y * 0.5) * Math.sin(z * 0.5),

            Math.cos(x * 0.5) * Math.sin(y * 0.5) * Math.cos(z * 0.5) +
            Math.sin(x * 0.5) * Math.cos(y * 0.5) * Math.sin(z * 0.5),

            Math.cos(x * 0.5) * Math.cos(y * 0.5) * Math.sin(z * 0.5) -
            Math.sin(x * 0.5) * Math.sin(y * 0.5) * Math.cos(z * 0.5),

            Math.cos(x * 0.5) * Math.cos(y * 0.5) * Math.cos(z * 0.5) +
            Math.sin(x * 0.5) * Math.sin(y * 0.5) * Math.sin(z * 0.5)
        );
    }

    /**
     * 欧拉角到方向向量
     * 单位弧度
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    static Euler2Direction(x, y, z)
    {
        return new v4(
            -((Math.cos(y) * Math.sin(x) * Math.sin(z)) + (Math.sin(y) * Math.cos(z))),
            (Math.cos(y) * Math.cos(z)) - (Math.sin(y) * Math.sin(x) * Math.sin(z)),
            Math.cos(x) * Math.sin(z),
            0
        );
    }

    /**
     * 归一化(使向量长度为1 不改变方向)
     * 不改变原向量
     * @returns {v4}
     */
    normalize()
    {
        var multiple = 1 / Math.hypot(this.x, this.y, this.z, this.w);
        if (multiple != Infinity)
            return new v4(
                this.x * multiple,
                this.y * multiple,
                this.z * multiple,
                this.w * multiple
            );
        else
            return new v4();
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
export function V4(a)
{
    return new v4(a[0], a[1], a[2], a[3]);
}