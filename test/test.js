/**
 * 此文件为测试文件
 * 非项目示例
 * @file 测试文件
 */
import { degToRad } from "../src/gl/util/math.js";
import { Manager } from "../src/manager/manager.js";
import { create_cube, initContext, Texture, ObjC, touchBind, KeyboardMap } from "../src/index.js";
import { Light } from "../src/gl/Light.js";
import { create_square } from "../src/gl/shape/square.js";
import { m4 } from "../src/math/m4.js";
import { TextureTable } from "../src/gl/texture/TextureTable.js";


(async function ()
{
    /* 初始化 */
    var canvas = document.body.appendChild(document.createElement("canvas"));
    canvas.style.position = "fixed";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    /* 显示调试信息 */
    var debugDiv = document.body.appendChild(document.createElement("div"));
    debugDiv.style.position = "fixed";
    debugDiv.style.left = "0px";
    debugDiv.style.top = "0px";
    var fpsCount = 0;
    setInterval(() =>
    {
        debugDiv.innerText = ([
            "fps: " + fpsCount,
            "cameraPos: " + camera.x.toFixed(2) + ", " + camera.y.toFixed(2) + ", " + camera.z.toFixed(2),
        ]).join("\n");
        fpsCount = 0;
    }, 1000);

    /* 创建场景和相机等 */
    var ct = initContext(canvas);
    var scene = ct.createScene();
    var camera = scene.createCamera();
    var keyMap = new KeyboardMap();
    var manager = new Manager();
    var texTab = new TextureTable(ct.gl);
    await manager.waitInit();
    var lastTimeStamp = 0;
    var speed = 0.01;

    var light = new Light(scene);
    camera.lights.push(light);

    /**
     * 绘制函数 每帧调用
     * @param {number} timeStamp 
     */
    function draw(timeStamp)
    {
        var timeChange = timeStamp - lastTimeStamp;
        lastTimeStamp = timeStamp;
        fpsCount++;

        if (keyMap.get("Shift"))
            speed = 0.03;
        else
            speed = 0.01;
        if (keyMap.get("w"))
        {
            camera.x -= timeChange * Math.sin(camera.ry) * speed;
            camera.z -= timeChange * Math.cos(camera.ry) * speed;
        }
        if (keyMap.get("s"))
        {
            camera.x += timeChange * Math.sin(camera.ry) * speed;
            camera.z += timeChange * Math.cos(camera.ry) * speed;
        }
        if (keyMap.get("a"))
        {
            camera.x -= timeChange * Math.cos(camera.ry) * speed;
            camera.z += timeChange * Math.sin(camera.ry) * speed;
        }
        if (keyMap.get("d"))
        {
            camera.x += timeChange * Math.cos(camera.ry) * speed;
            camera.z -= timeChange * Math.sin(camera.ry) * speed;
        }
        if (keyMap.get(" "))
        {
            camera.y += timeChange * speed;
        }
        if (keyMap.get("n"))
        {
            camera.y -= timeChange * speed;
        }

        if (window.lock) // 将灯光锁定到相机位置
            light.cMat = m4.perspective(camera.fov, camera.gl.canvas.clientHeight / camera.gl.canvas.clientWidth, camera.near, camera.far). // 透视投影矩阵
                rotateXYZ(-camera.rx, -camera.ry, -camera.rz). // 反向旋转
                translation(-camera.x, -camera.y, -camera.z); // 反向平移
        light.renderShadow();

        ct.clearFramebuffer();
        camera.draw();

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    /* 向场景添加物体 */

    let square = create_square(ct.gl, light.shadowTex.depthTex);
    square.sx = 64;
    square.sy = 64;
    square.z = 100;
    scene.addChild(square);

    let cubeF = create_cube(ct.gl, texTab.fromUrl("./cube.png"));
    cubeF.id = "cubeF";
    cubeF.sx = 16;
    cubeF.y = -10;
    cubeF.sz = 16;
    scene.addChild(cubeF);
    manager.addCube(cubeF, 0);

    let cube0 = create_cube(ct.gl, texTab.fromUrl("./WoodFloor045_1K_Color.jpg"));
    cube0.id = "cube0";
    cube0.x = 0;
    cube0.y = 9;
    cube0.z = 0;
    scene.addChild(cube0);
    manager.addCube(cube0, 1);

    for (let x = 0; x < 10; x += 3)
        for (let y = 0; y < 10; y += 3)
            for (let z = 0; z < 10; z += 3)
            {
                let cube = create_cube(ct.gl, texTab.fromUrl("./WoodFloor045_1K_Color.jpg"));
                cube.id = "cube" + x + "," + z;
                cube.x = x;
                cube.y = y;
                cube.z = z + 10;
                //let quat = v4.Euler2Quaternion(0.5, 0, 0);
                //cube.rx = quat.x;
                //cube.ry = quat.y;
                //cube.rz = quat.z;
                //cube.rw = quat.w;
                scene.addChild(cube);
                // manager.addCube(cube, 1);
            }
    {
        let objObj = await ObjC.fromWavefrontObj(await (await fetch("./yunjin/yunjin.obj")).text(), "./yunjin/");
        let obj = objObj.createSceneObject(ct.gl);
        obj.id = "yunjin";
        scene.addChild(obj);
    }
    {
        let objObj = await ObjC.fromWavefrontObj(await (await fetch("./ying/ying.obj")).text(), "./ying/");
        let obj = objObj.createSceneObject(ct.gl);
        obj.id = "ying";
        obj.x = 15;
        scene.addChild(obj);
    }
    //scene.obje.x = scene.obje.z = camera.x = camera.z = 100000;


    /* 添加输入响应处理 */

    keyMap.bind("c", e =>
    {
        if (e.hold)
            camera.fov = degToRad * 80;
        else
            camera.fov = degToRad * 125;
    });

    /**
     * @param {{ movementY: number, movementX: number }} e
     */
    function mousemove(e)
    {
        var rx = camera.rx - (e.movementY * 0.005);
        var ry = camera.ry - (e.movementX * 0.005);
        if (rx < degToRad * -90)
            rx = degToRad * -90;
        else if (rx > degToRad * 90)
            rx = degToRad * 90;
        if (ry < degToRad * -360)
            ry += degToRad * 720;
        else if (ry > degToRad * 360)
            ry += degToRad * -720;
        camera.rx = rx;
        camera.ry = ry;
    }
    canvas.addEventListener("click", () =>
    {
        canvas.requestPointerLock();
    });
    document.addEventListener("pointerlockchange", () =>
    {
        if (document.pointerLockElement === canvas)
            document.addEventListener("mousemove", mousemove, false);
        else
            document.removeEventListener("mousemove", mousemove, false);
    }, false);
    touchBind(canvas, e => mousemove({
        movementY: e.vy,
        movementX: e.vx
    }));


})();