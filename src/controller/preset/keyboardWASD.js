import { v3 } from "../../math/v3.js";
import { KeyboardMap } from "../KeyboardMap.js";

/**
 * 预设wasd绑定
 * 绑定键盘移动
 * 事件绑定到body
 * 返回一个函数 每次渲染前调用 传递移动系数(与时间成正比) 返回运动向量
 * @param {import("../../index.js").Camera} camera
 * @returns {function(number): v3}
 */
export function keyboardWASD(camera)
{
    var keyMap = new KeyboardMap();

    return ((factor) =>
    {
        var ret = new v3();

        var speedX = 0, speedZ = 0;
        if (keyMap.get("w"))
            speedZ -= 1;
        if (keyMap.get("s"))
            speedZ += 1;
        if (keyMap.get("a"))
            speedX -= 1;
        if (keyMap.get("d"))
            speedX += 1;
        if (speedX != 0 || speedZ != 0)
        {
            let speedLen = Math.hypot(speedX, speedZ);
            speedX /= speedLen;
            speedZ /= speedLen;
            ret.x += (speedX * Math.cos(camera.ry) + speedZ * Math.sin(camera.ry)) * factor;
            ret.z += (speedZ * Math.cos(camera.ry) - speedX * Math.sin(camera.ry)) * factor;
        }

        if (keyMap.get(" "))
        {
            ret.y += factor;
        }
        if (keyMap.get("n"))
        {
            ret.y -= factor;
        }

        return ret;
    });
}