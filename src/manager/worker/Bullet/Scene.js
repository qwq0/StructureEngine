/**
 * 此文件在worker中
 */
/**
 * 使用Ammo.js以在js中使用Bullet物理引擎
 */
import { Ammo } from "../../../../lib/ammojs/ammo.wasm.js";
import { SceneObject } from "./SceneObject.js";

/**
 * Bullet接口
 * Bullet的Api文档: https://pybullet.org/Bullet/BulletFull/
*/
var bt = null;
/**
 * 初始化Ammo
 */
export async function initAmmo()
{
    bt = await Ammo(null, "../../../lib/ammojs/ammo.wasm");
    return bt;
}

/**
 * 场景类
 * 对Bullet接口的封装
 * 有重力刚体碰撞世界
 */
export class Scene
{
    /**
     * 世界
     */
    dynamicsWorld = null;

    /**
     * 物体列表
     * @type {Array<import("./SceneObject").SceneObject>}
     */
    objs = [];

    /**
     * 转换(公共)
     * 转换 仅具有平移和旋转且没有缩放,剪切的刚性变换(矩阵的封装)
     * 在方法外定义这个可以减少内存泄漏
     */
    transform = new bt.btTransform();

    initscene()
    {
        var collisionConfiguration = new bt.btDefaultCollisionConfiguration(); // 内存检查与初始化
        var dispatcher = new bt.btCollisionDispatcher(collisionConfiguration); // 处理碰撞
        var overlappingPairCache = new bt.btDbvtBroadphase(); // 处理aabb包围体
        var solver = new bt.btSequentialImpulseConstraintSolver(); // 投影高斯赛德尔迭代(LCP迭代)方法的快速SIMD实现
        this.dynamicsWorld = new bt.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration); // 处理离散刚体模拟(刚体世界)
        this.dynamicsWorld.setGravity(new bt.btVector3(0, -10, 0)); // 设置重力
    }

    /**
     * 添加一个刚体方块
     * @param {any} sn 方块id
     * @param {any} x x坐标
     * @param {any} y y坐标
     * @param {any} z z坐标
     * @param {any} [mass] 质量
     * @param {any} [sx] x缩放
     * @param {any} [sy] y缩放
     * @param {any} [sz] z缩放
     */
    addCube(sn, x, y, z, mass = 0, sx = 1, sy = 1, sz = 1)
    {
        var boxShape = new bt.btBoxShape(new bt.btVector3(sx / 2, sy / 2, sz / 2)); // 立方体大小(边长的一半)

        var startTransform = new bt.btTransform(); // 转换 仅具有平移和旋转且没有缩放,剪切的刚性变换
        startTransform.setIdentity(); // 将此转换设置为标识
        startTransform.setOrigin(new bt.btVector3(x, y, z)); // 设置坐标

        var localInertia = new bt.btVector3(0, 0, 0); // 局部惯性
        var motionState = new bt.btDefaultMotionState(startTransform); // 默认运动状态
        if (mass != 0)
        {
            boxShape.calculateLocalInertia(mass, localInertia); // 计算惯性
        }

        var rbInfo = new bt.btRigidBodyConstructionInfo(mass, motionState, boxShape, localInertia); // 刚体结构信息
        var body = new bt.btRigidBody(rbInfo); // 生成刚体

        this.dynamicsWorld.addRigidBody(body); // 添加刚体到世界
        this.objs.push(new SceneObject(body, sn)); // 放入物体列表
    }

    /**
     * 模拟(一帧)
     * 返回当前变化的物体信息
     * @param {number} dt 
     */
    simulate(dt) // 模拟
    {
        dt = dt || 1;

        this.dynamicsWorld.stepSimulation(dt, 2);

        // 从引擎中获取数据转换到js对象
        var data = { objects: [] };
        var objs = this.objs;
        var objNum = 0;
        for (var i = 0; i < objs.length; i++)
        {
            var info = objs[i].getInfoA(this.transform);
            if (info)
                data.objects[objNum++] = info;
        }
        return data;
    }
}

