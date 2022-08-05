import { SceneObject } from "../scene/SceneObject.js";
import { Render } from "./Render.js";

/**
 * 实例化绘图
 * 使用实例化方法一次绘制多个带有相同面数据的物体
 *  + 此方法不会绘制子节点
 *  + 此方法不会检查绘制物体面数据是否相同
 * @param {WebGL2RenderingContext} gl
 * @param {Array<SceneObject>} objeArr 绘制的物体列表
 * @param {Render} render
 */
export function instantiatedDraw(gl, objeArr, render)
{
    // TODO 优化实例化绘图
    let program = render.scene.ct.program.cameraInstance;
    program.use(); // 切换着色器组(渲染程序)
    program.uniformMatrix4fv("u_cameraMatrix", render.cMat.a); // 设置相机矩阵
    gl.colorMask(true, true, true, true); // 允许写入颜色
    gl.depthMask(true); // 允许写入深度

    var faces = objeArr[0].faces; // 面数据

    {
        gl.bindVertexArray(render.pool.getInstanceVao(faces, Date.now())); // 绑定顶点数组(切换当前正在操作的顶点数组)

        const matrixData = new Float32Array(objeArr.length * 16); // 每个物体一个矩阵 一个矩阵16个浮点数

        objeArr.forEach((/** @type {{ wMat: { a: ArrayLike<number>; }; }} */ o, /** @type {number} */ i) => matrixData.set(o.wMat.a, i * 16)); // 设置矩阵数据

        const matrixLoc = gl.getAttribLocation(program.progra, "u_worldMatrix");
        const matrixBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);

        const bytesPerMatrix = 4 * 16;
        for (let i = 0; i < 4; i++)
        {
            const loc = matrixLoc + i;
            gl.enableVertexAttribArray(loc);

            const offset = i * 16;
            gl.vertexAttribPointer(
                loc,
                4,
                gl.FLOAT,
                false,
                bytesPerMatrix,
                offset,
            );

            gl.vertexAttribDivisor(loc, 1);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);
    }

    if (faces.tex) // 如果有纹理
        faces.tex.bindTexture(0); // 绑定纹理
    gl.drawArraysInstanced(faces.mode, 0, faces.posLen, objeArr.length); // 绘制数据(实例化绘制多个物体)
}