import { m4 } from "../math/m4.js";
import { degToRad } from "./util/math.js";


/**
 * 相机类
 * 需要绑定到 场景类 和 webgl上下文
 */
export class Camera
{
    /**
     * 相机坐标x
     * @type {number}
     */
    x = 0;
    /**
     * 相机坐标y
     * @type {number}
     */
    y = 0;
    /**
     * 相机坐标z
     * @type {number}
     */
    z = 0;
    /**
     * 相机x轴旋转
     * @type {number}
     */
    rx = 0;
    /**
     * 相机y轴旋转
     * @type {number}
     */
    ry = 0;
    /**
     * 相机z轴旋转
     * @type {number}
     */
    rz = 0;
    /**
     * 相机视角场角度
     * @type {number}
     */
    fov = degToRad * 90;

    /**
     * 绑定的场景
     * @type {import("./scene/Scene").Scene}
     */
    scene = null;
    /**
     * 绑定的webgl上下文
     * @type {WebGL2RenderingContext}
     */
    gl = null;


    /**
     * @param {import("./scene/Scene").Scene} scene
     */
    constructor(scene)
    {
        this.scene = scene;
        this.gl = scene.gl;
    }

    draw()
    {
        this.scene.obje.updateMat(new m4());
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.render(
            this.gl,
            this.scene.obje,
            m4.perspective(this.fov, this.gl.canvas.clientWidth / this.gl.canvas.clientHeight, 0.1, 2500).
                rotateXYZ(-this.rx, -this.ry, -this.rz).
                translation(-this.x, -this.y, -this.z),
            new m4()
        );
    }

    /**
     * 递归渲染场景
     * 写给以后的自己和其他想要修改这部分的人:
     * 请不要随意改动你无法理解的部分
     * webgl以及opengl的接口有些杂乱
     * 我写了这个引擎 但也许我自己也不完全了解webglAPI
     * @param {WebGL2RenderingContext} gl webgl上下文
     * @param {import("./scene/SceneObject").SceneObject} obje 场景中的物体对象(当前位置)
     * @param {m4} pers_matrix 投影矩阵(相机矩阵)
     */
    render(gl, obje, pers_matrix)
    {
        // 变换矩阵
        var matrix = pers_matrix.multiply(obje.wMat);
        var worldViewProjection = obje.getWorldViewProjectionMat();
        var worldMatrix = obje.wMat;
        // -----

        // 绘制图像
        if (obje.faces) // 有"面数据" 则绘制
        {
            var faces = obje.faces;
            gl.useProgram(obje.program.progra); // 修改着色器组(渲染程序)

            obje.program.uniformMatrix4fv("u_matrix", matrix.a); // 设置矩阵
            obje.program.uniformMatrix4fv("u_worldMatrix", worldMatrix.a); // 设置世界矩阵
            obje.program.uniformMatrix4fv_tr("u_worldViewProjection", worldViewProjection.inverse().a); // 设置世界视图投影矩阵
            obje.program.uniform3f("u_viewPos", this.x, this.y, this.z);
            if (faces.tex) // 如果有纹理
                faces.tex.bindTexture(0); // 绑定纹理

            gl.bindVertexArray(faces.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)
            gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制数据
        }
        // -----

        // 递归子节点
        if (obje.c)
            obje.c.forEach(o => this.render(gl, o, pers_matrix));
    }
}