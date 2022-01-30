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
     * 场景管理worker(线程)
     * @type {Worker}
     */
    woker = null;

    constructor()
    {
        this.woker = new Worker("../src/manager/worker.js", { type: "module" });
    }
}