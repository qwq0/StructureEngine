import { SBENode } from "./SBENode.js";
import { SBPart } from "./SBPart.js";
import { SBStatement } from "./SBStatement.js";

/**
 * 着色器生成器标志类
 * 使用不同标志以构建不同着色器
 * ShaderBuilderFlag
 */
export class SBFlag
{
    /**
     * 标志表
     * 标志名到标志编号的映射
     * @type {Map<string, number>}
     */
    flagMap = new Map();

    /**
     * 标志表计数
     * @type {number}
     */
    flagMapSNCount = 0;

    /**
     * 标志集合
     * 当前标记的标志编号集合
     * @type {Set<number>}
     */
    flagStateSet = new Set();

    /**
     * 添加标志
     * @param {Array<string>} flags 添加标志名列表
     */
    addFlags(flags)
    {
        flags.forEach(o =>
        {
            var flagSN = this.flagMap.get(o);
            if (flagSN != undefined)
                this.flagStateSet.add(flagSN);
            else
                throw "SBFlag(ShaderBuilderFlag) error: an undefined flag name was used";
        });
    }

    /**
     * 设置标志
     * 这会清除之前设置的标志
     * @param {Array<string>} flags 设置此标志名列表
     */
    setFlags(flags)
    {
        this.flagStateSet.clear();
        this.addFlags(flags);
    }

    /**
     * 获取当前标志状态包含的标志编号数组
     * @returns {Array<number>}
     */
    getFlagSNArr()
    {
        /** @type {Array<number>} */
        var ret = [];
        this.flagStateSet.forEach(o => { ret.push(o); });
        ret.sort();
        return ret;
    }

    /**
     * 获取当前标志状态的描述字符串
     * 相同标志状态的描述字符串相同
     * @returns {string}
     */
    getDescribeString()
    {
        return this.getFlagSNArr().map(o => o.toString(36)).join("-");
    }

    /**
     * 定义可使用的标志名
     * @param {string} flagName
     * @returns {number} 标志编号
     */
    defineFlagName(flagName)
    {
        var ret = this.flagMap.get(flagName);
        if (ret == undefined)
            this.flagMap.set(flagName, (ret = this.flagMapSNCount++));
        return ret;
    }

    /**
     * 按照flag分支
     * @template {SBENode | SBStatement | SBPart} T
     * @param {string} flagName
     * @param {T} ifTrue
     * @param {T} ifFalse
     * @returns {T}
     */
    ifFlag(flagName, ifTrue, ifFalse)
    {
        var flagSN = this.defineFlagName(flagName);
        return (new Proxy(ifTrue, {
            get: (_target, property) =>
            {
                var targetThis = (this.flagStateSet.has(flagSN) ? ifTrue : ifFalse);
                var ret = targetThis[property];
                if (typeof (ret) == "function")
                    return (/** @type {function} */(ret)).bind(targetThis);
                else
                    return ret;
            },
            set: (_target, property, value) =>
            {
                (this.flagStateSet.has(this.flagMap.get(flagName)) ? ifTrue : ifFalse)[property] = value;
                return true;
            }
        }));
    }
}