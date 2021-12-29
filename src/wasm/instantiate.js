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

/**
 * 创建wasm内存
 * @param {number} initial 初始大小 单位是wasmPages(65536 bytes 即 64 KiB)
 * @param {number} [maximum]
 * @param {boolean} [shared]
 * @returns {WebAssembly.Memory}
 */
export function createMemory(initial, maximum = initial, shared = false)
{
    return new WebAssembly.Memory({
        initial: initial,
        maximum: maximum,
        shared: shared
    });
}