import { SEContext } from "../SEContext.js";

/**
 * 初始化画板(canvas)
 * 返回Structure Engine上下文
 * @param {HTMLCanvasElement} canvas
 * @param {number} scale
 * @returns {SEContext}
 */
export function initContext(canvas, scale = 1)
{
    var gl = canvas.getContext("webgl2");
    canvas.width = Math.floor(canvas.clientWidth * window.devicePixelRatio * scale);
    canvas.height = Math.floor(canvas.clientHeight * window.devicePixelRatio * scale);
    // TODO 将此处gl操作移动到SEContext
    gl.viewport(0, 0, canvas.width, canvas.height);
    // gl.enable(gl.CULL_FACE); // (三角形方向)面剔除
    gl.enable(gl.DEPTH_TEST); // 深度测试(z-buffer)
    gl.clearColor(0.2, 0.2, 0.2, 1);
    return new SEContext(gl, canvas);
}