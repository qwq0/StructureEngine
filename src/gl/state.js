/**
 * 全局状态 避免每次传入
 */
class glState
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;
}
export var state = new glState();