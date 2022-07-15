/*
    此文件在worker中
*/

/**
 * 场景中的物体
 */
export class SceneObject
{
    /**
     * 物体在物理引擎中的对象
     * @type {import("./phyInterface/RigidBody").RigidBody}
     */
    body = null;
    /**
     * 坐标x(相对)
     * 此处的值为变化前
     * @type {number}
     */
    x = 0;
    /**
     * 坐标y(相对)
     * 此处的值为变化前
     * @type {number}
     */
    y = 0;
    /**
     * 坐标z(相对)
     * 此处的值为变化前
     * @type {number}
     */
    z = 0;
    /**
     * 四元数x(相对旋转)
     * 此处的值为变化前
     * @type {number}
     */
    rx = 0;
    /**
     * 四元数y(相对旋转)
     * 此处的值为变化前
     * @type {number}
     */
    ry = 0;
    /**
     * 四元数z(相对旋转)
     * 此处的值为变化前
     * @type {number}
     */
    rz = 0;
    /**
     * 四元数w(相对旋转)
     * 此处的值为变化前
     * @type {number}
     */
    rw = 1;
    /**
     * x轴缩放(相对)
     * 此处的值为变化前
     * @type {number}
     */
    sx = 1;
    /**
     * y轴缩放(相对)
     * 此处的值为变化前
     * @type {number}
     */
    sy = 1;
    /**
     * z轴缩放(相对)
     * 此处的值为变化前
     * @type {number}
     */
    sz = 1;

    /**
     * 物体的唯一编号
     * 正常时为非负整数
     * 与渲染线程中的对应
     * @type {number}
     */
    sn = -1;

    /**
     * @param {import("./phyInterface/RigidBody").RigidBody} o
     * @param {number} sn
     */
    constructor(o, sn)
    {
        this.body = o;
        this.sn = sn;
        var info = this.body.getPosition(); // 位置
        this.x = info.x;
        this.y = info.y;
        this.z = info.z;
        this.rx = info.rx;
        this.ry = info.ry;
        this.rz = info.rz;
        this.rw = info.rw;
    }

    /**
     * 设置位置
     * @param {number} x 坐标x
     * @param {number} y 坐标y
     * @param {number} z 坐标z
     * @param {number} [rx] 四元数x
     * @param {number} [ry] 四元数y
     * @param {number} [rz] 四元数z
     * @param {number} [rw] 四元数w
     */
    setPosition(x, y, z, rx, ry, rz, rw)
    {
        this.body.setPosition(x, y, z, rx, ry, rz, rw);
    }

    /**
     * 获取此物体在引擎中的信息
     */
    getInfoE()
    {
        var info = [];
        info[0] = this.sn;
        var position = this.body.getPosition(); // 位置
        info[1] = position.x;
        info[2] = position.y;
        info[3] = position.z;
        info[4] = position.rx;
        info[5] = position.ry;
        info[6] = position.rz;
        info[7] = position.rw;
        return info;
    }

    /**
     * 获取此物体的信息
     * 并同步当前对象到物理引擎状态
     * 若信息不变则返回null
     */
    getInfoA()
    {
        var info = this.getInfoE();
        if (
            info[1] == this.x &&
            info[2] == this.y &&
            info[3] == this.z &&
            info[4] == this.rx &&
            info[5] == this.ry &&
            info[6] == this.rz &&
            info[7] == this.rw
        )
            return null;
        else
        {
            this.x = info[1];
            this.y = info[2];
            this.z = info[3];
            this.rx = info[4];
            this.ry = info[5];
            this.rz = info[6];
            this.rw = info[7];
            return info;
        }
    }
}