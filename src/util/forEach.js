/*
    文件引用自nFrame
*/

/**
 * 正向遍历数组   
 * 在回调中返回不为false或void的值主动结束遍历   
 * 主动结束遍历 并返回true   
 * 未主动结束遍历完全部内容 返回false   
 * @template T
 * @param {ArrayLike<T>} o
 * @param {function(T, number):(boolean | void)} callback
 * @returns {boolean}
 */
export function forEach(o, callback)
{
    if (!o)
        return false;
    for (var i = 0, Li = o.length; i < Li; i++)
        if (o[i] != undefined && callback(o[i], i))
            return true;
    return false;
}

/**
 * 反向遍历数组   
 * 在回调中返回不为false或void的值主动结束遍历   
 * 主动结束遍历 并返回true   
 * 未主动结束遍历完全部内容 返回false   
 * @template T
 * @param {ArrayLike<T>} o
 * @param {function(T, number):(boolean | void)} callback
 * @returns {boolean}
 */
export function forEachRev(o, callback)
{
    if (!o)
        return false;
    for (var i = o.length - 1; i >= 0; i--)
        if (o[i] != undefined && callback(o[i], i))
            return true;
    return false;
}

/**
 * 判断第一个参数是否属于之后所有的参数   
 * 第一个参数与任何一个之后的参数相等 返回true   
 * 与任何一个都不相等 返回false   
 * @param {any} k
 * @param  {...any} s
 * @returns {boolean}
 */
export function isAmong(k, ...s)
{
    return forEach(s, o => o == k);
}

/**
 * 寻找数组中第一个空元素的下标   
 * 若没有空元素 返回-1   
 * @param {Array<any>} o 
 * @returns {number}
 */
export function findEmpty(o)
{
    for (var i = 0, Li = o.length; i < Li; i++)
        if (o[i] == undefined)
            return i;
    return -1;
}