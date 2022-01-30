/**
 * 此文件在worker中
 */
import { Ammo } from "../../lib/ammojs/ammo.wasm.js";
import { v4 } from "../matrix/v4.js";

Ammo(null, "../../lib/ammojs/ammo.wasm").then(function (Ammo)
{
    var NUM = 1, NUMRANGE = [null];

    // Bullet接口代码

    var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // 内存检查与初始化
    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration); // 处理碰撞
    var overlappingPairCache = new Ammo.btDbvtBroadphase(); // 处理aabb包围体
    var solver = new Ammo.btSequentialImpulseConstraintSolver(); // 投影高斯赛德尔迭代(LCP迭代)方法的快速SIMD实现
    var dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration); // 处理离散刚体模拟(刚体世界)
    dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0)); // 设置重力

    var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(8, 0.5, 8)); // 地板大小(边长的一半)

    var bodyArray = [];

    var groundTransform = new Ammo.btTransform(); // 转换 仅具有平移和旋转且没有缩放,剪切的刚性变换
    groundTransform.setIdentity(); // 将此转换设置为标识
    groundTransform.setOrigin(new Ammo.btVector3(0, -10, 0)); // 设置坐标

    (function ()
    {
        var mass = 0; // 质量
        var localInertia = new Ammo.btVector3(0, 0, 0); // 局部惯性
        var myMotionState = new Ammo.btDefaultMotionState(groundTransform); // 默认运动状态
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, groundShape, localInertia); // 刚体结构信息
        var body = new Ammo.btRigidBody(rbInfo); // 生成刚体

        dynamicsWorld.addRigidBody(body); // 添加刚体到世界
        bodyArray.push(body); // 放入列表
    })();

    var boxShape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5)); // 立方体大小(边长的一半)

    function resetPositions() // 重置坐标
    {
        var i = 1;
        var body = bodyArray[i++];
        var transform = body.getWorldTransform();
        var origin = transform.getOrigin();
        origin.setX(0);
        origin.setY(9);
        origin.setZ(0);
        body.activate();
        var rotation = transform.getRotation();
        var quat = v4.Euler2Quaternion(10, 0.5, 10);
        rotation.setX(quat.x)
        rotation.setY(quat.y);
        rotation.setZ(quat.z);
        rotation.setW(quat.w);
        transform.setRotation(rotation);
    }

    function startUp() // 初始化
    {
        NUMRANGE.forEach(function (i)
        {
            var startTransform = new Ammo.btTransform(); // 转换 仅具有平移和旋转且没有缩放,剪切的刚性变换
            startTransform.setIdentity(); // 将此转换设置为标识
            var mass = 1; // 质量
            var localInertia = new Ammo.btVector3(0, 0, 0); // 局部惯性
            boxShape.calculateLocalInertia(mass, localInertia); // 计算惯性

            var myMotionState = new Ammo.btDefaultMotionState(startTransform); // 默认运动状态
            var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, boxShape, localInertia); // 刚体结构信息
            var body = new Ammo.btRigidBody(rbInfo); // 生成刚体

            dynamicsWorld.addRigidBody(body); // 添加刚体到世界
            bodyArray.push(body); // 放入列表
        });

        resetPositions(); // 设置坐标
    }

    var transform = new Ammo.btTransform(); // 转换 仅具有平移和旋转且没有缩放,剪切的刚性变换 // taking this out of readBulletObject reduces the leaking

    function readBulletObject(i, object) // 读取Bullet中的物体信息
    {
        var body = bodyArray[i];
        body.getMotionState().getWorldTransform(transform);
        var origin = transform.getOrigin(); // 位置坐标
        object[0] = origin.x();
        object[1] = origin.y();
        object[2] = origin.z();
        var rotation = transform.getRotation(); // 四元数角度
        object[3] = rotation.x();
        object[4] = rotation.y();
        object[5] = rotation.z();
        object[6] = rotation.w();
    }

    var nextTimeToRestart = 0;
    function timeToRestart() // 是否重置
    { // restart if at least one is inactive - the scene is starting to get boring
        if (nextTimeToRestart)
        {
            if (Date.now() >= nextTimeToRestart)
            {
                nextTimeToRestart = 0;
                return true;
            }
            return false;
        }
        for (var i = 1; i <= NUM; i++) // 遍历每个小方块
        {
            var body = bodyArray[i];
            if (!body.isActive()) // 小方块不再运动
            {
                nextTimeToRestart = Date.now() + 1000; // add another second after first is inactive
                break;
            }
        }
        return false;
    }

    var meanDt = 0, meanDt2 = 0, frame = 1;

    function simulate(dt) // 模拟
    {
        dt = dt || 1;

        dynamicsWorld.stepSimulation(dt, 2);

        var alpha;
        if (meanDt > 0)
        {
            alpha = Math.min(0.1, dt / 1000);
        } else
        {
            alpha = 0.1; // first run
        }
        meanDt = alpha * dt + (1 - alpha) * meanDt;

        var alpha2 = 1 / frame++;
        meanDt2 = alpha2 * dt + (1 - alpha2) * meanDt2;

        var data = { objects: [], currFPS: Math.round(1000 / meanDt), allFPS: Math.round(1000 / meanDt2) };

        // Read bullet data into JS objects
        for (var i = 0; i < NUM; i++)
        {
            var object = [];
            readBulletObject(i + 1, object);
            data.objects[i] = object;
        }

        postMessage(data);

        if (timeToRestart()) resetPositions();
    }

    var interval = null;

    onmessage = function (event) // 接受来自主线程的信息
    {
        // 初始化数组
        NUM = event.data;
        NUMRANGE.length = 0;
        while (NUMRANGE.length < NUM) NUMRANGE.push(NUMRANGE.length + 1);

        frame = 1;
        meanDt = meanDt2 = 0;

        startUp(); // 初始化

        var last = Date.now();
        function mainLoop() // 主循环
        {
            var now = Date.now();
            simulate(now - last);
            last = now;
        }
        if (interval) clearInterval(interval);
        interval = setInterval(mainLoop, 1000 / 60);
    }
    postMessage({ isReady: true }); // 发送准备信息
});