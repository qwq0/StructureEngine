import { m4 } from "../math/m4.js";
import { GlslGenerator } from "./shader/generator/GlslGenerator.js";
import { GlslGenParam } from "./shader/generator/GlslGenParam.js";
import { Render2Texture } from "./texture/Render2Texture.js";

/**
 * 物体id的bitmap封装
 * 绘制包含物体id的纹理
 * 注意: 此处的id通常对应场景中的sn
 */
export class IdBitmap
{
    /**
     * 相机矩阵
     * 绘制idBitmap贴图时使用
     * 带投影
     * @type {m4}
     */
    cMat = new m4();

    /**
     * 不含投影的相机矩阵
     * 仅变换坐标到相对相机坐标 不含投影矩阵
     * @private
     * @type {m4}
     */
    npMat = new m4();

    /**
     * 相机视角场
     * 单位为弧度
     * 对角线fov
     * @type {number}
     */
    fov = 0;

    /**
     * 绑定的场景
     * @private
     * @type {import("./scene/Scene").Scene}
     */
    scene = null;
    /**
     * 绑定的webgl上下文
     * @private
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 绘制idBitmap贴图的着色器
     * @private
     * @type {import("./shader/GlslProgram").GlslProgram}
     */
    program = null;

    /**
     * idBitmap贴图
     * @type {Render2Texture}
     */
    bitmapTex = null;

    /**
     * @param {import("./scene/Scene").Scene} scene
     */
    constructor(scene)
    {
        this.scene = scene;
        this.gl = scene.gl;

        this.bitmapTex = new Render2Texture(this.gl, 960, 540, true, true);

        var pGenerator = new GlslGenerator(this.gl);
        pGenerator.fUniform.set("u_id", new GlslGenParam("vec4", "u_id"));
        pGenerator.fOutColorType = "rgba";
        pGenerator.fOutColor = "u_id";
        this.program = pGenerator.gen();
    }

    /**
     * 绘制bitMap贴图
     * 将调用递归渲染阴影
     */
    renderBitmap()
    {
        this.scene.obje.updateMat(); // 更新场景中物体的矩阵

        this.bitmapTex.bindFramebuffer(); // 渲染到纹理(帧缓冲区)

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // 清除此帧缓冲区的深度缓冲区

        this.program.use(); // 修改着色器组(渲染程序)
        this.program.uniformMatrix4fv("u_cameraMatrix", this.cMat.a);// 设置灯光矩阵(类似相机矩阵)
        this.render(this.scene.obje); // 递归渲染
    }

    /**
     * 递归渲染bitMap
     * @private
     * @param {import("./scene/SceneObject").SceneObject} obje 场景中的物体对象(当前位置)
     */
    render(obje)
    {
        /**
         * 此物体的id
         */
        var id = obje.sn;

        /*
            绘制图像
        */
        if (obje.faces) // 有"面数据"
        {
            if (!obje.coneRemove(this.npMat, this.fov))
            {
                var faces = obje.faces;

                this.program.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
                this.program.uniform4f("u_id",
                    ((id >> 0) & 0xFF) / 0xFF,
                    ((id >> 8) & 0xFF) / 0xFF,
                    ((id >> 16) & 0xFF) / 0xFF,
                    ((id >> 24) & 0xFF) / 0xFF
                );

                this.gl.bindVertexArray(faces.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)
                this.gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制数据
            }
        }

        /*
            递归子节点
        */
        if (obje.c)
            obje.c.forEach(o => this.render(o));
    }

    /**
     * 获取可见物体的id的集合
     * 需要先渲染bitmap后调用
     * 注意: 此处的id对应场景中物体的sn
     * @returns {Set<number>}
     */
    getVisible()
    {
        var ret = new Set();

        this.bitmapTex.bindFramebuffer(); // 渲染到纹理(帧缓冲区)

        var data = new Uint8Array(4 * this.bitmapTex.textureWidth * this.bitmapTex.textureHeight);
        this.gl.readPixels(
            0, 0, this.bitmapTex.textureWidth, this.bitmapTex.textureHeight,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, data
        );

        for (var i = 0; i < data.length; i += 4)
        {
            ret.add(data[i] + (data[i + 1] << 8) + (data[i + 2] << 16) + (data[i + 3] << 24));
        }

        return ret;
    }

    /**
     * 返回一个像素的id
     * 注意: 此处的id对应场景中物体的sn
     * @param {number} x 
     * @param {number} y 
     * @returns {number}
     */
    getPixel(x, y)
    {
        this.bitmapTex.bindFramebuffer(); // 渲染到纹理(帧缓冲区)

        var data = new Uint8Array(4);
        this.gl.readPixels(
            0, 0, x, y,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, data
        );

        return data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
    }
}