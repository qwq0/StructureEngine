/**
 * 4*4矩阵类
 */
export class m4
{
    /**
     * 矩阵原始数据
     * 数组长度为16
     * @type {Float32Array}
     */
    a = null;

    /**
     * @param {Array<number> | Float32Array} [arr]
     */
    constructor(arr)
    {
        if (arr)
        {
            this.a = new Float32Array(arr);
        }
        else
        {
            this.a = new Float32Array([ // 新矩阵
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
    }
    /**
     * 复制矩阵
     * @returns {m4}
     */
    copy()
    {
        return new m4(this.a);
    }

    /**
     * 矩阵乘法
     * 不会改变原矩阵
     * 注意 此乘法与一般矩阵乘法的ab相反
     * 此函数为b*a 也就是矩阵变换乘
     * c[i][j] = sum(a[k][j] + b[i][k])
     * @param {m4} matrix 
     * @returns {m4}
     */
    multiply(matrix)
    {
        var a = this.a;
        var b = matrix.a;
        return new m4([
            (a[0 * 4 + 0] * b[0 * 4 + 0]) + (a[1 * 4 + 0] * b[0 * 4 + 1]) + (a[2 * 4 + 0] * b[0 * 4 + 2]) + (a[3 * 4 + 0] * b[0 * 4 + 3]),
            (a[0 * 4 + 1] * b[0 * 4 + 0]) + (a[1 * 4 + 1] * b[0 * 4 + 1]) + (a[2 * 4 + 1] * b[0 * 4 + 2]) + (a[3 * 4 + 1] * b[0 * 4 + 3]),
            (a[0 * 4 + 2] * b[0 * 4 + 0]) + (a[1 * 4 + 2] * b[0 * 4 + 1]) + (a[2 * 4 + 2] * b[0 * 4 + 2]) + (a[3 * 4 + 2] * b[0 * 4 + 3]),
            (a[0 * 4 + 3] * b[0 * 4 + 0]) + (a[1 * 4 + 3] * b[0 * 4 + 1]) + (a[2 * 4 + 3] * b[0 * 4 + 2]) + (a[3 * 4 + 3] * b[0 * 4 + 3]),

            (a[0 * 4 + 0] * b[1 * 4 + 0]) + (a[1 * 4 + 0] * b[1 * 4 + 1]) + (a[2 * 4 + 0] * b[1 * 4 + 2]) + (a[3 * 4 + 0] * b[1 * 4 + 3]),
            (a[0 * 4 + 1] * b[1 * 4 + 0]) + (a[1 * 4 + 1] * b[1 * 4 + 1]) + (a[2 * 4 + 1] * b[1 * 4 + 2]) + (a[3 * 4 + 1] * b[1 * 4 + 3]),
            (a[0 * 4 + 2] * b[1 * 4 + 0]) + (a[1 * 4 + 2] * b[1 * 4 + 1]) + (a[2 * 4 + 2] * b[1 * 4 + 2]) + (a[3 * 4 + 2] * b[1 * 4 + 3]),
            (a[0 * 4 + 3] * b[1 * 4 + 0]) + (a[1 * 4 + 3] * b[1 * 4 + 1]) + (a[2 * 4 + 3] * b[1 * 4 + 2]) + (a[3 * 4 + 3] * b[1 * 4 + 3]),

            (a[0 * 4 + 0] * b[2 * 4 + 0]) + (a[1 * 4 + 0] * b[2 * 4 + 1]) + (a[2 * 4 + 0] * b[2 * 4 + 2]) + (a[3 * 4 + 0] * b[2 * 4 + 3]),
            (a[0 * 4 + 1] * b[2 * 4 + 0]) + (a[1 * 4 + 1] * b[2 * 4 + 1]) + (a[2 * 4 + 1] * b[2 * 4 + 2]) + (a[3 * 4 + 1] * b[2 * 4 + 3]),
            (a[0 * 4 + 2] * b[2 * 4 + 0]) + (a[1 * 4 + 2] * b[2 * 4 + 1]) + (a[2 * 4 + 2] * b[2 * 4 + 2]) + (a[3 * 4 + 2] * b[2 * 4 + 3]),
            (a[0 * 4 + 3] * b[2 * 4 + 0]) + (a[1 * 4 + 3] * b[2 * 4 + 1]) + (a[2 * 4 + 3] * b[2 * 4 + 2]) + (a[3 * 4 + 3] * b[2 * 4 + 3]),

            (a[0 * 4 + 0] * b[3 * 4 + 0]) + (a[1 * 4 + 0] * b[3 * 4 + 1]) + (a[2 * 4 + 0] * b[3 * 4 + 2]) + (a[3 * 4 + 0] * b[3 * 4 + 3]),
            (a[0 * 4 + 1] * b[3 * 4 + 0]) + (a[1 * 4 + 1] * b[3 * 4 + 1]) + (a[2 * 4 + 1] * b[3 * 4 + 2]) + (a[3 * 4 + 1] * b[3 * 4 + 3]),
            (a[0 * 4 + 2] * b[3 * 4 + 0]) + (a[1 * 4 + 2] * b[3 * 4 + 1]) + (a[2 * 4 + 2] * b[3 * 4 + 2]) + (a[3 * 4 + 2] * b[3 * 4 + 3]),
            (a[0 * 4 + 3] * b[3 * 4 + 0]) + (a[1 * 4 + 3] * b[3 * 4 + 1]) + (a[2 * 4 + 3] * b[3 * 4 + 2]) + (a[3 * 4 + 3] * b[3 * 4 + 3])
        ]);
    }

    /**
     * 透视投影矩阵
     * @param {number} fieldOfViewInRadians 
     * @param {number} aspect 
     * @param {number} near 
     * @param {number} far 
     * @returns {m4}
     */
    static perspective(fieldOfViewInRadians, aspect, near, far)
    {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        return new m4([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]);
    }

    /**
     * 转换坐标(未测试)
     * @param {number} w 宽
     * @param {number} h 高
     * @param {number} d 深
     * @returns {m4}
     */
    static projection(w, h, d)
    {
        return new m4([
            2 / w, 0, 0, 0,
            0, -2 / h, 0, 0,
            0, 0, 2 / d, 0,
            -1, 1, 0, 1
        ]);
    }

    /*
        以下矩阵变换经过优化
        可能提供效率 未经过效率测试
    */

    /**
     * 平移矩阵
     * 将改变原矩阵
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {m4}
     */
    translation(x, y, z)
    {
        this.a[3 * 4 + 0] +=
            x * this.a[0 * 4 + 0] +
            y * this.a[1 * 4 + 0] +
            z * this.a[2 * 4 + 0];
        this.a[3 * 4 + 1] +=
            x * this.a[0 * 4 + 1] +
            y * this.a[1 * 4 + 1] +
            z * this.a[2 * 4 + 1];
        this.a[3 * 4 + 2] +=
            x * this.a[0 * 4 + 2] +
            y * this.a[1 * 4 + 2] +
            z * this.a[2 * 4 + 2];
        this.a[3 * 4 + 3] +=
            x * this.a[0 * 4 + 3] +
            y * this.a[1 * 4 + 3] +
            z * this.a[2 * 4 + 3];
        return this;
    }
    /**
     * 绕x轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} rx
     */
    rotateX(rx)
    {
        var a = this.a;
        /*
            1, 0,  0, 0,
            0, c,  s, 0,
            0, -s, c, 0,
            0, 0,  0, 1
        */
        var cosX = Math.cos(rx),
            sinX = Math.sin(rx),
            l0 = a[1 * 4 + 0],
            l1 = a[1 * 4 + 1],
            l2 = a[1 * 4 + 2],
            l3 = a[1 * 4 + 3],
            r0 = a[2 * 4 + 0],
            r1 = a[2 * 4 + 1],
            r2 = a[2 * 4 + 2],
            r3 = a[2 * 4 + 3];
        a[1 * 4 + 0] = l0 * cosX + r0 * sinX;
        a[1 * 4 + 1] = l1 * cosX + r1 * sinX;
        a[1 * 4 + 2] = l2 * cosX + r2 * sinX;
        a[1 * 4 + 3] = l3 * cosX + r3 * sinX;
        a[2 * 4 + 0] = r0 * cosX - l0 * sinX;
        a[2 * 4 + 1] = r1 * cosX - l1 * sinX;
        a[2 * 4 + 2] = r2 * cosX - l2 * sinX;
        a[2 * 4 + 3] = r3 * cosX - l3 * sinX;
    }
    /**
     * 绕y轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} ry
     */
    rotateY(ry)
    {
        var a = this.a;
        /*
            c, 0, -s, 0,
            0, 1, 0,  0,
            s, 0, c,  0,
            0, 0, 0,  1
        */
        var cosY = Math.cos(ry),
            sinY = Math.sin(ry),
            l0 = a[0 * 4 + 0],
            l1 = a[0 * 4 + 1],
            l2 = a[0 * 4 + 2],
            l3 = a[0 * 4 + 3],
            r0 = a[2 * 4 + 0],
            r1 = a[2 * 4 + 1],
            r2 = a[2 * 4 + 2],
            r3 = a[2 * 4 + 3];
        a[0 * 4 + 0] = l0 * cosY - r0 * sinY;
        a[0 * 4 + 1] = l1 * cosY - r1 * sinY;
        a[0 * 4 + 2] = l2 * cosY - r2 * sinY;
        a[0 * 4 + 3] = l3 * cosY - r3 * sinY;
        a[2 * 4 + 0] = r0 * cosY + l0 * sinY;
        a[2 * 4 + 1] = r1 * cosY + l1 * sinY;
        a[2 * 4 + 2] = r2 * cosY + l2 * sinY;
        a[2 * 4 + 3] = r3 * cosY + l3 * sinY;
    }
    /**
     * 绕z轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} rz
     */
    rotateZ(rz)
    {
        var a = this.a;
        /*
            c,  s, 0, 0,
            -s, c, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        */
        var cosZ = Math.cos(rz),
            sinZ = Math.sin(rz),
            l0 = a[0 * 4 + 0],
            l1 = a[0 * 4 + 1],
            l2 = a[0 * 4 + 2],
            l3 = a[0 * 4 + 3],
            r0 = a[1 * 4 + 0],
            r1 = a[1 * 4 + 1],
            r2 = a[1 * 4 + 2],
            r3 = a[1 * 4 + 3];
        a[0 * 4 + 0] = l0 * cosZ + r0 * sinZ;
        a[0 * 4 + 1] = l1 * cosZ + r1 * sinZ;
        a[0 * 4 + 2] = l2 * cosZ + r2 * sinZ;
        a[0 * 4 + 3] = l3 * cosZ + r3 * sinZ;
        a[1 * 4 + 0] = r0 * cosZ - l0 * sinZ;
        a[1 * 4 + 1] = r1 * cosZ - l1 * sinZ;
        a[1 * 4 + 2] = r2 * cosZ - l2 * sinZ;
        a[1 * 4 + 3] = r3 * cosZ - l3 * sinZ;
    }
    /**
     * 旋转矩阵
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {m4}
     */
    rotate(rx, ry, rz)
    {
        this.rotateX(rx);
        this.rotateY(ry);
        this.rotateZ(rz);
        return this;
    }

    /**
     * 缩放矩阵
     * 将改变原矩阵
     * @param {number} sx
     * @param {number} sy
     * @param {number} sz
     * @returns {m4}
     */
    scale(sx, sy, sz)
    {
        this.a[0 * 4 + 0] *= sx;
        this.a[0 * 4 + 1] *= sx;
        this.a[0 * 4 + 2] *= sx;
        this.a[0 * 4 + 3] *= sx;
        this.a[1 * 4 + 0] *= sy;
        this.a[1 * 4 + 1] *= sy;
        this.a[1 * 4 + 2] *= sy;
        this.a[1 * 4 + 3] *= sy;
        this.a[2 * 4 + 0] *= sz;
        this.a[2 * 4 + 1] *= sz;
        this.a[2 * 4 + 2] *= sz;
        this.a[2 * 4 + 3] *= sz;
        return this;
    }
}
