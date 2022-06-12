import { m4 } from "../../math/m4.js";
import { v4 } from "../../math/v4.js";
import { forEach } from "../../util/forEach.js";

/**
 * 物体唯一编号计数
 * @type {number}
 */
var snCount = 0;
/**
 * 场景中的物体
 *  物体可以有需要渲染的面
 *  或不绑定面作为中间节点
 *  物体可以绑定到 相机 灯光 粒子
 */
export class SceneObject
{
    /**
     * 坐标x(相对)
     * @private
     * @type {number}
     */
    x = 0;
    /**
     * 坐标y(相对)
     * @private
     * @type {number}
     */
    y = 0;
    /**
     * 坐标z(相对)
     * @private
     * @type {number}
     */
    z = 0;
    /**
     * 四元数x(相对旋转)
     * @private
     * @type {number}
     */
    rx = 0;
    /**
     * 四元数y(相对旋转)
     * @private
     * @type {number}
     */
    ry = 0;
    /**
     * 四元数z(相对旋转)
     * @private
     * @type {number}
     */
    rz = 0;
    /**
     * 四元数w(相对旋转)
     * @private
     * @type {number}
     */
    rw = 1;
    /**
     * x轴缩放(相对)
     * @private
     * @type {number}
     */
    sx = 1;
    /**
     * y轴缩放(相对)
     * @private
     * @type {number}
     */
    sy = 1;
    /**
     * z轴缩放(相对)
     * @private
     * @type {number}
     */
    sz = 1;

    /**
     * 世界矩阵
     * @package
     * @type {m4}
     */
    wMat = new m4();

    /**
     * 局部矩阵
     * @private
     * @type {m4}
     */
    lMat = new m4();

    /**
     * 子节点
     * @package
     * @type {Array<SceneObject>}
     */
    c = null;

    /**
     * 父节点
     * @package
     * @type {SceneObject}
     */
    parent = null;

    /**
     * 物体所在的场景
     * @package
     * @type {import("./Scene").Scene}
     */
    scene = null;

    /**
     * 绘制此物体使用的着色器组(渲染程序)
     * 此属性暂时未使用
     * @package
     * @type {import("../shader/GlslProgram").GlslProgram}
     */
    program = null;

    /**
     * 物体id
     * @package
     * @type {string}
     */
    id = "";

    /**
     * 物体的唯一编号
     * 正常时为非负整数
     * 与worker中的对应
     * @package
     * @type {number}
     */
    sn = -1;

    /**
     * [gl]面数据
     * @package
     * @type {import("./ObjFaces").ObjFaces}
     */
    faces = null;

    /**
     * 包围球半径
     * 包围球中心为局部原点
     * @package
     * @type {number}
     */
    boundingSphereR = -1;

    /**
     * 矩阵需要更新
     * 防止反复计算没有移动的物体
     * @package
     * @type {boolean}
     */
    needUpdate = true;


    constructor()
    {
        this.sn = snCount++;
        this.updateCMat();
    }


    /**
     * 遍历设置物体所在的场景
     * 若此节点的场景不需要改变则不继续向下
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
        o.setScene(this.scene);
        o.parent = this;
        o.needUpdate = true;
        this.c.push(o);
    }

    /**
     * 更新世界矩阵
     * 若此物体
     * @package
     */
    updateCMat()
    {
        if (this.needUpdate) // 需要更新
        {
            this.lMat = new m4().
                translation(this.x, this.y, this.z). // 平移
                rotateQuat(this.rx, this.ry, this.rz, this.rw). // 旋转
                scale(this.sx, this.sy, this.sz); // 缩放
            if (this.parent)
                this.wMat = (this.parent.wMat).multiply(this.lMat);
            else
                this.wMat = this.lMat;
        }
        if (this.c) // 递归子节点
            this.c.forEach(o =>
            {
                if (this.needUpdate) // 若此节点需要更新
                    o.needUpdate = true; // 子节点也需要更新
                o.updateCMat();
            });
        this.needUpdate = false; // 标记无需更新
    }

    /**
     * 获取世界坐标
     * 需要先更新矩阵
     * @returns {v4} xyz为坐标 w恒定为1
     */
    getWorldPos()
    {
        var wMat = this.wMat;
        return new v4(wMat.a[12], wMat.a[13], wMat.a[14]);
    }

    /**
     * 获取世界视图投影矩阵
     * 只包含旋转和缩放没有平移
     * @returns {m4}
     */
    getWorldViewProjectionMat()
    {
        var ret = this.wMat.copy();
        ret.a[12] = ret.a[13] = ret.a[14] = 0;
        return ret;
    }

    /**
     * 更新当前物体的面的包围球
     * 需要先更新矩阵
     * @package
     */
    updateBoundingSphere()
    {
        if (this.boundingSphereR < 0)
        {
            var pos = this.faces.pos;
            var wvpMat = this.getWorldViewProjectionMat();
            var maxR = 0;
            for (var i = 0; i < pos.length; i += 3)
                maxR = Math.max(maxR, (new v4(pos[i], pos[i + 1], pos[i + 2])).mulM4(wvpMat).getV3Len());
            this.boundingSphereR = maxR;
        }
    }

    /**
     * 设置坐标
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.needUpdate = true;
    }

    /**
     * 设置缩放
     * @param {number} sx
     * @param {number} sy
     * @param {number} sz
     */
    setScale(sx, sy, sz)
    {
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.needUpdate = true;
    }

    /**
     * 设置旋转(四元数)
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @param {number} rw
     */
    setRotation(rx, ry, rz, rw)
    {
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.rw = rw;
        this.needUpdate = true;
    }
}