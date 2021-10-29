import { forEach } from "../util/forEach.js";
import { pointerData } from "./pointerData.js";

/**
 * 触摸(拖拽) 事件处理
 * @param {HTMLElement} element 
 * @param {function(pointerData):void} callBack
 */
export function touchBind(element, callBack)
{
    element.addEventListener("touchstart", e => touchStart(e), {
        capture: false,
        passive: false
    });
    element.addEventListener("touchmove", e => touchMove(e), {
        capture: false,
        passive: true
    });
    element.addEventListener("touchend", e => touchEnd(e), {
        capture: false,
        passive: true
    });

    var ogTouches = [];
    /**
     * 通过标识符取触摸点数据索引
     * @param {any} id
     * @returns {number}
     */
    function getTouchesInd(id)
    {
        var ret = -1;
        ogTouches.forEach((o, i) =>
        {
            if (id == o.id)
                ret = i;
        });
        return ret;
    }
    /**
     * 触摸处理函数(按下)
     * @param {TouchEvent} e 
     */
    function touchStart(e)
    {
        if (e.cancelable)
            e.preventDefault();
        forEach(e.touches, o =>
        {
            var t = {
                id: o.identifier,
                sx: o.clientX,
                sy: o.clientY,
                x: o.clientX,
                y: o.clientY
            };
            ogTouches.push(t);
            callBack(new pointerData(
                t.x, t.y,
                0, 0,
                t.sx, t.sy,
                true, true
            ));
        });
    }
    /**
     * 触摸处理函数(移动)
     * @param {TouchEvent} e 
     */
    function touchMove(e)
    {
        forEach(e.touches, o =>
        {
            var ind = getTouchesInd(o.identifier);
            if (ind > -1)
            {
                var t = ogTouches[ind];
                var vx = o.clientX - t.x;
                var vy = o.clientY - t.y;
                t.x = o.clientX;
                t.y = o.clientY;
                callBack(new pointerData(
                    t.x, t.y,
                    vx, vy,
                    t.sx, t.sy,
                    true, false
                ));
            }
        });
    }
    /**
     * 触摸处理函数(松开)
     * @param {TouchEvent} e 
     */
    function touchEnd(e)
    {
        forEach(e.touches, o =>
        {
            var ind = getTouchesInd(o.identifier);
            if (ind > -1)
            {
                var t = ogTouches[ind];
                ogTouches.splice(ind, 1);
                var vx = o.clientX - t.x;
                var vy = o.clientY - t.y;
                t.x = o.clientX;
                t.y = o.clientY;
                callBack(new pointerData(
                    t.x, t.y,
                    vx, vy,
                    t.sx, t.sy,
                    false, false
                ));
            }
        });
    }
}