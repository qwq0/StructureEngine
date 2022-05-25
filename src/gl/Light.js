import { m4 } from "../math/m4.js";
import { GlslGenerator } from "./shader/generator/GlslGenerator.js";
import { Render2Texture } from "./texture/Render2Texture.js";

/**
 * 灯光封装
 * 包括阴影
 */
export class Light
{
    /**
     * 灯光矩阵
     * 绘制阴影贴图时使用
     * 带投影
     * @type {m4}
     */
    cMat = new m4();

    /**
     * 绑定的场景
     * @private
     * @type {import("./scene/Scene").Scene}
     */
    scene = null;
    /**
     * 绑定的webgl上下文
     * @private
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 绘制阴影贴图的着色器
     * @private
     * @type {import("./shader/GlslProgram").GlslProgram}
     */
    program = null;

    /**
     * 阴影贴图
     * @type {Render2Texture}
     */
    shadowTex = null;

    /**
     * @param {import("./scene/Scene").Scene} scene
     */
    constructor(scene)
    {
        this.scene = scene;
        this.gl = scene.gl;
        this.shadowTex = new Render2Texture(this.gl, 1000, 1000, false, true);
        this.cMat = m4.projection(5, 5, 5);
        this.program = (new GlslGenerator(this.gl)).gen();
    }

    /**
     * 绘制阴影贴图
     * 将调用递归渲染阴影
     */
    renderShadow()
    {
        this.scene.obje.updateMat(); // 更新场景中物体的矩阵

        this.shadowTex.bindFramebuffer(); // 渲染到纹理

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // 清除画布颜色和深度缓冲区

        this.program.use(); // 修改着色器组(渲染程序)
        this.program.uniformMatrix4fv("u_cameraMatrix", ( // 设置灯光矩阵(类似相机矩阵)
            this.cMat
        ).a);
        this.render(this.scene.obje); // 递归渲染
    }

    /**
     * 递归渲染阴影
     * @private
     * @param {import("./scene/SceneObject").SceneObject} obje 场景中的物体对象(当前位置)
     */
    render(obje)
    {
        /*
            绘制图像
        */
        if (obje.faces) // 有"面数据"
        {
            var faces = obje.faces;

            this.program.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵

            this.gl.bindVertexArray(faces.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)
            this.gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制数据
        }
        /*---------*/

        /*
            递归子节点
        */
        if (obje.c)
            obje.c.forEach(o => this.render(o));
    }
}