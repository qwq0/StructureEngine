import { m4 } from "../math/m4.js";
import { debugInfo } from "../tools/debugInfo.js";
import { GlslGenerator } from "./shader/GlslGenerator.js";
import { degToRad } from "./util/math.js";


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
    far = 2500;

    /**
     * 绑定的场景
     * @type {import("./scene/Scene").Scene}
     */
    scene = null;
    /**
     * 绑定的webgl上下文
     * @type {WebGL2RenderingContext}
     */
    gl = null;

    /**
     * 相机矩阵
     * 仅变换坐标到相对相机坐标 不含投影矩阵
     * @type {m4}
     */
    cMat = null;
    /**
     * 当前着色器
     * @type {import("./shader/GlslProgram").GlslProgram}
     */
    program = null;


    /**
     * @param {import("./scene/Scene").Scene} scene
     */
    constructor(scene)
    {
        this.scene = scene;
        this.gl = scene.gl;

        this.program = (new GlslGenerator(this.gl)).gen();
    }

    /**
     * 绘制场景
     * 先进行一些设置 然后调用递归渲染
     */
    draw()
    {
        debugInfo.clear();

        this.scene.obje.updateMat(); // 更新场景中物体的矩阵

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // 清除画布颜色和深度缓冲区

        this.cMat = new m4().rotateXYZ(-this.rx, -this.ry, -this.rz). // 反向旋转
            translation(-this.x, -this.y, -this.z) // 反向平移
        this.program.use(); // 修改着色器组(渲染程序)
        this.program.uniformMatrix4fv("u_cameraMatrix", ( // 设置相机矩阵
            m4.perspective(this.fov, this.gl.canvas.clientHeight / this.gl.canvas.clientWidth, this.near, this.far). // 透视投影矩阵
                rotateXYZ(-this.rx, -this.ry, -this.rz). // 反向旋转
                translation(-this.x, -this.y, -this.z) // 反向平移
        ).a);
        this.program.uniform3f("u_viewPos", this.x, this.y, this.z); // 视点坐标(相机坐标)
        this.render(this.scene.obje); // 递归渲染
    }

    /**
     * 递归渲染场景
     * @param {import("./scene/SceneObject").SceneObject} obje 场景中的物体对象(当前位置)
     */
    render(obje)
    {
        /*
            变换矩阵(遗留部分)
        */
        var worldMatrix = obje.wMat;
        /*---------*/

        /*
            绘制图像
        */
        if (obje.faces) // 有"面数据"
        {

            if (!obje.coneRemove(this.cMat, this.fov)) // 未被剔除
            {
                var faces = obje.faces;

                this.program.uniformMatrix4fv("u_worldMatrix", worldMatrix.a); // 设置世界矩阵
                // obje.program.uniform3f("u_markColor", 0, 0.2, 0); // 标记颜色
                if (faces.tex) // 如果有纹理
                    faces.tex.bindTexture(0); // 绑定纹理
                this.gl.bindVertexArray(faces.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)
                this.gl.drawArrays(faces.mode, 0, faces.posLen); // 绘制数据
            }
            else
                debugInfo.cullCount++;
        }
        /*---------*/

        /*
            递归子节点
        */
        if (obje.c)
            obje.c.forEach(o => this.render(o));
    }
}