import { ScenesObject } from "./ScenesObject.js";

/**
 * 场景类
 * 记录场景中的物体
 */
export class Scenes
{
    /**
     * @type {ScenesObject}
     */
    obje = null;
    /**
     * 场景中物体id与物品对象的对应map
     * @type {Map}
     */
    idMap = new Map();

    constructor()
    {
        this.obje = new ScenesObject();
        this.obje.c = [];
    }
}