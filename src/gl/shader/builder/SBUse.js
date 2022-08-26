/**
 * 着色器使用到的变量信息
 * ShaderBuilderUse
 */
export class SBUse
{
    // TODO 改成变量名到定义语句的映射
    /**
     * 此函数需要的uniform参数列表
     * 参数名到参数类型的映射
     * @type {Map<string, string>}
     */
    uniform = new Map();
    /**
     * 此函数需要的in参数列表
     * 参数名到参数类型的映射
     * @type {Map<string, string>}
     */
    in = new Map();
    /**
     * 此函数需要的out参数列表
     * 参数名到参数类型的映射
     * @type {Map<string, string>}
     */
    out = new Map();
    /**
     * 引用的函数名集合
     * @type {Set<string>}
     */
    referenceFunction = new Set();

    /**
     * 复制此SBUse
     * @returns {SBUse}
     */
    copy()
    {
        var ret = new SBUse();
        ret.mix(this);
        return ret;
    }

    /**
     * 将另一个SBUse的需求混合到此SBUse
     * 会改变此SBUse
     * @param {SBUse} a
     */
    mix(a)
    {
        mixMap(this.uniform, a.uniform);
        mixMap(this.in, a.in);
        mixMap(this.out, a.out);
        a.referenceFunction.forEach(o => { this.referenceFunction.add(o); });
    }

    /**
     * 添加uniform参数
     * @param {string} name
     * @param {string} type
     */
    addUniform(name, type)
    {
        this.uniform.set(name, type);
    }

    /**
     * 添加in参数
     * @param {string} name
     * @param {string} type
     */
    addIn(name, type)
    {
        this.in.set(name, type);
    }

    /**
     * 添加out参数
     * @param {string} name
     * @param {string} type
     */
    addOut(name, type)
    {
        this.out.set(name, type);
    }

    /**
     * 添加引用的函数
     * @param {string} functionName
     */
    addReferenceFunction(functionName)
    {
        this.referenceFunction.add(functionName);
    }

    /**
     * 创建SBUse对象
     * 此函数使用创建的SBUse对象调用回调
     * 并返回创建的SBUse对象
     * @param {function(SBUse): void} cb 回调
     */
    static create(cb)
    {
        var ret = new SBUse();
        cb(ret);
        return ret;
    }
}

/**
 * 将b混合到a
 * @param {Map} a
 * @param {Map} b
 */
function mixMap(a, b)
{
    b.forEach((value, key) =>
    {
        var v = a.get(key);
        if (v == undefined)
            a.set(key, value);
        else if (v != value)
            throw "SBUse(ShaderBuilderUse) error: An error occurred while mixing requirements";
    });
}