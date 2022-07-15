import { phyCt } from "./phyContext.js";

export class Shape
{
    shape = null;

    constructor()
    { }

    /**
     * 立方体
     * @param {number} sx
     * @param {number} sy
     * @param {number} sz
     * @returns {Shape}
     */
    static cube(sx, sy, sz)
    {
        const Ammo = phyCt.Ammo;
        var shapeObj = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));// 刚体形状
        var ret = new Shape();
        ret.shape = shapeObj;
        return ret;
    }

    /**
     * 三角网络
     * @param {Array<number>} pos
     */
    static a(pos)
    {
        const Ammo = phyCt.Ammo;
        var shapeObj = new Ammo.btBvhTriangleMeshShape();// 刚体形状
        var ret = new Shape();
        ret.shape = shapeObj;
        return ret;
    }

    static BvhTriangleMesh()
    {}
}