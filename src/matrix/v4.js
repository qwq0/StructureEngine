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
}
