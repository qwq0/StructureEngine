import { v4 } from "./v4.js";

/**
 * 4*4矩阵类
 */
export class m4
{
    /**
     * 矩阵原始数据
     * 数组长度为16
     * @type {Array<number>}
     */
    a = null;

    /**
     * @param {Array<number>} [arr]
     */
    constructor(arr)
    {
        if (arr)
        {
            this.a = arr.slice();
        }
        else
        {
            this.a = [ // 新矩阵
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
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
     * 矩阵求逆
     * 不会改变原矩阵
     * @returns {m4}
     */
    inverse()
    {
        var a = this.a;
        var m00 = a[0 * 4 + 0], m01 = a[0 * 4 + 1], m02 = a[0 * 4 + 2], m03 = a[0 * 4 + 3],
            m10 = a[1 * 4 + 0], m11 = a[1 * 4 + 1], m12 = a[1 * 4 + 2], m13 = a[1 * 4 + 3],
            m20 = a[2 * 4 + 0], m21 = a[2 * 4 + 1], m22 = a[2 * 4 + 2], m23 = a[2 * 4 + 3],
            m30 = a[3 * 4 + 0], m31 = a[3 * 4 + 1], m32 = a[3 * 4 + 2], m33 = a[3 * 4 + 3];
        var k0 = m22 * m33;
        var k1 = m32 * m23;
        var k2 = m12 * m33;
        var k3 = m32 * m13;
        var k4 = m12 * m23;
        var k5 = m22 * m13;
        var k6 = m02 * m33;
        var k7 = m32 * m03;
        var k8 = m02 * m23;
        var k9 = m22 * m03;
        var k10 = m02 * m13;
        var k11 = m12 * m03;
        var k12 = m20 * m31;
        var k13 = m30 * m21;
        var k14 = m10 * m31;
        var k15 = m30 * m11;
        var k16 = m10 * m21;
        var k17 = m20 * m11;
        var k18 = m00 * m31;
        var k19 = m30 * m01;
        var k20 = m00 * m21;
        var k21 = m20 * m01;
        var k22 = m00 * m11;
        var k23 = m10 * m01;
        var t0 = (k0 * m11 + k3 * m21 + k4 * m31) - (k1 * m11 + k2 * m21 + k5 * m31);
        var t1 = (k1 * m01 + k6 * m21 + k9 * m31) - (k0 * m01 + k7 * m21 + k8 * m31);
        var t2 = (k2 * m01 + k7 * m11 + k10 * m31) - (k3 * m01 + k6 * m11 + k11 * m31);
        var t3 = (k5 * m01 + k8 * m11 + k11 * m21) - (k4 * m01 + k9 * m11 + k10 * m21);
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
        return new m4([
            d * t0,
            d * t1,
            d * t2,
            d * t3,

            d * ((k1 * m10 + k2 * m20 + k5 * m30) - (k0 * m10 + k3 * m20 + k4 * m30)),
            d * ((k0 * m00 + k7 * m20 + k8 * m30) - (k1 * m00 + k6 * m20 + k9 * m30)),
            d * ((k3 * m00 + k6 * m10 + k11 * m30) - (k2 * m00 + k7 * m10 + k10 * m30)),
            d * ((k4 * m00 + k9 * m10 + k10 * m20) - (k5 * m00 + k8 * m10 + k11 * m20)),

            d * ((k12 * m13 + k15 * m23 + k16 * m33) - (k13 * m13 + k14 * m23 + k17 * m33)),
            d * ((k13 * m03 + k18 * m23 + k21 * m33) - (k12 * m03 + k19 * m23 + k20 * m33)),
            d * ((k14 * m03 + k19 * m13 + k22 * m33) - (k15 * m03 + k18 * m13 + k23 * m33)),
            d * ((k17 * m03 + k20 * m13 + k23 * m23) - (k16 * m03 + k21 * m13 + k22 * m23)),

            d * ((k14 * m22 + k17 * m32 + k13 * m12) - (k16 * m32 + k12 * m12 + k15 * m22)),
            d * ((k20 * m32 + k12 * m02 + k19 * m22) - (k18 * m22 + k21 * m32 + k13 * m02)),
            d * ((k18 * m12 + k23 * m32 + k15 * m02) - (k22 * m32 + k14 * m02 + k19 * m12)),
            d * ((k22 * m22 + k16 * m02 + k21 * m12) - (k20 * m12 + k23 * m22 + k17 * m02)),
        ]);
    }

    /**
     * 矩阵转置
     * 不会改变原矩阵
     * @returns {m4}
     */
    transpose()
    {
        var a = this.a;
        return new m4([
            a[0 * 4 + 0], a[1 * 4 + 0], a[2 * 4 + 0], a[3 * 4 + 0],
            a[0 * 4 + 1], a[1 * 4 + 1], a[2 * 4 + 1], a[3 * 4 + 1],
            a[0 * 4 + 2], a[1 * 4 + 2], a[2 * 4 + 2], a[3 * 4 + 2],
            a[0 * 4 + 3], a[1 * 4 + 3], a[2 * 4 + 3], a[3 * 4 + 3]
        ]);
    }

    /**
     * 透视投影矩阵
     * 此矩阵将使用向量的w
     * z将不是线性变化的
     * 使用此矩阵纹理将正确映射
     * @param {number} fov 对角线视角场(单位:弧度)
     * @param {number} aspect 视口垂直长度与水平长度的比例
     * @param {number} near 视锥最近处
     * @param {number} far 视锥最远处
     * @returns {m4}
     */
    static perspective(fov, aspect, near, far)
    {
        var f = 1 / Math.tan(fov * 0.5);
        var rangeInv = 1.0 / (near - far);

        return new m4([
            Math.sqrt(1 + (aspect * aspect)) * f, 0, 0, 0,
            0, Math.sqrt(1 + 1 / (aspect * aspect)) * f, 0, 0,
            0, 0, 1 + 2 * far * rangeInv, -1, // 1 + ((2far) / (near - far))
            0, 0, near * far * rangeInv * 2, 0 // near * far * 2 / (near - far)
        ]); // Z = 2 * (0.5 + far + near * far / z) / (near - far)
    }

    /**
     * 坐标转换矩阵(正交投影)
     *  将以原点为中心
     *  面朝-z方向深度为d的
     *  xy方向长度分别为wh坐标
     *  转换为opengl(-1到1)坐标系
     * @param {number} w 宽
     * @param {number} h 高
     * @param {number} d 深
     * @returns {m4}
     */
    static projection(w, h, d)
    {
        return new m4([
            2 / w, 0, 0, 0,
            0, 2 / h, 0, 0,
            0, 0, -2 / d, 0,
            0, 0, -1, 1
        ]);
    }

    /**
     * 四元数转矩阵
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     * @returns {m4}
     */
    static quaternion(x, y, z, w)
    {
        return new m4([
            1 - 2 * (y * y + z * z),
            2 * (x * y - w * z),
            2 * (x * z + w * y),
            0,

            2 * (x * y + w * z),
            1 - 2 * (x * x + z * z),
            2 * (y * z - w * x),
            0,

            2 * (x * z - w * y),
            2 * (y * z + w * x),
            1 - 2 * (x * x + y * y),
            0,

            0,
            0,
            0,
            1
        ]);
    }

    /*
        部分矩阵变换经过优化
        可能提高效率 实际性能表现未经测试
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
     * 旋转矩阵(旋转顺序ZYX)
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {m4}
     */
    rotateZYX(rx, ry, rz)
    {
        this.rotateZ(rz);
        this.rotateY(ry);
        this.rotateX(rx);
        return this;
    }
    /**
     * 旋转矩阵(旋转顺序XYZ)
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {m4}
     */
    rotateXYZ(rx, ry, rz)
    {
        this.rotateX(rx);
        this.rotateY(ry);
        this.rotateZ(rz);
        return this;
    }
    /**
     * 旋转矩阵(根据四元数)
     * 不会改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @param {number} rw
     * @returns {m4}
     */
    rotateQuat(rx, ry, rz, rw)
    {
        return this.multiply(m4.quaternion(rx, ry, rz, rw));
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

    /**
     * 乘v4向量
     * (矩阵 乘 向量)
     * @param {import("./v4").v4} v
     */
    mulV4(v)
    {
        var a = this.a;
        return new v4(
            (v.x * a[0]) + (v.y * a[1]) + (v.z * a[2]) + (v.w * a[3]),
            (v.x * a[4]) + (v.y * a[5]) + (v.z * a[6]) + (v.w * a[7]),
            (v.x * a[8]) + (v.y * a[9]) + (v.z * a[10]) + (v.w * a[11]),
            (v.x * a[12]) + (v.y * a[13]) + (v.z * a[14]) + (v.w * a[15])
        );
    }
}
