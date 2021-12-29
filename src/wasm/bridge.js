import { createMemory, instantiate } from "./instantiate.js";
import { WMapi } from "./WMapi.js";

var inited = false;

/**
 * 初始化wasm场景管理
 * @returns {Promise<Object>}
 */
export async function initWM()
{
    var memory = createMemory(64 * 16);
    var wasm = await instantiate(
        (await (await fetch("../wasm/dist/main.wasm")).arrayBuffer()),
        {
            mem: memory,
            wasi_snapshot_preview1: {
                proc_exit: () => { },
                fd_write: () => { }
            }
        }
    );
    inited = true;
    console.log("StructureEngine: Scenario Management (WASM) has been loaded.", wasm.exports);
    /**
     * 导出wasm中的函数
     * (此类型定义用于防止报错)
     * @type {any} Object<string,Function>
     */
    var exp = wasm.exports;
    /**
     * wasm中的内存buffer
     * @type {ArrayBuffer}
     */
    var memoryBuffer = exp.memory.buffer;
    var memoryUint8 = new Uint8Array(exp.memory.buffer);
    /**
     * 从内存中读取字符串
     * @param {number} pointer
     * @returns {string}
     */
    function getStr(pointer)
    {
        var i = pointer;
        for (var Li = memoryUint8.length; i < Li; i++)
            if (memoryUint8[i] == 0)
                break;
        return decoder.decode(memoryBuffer.slice(pointer, i));
    }

    var bridge = new WMapi();
    var decoder = new TextDecoder("utf-8");
    var encoder = new TextEncoder();
    bridge.info = () => getStr(exp.info());
    return bridge;
}