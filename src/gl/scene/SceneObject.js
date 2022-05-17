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
 */
export class SceneObject
{
    /** 坐标x(相对) @package @type {number} */
    x = 0;
    /** 坐标y(相对) @package @type {number} */
    y = 0;
    /** 坐标z(相对) @package @type {number} */
    z = 0;
    /** 四元数x(相对旋转) @package @type {number} */
    rx = 0;
    /** 四元数y(相对旋转) @package @type {number} */
    ry = 0;
    /** 四元数z(相对旋转) @package @type {number} */
    rz = 0;
    /** 四元数w(相对旋转) @package @type {number} */
    rw = 1;
    /** x轴缩放(相对) @package @type {number} */
    sx = 1;
    /** y轴缩放(相对) @package @type {number} */
    sy = 1;
    /** z轴缩放(相对) @package @type {number} */
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
     * @type {import("../shader/GlslProgram").GlslProgram}
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
     * 包围球半径
     * 包围球中心为局部原点
     * @type {number}
     */
    bsR = -1;


    constructor()
    {
        this.sn = snCount++;
        this.updateMat();
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
        o.setScene(this.scene);
        o.parent = this;
        this.c.push(o);
    }

    /**
     * 递归更新矩阵
     */
    updateMat()
    {
        this.lMat = new m4().
            translation(this.x, this.y, this.z). // 平移
            rotateQuat(this.rx, this.ry, this.rz, this.rw). // 旋转
            scale(this.sx, this.sy, this.sz); // 缩放
        var pMat = null;
        if (this.parent)
        {
            this.wMat = (this.parent.wMat).multiply(this.lMat);
        }
        else
            pMat = this.lMat;
        // 递归子节点
        if (this.c)
            this.c.forEach(o => o.updateMat());
    }

    /**
     * 获取世界坐标
     * 需要先更新矩阵
     * @returns {v4} xyz为坐标 w恒定为1
     */
    getWPos()
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
     */
    updateBoundingSphere()
    {
        if (this.bsR < 0)
        {
            var pos = this.faces.pos;
            var wvpMat = this.getWorldViewProjectionMat();
            var maxR = 0;
            for (var i = 0; i < pos.length; i += 3)
                maxR = Math.max(maxR, (new v4(pos[i], pos[i + 1], pos[i + 2])).mulM4(wvpMat).getV3Len());
            this.bsR = maxR;
        }
    }

    /**
     * 视锥剔除判断
     * @param {m4} cMat
     * @param {number} fov
     * @returns {boolean} 返回true则剔除
     */
    coneRemove(cMat, fov)
    {
        this.updateBoundingSphere();
        var bsPos = this.getWPos().mulM4(cMat);
        /*
            ndzda推导的球与圆锥不相交的保守剔除原始判断公式
            圆锥沿着z轴向负方向扩展
            if (arccos(-z / len(x, y, z)) - Fov / 2 < Math.PI / 2)
                (sin(arccos(-z / len(x, y, z)) - Fov / 2) * len(x, y, z) >= r) or (z >= r)
            else
                len(x, y, z) >= r;
        */
        if (bsPos.z >= this.bsR)
            return true;
        var bsLen = bsPos.getV3Len(); // 球心和原点距离
        var angle = Math.acos(-bsPos.z / bsLen) - fov * 0.5; // 原点到球心与圆锥在对应方向母线的夹角
        if (angle < Math.PI / 2)
            return (Math.sin(angle) * bsLen >= this.bsR);
        else
            return bsLen >= this.bsR;
    }
}