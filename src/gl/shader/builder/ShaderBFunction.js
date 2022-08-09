/**
 * 着色器构建器的函数
 * ShaderBuilderFunction
 */
export class ShaderBFunction
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
     * @type {Array<ShaderBStatement>}
     */
    paramArr = [];
    /**
     * 函数返回值类型
     * @type {""|"float"|"int"|"bool"|"vec4"|"vec3"|"vec2"|"mat4"|"mat3"|"mat2"|"imat4"|"imat3"|"imat2"}
     */
    returnValueType = "";
    /**
     * 函数的片段
     * @type {ShaderBPart}
     */
    part = null;

    /**
     * 设置函数片段
     * @param {ShaderBPart} part
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
}