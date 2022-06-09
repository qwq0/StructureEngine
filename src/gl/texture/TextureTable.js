import { Texture } from "./Texture.js";

/**
 * 纹理表
 * 管理纹理 避免重复载入
 */
export class TextureTable
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