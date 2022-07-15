import { m4 } from "../../math/m4.js";
import { SceneObject } from "../scene/SceneObject.js";
import { GlslProgram } from "../shader/GlslProgram.js";
import { RenderPool } from "./RenderPool.js";
import { occlusionCull } from "./renderUtil.js";

/**
 * 渲染器封装(Renderer)
 * (此类基于webgl渲染)
 */
export class Render
{
    /**
     * 渲染池
     * @type {RenderPool}
     */
    pool = new RenderPool();

    /**
     * 绑定的webgl上下文
     * @private
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 当前渲染器使用的着色器
     * @type {GlslProgram}
     */
    program = null;

    /**
     * 相机投影矩阵
     *  + 含变换坐标到相对相机坐标
     *  + 含投影矩阵
     * @type {m4}
     */
    cMat = new m4();

    /**
     * 绑定的场景
     * @private
     * @type {import("../scene/Scene").Scene}
     */
    scene = null;

    /**
     * 判断函数
     * 渲染时对于每个遍历到的物体调用进行判断
     * 要求返回一个标志位整数表示判断结果
     *  + &1 不渲染此物体的面
     *  + &2 不遍历此物体的子节点
     * @type {function(SceneObject) : number}
     */
    judge = null;

    /**
     * 开启遮挡剔除
     * @type {boolean}
     */
    occlusion = false;


    /**
     * @param {import("../scene/Scene").Scene} scene
     * @param {GlslProgram} program
     */
    constructor(scene, program)
    {
        this.scene = scene;
        this.gl = scene.gl;
        this.program = program;
    }

    /**
     * 执行渲染
     * @param {function(GlslProgram): void} cb 切换着色器后调用此回调
     */
    render(cb)
    {
        this.scene.obje.updateCMat(); // 更新场景中物体的矩阵
        this.rtRList(this.scene.obje, this.judge); // 得到渲染列表
        this.draw(cb); // 绘制图像
    }

    /**
     * 递归遍历 获取渲染列表
     * @param {SceneObject} sObj
     * @param {function(SceneObject): number} [judge]
     */
    rtRList(sObj, judge)
    {
        var rList = this.pool.rList;
        rList.length = 0; // 清空渲染列表

        /** @type {Map<symbol, Array<SceneObject>>} */
        var instanceMap = new Map();
        const rt = (/** @type {SceneObject} */ obje) => // 递归遍历
        {
            /**
             * 标志位
             * 用于阻止一些操作
             */
            var flag = (judge ? judge(obje) : 0);

            var faces = obje.faces; // 面数据
            if ((!(flag & 1)) && faces) // 如果有 面数据
            {
                if (faces.instance)
                {
                    var instanceArr = instanceMap.get(faces.instance);
                    if (!instanceArr)
                        instanceMap.set(faces.instance, instanceArr = []);
                    instanceArr.push(obje);
                }
                else
                    rList.push(obje);
            }

            if ((!(flag & 2)) && obje.c) // 递归子节点
                obje.c.forEach(rt);
        }
        rt(sObj);

        instanceMap.forEach(o =>
        {
            if (o.length == 1)
                rList.push(o[0]);
            else if (o.length > 1)
                rList.push(o);
        });
    }

    /**
     * 绘图
     * 将渲染列表中的物体绘制出来
     * 不遍历子节点
     * @private
     * @param {function(GlslProgram): void} cb 切换着色器后调用此回调
     */
    draw(cb)
    {
        var gl = this.gl;

        gl.colorMask(true, true, true, true); // 允许写入颜色
        gl.depthMask(true); // 允许写入深度
        gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // 清除画布颜色和深度缓冲区

        this.program.use(); // 切换着色器组(渲染程序)
        this.program.uniformMatrix4fv("u_cameraMatrix", this.cMat.a); // 设置相机矩阵
        cb(this.program);

        this.pool.rList.forEach(obje => // 遍历渲染列表
        {
            if (obje instanceof SceneObject) // 单个物体
            {
                if (this.occlusion && occlusionCull(obje, gl, this.cMat)) // 遮挡剔除
                    return;
                this.program.use(); // 切换着色器组(渲染程序)
                gl.colorMask(true, true, true, true); // 允许写入颜色
                gl.depthMask(true); // 允许写入深度

                var faces = obje.faces; // 面数据

                this.program.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
                if (faces.tex) // 如果有纹理
                    faces.tex.bindTexture(0); // 绑定纹理
                gl.bindVertexArray(faces.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)
                gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制数据
            }
            else // 实例化绘图
            {
                let program = this.scene.ct.program.cameraInstance;
                program.use(); // 切换着色器组(渲染程序)
                program.uniformMatrix4fv("u_cameraMatrix", this.cMat.a); // 设置相机矩阵
                gl.colorMask(true, true, true, true); // 允许写入颜色
                gl.depthMask(true); // 允许写入深度

                var faces = obje[0].faces; // 面数据

                if (faces.tex) // 如果有纹理
                    faces.tex.bindTexture(0); // 绑定纹理

                {
                    // 这里绑定了vao会导致此vao发生污染(因为多了u_worldMatrix的vbo)
                    gl.bindVertexArray(faces.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)

                    const matrixData = new Float32Array(obje.length * 16); // 每个物体一个矩阵 一个矩阵16个浮点数

                    obje.forEach((o, i) => matrixData.set(o.wMat.a, i * 16)); // 设置矩阵数据

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

                gl.drawArraysInstanced(faces.mode, 0, faces.posLen, obje.length); // 绘制数据(实例化绘制多个物体)
            }
        });
    }
}