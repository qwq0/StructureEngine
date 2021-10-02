/**
 * 初始化画板(canvas)
 * 返回webgl上下文
 * @param {HTMLCanvasElement} canvas
 * @returns {WebGL2RenderingContext}
 */
export function initContext(canvas)
{
    var gl = canvas.getContext("webgl2");
    canvas.width = Math.floor(canvas.clientWidth * 1.4);
    canvas.height = Math.floor(canvas.clientHeight * 1.4);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1, 0.1, 0.3, 1);
    return gl;
}