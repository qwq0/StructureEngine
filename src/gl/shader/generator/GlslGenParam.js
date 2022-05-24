/**
 * glsl参数封装
 * 用于glsl生成
 */
export class GlslGenParam
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
     * @param {GlslGenParamType} type
     * @param {string} id
     */
    constructor(type, id)
    {
        this.type = type;
        this.id = id;
    }
}