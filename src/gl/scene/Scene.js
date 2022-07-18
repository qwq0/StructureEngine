import { Camera } from "../camera/Camera.js"
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
     * 场景中物体sn与物品对象的对应map
     * @package
     * @type {Map<number, SceneObject>}
     */
    snMap = new Map();
    /**
     * 绑定的webgl上下文
     * @package
     * @type {WebGL2RenderingContext}
     */
    gl = null;
    /**
     * 绑定的引擎上下文
     * @package
     * @type {import("../SEContext").SEContext}
     */
    ct = null;

    /**
     * @param {import("../SEContext").SEContext} ct
     */
    constructor(ct)
    {
        this.ct = ct;
        this.gl = ct.gl;
        
        this.obje = new SceneObject();
        this.obje.scene = this;
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