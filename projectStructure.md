# Structure Engine 项目结构说明

# 此项目的当前状态

- TODO
    - 紧急的

    - 活动的(当前)
        - 制作光的阴影

    - 重要的

    - 循环(定期)
        - 优化项目结构

    - 未来
        - 将游戏逻辑移动到worker线程


# 此项目的结构

- 源码 - src/
    - 处理用户操作 - controller
        - 处理键盘操作 - keyboard.js
        - 处理鼠标操作 - mouse.js
        - 处理触摸操作 - touch.js
    - 执行渲染 - gl
        - 初始化 - init/
            - 初始化上下文 - initContext.js
        - 物体(模型) - object/
            - mtl材质文件类 - MtlC.js
            - mtl中单个材质信息类 - MtlCMaterial.js
            - obj模型文件类 - ObjC.js
            - ObjC中的一组面类 - ObjCFaces.js
        - 场景 - scene/
            - SceneObject的面数据类 - ObjFaces.js
            - 场景类 - Scene.js
            - 场景内的物体类 - SceneObject.js
        - 着色器 - shader/
            - glsl着色器类 - glslProgram.js
        - 形状 - shape/
            - 正方体 - cube.js
        - 纹理 - texture/
            - 渲染到纹理 - Render2Texture.js
            - 纹理类 - Texture.js
        - 工具 - util/
            - 数学 - math.js
        - 相机类 - Camera.js
        - 灯光类 - Light.js
        - 此引擎的上下文类 - SEContext.js
        - 全局状态 - state.js
    - 管理场景(与worker通信) - manager
        - worker线程(详见下方) - worker/
        - 场景管理(与worker通信) - manager.js
    - 数学 - math
        - 4*4矩阵 - m4.js
        - 4向量 - v4.js
    - 工具 - util
        - 管理回调 - callbackHandler.js
        - 遍历数组 - forEach.js
    - 索引 - index.js

- worker线程 - src/manager/worker/
    - 处理物理模拟 - Bullet/
        - 场景封装 - Scene.js
        - 场景中的物体封装 - SceneObject.js
    - worker线程主程序 - worker.js


# 渲染线程与worker线程通信协议
- 渲染线程 -> worker
    - isReady
        - 作为worker发送的isReady的回应
    - objects
        - 添加物体到worker中
- worker -> 渲染进程
    - isReady
        - 当worker初始化完成后发送
    - objects
        - 传递物体的位置角度等数据


# 此项目的使用
    处理游戏逻辑 - 用户实现(在渲染线程中)


# 此项目使用的库
- 库 - lib/
    - 使用了ammo.js库以使用bullet作为物理库 - ammojs/
        - https://github.com/kripken/ammo.js