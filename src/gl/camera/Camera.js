import { m4 } from "../../math/m4.js";
import { Light } from "../Light.js";
import { Render } from "../render/Render.js";
import { coneCull } from "../render/renderUtil.js";
import { GlslGenerator } from "../shader/generator/GlslGenerator.js";
import { GlslGenParam } from "../shader/generator/GlslGenParam.js";
import { degToRad } from "../util/math.js";


/**
 * 相机类
 * 需要绑定到 场景类 和 webgl上下文
 */
export class Camera
{
    /**
     * 相机坐标x
     * @type {number}
     */
    x = 0;
    /**
     * 相机坐标y
     * @type {number}
     */
    y = 0;
    /**
     * 相机坐标z
     * @type {number}
     */
    z = 0;
    /**
     * 相机x轴旋转
     * @type {number}
     */
    rx = 0;
    /**
     * 相机y轴旋转
     * @type {number}
     */
    ry = 0;
    /**
     * 相机z轴旋转
     * @type {number}
     */
    rz = 0;
    /**
     * 相机视角场
     * 单位为弧度
     * 对角线fov
     * @type {number}
     */
    fov = degToRad * 130;
    /**
     * 视锥最近面距离
     * @type {number}
     */
    near = 0.1;
    /**
     * 视锥最远面距离
     * @type {number}
     */
    far = 450;



    /**
     * 不含投影的相机矩阵
     * 仅变换坐标到相对相机坐标 不含投影矩阵
     * @private
     * @type {m4}
     */
    npMat = new m4();

    /**
     * 相机投影矩阵
     *  + 含变换坐标到相对相机坐标
     *  + 含投影矩阵
     * @private
     * @type {m4}
     */
    cMat = new m4();

    /**
     * 判断函数
     * 渲染时对于每个遍历到的物体调用进行判断
     * 要求返回一个标志位整数表示判断结果
     *  + &1 不渲染此物体的面
     *  + &2 不遍历此物体的子节点
     * @type {function(import("../scene/SceneObject").SceneObject) : number}
     */
    judge = null;

    /**
     * 灯光列表
     * @type {Array<Light>}
     */
    lights = [];


    /**
     * @param {import("../scene/Scene").Scene} scene
     */
    constructor(scene)
    {
        this.scene = scene;
        this.gl = scene.gl;


        this.render = new Render(scene, scene.ct.program.camera);
        this.render.judge = (obje =>
        {
            return (obje.faces && coneCull(obje, obje.getWorldPos().mulM4(this.npMat), this.fov) ? 1 : 0); // 视锥剔除
        });
    }

    /**
     * 绘制场景
     * 先进行一些设置 然后调用递归渲染
     */
    draw()
    {
        this.npMat = new m4(). // 新矩阵
            rotateXYZ(-this.rx, -this.ry, -this.rz). // 反向旋转
            translation(-this.x, -this.y, -this.z) // 反向平移
        this.cMat = m4.perspective(this.fov, this.gl.canvas.clientHeight / this.gl.canvas.clientWidth, this.near, this.far). // 透视投影矩阵
            rotateXYZ(-this.rx, -this.ry, -this.rz). // 反向旋转
            translation(-this.x, -this.y, -this.z) // 反向平移
        this.render.cMat = this.cMat; // 设置渲染器的相机矩阵

        this.render.render(program => // 渲染
        { // 设置着色器uniform
            program.uniform3f("u_viewPos", this.x, this.y, this.z); // 视点坐标(相机坐标)
            this.gl.uniform1i(this.gl.getUniformLocation(program.progra, "u_texture"), 0);  // 纹理单元 0
            this.gl.uniform1i(this.gl.getUniformLocation(program.progra, "u_texS"), 1);  // 纹理单元 1
            if (this.lights[0])
            {
                this.lights[0].shadowTex.depthTex.bindTexture(1); // 绑定阴影贴图
                program.uniformMatrix4fv("u_lightMat", this.lights[0].cMat.a); // 设置灯光投影
            }
        });
    }
}