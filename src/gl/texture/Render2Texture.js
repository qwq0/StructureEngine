import { Texture } from "./Texture.js";

/**
 * 渲染到纹理
 * 帧缓冲区封装
 */
export class Render2Texture
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

            // 设置过滤 不需要使用贴图
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

            // 设置过滤 不需要使用贴图
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
