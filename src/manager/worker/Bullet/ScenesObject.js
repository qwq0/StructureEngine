/**
 * 此文件在worker中
 */
/**
 * 场景中的物体
 */
export class ScenesObject
{
    /**
     * 物体在物理引擎中的对象
     */
    o = null;
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
     * 物体id
     * @type {string}
     */
    id = "";

    /**
     * @param {any} o
     * @param {string} id
     */
    constructor(o, id)
    {
        this.o = o;
        this.id = id;
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
        var obj = this.o;
        var transform = obj.getWorldTransform();
        var origin = transform.getOrigin();
        origin.setX(x);
        origin.setY(y);
        origin.setZ(z);
        if (rx != undefined)
        {
            var rotation = transform.getRotation();
            rotation.setX(rx)
            rotation.setY(ry);
            rotation.setZ(rz);
            rotation.setW(rw);
            transform.setRotation(rotation);
        }
        obj.activate();
    }

    /**
     * 获取此物体在引擎中的信息
     * @param {any} transform
     */
    getInfoE(transform)
    {
        var info = [];
        info[0] = this.id;
        var body = this.o;
        body.getMotionState().getWorldTransform(transform);
        var origin = transform.getOrigin(); // 位置坐标
        info[1] = origin.x();
        info[2] = origin.y();
        info[3] = origin.z();
        var rotation = transform.getRotation(); // 四元数角度
        info[4] = rotation.x();
        info[5] = rotation.y();
        info[6] = rotation.z();
        info[7] = rotation.w();
        return info;
    }

    /**
     * 获取此物体的信息
     * 并同步当前对象到物理引擎状态
     * 若信息不变则返回null
     * @param {any} transform
     */
    getInfoA(transform)
    {
        var info = this.getInfoE(transform);
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