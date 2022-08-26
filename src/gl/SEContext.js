import { RenderPool } from "./render/RenderPool.js";
import { Scene } from "./scene/Scene.js";
import { presetShader } from "./shader/preset/presetShader.js";
import { ShaderProgramManage } from "./shader/ShaderProgramManage.js";
import { Render2Texture } from "./texture/Render2Texture.js";

/**
 * Structure Engine的上下文
 * 封装webgl2上下文
 * 此类将储存各种状态
 * 通过调用此上下文的方法以更方便的进行操作
 */
export class SEContext
{
    /**
     * 绑定的webgl上下文
     * @package
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * canvas对象
     * @package
     * @type {HTMLCanvasElement}
     */
    canvas = null;

    /**
     * 渲染池对象
     * 通常此上下文的所有渲染器共用此渲染池
     * @package
     * @type {RenderPool}
     */
    renderPool = null;

    /**
     * 渲染池对象
     * 通常此上下文的所有渲染器共用此渲染池
     * @package
     * @type {ShaderProgramManage}
     */
    shaderProgramManage = null;

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {HTMLCanvasElement} canvas
     */
    constructor(gl, canvas)
    {
        this.gl = gl;
        this.canvas = canvas;

        this.renderPool = new RenderPool(gl);
        this.shaderProgramManage = new ShaderProgramManage(gl);
        presetShader(this.shaderProgramManage.builder); // 预设着色器
    }

    /**
     * 创建场景
     * @returns {Scene}
     */
    createScene()
    {
        return new Scene(this);
    }

    /**
     * 清除帧缓冲绑定
     * 渲染到可视画布(canvas)
     * 也可用于初始化视口
     * @package
     */
    clearFramebuffer()
    {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 创建渲染到纹理
     * @package
     * @param {number} textureWidth
     * @param {number} textureHeight
     * @returns {Render2Texture}
     */
    createRender2Texture(textureWidth, textureHeight)
    {
        return new Render2Texture(this.gl, textureWidth, textureHeight);
    }
}