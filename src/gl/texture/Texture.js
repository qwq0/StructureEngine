/**
 * 纹理类
 */
export class Texture
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
     * 通过视频的url创建纹理
     * @param {WebGL2RenderingContext} gl
     * @param {string} url
     * @returns {Texture}
     */
    static fromVideoUrl(gl, url)
    {
        var ret = new Texture(gl);
        var video = document.createElement("video");
        video.src = url; // 加载视频
        video.addEventListener("loadeddata", () => // 视频加载完
        {
            video.play();
            gl.bindTexture(gl.TEXTURE_2D, ret.tex); // 绑定纹理(切换正在操作为当前纹理)
            gl.texImage2D( // 将纹理设置为此视频
                gl.TEXTURE_2D, // 二维纹理贴图
                0, // 基本图形等级
                gl.RGBA, // 纹理颜色组件
                gl.RGBA, // 数据格式
                gl.UNSIGNED_BYTE, // 数据类型
                video // 图像源
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); // 设置镜像重复
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT); // 设置镜像重复
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // mipmap设置(绘制的面大于贴图时)只选取1个像素
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // mipmap设置(绘制的面大于贴图时)混合原贴图的4个像素
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // mipmap设置(绘制的面小于贴图时)混合两个贴图每个选取4个像素
            gl.generateMipmap(gl.TEXTURE_2D); // 生成mipmap纹理
            var updateTexture = () => // 更新纹理
            {
                gl.bindTexture(gl.TEXTURE_2D, ret.tex); // 绑定纹理(切换正在操作为当前纹理)
                gl.texImage2D( // 将纹理设置为此视频
                    gl.TEXTURE_2D, // 二维纹理贴图
                    0, // 基本图形等级
                    gl.RGBA, // 纹理颜色组件
                    gl.RGBA, // 数据格式
                    gl.UNSIGNED_BYTE, // 数据类型
                    video // 图像源
                );
                gl.generateMipmap(gl.TEXTURE_2D); // 重新生成mipmap纹理
            }
            var intervalId = setInterval(updateTexture, 25);
            video.addEventListener("ended", () => { clearInterval(intervalId); });
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