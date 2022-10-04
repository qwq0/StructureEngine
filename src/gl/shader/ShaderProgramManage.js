import { SBFlag } from "./builder/SBFlag.js";
import { ShaderBuilder } from "./builder/ShaderBuilder.js";
import { GlslProgram } from "./GlslProgram.js";

/**
 * 着色器程序管理
 * 管理着色器生成与缓存
 */
export class ShaderProgramManage
{
    /**
     * 绑定的webgl上下文
     * @private
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 着色器生成器
     * @package
     * @type {ShaderBuilder}
     */
    builder = null;
    /**
     * 标志
     * @package
     * @type {SBFlag}
     */
    flag = null;
    /**
     * 着色器程序表
     * 标志描述字符串 到 着色器程序对象 的映射
     * @package
     * @type {Map<string, GlslProgram>}
     */
    programMap = new Map();

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.gl = gl;
        this.builder = new ShaderBuilder();
        this.flag = this.builder.flag;
    }

    /**
     * 获取着色器程序 通过标志数组
     * @param {Array<string>} flagsArr
     * @returns {GlslProgram}
     */
    getProgram(flagsArr)
    {
        this.flag.setFlags(flagsArr);
        var describeStr = this.flag.getDescribeString();
        var ret = this.programMap.get(describeStr);
        if (ret)
            return ret;
        else
        {
            this.programMap.set(describeStr, ret = this.builder.buildGlslProgram(this.gl, "vertexMain", "fragmentMain"));
            return ret;
        }
    }

    /**
     * 获取着色器程序 通过标志描述字符串
     * 必须先调用getProgram
     * @param {string} describeStr
     */
    getProgramByDescribe(describeStr)
    {
        var ret = this.programMap.get(describeStr);
        if (ret)
            return ret;
        else
            throw "ShaderProgramManage: getProgramByDescribe error";
    }
}