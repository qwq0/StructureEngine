import { SceneObject } from "../gl/scene/SceneObject.js";
import { Vec3 } from "../math/Vec3.js";

/**
 * 射线类
 * 可与场景中的物体进行相交判断
 */
export class Ray
{
    /**
     * 射线起点
     * @paceage
     * @type {Vec3}
     */
    origin = new Vec3();

    /**
     * 射线方向
     * 应当为单位向量
     * @package
     * @type {Vec3}
     */
    direction = new Vec3();

    /**
     * 设置射线起点
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setOrigin(x, y, z)
    {
        this.origin.x = x;
        this.origin.y = y;
        this.origin.z = z;
    }

    /**
     * 设置射线方向
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setDirection(x, y, z)
    {
        this.direction.x = x;
        this.direction.y = y;
        this.direction.z = z;
        this.direction = this.direction.normalize();
    }

    /**
     * 测试射线与物体的面是否相交
     * 相交返回长度 不相交返回-1
     * @param {SceneObject} obj 
     * @returns {number}
     */
    test(obj)
    {
        // TODO 包围球优化
        var iwMat = obj.wMat.inverse(); // 物体世界矩阵的逆矩阵
        var origin = this.origin.v4MulM4(iwMat); // 将逆矩阵应用于射线方向
        var direction = this.direction.mulPartOfM4(iwMat); // 将逆向旋转和缩放应用于射线方向
        var face = obj.faces;
        if (face.ind) // 带索引
        {
            let indArr = face.ind;
            let pos = face.pos;
            for (var i = 0, Li = indArr.length; i < Li; i += 3) // 一次一个三角形
            {
                var ind0 = indArr[i] * 3, ind1 = indArr[i + 1] * 3, ind2 = indArr[i + 2] * 3;
                var t = rayTriangleIntersection( // 单个三角形相交
                    origin, direction,
                    new Vec3(pos[ind0], pos[ind0 + 1], pos[ind0 + 2]),
                    new Vec3(pos[ind1], pos[ind1 + 1], pos[ind1 + 2]),
                    new Vec3(pos[ind2], pos[ind2 + 1], pos[ind2 + 2])
                );
                if (t > 0)
                    return t;
            }
        }
        else // 不带索引
        {
            let pos = face.pos;
            for (var i = 0, Li = pos.length; i < Li; i += 9) // 一次一个三角形
            {
                var t = rayTriangleIntersection( // 单个三角形相交
                    origin, direction,
                    new Vec3(pos[i], pos[i + 1], pos[i + 2]),
                    new Vec3(pos[i + 3], pos[i + 4], pos[i + 5]),
                    new Vec3(pos[i + 6], pos[i + 7], pos[i + 8])
                );
                if (t > 0)
                    return t;
            }
        }
        return -1;
    }

    /**
     * 遍历子树检测相交
     * @param {SceneObject} objRoot 需遍历的子树的根节点
     * @returns {Array<{obj: SceneObject, distance: number}>} 从近到远的相交物体列表
     */
    traverseTest(objRoot)
    {
        /**
         * @type {Array<{obj: SceneObject, distance: number}>}
         */
        var ret = [];
        /**
         * 遍历
         * @param {SceneObject} obje
         */
        const tr = (obje) =>
        {
            if (obje.faces)
            {
                var t = this.test(obje);
                if (t > 0)
                    ret.push({ obj: obje, distance: t });
            }
            if (obje.c)
                obje.c.forEach(tr);
        };
        tr(objRoot);
        ret.sort((a, b) => a.distance - b.distance);
        return ret;
    }
}

/**
 * 射线与三角形相交判断
 * @param {Vec3} orig 射线起点
 * @param {Vec3} dir 射线方向
 * @param {Vec3} v0 三角形的顶点0
 * @param {Vec3} v1 三角形的顶点1
 * @param {Vec3} v2 三角形的顶点2
 * @returns {number | undefined}
 */
function rayTriangleIntersection(orig, dir, v0, v1, v2)
{
    /**
     * @type {Vec3}
     */
    let E1 = v1.sub(v0);
    /**
     * @type {Vec3}
     */
    let E2 = v2.sub(v0);
    /**
     * @type {Vec3}
     */
    let P = dir.cross(E2);
    /**
     * 行列式
     * @type {number}
     */
    let det = E1.dot(P);

    /**
     * @type {Vec3}
     */
    let T = new Vec3();
    if (det > 0)
    {
        T = orig.sub(v0);
    }
    else
    {
        T = v0.sub(orig);
        det = (-det);
    }

    if (det < 0.000001)
        return undefined;

    let u = T.dot(P);
    if (u < 0 || u > det)
        return undefined;

    /**
     * @type {Vec3}
     */
    let Q = T.cross(E1);
    /**
     * @type {number}
     */
    let v = dir.dot(Q);
    if (v < 0 || u + v > det)
        return undefined;

    /**
     * @type {number}
     */
    let t = E2.dot(Q);
    /**
     * @type {number}
     */
    let fInvDet = 1 / det;

    t *= fInvDet;
    u *= fInvDet;
    v *= fInvDet;
    return t;
}