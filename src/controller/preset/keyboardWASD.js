import { KeyboardMap } from "../KeyboardMap.js";

/**
 * 预设wasd移动绑定
 * 绑定键盘移动相机
 * 事件绑定到body
 * 返回一个函数 每次渲染前调用 传递移动系数(与时间成正比)
 * @param {import("../../index.js").Camera} camera
 * @returns {function(number): void}
 */
export function keyboardWASD(camera)
{
    var keyMap = new KeyboardMap();

    return ((factor) =>
    {
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
            camera.x += (speedX * Math.cos(camera.ry) + speedZ * Math.sin(camera.ry)) * factor;
            camera.z += (speedZ * Math.cos(camera.ry) - speedX * Math.sin(camera.ry)) * factor;
        }

        if (keyMap.get(" "))
        {
            camera.y += factor;
        }
        if (keyMap.get("n"))
        {
            camera.y -= factor;
        }
    });
}