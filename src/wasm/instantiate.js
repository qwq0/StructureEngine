/**
 * 编译wasm并实例化
 * 此操作将执行wasm中的初始化指令
 * (如c/c++中的main函数)
 * @async
 * @param {BufferSource} bytes 二进制数据
 * @param {object} [imports] 导入到实例的对象
 * @returns {Promise<WebAssembly.Instance>}
 */
export async function instantiate(bytes, imports)
{
    var m = await WebAssembly.compile(bytes);
    return await WebAssembly.instantiate(m, imports);
}