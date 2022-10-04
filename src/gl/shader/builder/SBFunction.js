import { SBPart } from "./SBPart.js";
import { SBStatement } from "./SBStatement.js";
import { SBUse } from "./SBUse.js";

/**
 * 着色器构建器的函数
 * ShaderBuilderFunction
 */
export class SBFunction
{
    /**
     * 函数名
     * 函数定义中的函数名
     * @type {string}
     */
    name = "";
    /**
     * 函数参数定义
     * 一个语句数组 每个语句为一个变量声明
     * @type {Array<SBStatement>}
     */
    paramArr = [];
    /**
     * 函数返回值类型
     * @type {"void"|"float"|"int"|"bool"|"vec4"|"vec3"|"vec2"|"mat4"|"mat3"|"mat2"|"imat4"|"imat3"|"imat2"}
     */
    returnValueType = "void";
    /**
     * 函数的片段
     * 此片段不用标记为代码块
     * @type {SBPart}
     */
    part = null;
    /**
     * SBUse对象
     * 仅包含当前节点信息
     * 不继承子节点
     * @type {SBUse}
     */
    use = new SBUse();

    /**
     * @param {string} name
     */
    constructor(name)
    {
        this.name = name;
    }

    /**
     * 设置函数片段
     * @param {SBPart} part
     */
    setPart(part)
    {
        this.part = part;
    }

    /**
     * 获取此函数定义字符串
     * @returns {string}
     */
    getStr()
    {
        return `${this.returnValueType} ${this.name}(${this.paramArr.map(o => o.getStr()).join(",")})\n{\n${this.part.getStr()}\n}`;
    }

    /**
     * 获取SBUse对象
     * 将遍历子节点
     * @returns {SBUse}
     */
    getUse()
    {
        var ret = new SBUse();
        ret.mix(this.part.getUse());
        ret.mix(this.use);
        return ret;
    }
}