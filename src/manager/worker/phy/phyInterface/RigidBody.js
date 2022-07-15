import { phyCt } from "./phyContext.js";
import { Shape } from "./Shape.js";

/**
 * 刚体接口
 * @interface
 */
export class RigidBody
{
    /**
     * 刚体
     * @type {import("../../../../../lib/ammojs/ammo").Ammo.btRigidBody}
     */
    body = null;
    /**
     * 形状
     * @type {import("../../../../../lib/ammojs/ammo").Ammo.btCollisionShape}
     */
    shape = null;

    /**
     * @param {Shape} shape 形状
     * @param {number} mass 质量
     * @param {number} x 坐标x
     * @param {number} y 坐标y
     * @param {number} z 坐标z
     * @param {number} rx 四元数x
     * @param {number} ry 四元数y
     * @param {number} rz 四元数z
     * @param {number} rw 四元数w
     */
    constructor(shape, mass, x, y, z, rx, ry, rz, rw)
    {
        var Ammo = phyCt.Ammo;

        var shapeObj = shape.shape; // 刚体形状
        var localInertia = new Ammo.btVector3(0, 0, 0); // 局部惯性向量
        if (mass != 0)
            shapeObj.calculateLocalInertia(mass, localInertia); // 计算局部惯性

        var transform = new Ammo.btTransform(); // 变换
        transform.setIdentity(); // 标准矩阵
        transform.setOrigin(new Ammo.btVector3(x, y, z)); // 设置原点坐标
        transform.setRotation(new Ammo.btQuaternion(rx, ry, rz, rw)); // 设置旋转
        var defaultMotionState = new Ammo.btDefaultMotionState(transform); // 默认运动状态
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, defaultMotionState, shapeObj, localInertia); // 刚体信息
        var body = new Ammo.btRigidBody(rbInfo); // 创建刚体

        this.shape = shapeObj;
        this.body = body;
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
        var transform = this.body.getWorldTransform();
        var position = transform.getOrigin();
        var quaternion = transform.getRotation();
        position.setX(x);
        position.setY(y);
        position.setZ(z);
        quaternion.setX(rx);
        quaternion.setY(ry);
        quaternion.setZ(rz);
        quaternion.setW(rw);
        this.body.setWorldTransform(transform);
        this.body.activate();
    }

    /**
     * 设置线性力
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setLinearForce(x, y, z)
    {
        var Ammo = phyCt.Ammo;
        var force = new Ammo.btVector3(x, y, z);
        this.body.setLinearFactor(force);
        Ammo.destroy(force);
        this.body.activate();
    }

    /**
     * 设置阻尼
     * @param {number} lin 线阻尼
     * @param {number} ang 角阻尼
     */
    setDamping(lin, ang)
    {
        this.body.setDamping(lin, ang);
    }

    /**
     * 获取位置
     * @returns {{
     *     x:number,
     *     y:number,
     *     z:number,
     *     rx:number,
     *     ry:number,
     *     rz:number,
     *     rw:number
     * }}
     */
    getPosition()
    {
        var transform = this.body.getWorldTransform();
        var position = transform.getOrigin();
        var quaternion = transform.getRotation();
        var info = {
            x: position.x(),
            y: position.y(),
            z: position.z(),
            rx: quaternion.x(),
            ry: quaternion.y(),
            rz: quaternion.z(),
            rw: quaternion.w()
        };
        return info;
    }

    /**
     * 物体是否休眠
     */
    isActive()
    {
        return this.body.isActive();
    }
}