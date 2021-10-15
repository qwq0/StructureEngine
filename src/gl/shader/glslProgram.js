/**
 * 创建一个渲染程序
 * 包括一个顶点着色器和一个片段着色器
 */
export class glslProgram
{
    /**
     * @type {WebGLProgram}
     */
    progra = null;

    /**
     * @param {WebGL2RenderingContext} gl webgl上下文
     * @param {string} vertexShader 顶点着色器源码
     * @param {string} fragmentShader 片段着色器源码
     */
    constructor(gl, vertexShader, fragmentShader)
    {
        this.progra = gl.createProgram(); // 创建渲染程序

        gl.attachShader(this.progra, // 绑定顶点着色器
            createShader(gl, vertexShader, gl.VERTEX_SHADER)
        );
        gl.attachShader(this.progra, // 绑定片段着色器
            createShader(gl, fragmentShader, gl.FRAGMENT_SHADER)
        );

        gl.linkProgram(this.progra); // 链接渲染程序

        if (!gl.getProgramParameter(this.progra, gl.LINK_STATUS))
        {
            var info = gl.getProgramInfoLog(this.progra);
            throw "Could not link WebGL program:\n" + info;
        }
    }

    /**
     * 删除一个渲染程序(释放内存)
     * @param {WebGL2RenderingContext} gl webgl上下文
     */
    deleteProgram(gl)
    {
        gl.deleteProgram(this.progra);
    }
}

/**
 * 创建一个着色器
 * @param {WebGL2RenderingContext} gl webgl上下文
 * @param {string} sourceCode 着色器源码
 * @param {*} type 着色器类型 gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER
 * @returns {WebGLShader}
 */
function createShader(gl, sourceCode, type)
{
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        var info = gl.getShaderInfoLog(shader);
        throw "Could not compile WebGL program:\n" + info;
    }
    return shader;
}