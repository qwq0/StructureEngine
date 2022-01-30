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
     * (矩阵 乘 向量)
     * @param {import("./m4").m4} m
     */
    multiplyM4(m)
    {
        var a = m.a;
        return new v4(
            (this.x * a[0]) + (this.y * a[1]) + (this.z * a[2]) + (this.w * a[3]),
            (this.x * a[4]) + (this.y * a[5]) + (this.z * a[6]) + (this.w * a[7]),
            (this.x * a[8]) + (this.y * a[9]) + (this.z * a[10]) + (this.w * a[11]),
            (this.x * a[12]) + (this.y * a[13]) + (this.z * a[14]) + (this.w * a[15])
        );
    }

    /**
     * 欧拉角到四元数
     * 旋转顺序ZYX
     * 单位弧度
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    static Euler2Quaternion(x, y, z)
    {
        return new v4(
            Math.sin(x / 2) * Math.cos(y / 2) * Math.cos(z / 2) -
            Math.cos(x / 2) * Math.sin(y / 2) * Math.sin(z / 2),

            Math.cos(x / 2) * Math.sin(y / 2) * Math.cos(z / 2) +
            Math.sin(x / 2) * Math.cos(y / 2) * Math.sin(z / 2),

            Math.cos(x / 2) * Math.cos(y / 2) * Math.sin(z / 2) -
            Math.sin(x / 2) * Math.sin(y / 2) * Math.cos(z / 2),

            Math.cos(x / 2) * Math.cos(y / 2) * Math.cos(z / 2) +
            Math.sin(x / 2) * Math.sin(y / 2) * Math.sin(z / 2)
        );
    }

    /**
     * 欧拉角到方向向量
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
     * 归一化
     * 将改变原向量
     */
    normalize()
    {
        var sum = Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
        if(sum != 0)
        {
            this.x /= sum;
            this.y /= sum;
            this.z /= sum;
            this.w /= sum;
        }
        return this;
    }
}
