import { keyboardBind } from "./keyboard.js";

/**
 * 键盘操作的封装
 */
export class KeyboardMap
{
    /**
     * 按键状态表
     * 存在则为按下
     * @type {Set<string>}
     */
    keySet = new Set();
    /**
     * 按下回调map
     * @type {Map<string, function(import("./keyData").keyData) : void>}
     */
    downCB = new Map();
    /**
     * 弹起回调map
     * @type {Map<string, function(import("./keyData").keyData) : void>}
     */
    upCB = new Map();
    /**
     * 监听器函数
     * 调用此函数以模拟键盘操作
     * @type {function(import("./keyData").keyData, KeyboardEvent): void}
     */
    listener = null;

    /**
     * 接管元素的键盘操作
     * @param {HTMLElement} e 默认为 document.body
     */
    constructor(e = document.body)
    {
        keyboardBind(e, this.listener = ((e, ke) =>
        {
            if (ke.target instanceof HTMLElement && ke.target.tagName == "INPUT")
                return;
            var key = e.key;
            if (e.hold)
            {
                if (!this.keySet.has(key))
                {
                    this.keySet.add(key);
                    let cb = this.downCB.get(key);
                    if (cb)
                        cb(e);
                }
            }
            else
            {
                if (this.keySet.has(key))
                {
                    this.keySet.delete(e.key);
                    let cb = this.upCB.get(key);
                    if (cb)
                        cb(e);
                }
            }
        }));
    }

    /**
     * 获取按键状态
     * @param {string} key 
     * @returns {boolean} true为按下
     */
    get(key)
    {
        return this.keySet.has(key);
    }

    /**
     * 绑定按下事件
     * 注意: 一个按键多次绑定Down会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下时触发
     */
    bindDown(key, callback)
    {
        this.downCB.set(key, callback);
    }

    /**
     * 绑定弹起事件
     * 注意: 一个按键多次绑定Up会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键弹起时触发
     */
    bindUp(key, callback)
    {
        this.upCB.set(key, callback);
    }

    /**
     * 绑定按键事件
     * 注意: 一个按键多次绑定会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下或弹起时触发
     */
    bind(key, callback)
    {
        this.bindDown(key, callback);
        this.bindUp(key, callback);
    }

    /**
     * 绑定多个按键
     * 注意: 一个按键多次绑定会解除前一次绑定的回调
     * @param {Array<string>} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下或弹起时触发
     */
    bindArray(key, callback)
    {
        key.forEach(o => { this.bind(o, callback); });
    }
}