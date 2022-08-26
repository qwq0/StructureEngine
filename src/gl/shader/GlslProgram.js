/**
 * [gl]glsl着色器程序封装
 * 包括一个顶点着色器和一个片段着色器
 */
export class GlslProgram
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * @type {WebGLProgram}
     */
    progra = null;

    /**
     * uniform变量表
     * uniform名 到 uniform位置 映射
     * @type {Object<string, WebGLUniformLocation>}
     */
    unif = Object.create(null);

    /**
     * @param {WebGL2RenderingContext} gl webgl上下文
     * @param {string} vertexShader 顶点着色器源码
     * @param {string} fragmentShader 片段着色器源码
     */
    constructor(gl, vertexShader, fragmentShader)
    {
        this.gl = gl;
        this.progra = gl.createProgram(); // 创建渲染程序

        gl.attachShader(this.progra, // 绑定顶点着色器
            createShader(gl, vertexShader, gl.VERTEX_SHADER) // 编译顶点着色器
        );
        gl.attachShader(this.progra, // 绑定片段着色器
            createShader(gl, fragmentShader, gl.FRAGMENT_SHADER) // 编译片段着色器
        );

        gl.linkProgram(this.progra); // 链接渲染程序

        if (!gl.getProgramParameter(this.progra, gl.LINK_STATUS)) // 如果获取不到链接状态
        {
            var info = gl.getProgramInfoLog(this.progra);
            throw "Could not link WebGL program:\n" + info;
        }
    }

    /**
     * 使用一个渲染程序(切换到此渲染程序)
     */
    use()
    {
        this.gl.useProgram(this.progra);
    }

    /**
     * 删除一个渲染程序(释放内存)
     */
    deleteProgram()
    {
        this.gl.deleteProgram(this.progra);
    }

    /**
     * 设置着色器的uniformMatrix4值(32位浮点数)
     * @param {string} name 
     * @param {Float32Array | Array<number>} value 
     */
    uniformMatrix4fv(name, value)
    {
        if (!this.unif[name])
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniformMatrix4fv(this.unif[name], false, value);
    }

    /**
     * 设置着色器的uniformMatrix4值(32位浮点数)
     * 开启转置
     * @param {string} name 
     * @param {Float32Array | Array<number>} value 
     */
    uniformMatrix4fv_tr(name, value)
    {
        if (!this.unif[name])
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniformMatrix4fv(this.unif[name], true, value);
    }

    /**
     * 设置着色器的3维向量值(32位浮点数)
     * @param {string} name
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    uniform3f(name, x, y, z)
    {
        if (!this.unif[name])
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniform3f(this.unif[name], x, y, z);
    }

    /**
     * 设置着色器的4维向量值(32位浮点数)
     * @param {string} name
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     */
    uniform4f(name, x, y, z, w)
    {
        if (!this.unif[name])
            this.unif[name] = this.gl.getUniformLocation(this.progra, name);
        this.gl.uniform4f(this.unif[name], x, y, z, w);
    }
}

/**
 * 创建(编译)一个着色器
 * @param {WebGL2RenderingContext} gl webgl上下文
 * @param {string} sourceCode 着色器源码
 * @param {number} type 着色器类型 gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER
 * @returns {WebGLShader}
 */
function createShader(gl, sourceCode, type)
{
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))  // 如果获取不到编译状态
    {
        var info = gl.getShaderInfoLog(shader);
        throw "Could not compile WebGL program:\n" + info;
    }
    return shader;
}