import { Mat4 } from "../math/Mat4.js";
import { Render } from "./render/Render.js";
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
     * @type {Mat4}
     */
    cMat = Mat4.zero();

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
        this.shadowTex = new Render2Texture(this.gl, 2000, 2000, false, true);
        this.render = new Render(this.scene, scene.ct.shaderProgramManage.getProgram([]));
    }

    /**
     * 绘制阴影贴图
     * 将调用递归渲染阴影
     */
    renderShadow()
    {
        this.shadowTex.bindFramebuffer(); // 渲染到纹理(帧缓冲区)

        this.render.cMat = this.cMat;
        this.render.render();
    }
}