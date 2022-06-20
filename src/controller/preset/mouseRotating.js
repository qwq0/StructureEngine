import { degToRad } from "../../gl/util/math.js";
import { touchBind } from "../touch.js";

/**
 * 预设旋转绑定
 * 绑定鼠标和触摸旋转相机
 * 事件绑定到画布
 * @param {import("../../index.js").Camera} camera
 */
export function mouseRotatingBind(camera)
{
    var canvas = camera.scene.ct.canvas;
    /**
     * @param {{ movementY: number, movementX: number }} e
     */
    function mousemove(e)
    {
        var rx = camera.rx - (e.movementY * 0.005);
        var ry = camera.ry - (e.movementX * 0.005);
        if (rx < degToRad * -90)
            rx = degToRad * -90;
        else if (rx > degToRad * 90)
            rx = degToRad * 90;
        if (ry < degToRad * -360)
            ry += degToRad * 720;
        else if (ry > degToRad * 360)
            ry += degToRad * -720;
        camera.rx = rx;
        camera.ry = ry;
    }
    canvas.addEventListener("mousedown", () =>
    {
        canvas.requestPointerLock();
    });
    document.addEventListener("pointerlockchange", () =>
    {
        if (document.pointerLockElement === canvas)
            document.addEventListener("mousemove", mousemove, false);
        else
            document.removeEventListener("mousemove", mousemove, false);
    }, false);
    touchBind(canvas, e => mousemove({
        movementY: e.vy,
        movementX: e.vx
    }));
}