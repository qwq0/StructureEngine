import { pointerData } from "./pointerData.js";

/**
 * 鼠标(拖拽)事件处理
 * @param {HTMLElement} element 
 * @param {function(pointerData)} callBack
 */
export function mouseBind(element, callBack)
{
    element.addEventListener("mousedown", e => mouseDown(e), false);

    var mousemoveP = e => mouseMove(e);
    var mouseupP = e => mouseUp(e);

    var x = 0, y = 0;
    var sx = 0, sy = 0;
    var leftDown = false;
    /**
     * 鼠标处理函数(按下)
     * @param {MouseEvent} e 
     */
    function mouseDown(e)
    {
        if (e.cancelable)
            e.preventDefault();
        sx = x = e.clientX;
        sy = y = e.clientY;
        window.addEventListener("mousemove", mousemoveP, false);
        window.addEventListener("mouseup", mouseupP, false);
        if (e.button == 0)
        {
            leftDown = true;
            callBack(new pointerData(
                x, y,
                0, 0,
                x, y,
                true, true
            ));
        }
    }
    /**
     * 鼠标处理函数(移动)
     * @param {MouseEvent} e 
     */
    function mouseMove(e)
    {
        if (leftDown)
        {
            // e.preventDefault();
            var vx = e.clientX - x;
            var vy = e.clientY - y;
            x = e.clientX;
            y = e.clientY;
            callBack(new pointerData(
                x, y,
                vx, vy,
                sx, sy,
                true, false
            ));
        }
    }
    /**
     * 鼠标处理函数(松开)
     * @param {MouseEvent} e 
     */
    function mouseUp(e)
    {
        var vx = e.clientX - x;
        var vy = e.clientY - y;
        x = e.clientX;
        y = e.clientY;
        window.removeEventListener("mousemove", mousemoveP, false);
        window.removeEventListener("mouseup", mouseupP, false);
        if (leftDown && e.button == 0)
        {
            leftDown = false;
            callBack(new pointerData(
                x, y,
                vx, vy,
                sx, sy,
                false, false
            ));
        }
    }
}