import { Camera } from "../Camera.js"
import { SceneObject } from "./SceneObject.js";

/**
 * 场景类
 * 需要绑定到 本引擎上下文(包括webgl上下文)
 * 记录场景中的 物体 灯光 粒子
 */
export class Scene
{
    /**
     * 物体树
     * 此对象为根节点
     * @type {SceneObject}
     */
    obje = null;
    /**
     * 场景中物体id与物品对象的对应map
     * @package
     * @type {Map<string, SceneObject>}
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