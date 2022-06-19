import { GlslGenParam } from "./GlslGenParam.js";

/**
 * 着色器操作类型
 */
const ShaderOperateTable = {
    "": () => "",
    "+": (/** @type {string} */ a, /** @type {string} */ b) => a + "+" + b,
    "-": (/** @type {string} */ a, /** @type {string} */ b) => a + "-" + b,
    "*": (/** @type {string} */ a, /** @type {string} */ b) => a + "*" + b,
    "/": (/** @type {string} */ a, /** @type {string} */ b) => a + "/" + b,
    "=": (/** @type {string} */ a, /** @type {string} */ b) => a + "=" + b,
    "()": (/** @type {string} */ a, /** @type {Array<string>} */ ...b) => a + "(" + b.join(",") + ")",
    ".": (/** @type {string} */ a, /** @type {string} */ b) => a + "." + b,
};

/**
 * 着色器操作描述
 * 包括 运算符 函数执行
 */
export class ShaderOperate
{
    /**
     * 操作类型
     * @type {keyof ShaderOperateTable}
     */
    type = "";

    /**
     * 参数列表
     * @type {Array<ShaderOperate | GlslGenParam | string>}
     */
    param = [];

    /**
     * @param {keyof ShaderOperateTable} type
     * @param {Array<ShaderOperate>} param
     */
    constructor(type, param)
    {
        this.type = type;
        if (param)
            this.param = param;
    }

    /**
     * 递归获取字符串
     * @returns {string}
     */
    getStr()
    {
        return ShaderOperateTable[this.type](...this.param.map(o =>
        {
            if (typeof (o) == "string")
                return o;
            else if (o instanceof ShaderOperate)
                return o.getStr();
            else
                throw "ShaderGenerator error: getStr error";
        }));
    }
}

/**
 * 创建着色器操作描述封装
 * @param {keyof ShaderOperateTable} type
 * @param {Array<ShaderOperate>} param
 */
export function createShaderOperate(type, ...param)
{
    return new ShaderOperate(type, param);
}