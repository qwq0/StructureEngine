/**
 * 四元数类
 */
export class Quaternion
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
     * 球面线性插值
     * @param {Quaternion} q
     * @param {number} t 第一个四元数(this)的权重
     */
    slerp(q, t)
    {
        var ax = this.x, ay = this.y, az = this.z, aw = this.w;
        var bx = q.x, by = q.y, bz = q.z, bw = q.w;
        var ret = new Quaternion();
        var cosHalfTheta = aw * bw + ax * bx + ay * by + az * bz;
        if (Math.abs(cosHalfTheta) >= 0.999)
        {
            ret.x = ax;
            ret.y = ay;
            ret.z = az;
            ret.w = aw;
            return ret;
        }
        var halfTheta = Math.acos(cosHalfTheta);
        var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
        // 若夹角为180则结果不确定 可以绕任何与其垂直的轴旋转
        // if (Math.abs(sinHalfTheta) < 0.001)
        // {
        //     ret.x = (ax * 0.5 + bx * 0.5);
        //     ret.y = (ay * 0.5 + by * 0.5);
        //     ret.z = (az * 0.5 + bz * 0.5);
        //     ret.w = (aw * 0.5 + bw * 0.5);
        //     return ret;
        // }
        var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
        var ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
        ret.x = (ax * ratioA + bx * ratioB);
        ret.y = (ay * ratioA + by * ratioB);
        ret.z = (az * ratioA + bz * ratioB);
        ret.w = (aw * ratioA + bw * ratioB);
        return ret;
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
        return new Quaternion(
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
     * 归一化
     * 不改变原四元数
     * @returns {Quaternion}
     */
    normalize()
    {
        var multiple = 1 / Math.hypot(this.x, this.y, this.z, this.w);
        if (multiple != Infinity)
            return new Quaternion(
                this.x * multiple,
                this.y * multiple,
                this.z * multiple,
                this.w * multiple
            );
        else
            return new Quaternion();
    }
}

/**
 * 通过数组构造一个四元数类
 * @param {Array<number>} a
 */
export function newQuaternion(a)
{
    return new Quaternion(a[0], a[1], a[2], a[3]);
}