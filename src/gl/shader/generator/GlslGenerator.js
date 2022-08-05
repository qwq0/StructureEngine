import { GlslGenParam } from "./GlslGenParam.js";
import { GlslProgram } from "../GlslProgram.js";

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
export class GlslGenerator
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
            // "precision highp sampler2D;",

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