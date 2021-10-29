import { table } from "./keyboardTable.js";
import { keyData } from "./keyData.js";

/**
 * 键盘 事件处理
 * @param {HTMLElement} element
 * @param {function(keyData):void} callBack
 */
export function keyboardBind(element, callBack)
{
    element.addEventListener("keydown", e => callBack(new keyData(
        (table[e.key] ? table[e.key] : e.key),
        true,
        true
    )));
    element.addEventListener("keyup", e => callBack(new keyData(
        (table[e.key] ? table[e.key] : e.key),
        false,
        false
    )));
}