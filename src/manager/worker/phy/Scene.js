/*
    此文件在worker中
*/
import { OBoxGeometry, RigidBody, RigidBodyConfig, RigidBodyType, Shape, ShapeConfig, Vec3, World } from "../../../../lib/OimoPhysics/index.js";
import { SceneObject } from "./SceneObject.js";


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
    world = null;

    /**
     * 物体列表
     * @type {Array<import("./SceneObject").SceneObject>}
     */
    objs = [];


    constructor()
    {
        var world = new World(); // 世界
        world.setGravity(new Vec3(0, -10, 0)); // 设置重力
        this.world = world;
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
        var shapec = new ShapeConfig();
        shapec.geometry = new OBoxGeometry(new Vec3(sx / 2, sy / 2, sz / 2));
        var bodyc = new RigidBodyConfig();
        bodyc.type = (mass == 0 ? RigidBodyType.STATIC : RigidBodyType.DYNAMIC);
        bodyc.position = new Vec3(x, y, z);
        var body = new RigidBody(bodyc);
        body.addShape(new Shape(shapec));
        var massData = body.getMassData();
        massData.mass = mass;
        body.setMassData(massData);
        this.world.addRigidBody(body);

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

        this.world.step(dt);

        // 从引擎中获取数据转换到js对象
        var data = { objects: [] };
        var objs = this.objs;
        var objNum = 0;
        for (var i = 0; i < objs.length; i++)
        {
            var info = objs[i].getInfoA();
            if (info)
                data.objects[objNum++] = info;
        }
        return data;
    }
}

