/**
 * 着色器构建器语句
 * ShaderBuilderStatement
 */
export class ShaderBStatement
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
    content = null;

    /**
     * 获取此语句的字符串
     * 不包括结尾分号
     * @returns {string}
     */
    getStr()
    {
        return this.prefixString + (this.content ? this.content.getStr() : "") + this.postfixString;
    }


}