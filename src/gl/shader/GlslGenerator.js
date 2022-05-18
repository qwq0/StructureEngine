import { GlslGenParam } from "./GlslGenParam.js";
import { GlslProgram } from "./GlslProgram.js";

/**
 * glsl着色器生成器
 * 生成一对着色器(一个GlslProgram)
 *  - 顶点着色器流程
 *      - 定义输入变量
 *          - in vec4 a_position; // (必须)原始坐标
 *          - in vec3 a_normal; // 原始法线
 *          - in vec2 a_texcoord; // 纹理坐标
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
 *          - uniform vec3 u_markColor; // 标记颜色(调试)
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
     * 灯光列表
     * @type {any}
     */
    light = [];

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
     * 生成着色器
     * @returns {GlslProgram}
     */
    gen()
    {
        var vertexShader = genVertexShader(this.vUniform, this.vIn, this.fIn);
        var fragmentShader = genFragmentShader(this.fUniform, this.fIn);
        return new GlslProgram(this.gl, vertexShader, fragmentShader);
    }
}
/**
 * 生成顶点着色器
 * @param {Map<string, GlslGenParam>} uniform
 * @param {Map<string, GlslGenParam>} vIn
 * @param {Map<string, GlslGenParam>} vOut
 */
function genVertexShader(uniform, vIn, vOut)
{
    return ([
        "#version 300 es",
        "precision highp float;",

        (() => // 顶点着色器uniform
        {
            var ret = [];
            uniform.forEach((value) =>
            {
                ret.push("uniform " + value.type + " " + value.id + ";");
            });
            return ret;
        })(),

        (() => // 顶点着色器in
        {
            var ret = [];
            vIn.forEach((value) =>
            {
                ret.push("in " + value.type + " " + value.id + ";");
            });
            return ret;
        })(),

        (() => // 顶点着色器out
        {
            var ret = [];
            vOut.forEach((value) =>
            {
                ret.push("out " + value.type + " " + value.id + ";");
            });
            return ret;
        })(),

        "in vec4 a_position;", // 原始坐标
        "in vec3 a_normal;", // 原始法线

        "in vec2 a_texcoord;", // 纹理坐标

        "uniform mat4 u_cameraMatrix;", // 相机(包括投影投影)矩阵
        "uniform mat4 u_worldMatrix;", // 世界矩阵

        "out vec3 v_normal;", // 法线
        "out vec2 v_texcoord;", // 纹理坐标
        "out vec3 v_thisPos;", // 顶点的世界坐标

        "void main() {",
        "    gl_Position = u_cameraMatrix * u_worldMatrix * a_position;", // 转换到视图中坐标
        "    v_texcoord = a_texcoord;", // 纹理坐标(插值)
        "    v_thisPos = (u_worldMatrix * a_position).xyz;", // 顶点世界坐标(插值)

        "    mat4 u_worldViewProjection = u_worldMatrix;", // 求出不含平移的世界矩阵(旋转和缩放)
        "    u_worldViewProjection[3][0] = u_worldViewProjection[3][1] = u_worldViewProjection[3][2] = 0.0;",
        "    u_worldViewProjection = transpose(inverse(u_worldViewProjection));",
        "    v_normal = mat3(u_worldViewProjection) * a_normal;", // 法线(插值)
        "}"
    ]).flat(Infinity).join("\n");
}

/**
 * 生成片段着色器
 * @param {Map<string, GlslGenParam>} uniform
 * @param {Map<string, GlslGenParam>} fIn
 */
function genFragmentShader(uniform, fIn)
{
    return ([
        "#version 300 es",
        "precision highp float;",

        (() => // 片段着色器uniform
        {
            var ret = [];
            uniform.forEach((value) =>
            {
                ret.push("uniform " + value.type + " " + value.id + ";");
            });
            return ret;
        })(),

        (() => // 片段着色器in
        {
            var ret = [];
            fIn.forEach((value) =>
            {
                ret.push("in " + value.type + " " + value.id + ";");
            });
            return ret;
        })(),

        (() => // 片段着色器out
        {
            return ["out vec4 outColor;"];
        })(),

        "in vec3 v_normal;", // 法线
        "in vec3 v_thisPos;", // 顶点的世界坐标

        "in vec2 v_texcoord;", // 纹理坐标
        "uniform sampler2D u_texture;", // 纹理

        "const vec3 lightDir = normalize(vec3(0.3, -0.3, 1));", // 灯光方向向量
        "uniform vec3 u_viewPos;", // 视点(相机)的世界坐标

        "uniform vec3 u_markColor;", // 标记颜色(调试)

        "out vec4 outColor;", // 此片段最终的颜色

        "void main() {",
        "    vec3 normal = normalize(v_normal);", // 法线(归一化)

        "    float diffLight = max(dot(normal, -lightDir), 0.0);", // 平行光漫反射
        "    float reflLight = pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0);", // 平行光镜面反射

        "    float lightResult = 0.75 + diffLight * 0.2 + reflLight * 0.08;", // 光的总影响
        "    outColor.a = 1.0;",
        "    outColor.rgb = texture(u_texture, v_texcoord).rgb * lightResult;", // 计算最终颜色
        "    outColor.rgb += u_markColor;", // 标记颜色(调试)
        // "    discard;", 丢弃片段
        "}"
    ]).flat(Infinity).join("\n");
}