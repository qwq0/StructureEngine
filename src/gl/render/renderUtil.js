import { Mat4 } from "../../math/Mat4.js";
import { Vec3 } from "../../math/Vec3.js";

/**
 * 视锥剔除判断
 * @param {import("../scene/SceneObject").SceneObject} obje 物体
 * @param {Vec3} bsPos 物体的包围球中心相对相机坐标(不含投影)
 * @param {number} fov 相机的(对角线)角视场 单位为弧度
 * @returns {boolean} 返回true则剔除
 */
export function coneCull(obje, bsPos, fov)
{
    obje.updateBoundingSphere(); // 更新包围球半径
    /*
        ndzda推导的球与圆锥不相交的保守剔除原始判断公式
        圆锥沿着z轴向负方向扩展
        if (arccos(-z / len(x, y, z)) - Fov / 2 < Math.PI / 2)
            (sin(arccos(-z / len(x, y, z)) - Fov / 2) * len(x, y, z) >= r) or (z >= r)
        else
            len(x, y, z) >= r;
    */
    if (bsPos.z >= obje.boundingSphereR)
        return true;
    var bsLen = bsPos.len(); // 球心和原点距离
    var angle = Math.acos(-bsPos.z / bsLen) - fov * 0.5; // 原点到球心与圆锥在对应方向母线的夹角
    if (angle < Math.PI / 2)
        return (Math.sin(angle) * bsLen >= obje.boundingSphereR);
    else
        return bsLen >= obje.boundingSphereR;
}

/**
 * 遮挡剔除查询标志
 * 将 遮挡查询使用的WebGLQuery 绑定到ObjFaces上
 */
const querySymbol = Symbol("querySymbol");
/**
 * 遮挡剔除查询正在进行标志
 * 将 遮挡查询是否正在进行boolean 绑定到ObjFaces上
 */
const queryInProgressSymbol = Symbol("queryInProgressSymbol");
/**
 * 遮挡剔除判断
 * 在执行遮挡剔除判断前应该按照近到远排序
 * 注意: 此遮挡判断方案在大多数场景中并不能起到优化作用
 * 注意: 执行此函数会关闭颜色和深度写入
 * @param {import("../scene/SceneObject").SceneObject} obje
 * @param {WebGL2RenderingContext} gl
 * @param {Mat4} cMat
 */
export function occlusionCull(obje, gl, cMat)
{
    var boundingBoxProgram = obje.scene.ct.program.white;
    var faces = obje.faces;

    gl.colorMask(false, false, false, false); // 关闭颜色写入
    gl.depthMask(false); // 关闭深度缓冲写入

    boundingBoxProgram.use(); // 使用绘制包围体的着色器
    gl.bindVertexArray(faces.vao); // 绑定对象顶点数组(或包围体顶点数组)
    boundingBoxProgram.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
    boundingBoxProgram.uniformMatrix4fv("u_cameraMatrix", cMat.a); // 设置相机矩阵

    if (faces[queryInProgressSymbol] && gl.getQueryParameter(faces[querySymbol], gl.QUERY_RESULT_AVAILABLE)) // 查询已进行 且 结果可用
    {
        faces.occluded = !gl.getQueryParameter(faces[querySymbol], gl.QUERY_RESULT); // 获取遮挡结果
        faces[queryInProgressSymbol] = false; // 设置为查询未进行
    }
    if (!faces[queryInProgressSymbol]) // 查询未进行
    {
        if (!faces[querySymbol]) // 没有webgl查询对象则创建
            faces[querySymbol] = gl.createQuery();
        gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, faces[querySymbol]); // 启动异步查询 保守查询遮挡
        gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制顶点 此处绘制的内容将被查询
        gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE); // 结束查询
        faces[queryInProgressSymbol] = true; // 设置为查询进行中
    }

    return faces.occluded;
}