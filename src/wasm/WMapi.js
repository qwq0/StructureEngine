/**
 * wasm场景管理接口类
 * 这些功能在wasm(c/c++)的部分中实现
 */
export class WMapi
{
    /**
     * 请勿直接使用此成员
     * wasm中的函数
     * @type {Object<string,Function>}
     */
    exp = null;

    /**
     * 返回版本信息
     */
    info() { iniWarn(); }

    /**
     * 添加物体
     */
    addObject() { iniWarn(); }

    /**
     * 移除物体
     */
    removeObjects() { iniWarn(); }
}

/**
 * 显示"未实现的接口"警告
 */
function iniWarn()
{
    console.warn("StructureEngine: An unimplemented interface was called.");
}