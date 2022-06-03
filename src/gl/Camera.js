import { m4 } from "../math/m4.js";
import { debugInfo } from "../tools/debugInfo.js";
import { Light } from "./Light.js";
import { GlslGenerator } from "./shader/generator/GlslGenerator.js";
import { GlslGenParam } from "./shader/generator/GlslGenParam.js";
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
    far = 450;

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
     * 不含投影的相机矩阵
     * 仅变换坐标到相对相机坐标 不含投影矩阵
     * @private
     * @type {m4}
     */
    npMat = null;

    /**
     * 相机投影矩阵
     * 含变换坐标到相对相机坐标
     * 含投影矩阵
     * @private
     * @type {m4}
     */
    cMat = null;


    /**
     * 当前着色器
     * @private
     * @type {import("./shader/GlslProgram").GlslProgram}
     */
    program = null;
    /**
     * 着色器生成器对象
     * @private
     * @type {GlslGenerator}
     */
    pGenerator = null;

    /**
     * 灯光列表
     * @type {Array<Light>}
     */
    lights = [];


    /**
     * @param {import("./scene/Scene").Scene} scene
     */
    constructor(scene)
    {
        this.scene = scene;
        this.gl = scene.gl;

        this.pGenerator = new GlslGenerator(this.gl);

        ([
            new GlslGenParam("mat4", "u_lightMat") // 灯光投影矩阵
        ]).forEach(o => this.pGenerator.vUniform.set(o.id, o));
        ([
            new GlslGenParam("vec4", "v_lightP") // 灯光投影矩阵转换后的坐标
        ]).forEach(o => this.pGenerator.fIn.set(o.id, o));
        ([
            new GlslGenParam("sampler2D", "u_texS") // 阴影贴图
        ]).forEach(o => this.pGenerator.fUniform.set(o.id, o));
        this.pGenerator.vPart = [
            "v_lightP = u_lightMat * u_worldMatrix * a_position"
        ];
        this.pGenerator.fPart = [
            "vec3 lightP = v_lightP.xyz / v_lightP.w",
            "lightP.x *= 0.5",
            "lightP.y *= 0.5",
            "lightP.x += 0.5",
            "lightP.y += 0.5",

            "const vec3 lightDir = normalize(vec3(0.3, -0.3, 1))", // 灯光方向向量
            "float diffLight = max(dot(normal, -lightDir), 0.0)", // 平行光漫反射
            "float reflLight = pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0)", // 平行光镜面反射
            "lightResult = 0.75 + diffLight * 0.2 + reflLight * 0.08" // 光的总影响
        ];
        this.pGenerator.fOutColor = "(lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0 && lightP.z>=-1.0 && lightP.z<=1.0) ?(texture(u_texS, lightP.xy).r + 0.001 < lightP.z * 0.5 + 0.5) ? vec3(0.0,0.0,0.0) :  texture(u_texture, v_texcoord).rgb + 0.3: texture(u_texture, v_texcoord).rgb";
        
        // this.pGenerator.fPart = GlslGenerator.t_fPart.light;
        // this.pGenerator.fOutColor = GlslGenerator.t_fOutColor.light;
        
        this.program = this.pGenerator.gen();
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

        this.npMat = new m4().rotateXYZ(-this.rx, -this.ry, -this.rz). // 反向旋转
            translation(-this.x, -this.y, -this.z) // 反向平移
        this.program.use(); // 修改着色器组(渲染程序)
        this.program.uniformMatrix4fv("u_cameraMatrix", ( // 设置相机矩阵
            this.cMat = m4.perspective(this.fov, this.gl.canvas.clientHeight / this.gl.canvas.clientWidth, this.near, this.far). // 透视投影矩阵
                rotateXYZ(-this.rx, -this.ry, -this.rz). // 反向旋转
                translation(-this.x, -this.y, -this.z) // 反向平移
        ).a);
        //this.program.uniformMatrix4fv("u_cameraMatrix", this.lightMat.a);
        this.program.uniform3f("u_viewPos", this.x, this.y, this.z); // 视点坐标(相机坐标)
        this.gl.uniform1i(this.gl.getUniformLocation(this.program.progra, "u_texture"), 0);  // 纹理单元 0
        this.gl.uniform1i(this.gl.getUniformLocation(this.program.progra, "u_texS"), 1);  // 纹理单元 1
        if (this.shadowTex)
            this.shadowTex.bindTexture(1); // 绑定阴影贴图
        if (this.lightMat)
            this.program.uniformMatrix4fv("u_lightMat", ( // 设置灯光投影
                this.lightMat
            ).a);
        this.render(this.scene.obje); // 递归渲染
    }

    /**
     * 递归渲染场景
     * @private
     * @param {import("./scene/SceneObject").SceneObject} obje 场景中的物体对象(当前位置)
     */
    render(obje)
    {
        /*
            绘制图像
        */
        if (obje.faces) // 有"面数据"
        {

            if(true)
            //if (!obje.coneRemove(this.npMat, this.fov)) // 未被剔除
            {
                var faces = obje.faces;

                this.program.uniformMatrix4fv("u_worldMatrix", obje.wMat.a); // 设置世界矩阵
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