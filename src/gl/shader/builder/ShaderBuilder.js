import { ShaderBPart } from "./ShaderBPart.js";

/**
 * 着色器构建器的函数
 */
export class ShaderBFunction
{
    /**
     * 函数的片段
     * @type {ShaderBPart}
     */
    part = null;
}

/**
 * 着色器构建器
 * 此类不保证构造的着色器的安全性
 */
export class ShaderBuilder
{
    /**
     * 顶点着色器函数map
     * 函数名到函数片段
     * @type {Map<string, ShaderBPart>}
     */
    functionMap = new Map();

    constructor()
    {}

    /**
     * 设置函数
     * @param {string} name
     * @param {ShaderBFunction} sbfObj
     */
    setFunction(name, sbfObj)
    {}
}