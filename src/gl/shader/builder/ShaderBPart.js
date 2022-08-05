import { ShaderBStatement } from "./ShaderBStatement.js";

/**
 * 着色器构建器片段
 * 片段通常为一个代码块
 * 片段可包含多个语句
 * 片段可包含子片段
 * ShaderBuilderPart
 */
export class ShaderBPart
{
    /**
     * @type {Array<ShaderBStatement | ShaderBPart>}
     */
    part = [];

    /**
     * 获取此片段的字符串
     * @returns {string}
     */
    getStr()
    {
        var strArr = [];
        this.part.forEach(o =>
        {
            if (o instanceof ShaderBStatement)
                return strArr.push(o.getStr() + ";");
            else if (o instanceof ShaderBPart)
                return strArr.push("{\n" + o.getStr() + "\n}");
            else
                throw "ShaderBPart(ShaderBuilderPart) error: getStr error";
        });
        return strArr.join("\n");
    }

    /**
     * 设置片段内容
     * @param {Array<ShaderBStatement>} part
     */
    setPart(part)
    {
        this.part = part;
    }
}