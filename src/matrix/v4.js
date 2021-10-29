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
            (x * a[0]) + (y * a[1]) + (z * a[2]) + (w * a[3]),
            (x * a[4]) + (y * a[5]) + (z * a[6]) + (w * a[7]),
            (x * a[8]) + (y * a[9]) + (z * a[10]) + (w * a[11]),
            (x * a[12]) + (y * a[13]) + (z * a[14]) + (w * a[15])
        );
    }
}
