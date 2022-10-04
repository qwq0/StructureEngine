import { GlslProgram } from "../GlslProgram.js";
import { SBFlag } from "./SBFlag.js";
import { SBFunction } from "./SBFunction.js";
import { SBUse } from "./SBUse.js";

/**
 * 着色器构建器
 * 此类不保证构造的着色器的安全性
 */
export class ShaderBuilder
{
    /**
     * 顶点着色器函数map
     * 函数标识符到函数片段
     * @type {Map<string, SBFunction>}
     */
    functionMap = new Map();

    /**
     * 标志
     * @type {SBFlag}
     */
    flag = new SBFlag();

    constructor()
    { }

    /**
     * 设置函数
     * @param {string} name 函数标识符
     * @param {SBFunction} sbfObj
     */
    setFunction(name, sbfObj)
    {
        this.functionMap.set(name, sbfObj);
    }

    /**
     * 构建glsl着色器(一对着色器)
     * @param {WebGL2RenderingContext} gl
     * @param {string} vertexMainFunctionName
     * @param {string} fragmentMainFunctionName
     * @returns {GlslProgram}
     */
    buildGlslProgram(gl, vertexMainFunctionName, fragmentMainFunctionName)
    {
        /**
         * 获取单个glsl着色器字符串(顶点或片段)
         * @param {string} mainFunctionName
         */
        const getGlslShaderStr = (mainFunctionName) =>
        {
            /**
             * 已经使用的函数集合
             * @type {Set<SBFunction>}
             */
            var functionSet = new Set();
            var allUse = new SBUse();

            /**
             * 遍历需要的函数
             * @param {string} nowFunctionName
             */
            const trFunction = (nowFunctionName) =>
            {
                var nowFunction = this.functionMap.get(nowFunctionName);
                if ((!nowFunction) || functionSet.has(nowFunction))
                    return;
                functionSet.add(nowFunction);

                var nowUse = nowFunction.getUse();
                allUse.mix(nowUse);

                if (nowUse.referenceFunction) // 若有引用其他函数 则遍历
                    nowUse.referenceFunction.forEach(trFunction);
            };
            trFunction(mainFunctionName);

            return ([
                "#version 300 es",
                "precision highp float;",

                (() => // 定义uniform
                {
                    var ret = [];
                    allUse.uniform.forEach(o => { ret.push(o.getStr() + ";"); });
                    return ret;
                })(),
                (() => // 定义in
                {
                    var ret = [];
                    allUse.in.forEach(o => { ret.push(o.getStr() + ";"); });
                    return ret;
                })(),
                (() => // 定义out
                {
                    var ret = [];
                    allUse.out.forEach(o => { ret.push(o.getStr() + ";"); });
                    return ret;
                })(),

                (() => // 除主函数外其他函数的定义
                {
                    var ret = [];
                    functionSet.forEach(o =>
                    {
                        if (o.name != "main")
                            ret.push(o.getStr());
                    });
                    return ret.reverse(); // 反转数组 先定义被引用的
                })(),

                this.functionMap.get(mainFunctionName).getStr() // 主函数定义
            ]).flat(Infinity).join("\n");
        };
        var vertexStr = getGlslShaderStr(vertexMainFunctionName); // 顶点着色器字符串
        var fragmentStr = getGlslShaderStr(fragmentMainFunctionName); // 片段着色器字符串
        console.log(`glsl builder:\n\n${addLineNumber(vertexStr)}\n\n${addLineNumber(fragmentStr)}`);
        return (new GlslProgram(gl, vertexStr, fragmentStr)); // 编译为glsl着色程序
    }
}

/**
 * 为字符串添加行号
 * 用于调试输出
 * @param {string} str
 */
function addLineNumber(str)
{
    var arr = str.split("\n");
    var fillLength = arr.length.toString().length;
    return arr.map((o, i) => (i + 1).toString().padStart(fillLength, "0") + " | " + o).join("\n");
}