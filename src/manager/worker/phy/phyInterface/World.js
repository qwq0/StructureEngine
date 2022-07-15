import { phyCt } from "./phyContext.js";
import { RigidBody } from "./RigidBody.js";
/**
 * 世界接口
 */
export class World
{
    /**
     * @type {import("../../../../../lib/ammojs/ammo").Ammo.btDiscreteDynamicsWorld}
     */
    world = null;

    constructor()
    {
        var Ammo = phyCt.Ammo;
        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // 默认碰撞配置
        var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration); // 碰撞调度
        var overlappingPairCache = new Ammo.btDbvtBroadphase(); // dbvt宽相(粗略处理)
        var solver = new Ammo.btSequentialImpulseConstraintSolver(); // 连续冲量约束求解器
        var dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration); // 离散动力学世界
        dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0)); // 设置重力
        this.world = dynamicsWorld;
    }

    /**
     * @param {RigidBody} rbObj
     */
    addRigidBody(rbObj)
    {
        this.world.addRigidBody(rbObj.body);
    }

    /**
     * 模拟
     * 返回当前变化的物体信息
     * @param {number} dt 模拟的毫秒数(整数)
     */
    simulate(dt)
    {
        this.world.stepSimulation(dt);
    }
}