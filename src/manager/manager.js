import { SceneObject } from "../gl/scene/SceneObject.js";
import { Vec3 } from "../math/Vec3.js";
import { proxyCallback } from "../util/callbackHandler.js";
import { SmoothMove, smoothMoveSymbol } from "./SmoothMove.js";

/**
 * 场景管理类
 * 使用worker和物理引擎管理场景中的物体
 */
export class Manager
{
    /**
     * 模拟次数统计
     * @type {number}
     */
    simulateCount = 0;

    /**
     * 物体sn对应表
     * @type {Map<number, SceneObject>}
     */
    sMap = new Map();

    /**
     * 场景管理worker(线程)
     * @type {Worker}
     */
    worker = null;

    /**
     * 准备完成
     * @type {boolean}
     */
    isReady = false;

    constructor()
    {
        this.worker = new Worker("../src/manager/worker/worker.js", { type: "module" });

        var last = Date.now();
        this.worker.addEventListener("message", (e) => // 从worker发来的数据
        {
            var data = e.data;
            var now = Date.now();
            var et = now - last;
            last = now;
            if (data.objects)
            {
                /**
                 * @type {Array}
                 */
                var objA = data.objects;
                for (var i = 0; i < objA.length; i++)
                {
                    var info = objA[i];
                    var obj = this.sMap.get(info[0]);
                    if (obj)
                    {
                        /**
                         * @type {SmoothMove}
                         */
                        var sm = obj.addi[smoothMoveSymbol];
                        sm.setPosition(info[1], info[2], info[3]);
                        sm.setRotation(info[4], info[5], info[6], info[7]);
                    }
                }
                this.simulateCount++;
            }
            else if (data.isReady)
            {
                this.isReady = true;
                this.worker.postMessage({ isReady: true });
            }
            else
                console.log(e);
        });
    }

    /**
     * 等待直到初始化完成(准备好)
     */
    async waitInit()
    {
        if (this.isReady)
            return;
        await proxyCallback(e =>
        {
            Object.defineProperty(this, "isReady", {
                set: (o) =>
                {
                    if (o == true)
                        e();
                },
                get: () => false
            });
        }, () =>
        {
            delete this.isReady;
            this.isReady = true;
        });
    }

    /**
     * 每帧调用
     */
    tick()
    {
        this.sMap.forEach(o =>
        {
            if (o.addi[smoothMoveSymbol])
                o.addi[smoothMoveSymbol].tick(Date.now());
        });
    }

    /**
     * @param {SceneObject} e
     * @param {number} mass
     */
    addCube(e, mass)
    {
        e.spCB = e => this.updatePosition(e);
        e.addi[smoothMoveSymbol] = new SmoothMove(e);
        this.sMap.set(e.sn, e);
        this.worker.postMessage({
            objects: [{
                sn: e.sn,
                x: e.x,
                y: e.y,
                z: e.z,
                mass: mass,
                sx: e.sx,
                sy: e.sy,
                sz: e.sz
            }]
        });
    }

    /**
     * @param {SceneObject} e
     */
    updatePosition(e)
    {
        this.worker.postMessage({
            objects: [[
                e.sn,
                e.x,
                e.y,
                e.z,
                e.rx,
                e.ry,
                e.rz,
                e.rw
            ]]
        });
    }

    /**
     * @param {SceneObject} e
     * @param {Vec3} force
     */
    setLinearForce(e, force)
    {
        this.worker.postMessage({
            objects: [[
                e.sn,
                force.x,
                force.y,
                force.z
            ]]
        });
    }
}