import { SBStatement } from "./SBStatement.js";
import { SBUse } from "./SBUse.js";

/**
 * 着色器表达式运算符字符串生成函数
 * 此表生成glsl语法的着色器字符串
 */
const operatorTable = {
    // 空白
    "": () => "",
    // 直接进行字符串拼接
    "raw": (/** @type {Array<string>} */ ...a) => a.join(""),
    // 加
    "+": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}+${b})`,
    // 减
    "-": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}-${b})`,
    // 乘
    "*": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}*${b})`,
    // 除以
    "/": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}/${b})`,
    // 求余
    "%": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}%${b})`,
    // 赋值
    "=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}=${b})`,
    // 赋值加
    "+=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}+=${b})`,
    // 赋值减
    "-=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}-=${b})`,
    // 赋值乘
    "*=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}*=${b})`,
    // 赋值除以
    "/=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}/=${b})`,
    // 赋值求余
    "%=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}%=${b})`,
    // 执行函数
    "()": (/** @type {string} */ a, /** @type {Array<string>} */ ...param) => a + "(" + param.join(",") + ")",
    // 获取结构体的部分
    ".": (/** @type {string} */ a, /** @type {string} */ key) => a + "." + key,
    // 获取数组的元素
    "[]": (/** @type {string} */ a, /** @type {string} */ index) => `${a}[${index}]`,
    // 大于
    ">": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}>${b})`,
    // 小于
    "<": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}<${b})`,
    // 大于或等于
    ">=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}>=${b})`,
    // 小于或等于
    "<=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}<=${b})`,
    // 相等
    "==": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}==${b})`,
    // 不相等
    "!=": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}!=${b})`,
    // 逻辑取反
    "!": (/** @type {string} */ a) => `(!${a})`,
    // 逻辑或
    "||": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}||${b})`,
    // 逻辑与
    "&&": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}&&${b})`,
    // 逻辑异或
    "^^": (/** @type {string} */ a, /** @type {string} */ b) => `(${a}^^${b})`,
    // 条件(三目)运算
    "?:": (/** @type {string} */ condition, /** @type {string} */ ifTrue, /** @type {string} */ ifFalse) => `(${condition}?${ifTrue}:${ifFalse})`,
    // 构造数组
    "ConstructArray": (/** @type {string} */ type, /** @type {Array<string>} */ ...elements) => `(${type}[](${elements.join(",")}))`,
};


/**
 * 着色器构建器表达式树的节点
 * ShaderBuilderExpressionNode
 */
export class SBENode
{
    /**
     * 运算符
     * @type {keyof operatorTable}
     */
    operator = "";
    /**
     * 子节点
     * @type {Array<SBENode | string>}
     */
    child = null;
    /**
     * SBUse对象
     * 仅包含当前节点信息
     * 不继承子节点
     * @type {SBUse}
     */
    use = null;

    /**
     * @param {keyof operatorTable} operator
     * @param {Array<SBENode | string>} [child]
     */
    constructor(operator, child = [])
    {
        this.operator = operator;
        this.child = child;
    }

    /**
     * 递归获取字符串
     * @returns {string}
     */
    getStr()
    {
        return operatorTable[this.operator](...this.child.map(o =>
        {
            if (typeof (o) == "string")
                return o;
            else if (o instanceof SBENode)
                return o.getStr();
            else
                throw "SBENode(ShaderBuilderExpressionNode) error: getStr error";
        }));
    }

    /**
     * 获取SBUse对象
     * 将遍历子节点
     * @returns {SBUse}
     */
    getUse()
    {
        var ret = new SBUse();
        if (this.child)
            this.child.forEach(o =>
            {
                if (o instanceof SBENode)
                {
                    ret.mix(o.getUse());
                }
            });
        if (this.use)
            ret.mix(this.use);
        return ret;
    }

    /**
     * 加
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    add(a) { return new SBENode("+", [this, a]); }
    /**
     * 减
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    sub(a) { return new SBENode("-", [this, a]); }
    /**
     * 乘
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    mul(a) { return new SBENode("*", [this, a]); }
    /**
     * 除以
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    div(a) { return new SBENode("/", [this, a]); }
    /**
     * 赋值
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    assign(a) { return new SBENode("=", [this, a]); }
    /**
     * 逻辑或
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    or(a) { return new SBENode("||", [this, a]); }
    /**
     * 逻辑与
     * @param {SBENode | string} a
     * @returns {SBENode}
     */
    and(a) { return new SBENode("&&", [this, a]); }
    /**
     * 条件(三目)运算
     * @param {SBENode | string} ifTrue
     * @param {SBENode | string} ifFalse
     * @returns {SBENode}
     */
    condition(ifTrue, ifFalse) { return new SBENode("?:", [this, ifTrue, ifFalse]); }
    /**
     * 获取成员(获取结构体的部分)
     * @param {string} memberName
     * @returns {SBENode}
     */
    getMember(memberName) { return new SBENode(".", [this, memberName]); }
    /**
     * 自定义运算符
     * @param {keyof operatorTable} operator
     * @param {Array<SBENode | string>} param
     * @returns {SBENode}
     */
    o(operator, ...param)
    {
        if (!operatorTable[operator])
            throw "SBENode(ShaderBuilderExpressionNode) error: An operator that does not exist or cannot be used was used";
        return new SBENode(operator, param);
    }
    /**
     * 直接使用表达式字符串生成节点
     * @param {Array<string | SBENode>} code
     */
    static raw(...code)
    {
        return new SBENode("raw", code);
    }
    /**
     * 构造数组
     * @param {"float" | "int" | "bool" | "vec4" | "vec3" | "vec2" | "mat4" | "mat3" | "mat2" | "imat4" | "ivec4"} type
     * @param {Array<SBENode | string>} elements
     */
    static constructArray(type, elements)
    {
        return new SBENode("ConstructArray", [type, ...elements]);
    }
    /**
     * 调用函数
     * @param {string} name
     * @param {Array<SBENode | string>} param
     */
    static callFunc(name, ...param)
    {
        var ret = new SBENode("()", [name, ...param]);
        ret.use = new SBUse();
        ret.use.addReferenceFunction(name);
        return ret;
    }
    /**
     * in变量节点
     * @param {string} name
     * @param {string} type
     * @returns {SBENode}
     */
    static in(name, type, local)
    {
        var ret = new SBENode("raw", [name]);
        ret.use = new SBUse();
        ret.use.addIn(name, SBStatement.defineGlobalParameter(type, name, "in", local));
        return ret;
    }
    /**
     * out变量节点
     * @param {string} name
     * @param {string} type
     * @returns {SBENode}
     */
    static out(name, type)
    {
        var ret = new SBENode("raw", [name]);
        ret.use = new SBUse();
        ret.use.addOut(name, SBStatement.defineGlobalParameter(type, name, "out"));
        return ret;
    }
    /**
     * uniform变量节点
     * @param {string} name
     * @param {string} type
     * @returns {SBENode}
     */
    static uniform(name, type)
    {
        var ret = new SBENode("raw", [name]);
        ret.use = new SBUse();
        ret.use.addUniform(name, SBStatement.defineGlobalParameter(type, name, "uniform"));
        return ret;
    }
    /**
     * 获取调用函数的SBENode的构造器
     * @param {string} functionName
     * @returns {function(...(SBENode | string)): SBENode} 构造器 传递调用函数使用的参数
     */
    static callFunction(functionName)
    {
        return SBENode.callFunc.bind(this, functionName);
    }
}

