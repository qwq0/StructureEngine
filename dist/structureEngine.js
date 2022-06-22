/**
 * Structure Engine
 * @link https://github.com/qwq0/StructureEngine
 * @copyright StructureEngine authors (qwq0(qwq_yahu) & ndzda)
 * @license MIT
 */
const structureEngineInfo = Object.freeze({
    /** 引擎字符串版本号 */
    version: "1.0",
    /** 引擎版本编号 */
    versionNumber: 1
});

/**
 * glsl参数封装
 * 用于glsl生成
 */
class GlslGenParam
{
    /**
     * 类型
     * @typedef { "" |
     *  "float" | "int" | "bool" |
     *  "vec4" | "vec3" | "vec2" |
     *  "mat4" | "mat3" | "mat2" |
     *  "imat4" | "imat3" | "imat2" |
     *  "sampler2D" | "samplerCube"
     * } GlslGenParamType
     * @type {GlslGenParamType}
     */
    type = "";

    /**
     * 变量名(标识符)
     * @type {string}
     */
    id = "";

    /**
     * 此变量的位置(用于赋值时寻址)
     */
    location = -1;

    /**
     * @param {GlslGenParamType} type 类型
     * @param {string} id 标识符
     * @param {number} [location] 此值的位置 -1为不指定
     */
    constructor(type, id, location = -1)
    {
        this.type = type;
        this.id = id;
        this.location = location;
    }

    /**
     * 获取layout字符串(包括末尾的空格)
     * @returns {string}
     */
    getLayout()
    {
        if (this.location > -1)
            return "layout (location = " + this.location + ") ";
        else
            return "";
    }

    /**
     * 获取变量定义字符串
     * @param {"in" | "out" | "uniform"} variType
     * @returns {string}
     */
    getDefine(variType)
    {
        return this.getLayout() + variType + " " + this.type + " " + this.id;
    }
}

/**
 * [gl]创建一个glsl渲染程序
 * 包括一个顶点着色器和一个片段着色器
 */
class GlslProgram
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
     * @type {Object<string, object>}
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
 * 创建一个着色器
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

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        var info = gl.getShaderInfoLog(shader);
        throw "Could not compile WebGL program:\n" + info;
    }
    return shader;
}

/**
 * glsl着色器生成器
 * 生成一对着色器(一个GlslProgram)
 *  - 顶点着色器流程
 *      - 定义输入变量
 *          - in vec4 a_position; // 原始坐标 (必须)Location=0
 *          - in vec2 a_texcoord; // 纹理坐标 Location=1
 *          - in vec3 a_normal; // 原始法线 Location=2
 *          - uniform mat4 u_cameraMatrix; // (必须)相机(包括投影投影)矩阵
 *          - uniform mat4 u_worldMatrix; // (必须)世界矩阵
 *      - 传递顶点的视图坐标(必须)
 *      - 传递自定义数据
 *  - 片段着色器流程
 *      - 定义输入变量(包含顶点着色器的输入变量)
 *          - in vec3 v_normal; // 法线
 *          - in vec3 v_thisPos; // 顶点的世界坐标
 *          - in vec2 v_texcoord; // 纹理坐标
 *          - uniform sampler2D u_texture; // 纹理
 *          - uniform vec3 u_viewPos; // 视点(相机)的世界坐标
 *          - uniform vec3 u_markColor; // (默认未启用)标记颜色(调试)
 *      - 计算光照
 *      - 设置最终颜色(必须)
 */
class GlslGenerator
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;


    /**
     * 顶点着色器的uniform表
     * @type {Map<string, GlslGenParam>}
     */
    vUniform = new Map();
    /**
     * 片段着色器的uniform表
     * @type {Map<string, GlslGenParam>}
     */
    fUniform = new Map();
    /**
     * 顶点着色器的in表
     * @type {Map<string, GlslGenParam>}
     */
    vIn = new Map();
    /**
     * 片段着色器的in表
     * 顶点着色器的out表
     * @type {Map<string, GlslGenParam>}
     */
    fIn = new Map();

    /**
     * 顶点着色器部分
     * @type {Array<string>}
     */
    vPart = [];
    /**
     * 片段着色器部分
     * @type {Array<string>}
     */
    fPart = [];
    /**
     * fPart的一些预设
     */
    static t_fPart = {
        light: [
            "const vec3 lightDir = normalize(vec3(0.3, -0.3, 1))", // 灯光方向向量
            "float diffLight = max(dot(normal, -lightDir), 0.0)", // 平行光漫反射
            "float reflLight = pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0)", // 平行光镜面反射
            "lightResult = 0.75 + diffLight * 0.2 + reflLight * 0.08" // 光的总影响
        ]
    };

    /**
     * 片段着色器输出的颜色
     * @type {string}
     */
    fOutColor = GlslGenerator.t_fOutColor.white;
    /**
     * fOutColor的一些预设值
     */
    static t_fOutColor = {
        white: "vec3(1.0, 1.0, 1.0)",
        /** 纹理乘以光照 */
        light: "texture(u_texture, v_texcoord).rgb * lightResult",
        /** 渲染法线向量作为颜色 */
        normal: "normal"
    };

    /**
     * 片段着色器输出的颜色类型
     * @type {"rgb" | "rgba"}
     */
    fOutColorType = "rgb";

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.gl = gl;

        ([
            new GlslGenParam("mat4", "u_cameraMatrix"), // 相机(包括投影投影)矩阵
            new GlslGenParam("mat4", "u_worldMatrix") // 世界矩阵
        ]).forEach(o =>
        {
            this.vUniform.set(o.id, o);
        });

        ([
            new GlslGenParam("vec4", "a_position", 0), // 原始坐标
            new GlslGenParam("vec2", "a_texcoord", 1), // 纹理坐标
            new GlslGenParam("vec3", "a_normal", 2) // 原始法线
        ]).forEach(o =>
        {
            this.vIn.set(o.id, o);
        });

        ([
            new GlslGenParam("vec3", "v_thisPos"), // 顶点的世界坐标
            new GlslGenParam("vec3", "v_normal"), // 法线
            new GlslGenParam("vec2", "v_texcoord") // 纹理坐标
        ]).forEach(o =>
        {
            this.fIn.set(o.id, o);
        });

        ([
            new GlslGenParam("vec3", "u_viewPos"), // 视点(相机)的世界坐标
            new GlslGenParam("sampler2D", "u_texture") // 纹理
            // new GlslGenParam("vec3", "u_markColor") // 标记颜色(调试)    
        ]).forEach(o =>
        {
            this.fUniform.set(o.id, o);
        });
    }

    /**
     * 生成着色器
     * @returns {GlslProgram}
     */
    gen()
    {
        var vertexShader = this.genVertexShader();
        var fragmentShader = this.genFragmentShader();
        // console.trace(vertexShader, fragmentShader);
        return new GlslProgram(this.gl, vertexShader, fragmentShader);
    }

    /**
     * 生成顶点着色器
     * @private
     */
    genVertexShader()
    {
        return ([
            "#version 300 es",
            "precision highp float;",

            (() => // 顶点着色器uniform
            {
                var ret = [];
                this.vUniform.forEach((value) =>
                {
                    ret.push(value.getDefine("uniform") + ";");
                });
                return ret;
            })(),

            (() => // 顶点着色器in
            {
                var ret = [];
                this.vIn.forEach((value) =>
                {
                    ret.push(value.getDefine("in") + ";");
                });
                return ret;
            })(),

            (() => // 顶点着色器out
            {
                var ret = [];
                this.fIn.forEach((value) =>
                {
                    ret.push(value.getDefine("out") + ";");
                });
                return ret;
            })(),

            "void main() {",
            "    gl_Position = u_cameraMatrix * u_worldMatrix * a_position;", // 转换到视图中坐标
            "    v_texcoord = a_texcoord;", // 纹理坐标(插值)
            "    v_thisPos = (u_worldMatrix * a_position).xyz;", // 顶点世界坐标(插值)

            "    mat4 u_worldViewProjection = u_worldMatrix;", // 求出不含平移的世界矩阵(旋转和缩放)
            "    u_worldViewProjection[3][0] = u_worldViewProjection[3][1] = u_worldViewProjection[3][2] = 0.0;",
            "    u_worldViewProjection = transpose(inverse(u_worldViewProjection));",

            "    v_normal = mat3(u_worldViewProjection) * a_normal;", // 法线(插值)

            (() => // 顶点着色器部分
            {
                var ret = [];
                this.vPart.forEach((o) =>
                {
                    ret.push(o + ";\n");
                });
                return ret;
            })(),

            "}"
        ]).flat(Infinity).join("\n");
    }

    /**
     * 生成片段着色器
     * @private
     */
    genFragmentShader()
    {
        return ([
            "#version 300 es",
            "precision highp float;",

            (() => // 片段着色器uniform
            {
                var ret = [];
                this.fUniform.forEach((value) =>
                {
                    ret.push(value.getDefine("uniform") + ";");
                });
                return ret;
            })(),

            (() => // 片段着色器in
            {
                var ret = [];
                this.fIn.forEach((value) =>
                {
                    ret.push(value.getDefine("in") + ";");
                });
                return ret;
            })(),

            (() => // 片段着色器out
            {
                return ["out vec4 outColor;"]; // 此片段最终的颜色
            })(),


            "void main() {",
            "    vec3 normal = normalize(v_normal);", // 法线(归一化)

            "    float lightResult = 1.0;", // 光的总影响

            (() => // 片段着色器部分
            {
                var ret = [];
                this.fPart.forEach((o) =>
                {
                    ret.push(o + ";\n");
                });
                return ret;
            })(),

            "    outColor.a = 1.0;",
            "    outColor." + this.fOutColorType + " = (" + this.fOutColor + ");", // 计算最终颜色
            // "    outColor.rgb += u_markColor;", // 标记颜色(调试)
            // "    discard;", 丢弃片段
            "}"
        ]).flat(Infinity).join("\n");
    }
}

/**
 * 初始化glsl着色器
 * @param {WebGL2RenderingContext} gl
 * @param {object} program
 */
function initShader(gl, program)
{
    { // 纯白着色器
        let pGenerator = new GlslGenerator(gl);
        program.white = pGenerator.gen();
    }

    { // 相机着色器(绘制单个物体)
        let pGenerator = new GlslGenerator(gl);

        ([
            new GlslGenParam("mat4", "u_lightMat") // 灯光投影矩阵
        ]).forEach(o => pGenerator.vUniform.set(o.id, o));

        ([
            new GlslGenParam("vec4", "v_lightP") // 灯光投影矩阵转换后的坐标
        ]).forEach(o => pGenerator.fIn.set(o.id, o));

        ([
            new GlslGenParam("sampler2D", "u_texS") // 阴影贴图
        ]).forEach(o => pGenerator.fUniform.set(o.id, o));

        pGenerator.vPart = [
            "v_lightP = u_lightMat * u_worldMatrix * a_position"
        ];

        pGenerator.fPart = [
            "vec3 lightP = v_lightP.xyz / v_lightP.w",
            "lightP.x *= 0.5",
            "lightP.y *= 0.5",
            "lightP.x += 0.5",
            "lightP.y += 0.5",

            "const vec3 lightDir = normalize(vec3(0.3, -0.3, 1))", // 灯光方向向量
            "float diffLight = max(dot(normal, -lightDir), 0.0)", // 平行光漫反射
            "float reflLight = pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0)", // 平行光镜面反射
            "float factorLight = (lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0 && lightP.z>=-1.0 && lightP.z<=1.0 && texture(u_texS, lightP.xy).r + 0.001 * (1.0 - dot(normal,-lightDir)) < lightP.z * 0.5 + 0.5) ? 0.0 : 1.0", // 阴影
            "lightResult = 0.45 + (diffLight * 0.5 + reflLight * 0.08) * factorLight" // 光的总影响
        ];
        pGenerator.fOutColor = GlslGenerator.t_fOutColor.light;

        program.camera = pGenerator.gen();
    }

    { // 相机着色器(实例化绘制物体)
        let pGenerator = new GlslGenerator(gl);

        ([
            new GlslGenParam("mat4", "u_lightMat") // 灯光投影矩阵
        ]).forEach(o => pGenerator.vUniform.set(o.id, o));

        ([
            new GlslGenParam("vec4", "v_lightP") // 灯光投影矩阵转换后的坐标
        ]).forEach(o => pGenerator.fIn.set(o.id, o));

        ([
            new GlslGenParam("sampler2D", "u_texS") // 阴影贴图
        ]).forEach(o => pGenerator.fUniform.set(o.id, o));

        pGenerator.vPart = [
            "v_lightP = u_lightMat * u_worldMatrix * a_position"
        ];

        pGenerator.fPart = [
            "vec3 lightP = v_lightP.xyz / v_lightP.w",
            "lightP.x *= 0.5",
            "lightP.y *= 0.5",
            "lightP.x += 0.5",
            "lightP.y += 0.5",

            "const vec3 lightDir = normalize(vec3(0.3, -0.3, 1))", // 灯光方向向量
            "float diffLight = max(dot(normal, -lightDir), 0.0)", // 平行光漫反射
            "float reflLight = pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0)", // 平行光镜面反射
            "float factorLight = (lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0 && lightP.z>=-1.0 && lightP.z<=1.0 && texture(u_texS, lightP.xy).r + 0.001 * (1.0 - dot(normal,-lightDir)) < lightP.z * 0.5 + 0.5) ? 0.0 : 1.0", // 阴影
            "lightResult = 0.45 + (diffLight * 0.5 + reflLight * 0.08) * factorLight" // 光的总影响
        ];
        pGenerator.fOutColor = GlslGenerator.t_fOutColor.light;

        pGenerator.vUniform.delete("u_worldMatrix");
        pGenerator.vIn.set("u_worldMatrix", new GlslGenParam("mat4", "u_worldMatrix"));

        program.cameraInstance = pGenerator.gen();
    }
}

/**
 * 4向量类
 */
class v4
{
    /**
     * 向量中的第个1值
     * @type {number}
     */
    x;
    /**
     * 向量中的第个2值
     * @type {number}
     */
    y;
    /**
     * 向量中的第个3值
     * @type {number}
     */
    z;
    /**
     * 向量中的第个4值
     * @type {number}
     */
    w;

    /**
     * @param {number} [x]
     * @param {number} [y]
     * @param {number} [z]
     * @param {number} [w]
     */
    constructor(x = 0, y = 0, z = 0, w = 1)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * 乘m4矩阵
     * (向量 乘 矩阵)
     * @param {import("./m4").m4} m
     */
    mulM4(m)
    {
        var a = m.a;
        return new v4(
            (this.x * a[0]) + (this.y * a[4]) + (this.z * a[8]) + (this.w * a[12]),
            (this.x * a[1]) + (this.y * a[5]) + (this.z * a[9]) + (this.w * a[13]),
            (this.x * a[2]) + (this.y * a[6]) + (this.z * a[10]) + (this.w * a[14]),
            (this.x * a[3]) + (this.y * a[7]) + (this.z * a[11]) + (this.w * a[15])
        );
    }

    /**
     * 欧拉角到四元数
     * 旋转顺序ZYX
     * 单位为弧度
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    static Euler2Quaternion(x, y, z)
    {
        return new v4(
            Math.sin(x * 0.5) * Math.cos(y * 0.5) * Math.cos(z * 0.5) -
            Math.cos(x * 0.5) * Math.sin(y * 0.5) * Math.sin(z * 0.5),

            Math.cos(x * 0.5) * Math.sin(y * 0.5) * Math.cos(z * 0.5) +
            Math.sin(x * 0.5) * Math.cos(y * 0.5) * Math.sin(z * 0.5),

            Math.cos(x * 0.5) * Math.cos(y * 0.5) * Math.sin(z * 0.5) -
            Math.sin(x * 0.5) * Math.sin(y * 0.5) * Math.cos(z * 0.5),

            Math.cos(x * 0.5) * Math.cos(y * 0.5) * Math.cos(z * 0.5) +
            Math.sin(x * 0.5) * Math.sin(y * 0.5) * Math.sin(z * 0.5)
        );
    }

    /**
     * 欧拉角到方向向量
     * 单位弧度
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    static Euler2Direction(x, y, z)
    {
        return new v4(
            -((Math.cos(y) * Math.sin(x) * Math.sin(z)) + (Math.sin(y) * Math.cos(z))),
            (Math.cos(y) * Math.cos(z)) - (Math.sin(y) * Math.sin(x) * Math.sin(z)),
            Math.cos(x) * Math.sin(z),
            0
        );
    }

    /**
     * 归一化(使向量长度为1 不改变方向)
     * 不改变原向量
     * @returns {v4}
     */
    normalize()
    {
        var multiple = 1 / Math.hypot(this.x, this.y, this.z, this.w);
        if (multiple != Infinity)
            return new v4(
                this.x * multiple,
                this.y * multiple,
                this.z * multiple,
                this.w * multiple
            );
        else
            return new v4();
    }

    /**
     * 取三维向量的模(长度)
     * 只使用xyz
     */
    getV3Len()
    {
        return Math.hypot(this.x, this.y, this.z);
    }
}

/**
 * 4*4矩阵类
 */
class m4
{
    /**
     * 矩阵原始数据
     * 数组长度为16
     * @type {Array<number>}
     */
    a = null;

    /**
     * 使用数组作为参数以复制矩阵
     * 缺省参数创建单位矩阵(左上到右下对角线为1 其余为0)
     * @param {Array<number>} [arr]
     */
    constructor(arr)
    {
        if (arr)
        {
            this.a = arr.slice();
        }
        else
        {
            this.a = [ // 新矩阵
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        }
    }

    /**
     * 复制矩阵
     * @returns {m4}
     */
    copy()
    {
        return new m4(this.a);
    }

    /**
     * 矩阵乘法
     * 不会改变原矩阵
     * 注意 此乘法与一般矩阵乘法的ab相反
     * 此函数为b*a 也就是矩阵变换乘
     * c[i][j] = sum(a[k][j] + b[i][k])
     * @param {m4} matrix
     * @returns {m4}
     */
    multiply(matrix)
    {
        var a = this.a;
        var b = matrix.a;
        return new m4([
            (a[0 * 4 + 0] * b[0 * 4 + 0]) + (a[1 * 4 + 0] * b[0 * 4 + 1]) + (a[2 * 4 + 0] * b[0 * 4 + 2]) + (a[3 * 4 + 0] * b[0 * 4 + 3]),
            (a[0 * 4 + 1] * b[0 * 4 + 0]) + (a[1 * 4 + 1] * b[0 * 4 + 1]) + (a[2 * 4 + 1] * b[0 * 4 + 2]) + (a[3 * 4 + 1] * b[0 * 4 + 3]),
            (a[0 * 4 + 2] * b[0 * 4 + 0]) + (a[1 * 4 + 2] * b[0 * 4 + 1]) + (a[2 * 4 + 2] * b[0 * 4 + 2]) + (a[3 * 4 + 2] * b[0 * 4 + 3]),
            (a[0 * 4 + 3] * b[0 * 4 + 0]) + (a[1 * 4 + 3] * b[0 * 4 + 1]) + (a[2 * 4 + 3] * b[0 * 4 + 2]) + (a[3 * 4 + 3] * b[0 * 4 + 3]),

            (a[0 * 4 + 0] * b[1 * 4 + 0]) + (a[1 * 4 + 0] * b[1 * 4 + 1]) + (a[2 * 4 + 0] * b[1 * 4 + 2]) + (a[3 * 4 + 0] * b[1 * 4 + 3]),
            (a[0 * 4 + 1] * b[1 * 4 + 0]) + (a[1 * 4 + 1] * b[1 * 4 + 1]) + (a[2 * 4 + 1] * b[1 * 4 + 2]) + (a[3 * 4 + 1] * b[1 * 4 + 3]),
            (a[0 * 4 + 2] * b[1 * 4 + 0]) + (a[1 * 4 + 2] * b[1 * 4 + 1]) + (a[2 * 4 + 2] * b[1 * 4 + 2]) + (a[3 * 4 + 2] * b[1 * 4 + 3]),
            (a[0 * 4 + 3] * b[1 * 4 + 0]) + (a[1 * 4 + 3] * b[1 * 4 + 1]) + (a[2 * 4 + 3] * b[1 * 4 + 2]) + (a[3 * 4 + 3] * b[1 * 4 + 3]),

            (a[0 * 4 + 0] * b[2 * 4 + 0]) + (a[1 * 4 + 0] * b[2 * 4 + 1]) + (a[2 * 4 + 0] * b[2 * 4 + 2]) + (a[3 * 4 + 0] * b[2 * 4 + 3]),
            (a[0 * 4 + 1] * b[2 * 4 + 0]) + (a[1 * 4 + 1] * b[2 * 4 + 1]) + (a[2 * 4 + 1] * b[2 * 4 + 2]) + (a[3 * 4 + 1] * b[2 * 4 + 3]),
            (a[0 * 4 + 2] * b[2 * 4 + 0]) + (a[1 * 4 + 2] * b[2 * 4 + 1]) + (a[2 * 4 + 2] * b[2 * 4 + 2]) + (a[3 * 4 + 2] * b[2 * 4 + 3]),
            (a[0 * 4 + 3] * b[2 * 4 + 0]) + (a[1 * 4 + 3] * b[2 * 4 + 1]) + (a[2 * 4 + 3] * b[2 * 4 + 2]) + (a[3 * 4 + 3] * b[2 * 4 + 3]),

            (a[0 * 4 + 0] * b[3 * 4 + 0]) + (a[1 * 4 + 0] * b[3 * 4 + 1]) + (a[2 * 4 + 0] * b[3 * 4 + 2]) + (a[3 * 4 + 0] * b[3 * 4 + 3]),
            (a[0 * 4 + 1] * b[3 * 4 + 0]) + (a[1 * 4 + 1] * b[3 * 4 + 1]) + (a[2 * 4 + 1] * b[3 * 4 + 2]) + (a[3 * 4 + 1] * b[3 * 4 + 3]),
            (a[0 * 4 + 2] * b[3 * 4 + 0]) + (a[1 * 4 + 2] * b[3 * 4 + 1]) + (a[2 * 4 + 2] * b[3 * 4 + 2]) + (a[3 * 4 + 2] * b[3 * 4 + 3]),
            (a[0 * 4 + 3] * b[3 * 4 + 0]) + (a[1 * 4 + 3] * b[3 * 4 + 1]) + (a[2 * 4 + 3] * b[3 * 4 + 2]) + (a[3 * 4 + 3] * b[3 * 4 + 3])
        ]);
    }

    /**
     * 矩阵求逆
     * 不会改变原矩阵
     * @returns {m4}
     */
    inverse()
    {
        var a = this.a;
        var m00 = a[0 * 4 + 0], m01 = a[0 * 4 + 1], m02 = a[0 * 4 + 2], m03 = a[0 * 4 + 3],
            m10 = a[1 * 4 + 0], m11 = a[1 * 4 + 1], m12 = a[1 * 4 + 2], m13 = a[1 * 4 + 3],
            m20 = a[2 * 4 + 0], m21 = a[2 * 4 + 1], m22 = a[2 * 4 + 2], m23 = a[2 * 4 + 3],
            m30 = a[3 * 4 + 0], m31 = a[3 * 4 + 1], m32 = a[3 * 4 + 2], m33 = a[3 * 4 + 3];
        var k0 = m22 * m33;
        var k1 = m32 * m23;
        var k2 = m12 * m33;
        var k3 = m32 * m13;
        var k4 = m12 * m23;
        var k5 = m22 * m13;
        var k6 = m02 * m33;
        var k7 = m32 * m03;
        var k8 = m02 * m23;
        var k9 = m22 * m03;
        var k10 = m02 * m13;
        var k11 = m12 * m03;
        var k12 = m20 * m31;
        var k13 = m30 * m21;
        var k14 = m10 * m31;
        var k15 = m30 * m11;
        var k16 = m10 * m21;
        var k17 = m20 * m11;
        var k18 = m00 * m31;
        var k19 = m30 * m01;
        var k20 = m00 * m21;
        var k21 = m20 * m01;
        var k22 = m00 * m11;
        var k23 = m10 * m01;
        var t0 = (k0 * m11 + k3 * m21 + k4 * m31) - (k1 * m11 + k2 * m21 + k5 * m31);
        var t1 = (k1 * m01 + k6 * m21 + k9 * m31) - (k0 * m01 + k7 * m21 + k8 * m31);
        var t2 = (k2 * m01 + k7 * m11 + k10 * m31) - (k3 * m01 + k6 * m11 + k11 * m31);
        var t3 = (k5 * m01 + k8 * m11 + k11 * m21) - (k4 * m01 + k9 * m11 + k10 * m21);
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
        return new m4([
            d * t0,
            d * t1,
            d * t2,
            d * t3,

            d * ((k1 * m10 + k2 * m20 + k5 * m30) - (k0 * m10 + k3 * m20 + k4 * m30)),
            d * ((k0 * m00 + k7 * m20 + k8 * m30) - (k1 * m00 + k6 * m20 + k9 * m30)),
            d * ((k3 * m00 + k6 * m10 + k11 * m30) - (k2 * m00 + k7 * m10 + k10 * m30)),
            d * ((k4 * m00 + k9 * m10 + k10 * m20) - (k5 * m00 + k8 * m10 + k11 * m20)),

            d * ((k12 * m13 + k15 * m23 + k16 * m33) - (k13 * m13 + k14 * m23 + k17 * m33)),
            d * ((k13 * m03 + k18 * m23 + k21 * m33) - (k12 * m03 + k19 * m23 + k20 * m33)),
            d * ((k14 * m03 + k19 * m13 + k22 * m33) - (k15 * m03 + k18 * m13 + k23 * m33)),
            d * ((k17 * m03 + k20 * m13 + k23 * m23) - (k16 * m03 + k21 * m13 + k22 * m23)),

            d * ((k14 * m22 + k17 * m32 + k13 * m12) - (k16 * m32 + k12 * m12 + k15 * m22)),
            d * ((k20 * m32 + k12 * m02 + k19 * m22) - (k18 * m22 + k21 * m32 + k13 * m02)),
            d * ((k18 * m12 + k23 * m32 + k15 * m02) - (k22 * m32 + k14 * m02 + k19 * m12)),
            d * ((k22 * m22 + k16 * m02 + k21 * m12) - (k20 * m12 + k23 * m22 + k17 * m02)),
        ]);
    }

    /**
     * 矩阵转置
     * 不会改变原矩阵
     * @returns {m4}
     */
    transpose()
    {
        var a = this.a;
        return new m4([
            a[0 * 4 + 0], a[1 * 4 + 0], a[2 * 4 + 0], a[3 * 4 + 0],
            a[0 * 4 + 1], a[1 * 4 + 1], a[2 * 4 + 1], a[3 * 4 + 1],
            a[0 * 4 + 2], a[1 * 4 + 2], a[2 * 4 + 2], a[3 * 4 + 2],
            a[0 * 4 + 3], a[1 * 4 + 3], a[2 * 4 + 3], a[3 * 4 + 3]
        ]);
    }

    /**
     * 创建零矩阵(全部为0)
     * @returns {m4}
     */
    static zero()
    {
        return new m4([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);
    }

    /**
     * 透视投影矩阵
     * 此矩阵将使用向量的w
     * z将不是线性变化的
     * 使用此矩阵纹理将正确映射
     * @param {number} fov 对角线视角场(单位:弧度)
     * @param {number} aspect 视口垂直长度与水平长度的比例
     * @param {number} near 视锥最近处
     * @param {number} far 视锥最远处
     * @returns {m4}
     */
    static perspective(fov, aspect, near, far)
    {
        var f = 1 / Math.tan(fov * 0.5);
        var rangeInv = 1.0 / (near - far);

        return new m4([
            Math.sqrt(1 + (aspect * aspect)) * f, 0, 0, 0,
            0, Math.sqrt(1 + 1 / (aspect * aspect)) * f, 0, 0,
            0, 0, 1 + 2 * far * rangeInv, -1, // 1 + ((2far) / (near - far))
            0, 0, near * far * rangeInv * 2, 0 // near * far * 2 / (near - far)
        ]); // Z = 2 * (0.5 + far + near * far / z) / (near - far)
    }

    /**
     * 坐标转换矩阵(正交投影)
     *  将以原点为中心
     *  面朝-z方向深度为d的
     *  xy方向长度分别为wh坐标
     *  转换为opengl(-1到1)坐标系
     * @param {number} w 宽
     * @param {number} h 高
     * @param {number} d 深
     * @returns {m4}
     */
    static projection(w, h, d)
    {
        return new m4([
            2 / w, 0, 0, 0,
            0, 2 / h, 0, 0,
            0, 0, -2 / d, 0,
            0, 0, -1, 1
        ]);
    }

    /**
     * 四元数转矩阵
     * 按照左手螺旋定则方向旋转
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     * @returns {m4}
     */
    static quaternionLH(x, y, z, w)
    {
        return new m4([
            1 - 2 * (y * y + z * z),
            2 * (x * y - w * z),
            2 * (x * z + w * y),
            0,

            2 * (x * y + w * z),
            1 - 2 * (x * x + z * z),
            2 * (y * z - w * x),
            0,

            2 * (x * z - w * y),
            2 * (y * z + w * x),
            1 - 2 * (x * x + y * y),
            0,

            0,
            0,
            0,
            1
        ]);
    }

    /**
     * 四元数转矩阵
     * 按照右手螺旋定则方向旋转
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     * @returns {m4}
     */
    static quaternionRH(x, y, z, w)
    {
        return new m4([
            1 - 2 * (y * y + z * z),
            2 * (x * y + w * z),
            2 * (x * z - w * y),
            0,

            2 * (x * y - w * z),
            1 - 2 * (x * x + z * z),
            2 * (y * z + w * x),
            0,

            2 * (x * z + w * y),
            2 * (y * z - w * x),
            1 - 2 * (x * x + y * y),
            0,

            0,
            0,
            0,
            1
        ]);
    }

    /*
        部分矩阵变换经过优化
        可能提高效率 实际性能表现未经测试
    */

    /**
     * 平移矩阵
     * 将改变原矩阵
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {m4}
     */
    translation(x, y, z)
    {
        this.a[3 * 4 + 0] +=
            x * this.a[0 * 4 + 0] +
            y * this.a[1 * 4 + 0] +
            z * this.a[2 * 4 + 0];
        this.a[3 * 4 + 1] +=
            x * this.a[0 * 4 + 1] +
            y * this.a[1 * 4 + 1] +
            z * this.a[2 * 4 + 1];
        this.a[3 * 4 + 2] +=
            x * this.a[0 * 4 + 2] +
            y * this.a[1 * 4 + 2] +
            z * this.a[2 * 4 + 2];
        this.a[3 * 4 + 3] +=
            x * this.a[0 * 4 + 3] +
            y * this.a[1 * 4 + 3] +
            z * this.a[2 * 4 + 3];
        return this;
    }
    /**
     * 绕x轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} rx
     */
    rotateX(rx)
    {
        var a = this.a;
        /*
            1, 0,  0, 0,
            0, c,  s, 0,
            0, -s, c, 0,
            0, 0,  0, 1
        */
        var cosX = Math.cos(rx),
            sinX = Math.sin(rx),
            l0 = a[1 * 4 + 0],
            l1 = a[1 * 4 + 1],
            l2 = a[1 * 4 + 2],
            l3 = a[1 * 4 + 3],
            r0 = a[2 * 4 + 0],
            r1 = a[2 * 4 + 1],
            r2 = a[2 * 4 + 2],
            r3 = a[2 * 4 + 3];
        a[1 * 4 + 0] = l0 * cosX + r0 * sinX;
        a[1 * 4 + 1] = l1 * cosX + r1 * sinX;
        a[1 * 4 + 2] = l2 * cosX + r2 * sinX;
        a[1 * 4 + 3] = l3 * cosX + r3 * sinX;
        a[2 * 4 + 0] = r0 * cosX - l0 * sinX;
        a[2 * 4 + 1] = r1 * cosX - l1 * sinX;
        a[2 * 4 + 2] = r2 * cosX - l2 * sinX;
        a[2 * 4 + 3] = r3 * cosX - l3 * sinX;
    }
    /**
     * 绕y轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} ry
     */
    rotateY(ry)
    {
        var a = this.a;
        /*
            c, 0, -s, 0,
            0, 1, 0,  0,
            s, 0, c,  0,
            0, 0, 0,  1
        */
        var cosY = Math.cos(ry),
            sinY = Math.sin(ry),
            l0 = a[0 * 4 + 0],
            l1 = a[0 * 4 + 1],
            l2 = a[0 * 4 + 2],
            l3 = a[0 * 4 + 3],
            r0 = a[2 * 4 + 0],
            r1 = a[2 * 4 + 1],
            r2 = a[2 * 4 + 2],
            r3 = a[2 * 4 + 3];
        a[0 * 4 + 0] = l0 * cosY - r0 * sinY;
        a[0 * 4 + 1] = l1 * cosY - r1 * sinY;
        a[0 * 4 + 2] = l2 * cosY - r2 * sinY;
        a[0 * 4 + 3] = l3 * cosY - r3 * sinY;
        a[2 * 4 + 0] = r0 * cosY + l0 * sinY;
        a[2 * 4 + 1] = r1 * cosY + l1 * sinY;
        a[2 * 4 + 2] = r2 * cosY + l2 * sinY;
        a[2 * 4 + 3] = r3 * cosY + l3 * sinY;
    }
    /**
     * 绕z轴旋转矩阵
     * 将改变原矩阵
     * 此函数不返回矩阵本身
     * @param {number} rz
     */
    rotateZ(rz)
    {
        var a = this.a;
        /*
            c,  s, 0, 0,
            -s, c, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        */
        var cosZ = Math.cos(rz),
            sinZ = Math.sin(rz),
            l0 = a[0 * 4 + 0],
            l1 = a[0 * 4 + 1],
            l2 = a[0 * 4 + 2],
            l3 = a[0 * 4 + 3],
            r0 = a[1 * 4 + 0],
            r1 = a[1 * 4 + 1],
            r2 = a[1 * 4 + 2],
            r3 = a[1 * 4 + 3];
        a[0 * 4 + 0] = l0 * cosZ + r0 * sinZ;
        a[0 * 4 + 1] = l1 * cosZ + r1 * sinZ;
        a[0 * 4 + 2] = l2 * cosZ + r2 * sinZ;
        a[0 * 4 + 3] = l3 * cosZ + r3 * sinZ;
        a[1 * 4 + 0] = r0 * cosZ - l0 * sinZ;
        a[1 * 4 + 1] = r1 * cosZ - l1 * sinZ;
        a[1 * 4 + 2] = r2 * cosZ - l2 * sinZ;
        a[1 * 4 + 3] = r3 * cosZ - l3 * sinZ;
    }
    /**
     * 旋转矩阵(旋转顺序ZYX)
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {m4}
     */
    rotateZYX(rx, ry, rz)
    {
        this.rotateZ(rz);
        this.rotateY(ry);
        this.rotateX(rx);
        return this;
    }
    /**
     * 旋转矩阵(旋转顺序XYZ)
     * 将改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @returns {m4}
     */
    rotateXYZ(rx, ry, rz)
    {
        this.rotateX(rx);
        this.rotateY(ry);
        this.rotateZ(rz);
        return this;
    }
    /**
     * 旋转矩阵(根据四元数旋转(右手螺旋))
     * 不会改变原矩阵
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @param {number} rw
     * @returns {m4}
     */
    rotateQuatRH(rx, ry, rz, rw)
    {
        return this.multiply(m4.quaternionRH(rx, ry, rz, rw));
    }

    /**
     * 缩放矩阵
     * 将改变原矩阵
     * @param {number} sx
     * @param {number} sy
     * @param {number} sz
     * @returns {m4}
     */
    scale(sx, sy, sz)
    {
        this.a[0 * 4 + 0] *= sx;
        this.a[0 * 4 + 1] *= sx;
        this.a[0 * 4 + 2] *= sx;
        this.a[0 * 4 + 3] *= sx;
        this.a[1 * 4 + 0] *= sy;
        this.a[1 * 4 + 1] *= sy;
        this.a[1 * 4 + 2] *= sy;
        this.a[1 * 4 + 3] *= sy;
        this.a[2 * 4 + 0] *= sz;
        this.a[2 * 4 + 1] *= sz;
        this.a[2 * 4 + 2] *= sz;
        this.a[2 * 4 + 3] *= sz;
        return this;
    }

    /**
     * 乘v4向量
     * (矩阵 乘 向量)
     * @param {import("./v4").v4} v
     */
    mulV4(v)
    {
        var a = this.a;
        return new v4(
            (v.x * a[0]) + (v.y * a[1]) + (v.z * a[2]) + (v.w * a[3]),
            (v.x * a[4]) + (v.y * a[5]) + (v.z * a[6]) + (v.w * a[7]),
            (v.x * a[8]) + (v.y * a[9]) + (v.z * a[10]) + (v.w * a[11]),
            (v.x * a[12]) + (v.y * a[13]) + (v.z * a[14]) + (v.w * a[15])
        );
    }
}

/**
 * 纹理类
 */
class Texture
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 纹理对象
     * @type {WebGLTexture}
     */
    tex = null;

    /**
     * 创建纹理
     * 默认颜色纹理为 1*1-纯色-rgb(0,255,255)
     * @param {WebGL2RenderingContext} gl
     * @param {WebGLTexture} [texture] 纹理对象 传递以进行封装
     */
    constructor(gl, texture)
    {
        this.gl = gl;
        if (!texture)
        { // 默认纹理
            texture = gl.createTexture(); // 创建纹理
            gl.bindTexture(gl.TEXTURE_2D, texture); // 绑定纹理(切换正在操作为当前纹理)
            gl.texImage2D( // 图片未加载完成时的纹理
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.RGBA, // 纹理颜色组件
                1, // 宽
                1, // 高
                0, // 边框宽度(遗留属性,必须为0)
                gl.RGBA, // 数据格式
                gl.UNSIGNED_BYTE, // 数据类型
                new Uint8Array([0, 255, 255, 255]) // 图像源
            ); // 填充初始色
        }
        this.tex = texture;
    }

    /**
     * 通过图像的url创建纹理
     * @param {WebGL2RenderingContext} gl
     * @param {string} url
     * @returns {Texture}
     */
    static fromImageUrl(gl, url)
    {
        var ret = new Texture(gl);
        var image = new Image();
        image.src = url; // 加载图片
        image.addEventListener("load", () => // 图片加载完
        {
            gl.bindTexture(gl.TEXTURE_2D, ret.tex); // 绑定纹理(切换正在操作为当前纹理)
            gl.texImage2D( // 将纹理设置为此图片
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.RGBA, // 纹理颜色组件
                gl.RGBA, // 数据格式
                gl.UNSIGNED_BYTE, // 数据类型
                image // 图像源
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); // 设置镜像重复
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT); // 设置镜像重复
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // mipmap设置(绘制的面大于贴图时)只选取1个像素
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // mipmap设置(绘制的面大于贴图时)混合原贴图的4个像素
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // mipmap设置(绘制的面小于贴图时)混合两个贴图每个选取4个像素
            gl.generateMipmap(gl.TEXTURE_2D); // 生成mipmap纹理
        });
        return ret;
    }

    /**
     * 绑定纹理(到指定编号的纹理单元)
     * @param {number} ind
     */
    bindTexture(ind)
    {
        this.gl.activeTexture(this.gl.TEXTURE0 + ind); // 使用第ind纹理单元
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex); // 绑定纹理(切换正在操作为当前纹理)
    }
}

/**
 * 渲染到纹理
 * 帧缓冲区封装
 */
class Render2Texture
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /** 纹理宽度 @type {number} */
    textureWidth = 0;
    /** 纹理高度 @type {number} */
    textureHeight = 0;

    /**
     * 帧缓冲区
     * @type {WebGLFramebuffer}
    */
    frameBuffer = null;

    /**
     * 颜色纹理
     * @type {Texture}
     */
    colorTex = null;
    /**
     * 深度纹理
     * @type {Texture}
     */
    depthTex = null;

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {number} textureWidth
     * @param {number} textureHeight
     * @param {boolean} useColorTexture 使用颜色缓冲
     * @param {boolean} useDepthTexture 使用深度缓冲
     */
    constructor(gl, textureWidth, textureHeight, useColorTexture = true, useDepthTexture = true)
    {
        this.gl = gl;
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;

        var frameBuffer = gl.createFramebuffer(); // 创建帧缓冲
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer); // 绑定帧缓冲
        this.frameBuffer = frameBuffer;

        if(useColorTexture)
        { // 颜色
            let colorTexture = gl.createTexture(); // 创建颜色纹理
            gl.bindTexture(gl.TEXTURE_2D, colorTexture); // 绑定颜色纹理
            gl.texImage2D(
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.RGBA, // 纹理颜色组件
                textureWidth, // 宽
                textureHeight, // 高
                0, // 边框宽度(遗留属性,必须为0)
                gl.RGBA, // 数据格式
                gl.UNSIGNED_BYTE, // 数据类型
                null // 图像源
            );

            /* 设置筛选器 不需要使用贴图 */
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.framebufferTexture2D( // 附加纹理为第一个颜色附件
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                colorTexture,
                0
            );

            this.colorTex = new Texture(gl, colorTexture);
        }

        if(useDepthTexture)
        { // 深度缓冲
            let depthTexture = gl.createTexture(); // 创建深度纹理
            gl.bindTexture(gl.TEXTURE_2D, depthTexture); // 绑定深度纹理
            gl.texImage2D(
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.DEPTH_COMPONENT32F, // 纹理颜色组件
                textureWidth, // 宽
                textureHeight, // 高
                0, // 边框宽度(遗留属性,必须为0)
                gl.DEPTH_COMPONENT, // 数据格式
                gl.FLOAT, // 数据类型
                null // 图像源
            );

            /* 设置筛选器 不需要使用贴图 */
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.framebufferTexture2D( // 将深度纹理附加到缓冲帧
                gl.FRAMEBUFFER,
                gl.DEPTH_ATTACHMENT,
                gl.TEXTURE_2D,
                depthTexture,
                0
            );

            this.depthTex = new Texture(gl, depthTexture);
        }
    }

    /**
     * 绑定到此帧缓冲区
     * 之后的渲染将在此帧缓冲区执行
     */
    bindFramebuffer()
    {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.viewport(0, 0, this.textureWidth, this.textureHeight);
    }
}

/*
    文件引用自nFrame
*/

/**
 * 正向遍历数组   
 * 在回调中返回不为false或void的值主动结束遍历   
 * 主动结束遍历 并返回true   
 * 未主动结束遍历完全部内容 返回false   
 * @template T
 * @param {ArrayLike<T>} o
 * @param {function(T, number):(boolean | void)} callback
 * @returns {boolean}
 */
function forEach(o, callback)
{
    if (!o)
        return false;
    for (var i = 0, Li = o.length; i < Li; i++)
        if (o[i] != undefined && callback(o[i], i))
            return true;
    return false;
}

/**
 * 物体唯一编号计数
 * @type {number}
 */
var snCount = 0;
/**
 * 场景中的物体
 *  物体可以有需要渲染的面
 *  或不绑定面作为中间节点
 *  物体可以绑定到 相机 灯光 粒子
 */
class SceneObject
{
    /**
     * 坐标x(相对)
     * @private
     * @type {number}
     */
    x = 0;
    /**
     * 坐标y(相对)
     * @private
     * @type {number}
     */
    y = 0;
    /**
     * 坐标z(相对)
     * @private
     * @type {number}
     */
    z = 0;
    /**
     * 四元数x(相对旋转)
     * @private
     * @type {number}
     */
    rx = 0;
    /**
     * 四元数y(相对旋转)
     * @private
     * @type {number}
     */
    ry = 0;
    /**
     * 四元数z(相对旋转)
     * @private
     * @type {number}
     */
    rz = 0;
    /**
     * 四元数w(相对旋转)
     * @private
     * @type {number}
     */
    rw = 1;
    /**
     * x轴缩放(相对)
     * @private
     * @type {number}
     */
    sx = 1;
    /**
     * y轴缩放(相对)
     * @private
     * @type {number}
     */
    sy = 1;
    /**
     * z轴缩放(相对)
     * @private
     * @type {number}
     */
    sz = 1;

    /**
     * 世界矩阵
     * @package
     * @type {m4}
     */
    wMat = new m4();

    /**
     * 局部矩阵
     * @private
     * @type {m4}
     */
    lMat = new m4();

    /**
     * 子节点
     * @package
     * @type {Array<SceneObject>}
     */
    c = null;

    /**
     * 父节点
     * @package
     * @type {SceneObject}
     */
    parent = null;

    /**
     * 物体所在的场景
     * @package
     * @type {import("./Scene").Scene}
     */
    scene = null;

    /**
     * 绘制此物体使用的着色器组(渲染程序)
     * 此属性暂时未使用
     * @package
     * @type {import("../shader/GlslProgram").GlslProgram}
     */
    program = null;

    /**
     * 物体id
     * @package
     * @type {string}
     */
    id = "";

    /**
     * 物体的唯一编号
     * 正常时为非负整数
     * 与worker中的对应
     * @package
     * @type {number}
     */
    sn = -1;

    /**
     * [gl]面数据
     * @package
     * @type {import("./ObjFaces").ObjFaces}
     */
    faces = null;

    /**
     * 包围球半径
     * 包围球中心为局部原点
     * @package
     * @type {number}
     */
    boundingSphereR = -1;

    /**
     * 矩阵需要更新
     * 防止反复计算没有移动的物体
     * @package
     * @type {boolean}
     */
    needUpdate = true;


    constructor()
    {
        this.sn = snCount++;
        this.updateCMat();
    }


    /**
     * 遍历设置物体所在的场景
     * 若此节点的场景不需要改变则不继续向下
     * @package
     * @param {import("./Scene").Scene} scene
     */
    setScene(scene)
    {
        if (this.scene == scene) // 无需向下
            return;
        if (this.scene)
        { // 清除原区域中的关联
            if (this.id)
                this.scene.idMap.delete(this.id);
        }
        this.scene = scene;
        if (scene)
        { // 在新区域中建立关联
            if (this.id)
                scene.idMap.set(this.id, this);
        }
        if (this.c) // 遍历子节点
            forEach(this.c, (o) => { o.setScene(scene); });
    }

    /**
     * 添加子节点
     * @param {SceneObject} o
     */
    addChild(o)
    {
        if (!this.c)
            this.c = [];
        o.setScene(this.scene);
        o.parent = this;
        o.needUpdate = true;
        this.c.push(o);
    }

    /**
     * 更新世界矩阵
     * 若此物体
     * @package
     */
    updateCMat()
    {
        if (this.needUpdate) // 需要更新
        {
            this.lMat = new m4().
                translation(this.x, this.y, this.z). // 平移
                rotateQuatRH(this.rx, this.ry, this.rz, this.rw). // 旋转
                scale(this.sx, this.sy, this.sz); // 缩放
            if (this.parent)
                this.wMat = this.parent.wMat.multiply(this.lMat);
            else // 根节点
                this.wMat = this.lMat;
        }
        if (this.c) // 递归子节点
            this.c.forEach(o =>
            {
                if (this.needUpdate) // 若此节点需要更新
                    o.needUpdate = true; // 子节点也需要更新
                o.updateCMat();
            });
        this.needUpdate = false; // 标记无需更新
    }

    /**
     * 获取世界坐标
     * 需要先更新矩阵
     * @returns {v4} xyz为坐标 w恒定为1
     */
    getWorldPos()
    {
        var wMat = this.wMat;
        return new v4(wMat.a[12], wMat.a[13], wMat.a[14]);
    }

    /**
     * 获取世界视图投影矩阵
     * 只包含旋转和缩放没有平移
     * @returns {m4}
     */
    getWorldViewProjectionMat()
    {
        var ret = this.wMat.copy();
        ret.a[12] = ret.a[13] = ret.a[14] = 0;
        return ret;
    }

    /**
     * 更新当前物体的面的包围球
     * 需要先更新矩阵
     * @package
     */
    updateBoundingSphere()
    {
        if (this.boundingSphereR < 0)
        {
            var pos = this.faces.pos;
            var wvpMat = this.getWorldViewProjectionMat();
            var maxR = 0;
            for (var i = 0; i < pos.length; i += 3)
                maxR = Math.max(maxR, (new v4(pos[i], pos[i + 1], pos[i + 2])).mulM4(wvpMat).getV3Len());
            this.boundingSphereR = maxR;
        }
    }

    /**
     * 设置坐标
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.needUpdate = true;
    }

    /**
     * 设置缩放
     * @param {number} sx
     * @param {number} sy
     * @param {number} sz
     */
    setScale(sx, sy, sz)
    {
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
        this.needUpdate = true;
    }

    /**
     * 设置旋转(四元数)
     * @param {number} rx
     * @param {number} ry
     * @param {number} rz
     * @param {number} rw
     */
    setRotation(rx, ry, rz, rw)
    {
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.rw = rw;
        this.needUpdate = true;
    }
}

/**
 * 渲染池
 * 管理渲染列表
 * (此类基于webgl渲染)
 */
class RenderPool
{
    /**
     * @type {Array<SceneObject | Array<SceneObject>>}
     */
    rList = [];
}

/**
 * 视锥剔除判断
 * @param {import("../scene/SceneObject").SceneObject} obje 物体
 * @param {v4} bsPos 物体的包围球中心相对相机坐标(不含投影)
 * @param {number} fov 相机的角视场
 * @returns {boolean} 返回true则剔除
 */
function coneCull(obje, bsPos, fov)
{
    obje.updateBoundingSphere(); // 更新包围球半径
    /*
        ndzda推导的球与圆锥不相交的保守剔除原始判断公式
        圆锥沿着z轴向负方向扩展
        if (arccos(-z / len(x, y, z)) - Fov / 2 < Math.PI / 2)
            (sin(arccos(-z / len(x, y, z)) - Fov / 2) * len(x, y, z) >= r) or (z >= r)
        else
            len(x, y, z) >= r;
    */
    if (bsPos.z >= obje.boundingSphereR)
        return true;
    var bsLen = bsPos.getV3Len(); // 球心和原点距离
    var angle = Math.acos(-bsPos.z / bsLen) - fov * 0.5; // 原点到球心与圆锥在对应方向母线的夹角
    if (angle < Math.PI / 2)
        return (Math.sin(angle) * bsLen >= obje.boundingSphereR);
    else
        return bsLen >= obje.boundingSphereR;
}

/**
 * 遮挡剔除判断
 * 在执行遮挡剔除判断前应该按照近到远排序
 * 注意: 此遮挡判断方案在大多数场景中并不能起到优化作用
 * 注意: 执行此函数会关闭颜色和深度写入
 * @param {import("../scene/SceneObject").SceneObject} obje
 * @param {WebGL2RenderingContext} gl
 * @param {m4} cMat
 */
function occlusionCull(obje, gl, cMat)
{
    var boundingBoxProgram = obje.scene.ct.program.white;
    var faces = obje.faces;

    gl.colorMask(false, false, false, false); // 关闭颜色写入
    gl.depthMask(false); // 关闭深度缓冲写入

    boundingBoxProgram.use(); // 使用绘制包围体的着色器
    gl.bindVertexArray(faces.vao); // 绑定对象顶点数组(或包围体顶点数组)
    boundingBoxProgram.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
    boundingBoxProgram.uniformMatrix4fv("u_cameraMatrix", cMat.a); // 设置相机矩阵

    if (faces.queryInProgress && gl.getQueryParameter(faces.query, gl.QUERY_RESULT_AVAILABLE)) // 查询已进行 且 结果可用
    {
        faces.occluded = !gl.getQueryParameter(faces.query, gl.QUERY_RESULT); // 获取遮挡结果
        faces.queryInProgress = false; // 设置为查询未进行
    }
    if (!faces.queryInProgress) // 查询未进行
    {
        if (!faces.query) // 没有webgl查询对象则创建
            faces.query = gl.createQuery();
        gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, faces.query); // 启动异步查询 保守查询遮挡
        gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制顶点 此处绘制的内容将被查询
        gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE); // 结束查询
        faces.queryInProgress = true; // 设置为查询进行中
    }

    return faces.occluded;
}

/**
 * 渲染器封装(Renderer)
 * (此类基于webgl渲染)
 */
class Render
{
    /**
     * 渲染池
     * @type {RenderPool}
     */
    pool = new RenderPool();

    /**
     * 绑定的webgl上下文
     * @private
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 当前渲染器使用的着色器
     * @type {GlslProgram}
     */
    program = null;

    /**
     * 相机投影矩阵
     *  + 含变换坐标到相对相机坐标
     *  + 含投影矩阵
     * @type {m4}
     */
    cMat = new m4();

    /**
     * 绑定的场景
     * @private
     * @type {import("../scene/Scene").Scene}
     */
    scene = null;

    /**
     * 判断函数
     * 渲染时对于每个遍历到的物体调用进行判断
     * 要求返回一个标志位整数表示判断结果
     *  + &1 不渲染此物体的面
     *  + &2 不遍历此物体的子节点
     * @type {function(SceneObject) : number}
     */
    judge = null;

    /**
     * 开启遮挡剔除
     * @type {boolean}
     */
    occlusion = false;


    /**
     * @param {import("../scene/Scene").Scene} scene
     * @param {GlslProgram} program
     */
    constructor(scene, program)
    {
        this.scene = scene;
        this.gl = scene.gl;
        this.program = program;
    }

    /**
     * 执行渲染
     * @param {function(GlslProgram): void} cb 切换着色器后调用此回调
     */
    render(cb)
    {
        this.scene.obje.updateCMat(); // 更新场景中物体的矩阵
        this.rtRList(this.scene.obje, this.judge); // 得到渲染列表
        this.draw(cb); // 绘制图像
    }

    /**
     * 递归遍历 获取渲染列表
     * @param {SceneObject} sObj
     * @param {function(SceneObject): number} [judge]
     */
    rtRList(sObj, judge)
    {
        var rList = this.pool.rList;
        rList.length = 0; // 清空渲染列表

        /** @type {Map<symbol, Array<SceneObject>>} */
        var instanceMap = new Map();
        const rt = (/** @type {SceneObject} */ obje) => // 递归遍历
        {
            /**
             * 标志位
             * 用于阻止一些操作
             */
            var flag = (judge ? judge(obje) : 0);

            var faces = obje.faces; // 面数据
            if ((!(flag & 1)) && faces) // 如果有 面数据
            {
                if (faces.instance)
                {
                    var instanceArr = instanceMap.get(faces.instance);
                    if (!instanceArr)
                        instanceMap.set(faces.instance, instanceArr = []);
                    instanceArr.push(obje);
                }
                else
                    rList.push(obje);
            }

            if ((!(flag & 2)) && obje.c) // 递归子节点
                obje.c.forEach(o => rt(o));
        };
        rt(sObj);

        instanceMap.forEach(o =>
        {
            if (o.length == 1)
                rList.push(o[0]);
            else if (o.length > 1)
                rList.push(o);
        });
    }

    /**
     * 绘图
     * 将渲染列表中的物体绘制出来
     * 不遍历子节点
     * @private
     * @param {function(GlslProgram): void} cb 切换着色器后调用此回调
     */
    draw(cb)
    {
        var gl = this.gl;

        gl.colorMask(true, true, true, true); // 允许写入颜色
        gl.depthMask(true); // 允许写入深度
        gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // 清除画布颜色和深度缓冲区

        this.program.use(); // 切换着色器组(渲染程序)
        this.program.uniformMatrix4fv("u_cameraMatrix", this.cMat.a); // 设置相机矩阵
        cb(this.program);

        this.pool.rList.forEach(obje => // 遍历渲染列表
        {
            if (obje instanceof SceneObject) // 单个物体
            {
                if (this.occlusion && occlusionCull(obje, gl, this.cMat)) // 遮挡剔除
                    return;
                this.program.use(); // 切换着色器组(渲染程序)
                gl.colorMask(true, true, true, true); // 允许写入颜色
                gl.depthMask(true); // 允许写入深度

                var faces = obje.faces; // 面数据

                this.program.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
                if (faces.tex) // 如果有纹理
                    faces.tex.bindTexture(0); // 绑定纹理
                gl.bindVertexArray(faces.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)
                gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制数据
            }
            else // 实例化绘图
            {
                let program = this.scene.ct.program.cameraInstance;
                program.use(); // 切换着色器组(渲染程序)
                program.uniformMatrix4fv("u_cameraMatrix", this.cMat.a); // 设置相机矩阵
                gl.colorMask(true, true, true, true); // 允许写入颜色
                gl.depthMask(true); // 允许写入深度

                var faces = obje[0].faces; // 面数据

                if (faces.tex) // 如果有纹理
                    faces.tex.bindTexture(0); // 绑定纹理

                {
                    // 这里绑定了vao会导致此vao发生污染(因为多了u_worldMatrix的vbo)
                    gl.bindVertexArray(faces.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)

                    const matrixData = new Float32Array(obje.length * 16); // 每个物体一个矩阵 一个矩阵16个浮点数

                    obje.forEach((o, i) => matrixData.set(o.wMat.a, i * 16)); // 设置矩阵数据

                    const matrixLoc = gl.getAttribLocation(program.progra, "u_worldMatrix");
                    const matrixBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);

                    gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);

                    const bytesPerMatrix = 4 * 16;
                    for (let i = 0; i < 4; i++)
                    {
                        const loc = matrixLoc + i;
                        gl.enableVertexAttribArray(loc);

                        const offset = i * 16;
                        gl.vertexAttribPointer(
                            loc,
                            4,
                            gl.FLOAT,
                            false,
                            bytesPerMatrix,
                            offset,
                        );

                        gl.vertexAttribDivisor(loc, 1);
                    }

                    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);
                }

                gl.drawArraysInstanced(faces.mode, 0, faces.posLen, obje.length); // 绘制数据(实例化绘制多个物体)
            }
        });
    }
}

/**
 * 角度转弧度因数
 * @type {number}
 */
const degToRad = Math.PI / 180;

/**
 * 相机类
 * 需要绑定到 场景类 和 webgl上下文
 */
class Camera
{
    /**
     * 相机坐标x
     * @type {number}
     */
    x = 0;
    /**
     * 相机坐标y
     * @type {number}
     */
    y = 0;
    /**
     * 相机坐标z
     * @type {number}
     */
    z = 0;
    /**
     * 相机x轴旋转
     * @type {number}
     */
    rx = 0;
    /**
     * 相机y轴旋转
     * @type {number}
     */
    ry = 0;
    /**
     * 相机z轴旋转
     * @type {number}
     */
    rz = 0;
    /**
     * 相机视角场
     * 单位为弧度
     * 对角线fov
     * @type {number}
     */
    fov = degToRad * 130;
    /**
     * 视锥最近面距离
     * @type {number}
     */
    near = 0.1;
    /**
     * 视锥最远面距离
     * @type {number}
     */
    far = 450;



    /**
     * 不含投影的相机矩阵
     * 仅变换坐标到相对相机坐标 不含投影矩阵
     * @private
     * @type {m4}
     */
    npMat = new m4();

    /**
     * 相机投影矩阵
     *  + 含变换坐标到相对相机坐标
     *  + 含投影矩阵
     * @private
     * @type {m4}
     */
    cMat = new m4();

    /**
     * 判断函数
     * 渲染时对于每个遍历到的物体调用进行判断
     * 要求返回一个标志位整数表示判断结果
     *  + &1 不渲染此物体的面
     *  + &2 不遍历此物体的子节点
     * @type {function(import("../scene/SceneObject").SceneObject) : number}
     */
    judge = null;

    /**
     * 灯光列表
     * @type {Array<Light>}
     */
    lights = [];


    /**
     * @param {import("../scene/Scene").Scene} scene
     */
    constructor(scene)
    {
        this.scene = scene;
        this.gl = scene.gl;


        this.render = new Render(scene, scene.ct.program.camera);
        this.render.judge = (obje =>
        {
            return (obje.faces && coneCull(obje, obje.getWorldPos().mulM4(this.npMat), this.fov) ? 1 : 0); // 视锥剔除
        });
    }

    /**
     * 绘制场景
     * 先进行一些设置 然后调用递归渲染
     */
    draw()
    {
        this.npMat = new m4(). // 新矩阵
            rotateXYZ(-this.rx, -this.ry, -this.rz). // 反向旋转
            translation(-this.x, -this.y, -this.z); // 反向平移
        this.cMat = m4.perspective(this.fov, this.gl.canvas.clientHeight / this.gl.canvas.clientWidth, this.near, this.far). // 透视投影矩阵
            rotateXYZ(-this.rx, -this.ry, -this.rz). // 反向旋转
            translation(-this.x, -this.y, -this.z); // 反向平移
        this.render.cMat = this.cMat; // 设置渲染器的相机矩阵

        this.render.render(program => // 渲染
        { // 设置着色器uniform
            program.uniform3f("u_viewPos", this.x, this.y, this.z); // 视点坐标(相机坐标)
            this.gl.uniform1i(this.gl.getUniformLocation(program.progra, "u_texture"), 0);  // 纹理单元 0
            this.gl.uniform1i(this.gl.getUniformLocation(program.progra, "u_texS"), 1);  // 纹理单元 1
            if (this.lights[0])
            {
                this.lights[0].shadowTex.depthTex.bindTexture(1); // 绑定阴影贴图
                program.uniformMatrix4fv("u_lightMat", this.lights[0].cMat.a); // 设置灯光投影
            }
        });
    }
}

/**
 * 场景类
 * 需要绑定到 本引擎上下文(包括webgl上下文)
 * 记录场景中的 物体 灯光 粒子
 */
class Scene
{
    /**
     * 物体树
     * 此对象为根节点
     * @type {SceneObject}
     */
    obje = null;
    /**
     * 场景中物体id与物品对象的对应map
     * @package
     * @type {Map<string, SceneObject>}
     */
    idMap = new Map();
    /**
     * 绑定的webgl上下文
     * @package
     * @type {WebGL2RenderingContext}
     */
    gl = null;
    /**
     * 绑定的引擎上下文
     * @package
     * @type {import("../SEContext").SEContext}
     */
    ct = null;

    /**
     * @param {import("../SEContext").SEContext} ct
     */
    constructor(ct)
    {
        this.ct = ct;
        this.gl = ct.gl;
        
        this.obje = new SceneObject();
        this.obje.scene = this;
    }

    /**
     * 添加物体
     * @param {SceneObject} o
     */
    addChild(o)
    {
        this.obje.addChild(o);
    }

    createCamera()
    {
        return new Camera(this);
    }
}

/**
 * Structure Engine的上下文
 * 封装webgl2上下文
 * 此类将储存各种状态
 * 通过调用此上下文的方法以更方便的进行操作
 */
class SEContext
{
    /**
     * 绑定的webgl上下文
     * @package
     * @type {WebGL2RenderingContext}
     */
    gl;

    /**
     * canvas对象
     * @package
     * @type {HTMLCanvasElement}
     */
    canvas;

    /**
     * 通用着色器
     */
    program = {
        /**
         * 绘制纯白色
         * @type {import("./shader/GlslProgram").GlslProgram}
         */
        white: null,
        /**
         * 相机(绘制纹理色和光照)
         * @type {import("./shader/GlslProgram").GlslProgram}
         */
        camera: null,
        /**
         * 相机实例化(绘制纹理色和光照)
         * @type {import("./shader/GlslProgram").GlslProgram}
         */
        cameraInstance: null
    };

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {HTMLCanvasElement} canvas
     */
    constructor(gl, canvas)
    {
        this.gl = gl;
        this.canvas = canvas;

        initShader(gl, this.program);
    }

    /**
     * 创建场景
     * @returns {Scene}
     */
    createScene()
    {
        return new Scene(this);
    }

    /**
     * 清除帧缓冲绑定
     * 渲染到可视画布(canvas)
     * 也可用于初始化视口
     * @package
     */
    clearFramebuffer()
    {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 创建渲染到纹理
     * @package
     * @param {number} textureWidth
     * @param {number} textureHeight
     * @returns {Render2Texture}
     */
    createRender2Texture(textureWidth, textureHeight)
    {
        return new Render2Texture(this.gl, textureWidth, textureHeight);
    }
}

/**
 * 初始化画板(canvas)
 * 返回Structure Engine上下文
 * @param {HTMLCanvasElement} canvas
 * @param {number} scale
 * @returns {SEContext}
 */
function initContext(canvas, scale = 1)
{
    var gl = canvas.getContext("webgl2");
    canvas.width = Math.floor(canvas.clientWidth * window.devicePixelRatio * scale);
    canvas.height = Math.floor(canvas.clientHeight * window.devicePixelRatio * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // gl.enable(gl.CULL_FACE); // (三角形方向)面剔除
    gl.enable(gl.DEPTH_TEST); // 深度测试(z-buffer)
    gl.clearColor(0.2, 0.2, 0.2, 1);
    return new SEContext(gl, canvas);
}

/**
 * [gl]物体的面数据
 */
class ObjFaces
{
    /**
     * 顶点相对坐标向量
     * 每个顶点3个(1个向量)
     * 每个面9个(每个面3个顶点)
     * @type {Float32Array}
     */
    pos = null;
    /**
     * 法线方向向量(每个顶点3个(1个向量), 每个面9个(每个面3个顶点))
     * @type {Float32Array}
     */
    normal = null;
    /**
     * 顶点相对坐标数组中点的个数(每3个元素(每个向量)1个顶点)
     * @type {number}
     */
    posLen = 0;
    /**
     * 纹理
     * @type {import("../texture/Texture").Texture}
     */
    tex = null;
    /**
     * 纹理坐标向量(每个顶点2个(1个向量), 每个面6个(每个面3个纹理坐标))
     * @type {Float32Array}
     */
    texPos = null;
    /**
     * 此物体的vao对象
     * @type {WebGLVertexArrayObject}
     */
    vao = null;
    /**
     * 此物体的渲染模式 例如 gl.TRIANGLES
     * 暂时仅支持gl.TRIANGLES
     * @type {number}
     */
    mode = 0;
    /**
     * 遮挡剔除查询
     * @type {WebGLQuery}
     */
    query = null;
    /**
     * 遮挡剔除查询正在进行
     * @type {boolean}
     */
    queryInProgress = false;
    /**
     * 此物体被遮挡
     * @type {boolean}
     */
    occluded = false;
    /**
     * 实例标志
     * 相同代表可以实例化
     * @type {symbol}
     */
    instance = null;

    /**
     * @param {Float32Array | Array<number>} pos
     * @param {import("../texture/Texture").Texture} tex
     * @param {Float32Array | Array<number>} texPos
     * @param {Float32Array | Array<number>} normal
     * @param {number} [mode]
     */
    constructor(pos, tex, texPos, normal, mode = WebGL2RenderingContext.TRIANGLES)
    {
        if (pos instanceof Float32Array)
            this.pos = pos;
        else
            this.pos = new Float32Array(pos);
        if (mode == WebGL2RenderingContext.TRIANGLES) // 三角形
            this.posLen = Math.floor(pos.length / 3);
        else
            throw "drawMode error";
        this.tex = tex;
        if (texPos instanceof Float32Array)
            this.texPos = texPos;
        else
            this.texPos = new Float32Array(texPos);
        if (normal instanceof Float32Array)
            this.normal = normal;
        else
            this.normal = new Float32Array(normal);
        this.mode = mode;
    }

    /**
     * 更新vao的值
     * AttribLocation(变量位置)按照项目结构中的描述
     * @param {WebGL2RenderingContext} gl
     */
    update(gl)
    {
        let vao = gl.createVertexArray(); // 创建顶点数组
        this.vao = vao;
        gl.bindVertexArray(vao); // 绑定顶点数组(切换当前正在操作的顶点数组)


        // 初始化顶点数组
        // let positionAttributeLocation = gl.getAttribLocation(program.progra, "a_position"); // [着色器变量] 顶点坐标
        let positionAttributeLocation = 0; // [着色器变量] 顶点坐标

        let positionBuffer = gl.createBuffer(); // 创建缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
        gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.STATIC_DRAW); // 送入数据

        gl.enableVertexAttribArray(positionAttributeLocation); // 启用顶点属性数组(顶点坐标数组)

        gl.vertexAttribPointer( // 顶点属性指针
            positionAttributeLocation, // 到顶点坐标
            3, // 每个坐标为3个元素
            gl.FLOAT, // 浮点数(似乎应该是32位)
            false, // 归一化(规范化,正常化)
            0, // 坐标间间隔(无间隔)
            0 // 缓冲区偏移(从开头开始)
        );


        if (this.tex) // 有纹理
        {
            // 初始化纹理坐标
            //let texcoordAttributeLocation = gl.getAttribLocation(program.progra, "a_texcoord"); // [着色器变量] 纹理坐标
            let texcoordAttributeLocation = 1; // [着色器变量] 纹理坐标

            let texcoordBuffer = gl.createBuffer(); // 创建缓冲区
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
            gl.bufferData(gl.ARRAY_BUFFER, this.texPos, gl.STATIC_DRAW); // 送入数据

            gl.enableVertexAttribArray(texcoordAttributeLocation); // 启用顶点属性数组(纹理坐标数组)

            gl.vertexAttribPointer( // 顶点属性指针
                texcoordAttributeLocation, // 到纹理坐标
                2, // 每个坐标为2个元素
                gl.FLOAT, // 浮点数(似乎应该是32位)
                false, // 归一化(规范化,正常化)
                0, // 坐标间间隔(无间隔)
                0 // 缓冲区偏移(从开头开始)
            );
        }

        // 初始化法线向量
        // let normalAttributeLocation = gl.getAttribLocation(program.progra, "a_normal"); // [着色器变量] 法线向量
        let normalAttributeLocation = 2; // [着色器变量] 法线向量

        let normalBuffer = gl.createBuffer(); // 创建缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
        gl.bufferData(gl.ARRAY_BUFFER, this.normal, gl.STATIC_DRAW); // 送入数据

        gl.enableVertexAttribArray(normalAttributeLocation); // 启用顶点属性数组(法线向量数组)

        gl.vertexAttribPointer( // 顶点属性指针
            normalAttributeLocation, // 到法线向量
            3, // 每个坐标为3个元素
            gl.FLOAT, // 浮点数(似乎应该是32位)
            false, // 归一化(规范化,正常化)
            0, // 坐标间间隔(无间隔)
            0 // 缓冲区偏移(从开头开始)
        );
    }
}

var cubeVer = new Float32Array([
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,

    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,

    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,

    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,

    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,

    0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5
]);
var cubeNormal = new Float32Array([
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0
]);
var cubeTexOff = new Float32Array([
    1 / 3, 0,
    0, 0,
    0, 1 / 2,
    1 / 3, 0,
    0, 1 / 2,
    1 / 3, 1 / 2,

    1 / 3, 1 / 2,
    0, 1 / 2,
    1 / 3, 1,
    0, 1 / 2,
    0, 1,
    1 / 3, 1,

    2 / 3, 1 / 2,
    2 / 3, 0,
    1 / 3, 0,
    2 / 3, 1 / 2,
    1 / 3, 0,
    1 / 3, 1 / 2,

    1 / 3, 1 / 2,
    1 / 3, 1,
    2 / 3, 1 / 2,
    1 / 3, 1,
    2 / 3, 1,
    2 / 3, 1 / 2,

    1, 1 / 2,
    1, 0,
    2 / 3, 0,
    1, 1 / 2,
    2 / 3, 0,
    2 / 3, 1 / 2,

    2 / 3, 1 / 2,
    2 / 3, 1,
    1, 1 / 2,
    2 / 3, 1,
    1, 1,
    1, 1 / 2
]);

/**
 * 相同纹理对应相同实例
 * @type {Map<import("../texture/Texture").Texture, symbol>}
 */
var instanceMap = new Map();
/**
 * @returns {SceneObject}
 * @param {WebGL2RenderingContext} gl
 * @param {import("../texture/Texture").Texture} tex
 */
function create_cube(gl, tex)
{
    var obje = new SceneObject();
    var faces = obje.faces = new ObjFaces(cubeVer, tex, cubeTexOff, cubeNormal, gl.TRIANGLES);

    faces.update(gl);
    if(instanceMap.has(tex))
        faces.instance = instanceMap.get(tex);
    else
        instanceMap.set(tex, faces.instance = Symbol());

    return obje;
}

/**
 * 3向量类
 */
class v3
{
    /**
     * 向量中的第个1值
     * @type {number}
     */
    x;
    /**
     * 向量中的第个2值
     * @type {number}
     */
    y;
    /**
     * 向量中的第个3值
     * @type {number}
     */
    z;

    /**
     * @param {number} [x]
     * @param {number} [y]
     * @param {number} [z]
     */
    constructor(x = 0, y = 0, z = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * 归一化(使向量长度为1 不改变方向)
     * 不改变原向量
     * @returns {v3}
     */
    normalize()
    {
        var multiple = 1 / Math.hypot(this.x, this.y, this.z);
        if (multiple != Infinity)
            return new v3(
                this.x * multiple,
                this.y * multiple,
                this.z * multiple
            );
        else
            return new v3();
    }

    /**
     * 向量点乘
     * 不改变原向量
     * @param {v3} v
     * @returns {number}
     */
    dot(v)
    {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * 向量相加
     * 不改变原向量
     * @param {v3} v
     * @returns {v3}
     */
    add(v)
    {
        return new v3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * 向量相加
     * 不改变原向量
     * @param {v3} v
     * @returns {v3}
     */
    sub(v)
    {
        return new v3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * 向量叉乘
     * 不改变原向量
     * @param {v3} v
     * @returns {v3}
     */
    cross(v)
    {
        return new v3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    /**
     * 向量乘标量
     * @param {number} a
     * @returns {v3}
     */
    mulNum(a)
    {
        return new v3(this.x * a, this.y * a, this.z * a);
    }

    /**
     * 取三维向量的模(长度)
     * 只使用xyz
     * @returns {number}
     */
    len()
    {
        return Math.hypot(this.x, this.y, this.z);
    }

    /**
     * 取三维向量的模(长度)的平方
     * 只使用xyz
     * @returns {number}
     */
    lenSq()
    {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * 取两个向量的夹角
     * 单位为弧度
     * @param {v3} v
     * @returns {number}
     */
    angleTo(v)
    {
        var productOfLen = Math.sqrt(this.lenSq() + v.lenSq());
        if (productOfLen != 0)
            return Math.acos(this.dot(v) / productOfLen);
        else
            return Math.PI * 0.5;
    }
}
/**
 * 通过数组构造一个v3类
 * @param {Array<number>} a
 */
function V3(a)
{
    return new v3(a[0], a[1], a[2]);
}

/**
 * 纹理表
 * 管理纹理 避免重复载入
 */
class TextureTable
{
    /**
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * url对应的纹理
     * @type {Map<string, Texture>}
     */
    texMap = new Map();

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl)
    {
        this.gl = gl;
    }

    /**
     * 通过图像的url获得纹理
     * @param {string} url
     * @returns {Texture}
     */
    fromUrl(url)
    {
        var ret = this.texMap.get(url);
        if (!ret)
        {
            ret = Texture.fromImageUrl(this.gl, url);
            this.texMap.set(url, ret);
        }
        return ret;
    }
}

/**
 * MtlC类中的单个材质的封装
 */
class MtlCMaterial
{
    /**
     * 镜面反射度
     * @type {number}
     */
    shininess;

    /**
     * 环境色
     * @type {Array<number>}
     */
    ambient;

    /**
     * 漫反射色
     * @type {Array<number>}
     */
    diffuse;

    /**
     * 高光色
     * @type {Array<number>}
     */
    specular;

    /**
     * 发光色
     * @type {Array<number>}
     */
    emissive;

    /**
     * 光密度
     * @type {number}
     */
    opticalDensity;

    /**
     * 透明度(不透明度)
     * @type {number}
     */
    opacity;

    /**
     * 照明类型
     * @type {number}
     */
    illum;

    /**
     * 漫反射颜色贴图
     * @type {string}
     */
    diffuseMap;

    /**
     * 镜面反射度标量贴图
     * @type {string}
     */
    specularMap;

    /**
     * 法线贴图
     * @type {string}
     */
    normalMap;

}

/**
 * 对mtl文件的封装
 */
class MtlC
{
    /**
     * 材质map
     * @type {Map<string, MtlCMaterial>}
     */
    materialMap = new Map();

    /**
     * 从mtl字符串解析
     * @param {string} srcStr
     * @param {string} [folderPath]
     * @returns {MtlC}
     */
    static fromString(srcStr, folderPath = "")
    {
        var ret = new MtlC();
        var arr = srcStr.split("\n");

        /**
         * 解析贴图指令的参数
         * @todo 处理可选项参数
         * @param {Array<string>} args
         * @returns {string}
         */
        function parseMapArgs(args)
        {
            return args.join(" ");
        }

        /**
         * 当前材质
         * @type {MtlCMaterial}
         */
        var material = null;
        for (var oInd = 0; oInd < arr.length; oInd++)
        {
            var oStr = arr[oInd].trim();
            if (oStr == "" || oStr[0] == "#")
                continue;
            var parts = oStr.split(/\s+/);
            var type = parts.shift();

            switch (type)
            {
                case "newmtl": // 定义新材质
                    material = new MtlCMaterial();
                    ret.materialMap.set(parts[0], material);
                    break;
                case "Ns": // 镜面反射度
                    material.shininess = parseFloat(parts[0]);
                    break;
                case "Ka": // 环境色
                    material.ambient = parts.map(parseFloat);
                    break;
                case "Kd": // 漫反射色
                    material.diffuse = parts.map(parseFloat);
                    break;
                case "Ks": // 高光色
                    material.specular = parts.map(parseFloat);
                    break;
                case "Ke": // 发光色
                    material.emissive = parts.map(parseFloat);
                    break;
                case "Ni": // 光密度
                    material.opticalDensity = parseFloat(parts[0]);
                    break;
                case "d": // 透明度(不透明度)
                    material.opacity = parseFloat(parts[0]);
                    break;
                case "illum": // 照明类型
                    material.illum = parseInt(parts[0]);
                    break;
                case "map_Kd": // 漫反射颜色贴图
                    material.diffuseMap = folderPath + parseMapArgs(parts);
                    break;
                case "map_Ns": // 镜面反射度标量贴图
                    material.specularMap = folderPath + parseMapArgs(parts);
                    break;
                case "map_Bump": // 凹凸贴图(法线贴图)
                    material.normalMap = folderPath + parseMapArgs(parts);
                    break;
                default:
                    console.warn("unhandled type in mtl:", type);
            }
        }
        return ret;
    }
}

/**
 * ObjC类中(相同材质的)一些面封装
 */
class ObjCFaces
{
    /**
     * 顶点坐标
     * 每个顶点3个(1个向量)
     * 每个面9个(每个面3个顶点)
     * @type {Array<number>}
     */
    pos = [];

    /**
     * 纹理坐标
     * @type {Array<number>}
     */
    texPos = [];

    /**
     * 法线方向
     * @type {Array<number>}
     */
    norm = [];

    /**
     * 漫反射颜色贴图
     * @type {string}
     */
    tex = "";
}

/**
 * 多顶点的物体模型封装
 * (对wavefrontObj的封装)
 */
class ObjC
{
    /**
     * 顶点坐标数组
     * @type {Array<Array<number>>}
     */
    positions = [];

    /**
     * 纹理坐标数组
     * @type {Array<Array<number>>}
     */
    texcoords = [];

    /**
     * 法线方向数组
     * @type {Array<Array<number>>}
     */
    normals = [];

    /**
     * 面
     * @type {Array<ObjCFaces>}
     */
    faces = [];

    /**
     * 关联的mtl
     * @type {MtlC}
     */
    mtl = null;


    constructor()
    {
        // 由于WavefrontObj中索引从1开始所以将第0个位置占用
        this.positions.push([0, 0, 0]);
        this.normals.push([0, 0, 0]);
        this.texcoords.push([0, 0]);
    }

    /**
     * 以此模型创建物体
     * @returns {SceneObject}
     * @param {WebGL2RenderingContext} gl
     */
    createSceneObject(gl)
    {
        var ret = new SceneObject();
        var texTab = new TextureTable(gl); // 防止生成获取相同url的纹理
        forEach(this.faces, o =>
        {
            var obj = new SceneObject();
            obj.faces = new ObjFaces(o.pos, texTab.fromUrl(o.tex), o.texPos, o.norm);
            obj.faces.update(gl);
            ret.addChild(obj);
        });
        return ret;
    }

    /**
     * 从WavefrontObj字符串解析
     * @param {string} srcStr
     * @param {string} [folderPath]
     * @returns {Promise<ObjC>}
     */
    static async fromWavefrontObj(srcStr, folderPath = "")
    {
        var ret = new ObjC();
        var arr = srcStr.split("\n");

        var faces = new ObjCFaces();

        /** @type {Map<number | string, v3>} */
        var defaultNormalMap = new Map();
        /** @type {Array<[number, number | string]>} */
        var defaultNormalList = [];
        /**
         * 添加面
         * @param {[string, string, string]} vert 三个顶点索引 每个顶点索引为一个包含多索引的字符串
         */
        function addFace(vert)
        {
            var positionsInd = [-1, -1, -1];
            /** @type {Array<v3>} */
            var positions = [null, null, null];
            var texcoords = [null, null, null];
            var normals = [null, null, null];
            for (var i = 0; i < 3; i++)
            {
                var parts = vert[i].split("/");
                if (parts[0]) // 顶点索引
                {
                    var objInd = parseInt(parts[0]);
                    positions[i] = V3(ret.positions[
                        positionsInd[i] = (objInd + (objInd >= 0 ? 0 : ret.positions.length))
                    ]);
                }
                else
                    positions[i] = new v3();
                if (parts[1]) // 纹理索引
                {
                    var objInd = parseInt(parts[1]);
                    texcoords[i] = ret.texcoords[objInd + (objInd >= 0 ? 0 : ret.texcoords.length)];
                }
                if (parts[2]) // 法线索引
                {
                    var objInd = parseInt(parts[2]);
                    normals[i] = ret.normals[objInd + (objInd >= 0 ? 0 : ret.normals.length)];
                }
            }
            var vec1 = positions[1].sub(positions[0]); // 三角形的一条边向量
            var vec2 = positions[2].sub(positions[1]); // 三角形的另一条边向量
            var defaultNormal = vec1.cross(vec2).normalize().mulNum(Math.PI - vec1.angleTo(vec2)); // 默认法线向量乘夹角作为倍率
            for (var i = 0; i < 3; i++)
            {
                if (positions[i])
                    faces.pos.push(positions[i].x, positions[i].y, positions[i].z);
                else
                    faces.pos.push(0, 0, 0);
                if (texcoords[i])
                    faces.texPos.push(...texcoords[i]);
                else
                    faces.texPos.push(0, 0);
                if (normals[i])
                    faces.norm.push(...normals[i]);
                else
                { // 缺省法线
                    var key = positionsInd[i];
                    defaultNormalMap.set(key,
                        defaultNormal.add(
                            defaultNormalMap.has(key) ? defaultNormalMap.get(key) : new v3()
                        )
                    );
                    defaultNormalList.push([faces.norm.length, key]);
                    faces.norm.push(0, 0, 0);
                }
            }
        }
        /**
         * 设置缺省的法线
         */
        function setDefaultNormal()
        {
            forEach(defaultNormalList, o =>
            {
                var ind = o[0];
                var defaultNormal = defaultNormalMap.get(o[1]).normalize(); // 默认法线向量
                faces.norm[ind] = defaultNormal.x;
                faces.norm[ind + 1] = defaultNormal.y;
                faces.norm[ind + 2] = defaultNormal.z;
            });
            defaultNormalList.length = 0;
            defaultNormalMap.clear();
        }

        for (var oInd = 0; oInd < arr.length; oInd++)
        { // 解析单行指令
            var oStr = arr[oInd].trim();
            if (oStr == "" || oStr[0] == "#")
                continue;
            var parts = oStr.split(/\s+/);
            var type = parts.shift();

            switch (type)
            {
                case "v": // 顶点坐标
                    ret.positions.push(parts.slice(0, 3).map(parseFloat));
                    if (parts.length > 3) // 非标准情况 顶点声明中附带顶点颜色
                        console.warn("type v with color");
                    break;
                case "vt": // 纹理坐标
                    ret.texcoords.push(parts.map(parseFloat));
                    break;
                case "vn": // 法线坐标
                    ret.normals.push(parts.map(parseFloat));
                    break;
                case "f": // 面
                    var trianNum = parts.length - 2;
                    for (var i = 0; i < trianNum; i++)
                    {
                        addFace([parts[0], parts[i + 1], parts[i + 2]]);
                    }
                    break;
                case "mtllib": // 关联mtl文件
                    ret.mtl = MtlC.fromString(await (await fetch(folderPath + parts[0])).text(), folderPath);
                    break;
                case "usemtl": // 使用材质(在mtl中定义)
                    // 处理之前的面
                    setDefaultNormal();
                    if (faces.pos.length > 0)
                        ret.faces.push(faces);
                    // 新的面
                    faces = new ObjCFaces();
                    var material = ret.mtl.materialMap.get(parts[0]);
                    faces.tex = material.diffuseMap;
                    break;
                default:
                    console.warn("unhandled type in obj:", type);
            }
        }

        setDefaultNormal();
        ret.faces.push(faces);

        return ret;
    }
}

/**
 * 键盘对应表
 */
var table = {
    "~": "`",
    "!": "1",
    "@": "2",
    "#": "3",
    "$": "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
    "_": "-",
    "+": "=",
    "{": "[",
    "}": "]",
    "|": "\\",
    "\"": "\'",
    ":": ";",
    "<": ",",
    ">": ".",
    "?": "/"
};
var capitalA = "A".charCodeAt(0);
var lowercaseA = "a".charCodeAt(0);
for (var i = 0; i < 26; i++)
    table[String.fromCharCode(capitalA + i)] = String.fromCharCode(lowercaseA + i);

/**
 * 按键数据
 * 当发生键盘事件时传递
 * 包含按键和按下状态等数据
 */
class keyData
{
    /**
     * 键名
     */
    key = "";
    /**
     * 当前此指针是否处于按下状态
     */
    hold = false;
    /**
     * 当前指针是否正在按下(按下事件)
     */
    pressing = false;
    constructor(key, hold, pressing)
    {
        this.key = key;
        this.hold = hold;
        this.pressing = pressing;
    }
}

/**
 * 键盘 事件处理
 * @param {HTMLElement} element
 * @param {function(keyData):void} callBack
 */
function keyboardBind(element, callBack)
{
    element.addEventListener("keydown", e => callBack(new keyData(
        (table[e.key] ? table[e.key] : e.key),
        true,
        true
    )));
    element.addEventListener("keyup", e => callBack(new keyData(
        (table[e.key] ? table[e.key] : e.key),
        false,
        false
    )));
}

/**
 * 键盘操作的封装
 */
class KeyboardMap
{
    /**
     * 按键状态表
     * 存在则为按下
     * @type {Set<string>}
     */
    keySet = new Set();
    /**
     * 按下回调map
     * @type {Map<string, function(import("./keyData").keyData) : void>}
     */
    downCB = new Map();
    /**
     * 弹起回调map
     * @type {Map<string, function(import("./keyData").keyData) : void>}
     */
    upCB = new Map();
    /**
     * 监听器函数
     * 调用此函数以模拟键盘操作
     * @type {function(import("./keyData").keyData): void}
     */
    listener = null;

    /**
     * 接管元素的键盘操作
     * @param {HTMLElement} e 默认为 document.body
     */
    constructor(e = document.body)
    {
        keyboardBind(e, this.listener = (e =>
        {
            var key = e.key;
            if (e.hold)
            {
                if (!this.keySet.has(key))
                {
                    this.keySet.add(key);
                    let cb = this.downCB.get(key);
                    if (cb)
                        cb(e);
                }
            }
            else
            {
                if (this.keySet.has(key))
                {
                    this.keySet.delete(e.key);
                    let cb = this.upCB.get(key);
                    if (cb)
                        cb(e);
                }
            }
        }));
    }

    /**
     * 获取按键状态
     * @param {string} key 
     * @returns {boolean} true为按下
     */
    get(key)
    {
        return this.keySet.has(key);
    }

    /**
     * 绑定按下事件
     * 注意: 一个按键多次绑定Down会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下时触发
     */
    bindDown(key, callback)
    {
        this.downCB.set(key, callback);
    }

    /**
     * 绑定弹起事件
     * 注意: 一个按键多次绑定Up会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键弹起时触发
     */
    bindUp(key, callback)
    {
        this.upCB.set(key, callback);
    }

    /**
     * 绑定按键事件
     * 注意: 一个按键多次绑定会解除前一次绑定的回调
     * @param {string} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下或弹起时触发
     */
    bind(key, callback)
    {
        this.bindDown(key, callback);
        this.bindUp(key, callback);
    }

    /**
     * 绑定多个按键
     * 注意: 一个按键多次绑定会解除前一次绑定的回调
     * @param {Array<string>} key 
     * @param {function(import("./keyData").keyData) : void} callback 回调将在按键按下或弹起时触发
     */
    bindArray(key, callback)
    {
        key.forEach(o => { this.bind(o, callback); });
    }
}

/**
 * 指针数据
 * 当发生鼠标或触摸事件时传递
 * 包含指针坐标和按下状态等数据
 */
class pointerData
{
    x = 0; y = 0; // 当前指针位置
    vx = 0; vy = 0; // 指针位置和上次位置的变化
    sx = 0; sy = 0; // 此指针的起始位置
    hold = false; // 当前此指针是否处于按下状态
    pressing = false; // 当前指针是否正在按下(按下事件)
    constructor(x, y, vx, vy, sx, sy, hold, pressing)
    {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.sx = sx;
        this.sy = sy;
        this.hold = hold;
        this.pressing = pressing;
    }
}

/**
 * 触摸(拖拽) 事件处理
 * @param {HTMLElement} element 
 * @param {function(pointerData):void} callBack
 */
function touchBind(element, callBack)
{
    element.addEventListener("touchstart", e => touchStart(e), {
        capture: false,
        passive: false
    });
    element.addEventListener("touchmove", e => touchMove(e), {
        capture: false,
        passive: true
    });
    element.addEventListener("touchend", e => touchEnd(e), {
        capture: false,
        passive: true
    });

    var ogTouches = [];
    /**
     * 通过标识符取触摸点数据索引
     * @param {any} id
     * @returns {number}
     */
    function getTouchesInd(id)
    {
        var ret = -1;
        ogTouches.forEach((o, i) =>
        {
            if (id == o.id)
                ret = i;
        });
        return ret;
    }
    /**
     * 触摸处理函数(按下)
     * @param {TouchEvent} e 
     */
    function touchStart(e)
    {
        if (e.cancelable)
            e.preventDefault();
        forEach(e.touches, o =>
        {
            var t = {
                id: o.identifier,
                sx: o.clientX,
                sy: o.clientY,
                x: o.clientX,
                y: o.clientY
            };
            ogTouches.push(t);
            callBack(new pointerData(
                t.x, t.y,
                0, 0,
                t.sx, t.sy,
                true, true
            ));
        });
    }
    /**
     * 触摸处理函数(移动)
     * @param {TouchEvent} e 
     */
    function touchMove(e)
    {
        forEach(e.touches, o =>
        {
            var ind = getTouchesInd(o.identifier);
            if (ind > -1)
            {
                var t = ogTouches[ind];
                var vx = o.clientX - t.x;
                var vy = o.clientY - t.y;
                t.x = o.clientX;
                t.y = o.clientY;
                callBack(new pointerData(
                    t.x, t.y,
                    vx, vy,
                    t.sx, t.sy,
                    true, false
                ));
            }
        });
    }
    /**
     * 触摸处理函数(松开)
     * @param {TouchEvent} e 
     */
    function touchEnd(e)
    {
        forEach(e.touches, o =>
        {
            var ind = getTouchesInd(o.identifier);
            if (ind > -1)
            {
                var t = ogTouches[ind];
                ogTouches.splice(ind, 1);
                var vx = o.clientX - t.x;
                var vy = o.clientY - t.y;
                t.x = o.clientX;
                t.y = o.clientY;
                callBack(new pointerData(
                    t.x, t.y,
                    vx, vy,
                    t.sx, t.sy,
                    false, false
                ));
            }
        });
    }
}

export { Camera, KeyboardMap, ObjC, Scene, Texture, create_cube, initContext, keyboardBind, structureEngineInfo, touchBind };
//# sourceMappingURL=structureEngine.js.map
