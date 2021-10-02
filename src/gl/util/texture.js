/**
 * 纹理类
 */
export class Texture
{
    /**
     * 纹理对象
     * @type {WebGLTexture}
     */
    tex = null;

    /**
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {string} url
     */
    constructor(gl, url)
    {
        var texture = gl.createTexture(); // 创建纹理
        gl.bindTexture(gl.TEXTURE_2D, texture); // 绑定纹理(切换正在操作为当前纹理)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 255, 255, 255])); // 填充初始色
        var image = new Image();
        image.src = url; // 加载图片
        image.addEventListener("load", () => // 图片加载完
        {
            gl.bindTexture(gl.TEXTURE_2D, texture); // 绑定纹理(切换正在操作为当前纹理)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // 将纹理设置为此图片
            gl.generateMipmap(gl.TEXTURE_2D); // 生成mipmap纹理
        });
        this.tex = texture;
    }
}