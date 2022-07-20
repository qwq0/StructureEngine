import { GlslProgram } from "../shader/GlslProgram.js";

/**
 * [gl]物体的面数据
 * 此类的名称应为ObjMesh
 */
export class ObjFaces
{
    /**
     * 顶点相对坐标向量
     * 每个顶点3个(1个向量)
     * (无索引时)每个面9个(每个面3个顶点)
     * @type {Float32Array}
     */
    pos = null;
    /**
     * 顶点相对坐标向量
     * 每个面3个
     * @type {Uint32Array}
     */
    ind = null;
    /**
     * 法线方向向量
     * 每个顶点3个(1个向量)
     * (无索引时)每个面9个(每个面3个顶点)
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
     * 纹理坐标向量
     * 每个顶点2个(1个向量)
     * (无索引时)每个面6个(每个面3个纹理坐标)
     * @type {Float32Array}
     */
    texPos = null;
    /**
     * 此物体的渲染模式 例如 gl.TRIANGLES
     * 暂时仅支持gl.TRIANGLES
     * @type {number}
     */
    mode = 0;
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
     * @param {Uint32Array | Array<number>} [ind]
     */
    constructor(pos, tex, texPos, normal, mode = WebGL2RenderingContext.TRIANGLES, ind = null)
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
        if (ind)
        {
            if (ind instanceof Uint32Array)
                this.ind = ind;
            else
                this.ind = new Uint32Array(ind);
        }
    }

    /**
     * 转换使用索引数组的面信息
     * [!] 不建议使用
     * @param {Float32Array | Array<number>} pos
     * @param {import("../texture/Texture").Texture} tex
     * @param {Float32Array | Array<number>} texPos
     * @param {Float32Array | Array<number>} normal
     * @param {number} mode
     * @param {Uint32Array | Array<number>} ind
     */
    static convertInd(pos, tex, texPos, normal, mode, ind)
    {
        var nPos = new Float32Array(ind.length * 3);
        var nTexPos = new Float32Array(ind.length * 2);
        var nNormal = new Float32Array(ind.length * 3);
        ind.forEach((/** @type {number} */ o, /** @type {number} */ i) =>
        {
            [nPos[i * 3 + 0], nPos[i * 3 + 1], nPos[i * 3 + 2]] = [pos[o * 3 + 0], pos[o * 3 + 1], pos[o * 3 + 2]];
            [nTexPos[i * 2 + 0], nTexPos[i * 2 + 1]] = [texPos[o * 2 + 0], texPos[o * 2 + 1]];
            [nNormal[i * 3 + 0], nNormal[i * 3 + 1], nNormal[i * 3 + 2]] = [normal[o * 3 + 0], normal[o * 3 + 1], normal[o * 3 + 2]];
        });
        var ret = new ObjFaces(nPos, tex, nTexPos, nNormal, mode);
        return ret;
    }
}