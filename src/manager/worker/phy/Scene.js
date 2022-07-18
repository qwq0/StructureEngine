/*
    此文件在worker中
*/
import { RigidBody } from "./phyInterface/RigidBody.js";
import { Shape } from "./phyInterface/Shape.js";
import { World } from "./phyInterface/World.js";
import { SceneObject } from "./SceneObject.js";


/**
 * 场景类
 */
export class Scene
{
    /**
     * 世界
     * @type {World}
     */
    world = null;

    /**
     * 物体列表
     * @type {Array<import("./SceneObject").SceneObject>}
     */
    objs = [];

    /**
     * 物体列表
     * @type {Map<number, import("./SceneObject").SceneObject>}
     */
    snMap = new Map();

    constructor()
    {
        this.world = new World();
    }


    /**
     * 添加物体
     * @param {number} sn
     * @param {RigidBody} body
     */
    addSceneObject(sn, body)
    {
        var obj = new SceneObject(body, sn);
        this.objs.push(obj); // 放入物体列表
        this.snMap.set(sn, obj); // 放入唯一标识Map
    }

    /**
     * 获取物体
     * @param {number} sn
     * @returns {SceneObject}
     */
    getSceneObject(sn)
    {
        return this.snMap.get(sn);
    }


    /**
     * 添加一个刚体方块
     * @param {number} sn 方块id
     * @param {number} x x坐标
     * @param {number} y y坐标
     * @param {number} z z坐标
     * @param {number} mass 质量
     * @param {number} [sx] x缩放
     * @param {number} [sy] y缩放
     * @param {number} [sz] z缩放
     */
    addCube(sn, x, y, z, mass, sx = 1, sy = 1, sz = 1)
    {
        var body = new RigidBody(Shape.cube(sx, sy, sz), mass, x, y, z, 0, 0, 0, 1);
        this.world.addRigidBody(body);
        body.setDamping(0.02, 0.02);
        this.addSceneObject(sn, body);
    }

    /**
     * 添加一个三角网络
     * @param {number} sn 方块id
     * @param {Array<number>} pos 顶点数组
     * @param {number} mass 质量
     * @param {number} x x坐标
     * @param {number} y y坐标
     * @param {number} z z坐标
     * @param {number} [sx] x缩放
     * @param {number} [sy] y缩放
     * @param {number} [sz] z缩放
     */
    addMultimaterialTriangleMesh(sn, pos, mass, x, y, z, sx = 1, sy = 1, sz = 1)
    {
        var body = new RigidBody(Shape.multimaterialTriangleMesh(pos));
        this.world.addRigidBody(body);
        this.addSceneObject(sn, body);
    }

    /**
     * 模拟
     * 返回当前变化的物体信息
     * @param {number} dt 模拟的毫秒数(整数)
     */
    simulate(dt) // 模拟
    {
        dt = dt || 1;

        this.world.simulate(dt);

        // 从引擎中获取数据转换到js对象
        var data = { objects: [] };
        var objs = this.objs;
        for (var i = 0; i < objs.length; i++)
            if (objs[i].body.isActive())
            {
                var info = objs[i].getInfoA();
                if (info)
                    data.objects.push(info);
            }
        return data;
    }
}

