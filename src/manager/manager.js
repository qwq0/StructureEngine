import { SceneObject } from "../gl/scene/SceneObject.js";
import { proxyCallback } from "../util/callbackHandler.js";

/**
 * 场景管理类
 */
export class Manager
{

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

        this.worker.addEventListener("message", (e) => // 从worker发来的数据
        {
            var data = e.data;
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
                        obj.x = info[1];
                        obj.y = info[2];
                        obj.z = info[3];
                        obj.rx = info[4];
                        obj.ry = info[5];
                        obj.rz = info[6];
                        obj.rw = info[7];
                    }
                }
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
     * @param {SceneObject} e
     * @param {number} mass
     */
    addCube(e, mass)
    {
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
}