import { Scene } from "./scene/Scene.js";
import { Render2Texture } from "./texture/Render2Texture.js";

/**
 * Structure Engine的上下文
 * 封装webgl2上下文
 * 通过此上下文以更方便的操作
 */
export class SEContext
{
    /**
     * 绑定的webgl上下文
     * @package
     * @type {WebGL2RenderingContext}
     */
    gl;
    /**
     * canvas对象
     * @type {HTMLCanvasElement}
     */
    canvas;

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {HTMLCanvasElement} canvas
     */
    constructor(gl, canvas)
    {
        this.gl = gl;
        this.canvas = canvas;
    }

    /**
     * 创建场景
     * @returns {Scene}
     */
    createScene()
    {
        return new Scene(this.gl);
    }

    /**
     * 创建渲染到纹理
     * @param {number} textureWidth
     * @param {number} textureHeight
     * @returns {Render2Texture}
     */
    createRender2Texture(textureWidth, textureHeight)
    {
        return new Render2Texture(this.gl, textureWidth, textureHeight);
    }
}