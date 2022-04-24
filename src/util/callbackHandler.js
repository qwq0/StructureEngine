/*
    文件引用自nFrame
*/

/**
 * 管理一个回调
 * 使其成为异步函数
 * 
 * 此类未完成
 * 
 * @template T
 */
export class CallbackHandler
{

    /**
     * @private
     * @type {function(T):void}
     */
    callback;

    constructor()
    { }

    /**
     * 获取回调函数
     * @returns {function(T):void}
     */
    getCBFunction()
    {
        return this.callback;
    }

    /**
     * 等待直到函数执行
     * @async
     */
    wait()
    {
        return (new Promise((resolve, reject) =>
        {
        }));
    }
}

/**
 * 代理回调
 * 作为一个异步函数
 * @template T
 * @param {(arg0: (e: T) => void) => void} executor
 * @param {(arg0: any) => void} [after]
 * @param {(arg0: (e: any) => void) => void} [errorExecutor]
 * @param {(arg0: any) => void} [errorAfter]
 * @returns {Promise<T>}
 */
export function proxyCallback(executor, after, errorExecutor, errorAfter)
{
    return (new Promise((resolve, reject) =>
    {
        var proxy = (/** @type {T} */ e) =>
        {
            resolve(e);
            if (after)
                after(proxy);
        };
        executor(proxy);
        if (errorExecutor)
        {
            var errorProxy = (/** @type {any} */ e) =>
            {
                reject(e);
                if (errorAfter)
                    errorAfter(errorExecutor);
            };
            errorExecutor(errorProxy);
        }

    }));
}