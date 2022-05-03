import { Scene } from "./scene/Scene.js";

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
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.gl = gl;
    }

    /**
     * 创建场景
     * @returns {Scene}
     */
    createScene()
    {
        return new Scene(this.gl);
    }
}