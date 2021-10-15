import { ScenesObject } from "./ScenesObject.js";

/**
 * 场景类
 * 需要绑定到 webgl上下文
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
    /**
     * 绑定的webgl上下文
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.obje = new ScenesObject();
        this.obje.c = [];
        this.gl = gl;
    }
}