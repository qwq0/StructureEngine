import { SceneObject } from "../gl/scene/SceneObject.js";
import { Quaternion } from "../math/Quaternion.js";

/**
 * 平滑移动标志
 * 将SmoothMove绑定到SceneObject.addi上
 */
export const smoothMoveSymbol = Symbol("smoothMoveSymbol");
/**
 * 平滑移动场景中的物体
 * 因为物理引擎的tps小于渲染fps
 */
export class SmoothMove
{
    /**
     * 对应的SceneObject
     * @package
     * @type {SceneObject}
     */
    obj = null;

    /**
     * (目标)坐标x(相对)
     * @package
     * @type {number}
     */
    x = 0;
    /**
     * (目标)坐标y(相对)
     * @package
     * @type {number}
     */
    y = 0;
    /**
     * (目标)坐标z(相对)
     * @package
     * @type {number}
     */
    z = 0;
    /**
     * (目标)四元数x(相对旋转)
     * @package
     * @type {number}
     */
    rx = 0;
    /**
     * (目标)四元数y(相对旋转)
     * @package
     * @type {number}
     */
    ry = 0;
    /**
     * (目标)四元数z(相对旋转)
     * @package
     * @type {number}
     */
    rz = 0;
    /**
     * (目标)四元数w(相对旋转)
     * @package
     * @type {number}
     */
    rw = 1;

    /**
     * 对应的SceneObject的位置需要更新
     * @package
     * @type {boolean}
     */
    needUpdate = false;

    /**
     * 预计完成时的毫秒时间戳
     * @package
     * @type {number}
     */
    ecTs = 0;

    /**
     * 开始移动时的毫秒时间戳
     * @package
     * @type {number}
     */
    stTs = 0;

    /**
     * @param {SceneObject} obj
     */
    constructor(obj)
    {
        this.obj = obj;
    }

    /**
     * 设置目标坐标
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.needUpdate = true;
    }

    /**
     * 设置目标旋转(四元数)
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @param {number} rw
     */
    setRotation(rx, ry, rz, rw)
    {
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.rw = rw;
        this.needUpdate = true;
    }

    /**
     * 每帧调用以更新SceneObject的位置
     * @param {number} now 毫秒时间戳 应传入Date.now()
     */
    tick(now)
    {
        if (this.needUpdate)
        {
            var o = this.obj;
            // if (now >= this.ecTs)
            // {
            //     ({ x: o.x, y: o.y, z: o.z, rx: o.rx, ry: o.ry, rz: o.rz, rw: o.rw } = this);
            //     o.needUpdate = true;
            //     this.needUpdate = false;
            //     return;
            // }
            var factorT = 0.25;
            var factorO = 1 - factorT;
            o.x = this.x * factorT + o.x * factorO;
            o.y = this.y * factorT + o.y * factorO;
            o.z = this.z * factorT + o.z * factorO;
            var qO = new Quaternion(o.rx, o.ry, o.rz, o.rw);
            var qT = new Quaternion(this.rx, this.ry, this.rz, this.rw);
            var qN = qT.slerp(qO, factorT);
            ({ x: o.rx, y: o.ry, z: o.rz, w: o.rw } = qN);
            o.needUpdate = true;
        }
    }
}