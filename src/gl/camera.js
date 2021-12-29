import { m4 } from "../matrix/m4.js";
import { glslProgram } from "./shader/glslProgram.js";
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
     * 相机视角场角度
     * @type {number}
     */
    fov = degToRad * 90;

    /**
     * 绑定的场景
     * @type {import("./scenes").Scenes}
     */
    scenes = null;
    /**
     * 绑定的webgl上下文
     * @type {WebGL2RenderingContext}
     */
    gl = null;


    /**
     * @param {import("./scenes").Scenes} scenes
     */
    constructor(scenes)
    {
        this.scenes = scenes;
        this.gl = scenes.gl;
    }

    draw()
    {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.render(
            this.gl,
            this.scenes.obje,
            m4.perspective(this.fov, this.gl.canvas.clientWidth / this.gl.canvas.clientHeight, 0.1, 2500).
                rotate(-this.rx, -this.ry, -this.rz).
                translation(-this.x, -this.y, -this.z),
            new m4()
        );
    }

    /**
     * 递归渲染场景
     * 写给以后的自己和其他想要修改这部分的人:
     * 请不要随意改动你无法理解的部分
     * webgl以及opengl的接口有些杂乱
     * 我写了这个引擎 但也许我自己也不完全了解webglAPI
     * @param {WebGL2RenderingContext} gl webgl上下文
     * @param {import("./ScenesObject").ScenesObject} obje 场景中的物体对象(当前位置)
     * @param {m4} lase_matrix 上一个矩阵(上一个位置角度与缩放)
     * @param {m4} cameraMatrix 相机偏移矩阵(已弃用)
     */
    render(gl, obje, lase_matrix, cameraMatrix)
    {
        /*
            变换矩阵
        */
        var matrix = lase_matrix.copy(). // 复制矩阵
            translation(obje.x, obje.y, obje.z). // 平移
            rotate(obje.rx, obje.ry, obje.rz). // 旋转
            scale(obje.sx, obje.sy, obje.sz); // 缩放
        /*
            绘制图像
        */
        if (obje.faces) // 有"面数据" 则绘制
        {
            if (!obje.vao) // 初始化顶点数组(材质数组)
            {
                // 初始化顶点数组
                let positionAttributeLocation = gl.getAttribLocation(obje.program.progra, "a_position"); // [着色器变量] 顶点坐标

                let positionBuffer = gl.createBuffer(); // 创建缓冲区
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
                gl.bufferData(gl.ARRAY_BUFFER, obje.faces.ver, gl.STATIC_DRAW); // 送入数据

                let vao = gl.createVertexArray(); // 创建顶点数组
                gl.bindVertexArray(vao); // 绑定顶点数组(切换当前正在操作的顶点数组)
                gl.enableVertexAttribArray(positionAttributeLocation); // 启用顶点属性数组(顶点坐标数组)

                gl.vertexAttribPointer( // 顶点属性指针
                    positionAttributeLocation, // 到顶点坐标
                    3, // 每个坐标为三个元素
                    gl.FLOAT, // 浮点数(似乎应该是32位)
                    false, // 归一化(规范化,正常化)
                    0, // 坐标间间隔(无间隔)
                    0 // 缓冲区偏移(从开头开始)
                );

                obje.vao = vao;

                if (obje.faces.tex)
                {
                    // 初始化材质坐标
                    let texcoordAttributeLocation = gl.getAttribLocation(obje.program.progra, "a_texcoord"); // [着色器变量] 材质坐标

                    let texcoordBuffer = gl.createBuffer(); // 创建缓冲区
                    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer); // 绑定缓冲区(切换当前正在操作的缓冲区)
                    gl.bufferData(gl.ARRAY_BUFFER, obje.faces.texOff, gl.STATIC_DRAW); // 送入数据

                    gl.enableVertexAttribArray(texcoordAttributeLocation); // 启用顶点属性数组(材质坐标数组)

                    gl.vertexAttribPointer( // 顶点属性指针
                        texcoordAttributeLocation, // 到纹理坐标
                        2, // 每个坐标为两个元素
                        gl.FLOAT, // 浮点数(似乎应该是32位)
                        false, // 归一化(规范化,正常化)
                        0, // 坐标间间隔(无间隔)
                        0 // 缓冲区偏移(从开头开始)
                    );
                }
            }

            gl.useProgram(obje.program.progra); // 修改着色器组(渲染程序)

            if (!obje.matrixLoc) // 未获取矩阵在着色器中的位置
                obje.matrixLoc = gl.getUniformLocation(obje.program.progra, "u_matrix");
            gl.uniformMatrix4fv(obje.matrixLoc, false, matrix.a); // 设置矩阵

            gl.bindVertexArray(obje.vao); // 绑定顶点数组(切换当前正在操作的顶点数组)
            gl.drawArrays(gl.TRIANGLES, 0, obje.faces.verLen); // 绘制数据
        }
        /*
            递归子节点
        */
        if (obje.c)
            obje.c.forEach(o => this.render(gl, o, matrix, cameraMatrix));
    }
}
