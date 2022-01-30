/**
 * 初始化画板(canvas)
 * 返回webgl上下文
 * @param {HTMLCanvasElement} canvas
 * @param {number} scale
 * @returns {WebGL2RenderingContext}
 */
export function initContext(canvas, scale = 1.1)
{
    var gl = canvas.getContext("webgl2");
    canvas.width = Math.floor(canvas.clientWidth * scale);
    canvas.height = Math.floor(canvas.clientHeight * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.3, 0.3, 0.3, 1);
    return gl;
}