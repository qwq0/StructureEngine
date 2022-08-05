import { ShaderBuilder } from "./builder/ShaderBuilder.js";

/**
 * 着色器程序组
 * 通常包含多个着色器
 * 同时管理着色器生成
 */
export class ProgramGroup
{
    /**
     * 着色器生成器
     * @type {ShaderBuilder}
     */
    builder = null;

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.builder = new ShaderBuilder();
    }

    /**
     * 重新生成着色器
     */
    regen()
    {
    }
}