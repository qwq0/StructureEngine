import { m4 } from "../../math/m4.js";
import { forEach } from "../../util/forEach.js";

/**
 * 物体唯一编号计数
 * @type {number}
 */
var snCount = 0;
/**
 * 场景中的物体
 */
export class SceneObject
{
    /**
     * 坐标x(相对)
     * @type {number}
     */
    x = 0;
    /**
     * 坐标y(相对)
     * @type {number}
     */
    y = 0;
    /**
     * 坐标z(相对)
     * @type {number}
     */
    z = 0;
    /**
     * 四元数x(相对旋转)
     * @type {number}
     */
    rx = 0;
    /**
     * 四元数y(相对旋转)
     * @type {number}
     */
    ry = 0;
    /**
     * 四元数z(相对旋转)
     * @type {number}
     */
    rz = 0;
    /**
     * 四元数w(相对旋转)
     * @type {number}
     */
    rw = 1;
    /**
     * x轴缩放(相对)
     * @type {number}
     */
    sx = 1;
    /**
     * y轴缩放(相对)
     * @type {number}
     */
    sy = 1;
    /**
     * z轴缩放(相对)
     * @type {number}
     */
    sz = 1;

    /**
     * 世界矩阵
     * @type {m4}
     */
    wMat = new m4();

    /**
     * 局部矩阵
     * @type {m4}
     */
    lMat = new m4();

    /**
     * 子节点
     * @type {Array<SceneObject>}
     */
    c = null;

    /**
     * 父节点
     * @type {SceneObject}
     */
    parent = null;

    /**
     * 物体所在的场景
     * @type {import("./Scene").Scene}
     */
    scene = null;

    /**
     * 绘制此物体使用的着色器组(渲染程序)
     * @type {import("../shader/glslProgram").glslProgram}
     */
    program = null;

    /**
     * 物体id
     * @type {string}
     */
    id = "";

    /**
     * 物体的唯一编号
     * 正常时为非负整数
     * 与worker中的对应
     * @type {number}
     */
    sn = -1;

    /**
     * [gl]面数据
     * @type {import("./ObjFaces").ObjFaces}
     */
    faces = null;

    /**
     * [gl]此物体的缓冲区
     * 用于释放内存使用
     * @type {WebGLBuffer}
     */
    buffer = null;


    constructor()
    {
        this.sn = snCount++;
    }


    /**
     * 遍历设置物体所在的场景
     * @package
     * @param {import("./Scene").Scene} scene
     */
    setScene(scene)
    {
        if (this.scene == scene) // 无需向下
            return;
        if (this.scene)
        { // 清除原区域中的关联
            if (this.id)
                this.scene.idMap.delete(this.id);
        }
        this.scene = scene;
        if (scene)
        { // 在新区域中建立关联
            scene.idMap.set(this.id, this);
        }
        if (this.c) // 遍历子节点
            forEach(this.c, (o) => { o.setScene(scene); });
    }

    /**
     * 添加子节点
     * @param {SceneObject} o
     */
    addChild(o)
    {
        if (!this.c)
            this.c = [];
        this.c.push(o);
    }

    /**
     * 更新矩阵
     */
    updateMat()
    {}
}