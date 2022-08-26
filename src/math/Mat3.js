/**
 * 3*3矩阵类
 */
export class Mat3
{
    /**
     * 矩阵原始数据
     * 数组长度为9
     * @type {Array<number>}
     */
    a = null;

    /**
     * 使用数组作为参数以包装为矩阵
     * 缺省参数创建单位矩阵(左上到右下对角线为1 其余为0)
     * @param {Array<number>} [arr]
     */
    constructor(arr)
    {
        if (arr)
        {
            this.a = arr;
        }
        else
        {
            this.a = [ // 新矩阵
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
            ];
        }
    }

    /**
     * 复制矩阵
     * @returns {Mat3}
     */
    copy()
    {
        return new Mat3(this.a.slice());
    }

    /**
     * 矩阵乘法(反向)
     * 不会改变原矩阵
     * 注意 此乘法与一般矩阵乘法的ab相反
     * 此函数为b*a 也就是矩阵变换乘
     * c[i][j] = sum(a[k][j] + b[i][k])
     * @param {Mat3} matrix
     * @returns {Mat3}
     */
    multiply(matrix)
    {
        var a = this.a;
        var b = matrix.a;
        var ret = [
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ];
        for (var i = 0; i < 3; i++)
            for (var j = 0; j < 3; j++)
                ret[i * 3 + j] = a[0 * 3 + j] * b[i * 3 + 0] + a[1 * 3 + j] * b[i * 3 + 1] + a[2 * 3 + j] * b[i * 3 + 2];
        return new Mat3(ret);
    }

    /**
     * 矩阵求逆
     * 不会改变原矩阵
     * @returns {Mat3}
     */
    inverse()
    {
        var a = this.a;
        var m00 = a[0 * 3 + 0], m01 = a[0 * 3 + 1], m02 = a[0 * 3 + 2],
            m10 = a[1 * 3 + 0], m11 = a[1 * 3 + 1], m12 = a[1 * 3 + 2],
            m20 = a[2 * 3 + 0], m21 = a[2 * 3 + 1], m22 = a[2 * 3 + 2];
        var d = 1.0 / (m00 * m11 * m22 + m01 * m12 * m20 + m02 * m10 * m21 - m00 * m12 * m21 - m01 * m10 * m22 - m02 * m11 * m20);
        return new Mat3([
            d * (m11 * m22 - m12 * m21),
            d * (-m01 * m22 + m02 * m21),
            d * (m01 * m12 - m02 * m11),

            d * (-m10 * m22 + m12 * m20),
            d * (m00 * m22 - m02 * m20),
            d * (-m00 * m12 + m02 * m10),

            d * (m10 * m21 - m11 * m20),
            d * (-m00 * m21 + m01 * m20),
            d * (m00 * m11 - m01 * m10)
        ]);
    }

    /**
     * 矩阵转置
     * 不会改变原矩阵
     * @returns {Mat3}
     */
    transpose()
    {
        var a = this.a;
        return new Mat3([
            a[0 * 3 + 0], a[1 * 3 + 0], a[2 * 3 + 0],
            a[0 * 3 + 1], a[1 * 3 + 1], a[2 * 3 + 1],
            a[0 * 3 + 2], a[1 * 3 + 2], a[2 * 3 + 2]
        ]);
    }

    /**
     * 创建零矩阵(全部为0)
     * @returns {Mat3}
     */
    static zero()
    {
        return new Mat3([
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ]);
    }
}
