# Structure Engine 项目结构说明
本项目使用的开发语言
- JavaScript
- Rust

构建项目使用的工具
- npm包
    - rollup
- cargo包
    - wasm-pack

# 此项目的当前状态

- TODO
    - 紧急的

    - 活动的(当前)
        - 重构渲染结构 将渲染相关完全移到渲染类
        - 将所有渲染封装到渲染类 而不是相机和灯光中
        - 添加骨骼
        - 更新项目结构描述
        - 优化渲染
        - 添加屏幕空间环境光遮蔽

    - 重要的
        - 绘制gui
        - 渲染流程封装类
        - 将面信息中的标志从场景中的物体对象移动至渲染类

    - 循环(定期)
        - 优化项目结构

    - 未来
        - 将游戏逻辑允许移动到worker线程


# 此项目的结构

- 源码 - src/
    - 处理用户操作 - controller/
        - 预设操作处理 - preset/
            - 键盘操作移动 - keyboardWASD.js
            - 鼠标转动相机 - mouseRotating.js
        - 键盘操作 - keyboard.js
        - 键盘操作的封装类 - KeyboardMap.js
        - 键盘对应表 - keyboardTable.js
        - 按键数据类 - keyData.js.js
        - 鼠标操作 - mouse.js
        - 指针数据类 - pointerData.js
        - 触摸操作 - touch.js
    - 处理图形 - gl/
        - 相机 - camera/
            - 相机类 - Camera.js
        - 初始化 - init/
            - 初始化上下文 - initContext.js
            - 初始化着色器 - initShader.js
        - 物体(模型) - object/
            - mtl材质文件类 - MtlC.js
            - mtl中单个材质信息类 - MtlCMaterial.js
            - obj模型文件类 - ObjC.js
            - ObjC中的一组面类 - ObjCFaces.js
        - 渲染 - render/
            - 渲染器类 - Render.js
            - 渲染池类 - RenderPool.js
            - 渲染工具函数 - renderUtil.js
        - 场景 - scene/
            - SceneObject的面数据类 - ObjFaces.js
            - 场景类 - Scene.js
            - 场景内的物体类 - SceneObject.js
        - 着色器 - shader/
            - 着色器生成器 - generator/
                - glsl着色器生成器 - GlslGenerator.js
                - glsl着色器生成器的片段封装 - GlslGenParam.js
                - 着色器运算符 - ShaderOperate.js
                - 着色器部分 - ShaderPart.js
            - 预设着色器 - preset/
                - 生成相机着色器 - genCameraShader.js
            - glsl着色器封装类 - glslProgram.js
            - 着色器组类 - ProgramGroup.js
        - 形状 - shape/
            - 正方体 - cube.js
            - 正方形 - square.js
        - 纹理 - texture/
            - 渲染到纹理 - Render2Texture.js
            - 纹理类 - Texture.js
            - 纹理表类 - TextureTable.js
        - 操作界面 - ui/
            - 用户界面类(管理gui树) - GUI.js
            - gui树中的元素 - GUIObject.js
        - 工具 - util/
            - 数学 - math.js
        - 灯光类 - Light.js
        - 此引擎的上下文类 - SEContext.js
    - 管理场景 - manager/
        - worker线程(详见下方) - worker/
        - 场景管理(与worker通信) - Manager.js
        - 平滑运动 - SmoothMove.js
    - 数学 - math/
        - 4*4矩阵 - Mat4.js
        - 四元数 - Quaternion.js.js
        - 3轴向量 - Vec3.js
        - 4轴向量 - Vec4.js
    - 实用工具函数和类 - util/
        - 管理回调 - callbackHandler.js
        - 遍历数组 - forEach.js
    - 索引 - index.js
    - 此引擎的有关信息(版本号等) - infoObj.js

- worker线程 - src/manager/worker/
    - 处理物理模拟 - phy/
        - 物理引擎接口封装 phyInterface/
            - 刚体类 - RigidBody.js
            - 世界类 - World.js
        - 场景封装 - Scene.js
        - 场景中的物体封装 - SceneObject.js
    - worker线程主程序 - worker.js


# 渲染流程

## 图像的原始渲染
(此部分与项目不同步 需要更新)
由相机类完成
- 相机 - src/gl/Camera.js
    - 调用 draw 方法 (绘制图像)
        - 更新矩阵
        - 清除画布
        - 计算相机矩阵
        - 设置着色器
        - 调用 render 方法 (执行递归渲染)
            - 检测 视锥剔除 和 遮挡剔除 如果通过
                - 绘制面
                    - 设置物体的世界矩阵
                    - 绑定纹理
                    - 绑定顶点数组
                    - 绘制数据
            - 遍历 子节点 递归调用 render 方法

## 灯光阴影贴图渲染
由灯光类完成
- 灯光 - src/gl/Light.js
    - 调用 renderShadow 方法 (绘制阴影贴图)
        - 更新矩阵
        - 切换帧缓冲区以渲染到纹理
        - 清除画布
        - 设置着色器
        - 调用 render 方法 (执行递归渲染)
            - 绘制面
                - 设置物体的世界矩阵
                - 绑定顶点数组
                - 绘制数据
            - 遍历 子节点 递归调用 render 方法

## 渲染流程(渲染与后期)
由渲染流程封装类完成
- 渲染流程 - 还没写


# 渲染线程与worker线程通信协议
- 渲染线程 -> worker
    - isReady
        - 作为worker发送的isReady的回应
    - objects 一个数组
        - 一个对象
            - 添加物体到worker中
        - 一个数组 长度为8
            - 修改物体的位置角度
        - 一个数组 长度为4
            - 设置物体的力
- worker -> 渲染进程
    - isReady
        - 当worker初始化完成后发送
    - objects 一个数组
        - 一个数组 长度为8
            - 传递物体的位置角度数据

# 坐标规范
x z 水平坐标轴   
y 垂直坐标轴   
下图中的方向为角度为0时的坐标轴方向
```
    | y
    |
    |
    |
    .-------- x
   /
  /
 / z
```
默认情况下   
所有 相机 物体 灯光 的朝向为z轴负方向   

# glsl着色器规范
- 相机着色器
    - 顶点着色器
        - in变量
            - vec4 a_position
                - 原始坐标 (必须) Location=0
            - vec2 a_texcoord
                - 纹理坐标 Location=1
            - vec3 a_normal
                - 原始法线 Location=2
        - uniform变量
            - mat4 u_cameraMatrix
                - 相机(包括投影投影)矩阵 (必须)
            - mat4 u_worldMatrix
                - 世界矩阵 (必须)
        - out变量
            - 同片段着色器的in变量
    - 片段着色器
        - in变量
            - vec3 v_normal
                - 法线
            - vec3 v_thisPos
                - 顶点的世界坐标
            - vec2 v_texcoord
                - 纹理坐标
        - uniform变量
            - sampler2D u_texture
                - 颜色纹理
            - vec3 u_viewPos
                - 视点(相机)的世界坐标
            - vec3 u_markColor
                - (默认未启用)标记颜色(调试)

# glsl着色器生成器规范
- glsl着色器生成
    - 顶点着色器
        - 计算 屏幕空间顶点坐标
        - 计算 纹理坐标
        - 计算 世界空间顶点坐标
        - 计算 不包含位移的世界矩阵
        - 计算 法线向量(世界空间)
    - 片段着色器
        - 计算 归一化的法线向量(世界空间)
        - 定义 光的总影响(float)
        - 循环遍历 每个灯光
            - 计算 光照与阴影 得到 当前灯光的贡献
            - 将 当前灯光的贡献 加到 光的总影响
        - 设置 输出颜色不透明通道为1.0
        - 计算 纹理颜色 乘以 光的总影响 得到 输出颜色


# 此项目的使用
    处理游戏逻辑 - 用户实现(在渲染线程中)


# 此项目使用的库
- 库 - lib/
    - 使用了ammo.js库以使用bullet作为物理库 - ammojs/
        - https://github.com/kripken/ammo.js