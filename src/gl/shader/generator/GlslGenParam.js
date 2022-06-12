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