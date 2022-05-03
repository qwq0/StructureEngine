import { Camera } from "../Camera.js"
import { SceneObject } from "./sceneObject.js";

/**
 * 场景类
 * 需要绑定到 webgl上下文
 * 记录场景中的物体
 */
export class Scene
{
    /**
     * @type {SceneObject}
     */
    obje = null;
    /**
     * 场景中物体id与物品对象的对应map
     * @package
     * @type {Map}
     */
    idMap = new Map();
    /**
     * 绑定的webgl上下文
     * @package
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.obje = new SceneObject();
        this.obje.scene = this;
        this.gl = gl;
    }

    /**
     * 添加物体
     * @param {SceneObject} o
     */
    addChild(o)
    {
        this.obje.addChild(o);
    }

    createCamera()
    {
        return new Camera(this);
    }
}