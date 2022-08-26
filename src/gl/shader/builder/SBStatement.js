import { SBENode } from "./SBENode.js";
import { SBUse } from "./SBUse.js";

/**
 * 着色器构建器语句
 * ShaderBuilderStatement
 */
export class SBStatement
{
    /**
     * 前缀字符串
     * @type {string}
     */
    prefixString = "";
    /**
     * 后缀字符串
     * @type {string}
     */
    postfixString = "";
    /**
     * 表达式
     * @type {SBENode}
     */
    contentNode = null;
    /**
     * SBUse对象
     * 仅包含当前节点信息
     * 不继承子节点
     * @type {SBUse}
     */
    use = null;

    /**
     * 获取此语句的字符串
     * 不包括结尾分号
     * @returns {string}
     */
    getStr()
    {
        return this.prefixString + (this.contentNode ? this.contentNode.getStr() : "") + this.postfixString;
    }

    /**
     * 获取SBUse对象
     * 将遍历子节点
     * @returns {SBUse}
     */
    getUse()
    {
        var ret = new SBUse();
        ret.mix(this.contentNode.getUse());
        if (this.use)
            ret.mix(this.use);
        return ret;
    }

    /**
     * 定义变量
     * @param {"float"|"int"|"bool"|"vec4"|"vec3"|"vec2"|"mat4"|"mat3"|"mat2"|"imat4"|"ivec4"|"sampler2D"|"samplerCube"} type 类型
     * @param {string} name 变量名
     * @param {SBENode} [initValue] 初始值
     * @returns {SBStatement}
     */
    static defineVariable(type, name, initValue) 
    {
        var ret = new SBStatement();
        ret.prefixString = `${type} ${name}`;
        if (initValue)
        {
            ret.prefixString += "=";
            ret.contentNode = initValue;
        }
        return ret;
    }
    /**
     * 定义常量
     * @param {`${("float"|"int"|"bool"|"vec4"|"vec3"|"vec2"|"mat4"|"mat3"|"mat2"|"imat4"|"ivec4")}${(""|"[]"|`[${number}]`)}`} type 类型
     * @param {string} name 常量名
     * @param {SBENode} initValue 初始值
     * @returns {SBStatement}
     */
    static defineConst(type, name, initValue) 
    {
        var ret = new SBStatement();
        ret.prefixString = `const ${type} ${name}`;
        if (initValue)
        {
            ret.prefixString += "=";
            ret.contentNode = initValue;
        }
        return ret;
    }
    /**
     * 直接使用表达式字符串创建ShaderBStatement
     * shaderRawStatement
     * @param {Array<string>} code
     * @returns {SBStatement}
     */
    static raw(...code)
    {
        var ret = new SBStatement();
        ret.contentNode = SBENode.raw(...code);
        return ret;
    }
    
    /**
     * 使用SBENode对象创建ShaderBStatement
     * @param {SBENode} node
     * @returns {SBStatement}
     */
    static node(node)
    {
        var ret = new SBStatement();
        ret.contentNode = node;
        return ret;
    }
}