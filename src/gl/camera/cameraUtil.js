import { m4 } from "../../math/m4.js";
import { v4 } from "../../math/v4.js";

/**
 * 视锥剔除判断
 * @param {import("../scene/SceneObject").SceneObject} obje 物体
 * @param {v4} bsPos 物体的包围球中心相对相机坐标(不含投影)
 * @param {number} fov 相机的角视场
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
    if (bsPos.z >= obje.bsR)
        return true;
    var bsLen = bsPos.getV3Len(); // 球心和原点距离
    var angle = Math.acos(-bsPos.z / bsLen) - fov * 0.5; // 原点到球心与圆锥在对应方向母线的夹角
    if (angle < Math.PI / 2)
        return (Math.sin(angle) * bsLen >= obje.bsR);
    else
        return bsLen >= obje.bsR;
}

/**
 * 遮挡剔除判断
 * 在执行遮挡剔除判断前应该按照近到远排序
 * 注意: 执行此函数会关闭颜色和深度写入
 * @param {import("../scene/SceneObject").SceneObject} obje
 * @param {WebGL2RenderingContext} gl
 * @param {m4} cMat
 */
export function occlusionCull(obje, gl, cMat)
{
    var ret = false;
    var boundingBoxProgram = obje.scene.ct.program.white;
    var faces = obje.faces;

    gl.colorMask(false, false, false, false); // 关闭颜色写入
    gl.depthMask(false); // 关闭深度缓冲写入

    boundingBoxProgram.use(); // 使用绘制包围体的着色器
    gl.bindVertexArray(faces.vao); // 绑定对象顶点数组(或包围体顶点数组)
    boundingBoxProgram.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
    boundingBoxProgram.uniformMatrix4fv("u_cameraMatrix", cMat.a); // 设置相机矩阵

    if (faces.queryInProgress) // 查询进行中
    {
        if (gl.getQueryParameter(faces.query, gl.QUERY_RESULT_AVAILABLE)) // 查询结果可用
        {
            ret = !gl.getQueryParameter(faces.query, gl.QUERY_RESULT); // 获取遮挡结果
            faces.queryInProgress = false; // 下一帧需要重新查询
        }
    }
    else // 查询未进行
    {
        if (!faces.query) // 没有webgl查询对象则创建
            faces.query = gl.createQuery();
        gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, faces.query); // 启动异步查询 保守查询遮挡
        gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制顶点 此处绘制的内容将被查询
        gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE); // 结束查询
        faces.queryInProgress = true; // 设置为查询进行中
    }

    return ret;
}