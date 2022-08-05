/**
 * 着色器表达式运算符字符串生成函数
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
    "()": (/** @type {string} */ a, /** @type {Array<string>} */ ...b) => a + "(" + b.join(",") + ")",
    // 获取结构体的部分
    ".": (/** @type {string} */ a, /** @type {string} */ b) => a + "." + b,
    // 获取数组的元素
    "[]": (/** @type {string} */ a, /** @type {string} */ b) => `${a}[${b}]`,
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
    "?:": (/** @type {string} */ a, /** @type {string} */ b, /** @type {string} */ c) => `(${a}?${b}:${c})`,
};


/**
 * 着色器构建器表达式树的节点
 * ShaderBuilderExpressionNode
 */
class SBENode
{
    /**
     * 运算符
     * @type {string}
     */
    operator = "";
    /**
     * 子节点
     * @type {Array<string | SBENode>}
     */
    child = null;

    /**
     * @param {string} [operator]
     * @param {Array<string | SBENode>} [child]
     */
    constructor(operator = "", child = [])
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
     * 加
     * @param {string | SBENode} a
     * @returns {SBENode}
     */
    add(a) { return new SBENode("+", [this, a]); }
    /**
     * 减
     * @param {string | SBENode} a
     * @returns {SBENode}
     */
    sub(a) { return new SBENode("-", [this, a]); }
    /**
     * 乘
     * @param {string | SBENode} a
     * @returns {SBENode}
     */
    mul(a) { return new SBENode("*", [this, a]); }
    /**
     * 除以
     * @param {string | SBENode} a
     * @returns {SBENode}
     */
    div(a) { return new SBENode("/", [this, a]); }
    /**
     * 赋值
     * @param {string | SBENode} a
     * @returns {SBENode}
     */
    assign(a) { return new SBENode("=", [this, a]); }
    /**
     * 逻辑或
     * @param {string | SBENode} a
     * @returns {SBENode}
     */
    or(a) { return new SBENode("||", [this, a]); }
    /**
     * 逻辑与
     * @param {string | SBENode} a
     * @returns {SBENode}
     */
    and(a) { return new SBENode("&&", [this, a]); }
    /**
     * 条件(三目)运算
     * @param {string | SBENode} a
     * @param {string | SBENode} b
     * @returns {SBENode}
     */
    condition(a, b) { return new SBENode("?:", [this, a, b]); }
    /**
     * 自定义运算符
     * @param {string} operator
     * @param {Array<string | SBENode>} param
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
}

