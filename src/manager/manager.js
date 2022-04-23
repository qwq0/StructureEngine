import { ScenesObject } from "../gl/ScenesObject.js";
import { ManagerObject } from "./ManagerObject.js";

/**
 * 场景管理类
 */
export class Manager
{
    /**
     * 场景物体树
     * @type {ManagerObject}
     */
    obje = null;

    /**
     * 物体对应表
     * @type {Map<string | number, ScenesObject>}
     */
    oMap = new Map();

    /**
     * 场景管理worker(线程)
     * @type {Worker}
     */
    woker = null;

    constructor()
    {
        this.woker = new Worker("../src/manager/worker/worker.js", { type: "module" });

        this.woker.addEventListener("message", (e) => // 从worker发来的数据
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
                    var obj = this.oMap.get(info[0]);
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
                this.woker.postMessage(1);
            else
                console.log(e);
        });
    }
}