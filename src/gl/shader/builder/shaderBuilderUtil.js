import { ShaderBStatement } from "./ShaderBStatement.js";

/**
 * 着色器变量类型
 */
const shaderVariableType = {
    "float": true,
    "int": true,
    "bool": true,
    "vec4": true,
    "vec3": true,
    "vec2": true,
    "mat4": true,
    "mat3": true,
    "mat2": true,
    "imat4": true,
    "imat3": true,
    "imat2": true,
    "sampler2D": true,
    "samplerCube": true
};

/**
 * 着色器构建器工具
 */
export const shaderBuilderUtil = {
    /**
     * 定义变量
     * @param {keyof shaderVariableType} type 类型
     * @param {string} name 变量名
     * @param {SBENode} [initValue] 初始值
     * @returns {ShaderBStatement}
     */
    defineVariable: (type, name, initValue) =>
    {
        var ret = new ShaderBStatement();
        ret.prefixString = `${type} ${name}`;
        if (initValue)
        {
            ret.prefixString += "=";
            ret.content = initValue;
        }
        return ret;
    },

    /**
     * 直接使用表达式字符串创建ShaderBStatement
     * shaderRawStatement
     * @param {Array<string>} code
     * @returns {ShaderBStatement}
     */
    raw: (...code) =>
    {
        var ret = new ShaderBStatement();
        ret.content = SBENode.raw(...code);
        return ret;
    }
}