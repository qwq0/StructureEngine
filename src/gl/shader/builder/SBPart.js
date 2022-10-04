import { SBENode } from "./SBENode.js";
import { SBStatement } from "./SBStatement.js";
import { SBUse } from "./SBUse.js";

/**
 * 着色器构建器片段
 * 片段通常为一个代码块
 * 片段可包含多个语句
 * 片段可包含子片段
 * ShaderBuilderPart
 */
export class SBPart
{
    /**
     * 此片段中的内容
     * @type {Array<SBStatement | SBPart>}
     */
    content = [];

    /**
     * 此片段使用的SBUse列表
     * 仅包含当前节点信息
     * 不继承子节点
     * @type {Array<SBUse>}
     */
    useArr = [];

    /**
     * 代码块
     * 非代码块不会生成大括号
     * @type {boolean}
     */
    codeBlock = false;

    /**
     * 获取此片段的字符串
     * @returns {string}
     */
    getStr()
    {
        var strArr = [];
        this.content.forEach(o =>
        {
            if (o instanceof SBStatement)
                return strArr.push(o.getStr() + ";");
            else if (o instanceof SBPart)
                return strArr.push(o.getStr());
            else
                throw "ShaderBPart(ShaderBuilderPart) error: getStr error";
        });
        var ret = strArr.join("\n");
        if (ret == "")
            return "";
        else if (this.codeBlock)
            return "{\n" + ret + "\n}";
        else
            return ret;
    }

    /**
     * 设置片段内容
     * @param {Array<SBStatement | SBPart | SBENode | SBUse>} partContent
     */
    setPart(partContent)
    {
        this.content = [];
        partContent.forEach(o =>
        {
            if (o instanceof SBStatement || o instanceof SBPart)
                this.content.push(o);
            else if (o instanceof SBENode)
                this.content.push(SBStatement.node(o));
            else if (o instanceof SBUse)
                this.useArr.push(o);
            else
                throw "ShaderBPart(ShaderBuilderPart) error: setPart error";
        });
    }

    /**
     * 获取SBUse对象
     * 将遍历子节点
     * @returns {SBUse}
     */
    getUse()
    {
        var ret = new SBUse();
        this.content.forEach(o =>
        {
            ret.mix(o.getUse());
        });
        this.useArr.forEach(o =>
        {
            ret.mix(o);
        });
        return ret;
    }

    /**
     * 通过片段内容创建片段
     * @param {Array<SBStatement | SBPart | SBENode | SBUse>} partContent
     * @returns {SBPart}
     */
    static createPart(partContent)
    {
        var ret = new SBPart();
        ret.setPart(partContent);
        return ret;
    }
}