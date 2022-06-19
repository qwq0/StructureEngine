import { isAmong } from "../../../util/forEach.js";
import { ShaderOperate } from "./ShaderOperate.js";

/**
 * 着色器部分标识类型表
 * @enum {number}
 */
export const shaderPartFlagTable = Object.freeze({
    /** 无要求 */
    noReq: 0,
    /** 在之前 */
    before: 1,
    /** 在之后 */
    after: 2
});

/**
 * 着色器部分
 * 通常为一个代码块
 */
export class ShaderPart
{
    /**
     * 内容
     * @package
     * @type {Array<ShaderPart | ShaderOperate>}
     */
    parts = [];

    /**
     * 是代码块
     * @package
     * @type {boolean}
     */
    isBlock = false;

    /**
     * 标识要求
     * @package
     * @type {Object<string, shaderPartFlagTable>}
     */
    flagReq = {};

    /**
     * 标识id
     * @package
     * @type {string}
     */
    flagId = "";

    constructor()
    { }

    getStr()
    {
        var strArr = [];
        this.parts.forEach(o => strArr.push(o.getStr()));
        if (this.isBlock)
        {
            strArr.unshift("");
            return "{\n\t" + strArr.join(";\n\t") + "}";
        }
        else
        {
            strArr.push("");
            return strArr.join(";\n");
        }
    }


    /**
     * 获取标识id对应的数组下标(索引)的map
     * 时间复杂度 n*log(n)
     * @private
     * @returns {Map<string, number>}
     */
    getIndMap()
    {
        var indMap = new Map(); // 记录
        this.parts.forEach((now, i) => // 初始化下标map
        {
            if (now instanceof ShaderPart && now.flagId)
            {
                if (indMap.has(now.flagId)) // 重复则不合法
                    throw "ShaderPart error: Duplicate flag ID";
                else
                    indMap.set(now.flagId, i);
            }
        });
        return indMap;
    }

    /**
     * 检测当前列表是否是有序的
     * 判断列表是否满足标识要求
     * @private
     * @param {Map<string, number>} indMap
     */
    isInOrder(indMap)
    {
        return (this.parts.every((now, i) => // 检查每个部分
        {
            if (now instanceof ShaderPart && now.flagReq) // 若有要求
            {
                Object.keys(now.flagReq).every(key => // 对于每个要求
                {
                    switch (now.flagReq[key])
                    {
                        case shaderPartFlagTable.before:
                            if (indMap.has(key) && indMap.get(key) < i) // 当前内容在要求内容之后
                                return false;
                            break;
                        case shaderPartFlagTable.after:
                            if (indMap.has(key) && indMap.get(key) > i) // 当前内容在要求内容之前
                                return false;
                            break;
                    }
                });
            }
            return true;
        }));
    }

    /**
     * 对部分列表重新排序
     * 不能处理离线排序
     * 应当在每次插入一个内容后调用
     *  先对内容列表进行插入排序思想的插入
     *  再逐位冒泡此内容直到满足要求
     * @private
     * @param {ShaderPart} c
     */
    reorderParts(c)
    {
        /**
         * @type {Map<string, number>}
         */
        var indMap = this.getIndMap();
        var nowInd = this.parts.length;
        this.parts.push(c);

        var pdlc = 0; // 防死循环计数 (Prevent dead-loop counters)
        while (!this.isInOrder(indMap = this.getIndMap())) // 如果列表无序
        {
            if ((pdlc++) > 3000) // 防死循环
                throw "ShaderPart error: An infinite loop occurs while sorting";
            this.parts.splice(nowInd, 1);
            nowInd--;
            if (nowInd < 0)
                throw "ShaderPart error: Unable to sort";
            this.parts.splice(nowInd, 0, c);
        }
    }

    /**
     * 添加着色器部分
     * @param {ShaderPart} part
     * @param {Object<string, shaderPartFlagTable>} reqFlagObj
     */
    addPart(part, reqFlagObj)
    {
        var rFlag = { // 默认排序
            writeColor: shaderPartFlagTable.before // 在写入颜色前
        };
        Object.keys(reqFlagObj).forEach(key => rFlag[key] = reqFlagObj.key);

        var c = new ShaderPart();
        c.addPartNoReq(part);
        c.flagReq = rFlag;
        this.reorderParts(c);
    }

    /**
     * 无排序要求添加着色器部分
     * 添加到末尾
     * @param {ShaderPart | ShaderOperate} part
     */
    addPartNoReq(part)
    {
        this.parts.push(part);
    }
}