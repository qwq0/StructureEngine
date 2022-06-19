import { GlslGenerator } from "./generator/GlslGenerator";

/**
 * (着色器)程序组
 * 通常包含 普通glsl着色器 和 实例化glsl着色器
 * 程序组中的着色器通常有相同的片段着色器
 */
export class ProgramGroup
{
    /**
     * 着色器生成器
     * @type {GlslGenerator}
     */
    pGenerator = null;

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.pGenerator = new GlslGenerator(gl);
    }

    /**
     * 重新生成着色器
     */
    regen()
    {
    }
}