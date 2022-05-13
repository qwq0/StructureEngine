/**
 * 此文件为测试文件
 * 非项目示例
 * @file 测试文件
 */
import { keyboardBind } from "../src/controller/keyboard.js";
import { touchBind } from "../src/controller/touch.js";
import { ObjC } from "../src/gl/object/ObjC.js";
import { degToRad } from "../src/gl/util/math.js";
import { create_cube, initContext, Texture } from "../src/index.js";
import { Manager } from "../src/manager/manager.js";
import { debugObj } from "../src/tools/debugObj.js";


(async function ()
{
    var canvas = document.body.appendChild(document.createElement("canvas"));
    canvas.style.position = "fixed";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    var debugDiv = document.body.appendChild(document.createElement("div"));
    debugDiv.style.position = "fixed";
    debugDiv.style.left = "0px";
    debugDiv.style.top = "0px";
    var fpsCount = 0;
    var cullCount = 0;
    setInterval(() =>
    {
        debugDiv.innerText = ([
            "fps: " + fpsCount,
            "cullCount: " + debugObj.cullCount,
        ]).join("\n");
        fpsCount = 0;
    }, 1000);

    var ct = initContext(canvas);
    var scene = ct.createScene();
    var camera = scene.createCamera();
    var keyMap = new Map();
    var manager = new Manager();
    await manager.waitInit();
    var lastTimeStamp = 0;
    var speed = 0.01;

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
            speed = 0.02;
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

        camera.draw();

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);


    let cubeF = create_cube(ct.gl, new Texture(scene.gl, "./cube.png"));
    cubeF.id = "cubeF";
    cubeF.sx = 16;
    cubeF.y = -10;
    cubeF.sz = 16;
    scene.addChild(cubeF);
    manager.addCube(cubeF, 0);
    let cube0 = create_cube(ct.gl, new Texture(scene.gl, "./WoodFloor045_1K_Color.jpg"));
    cube0.id = "cube0";
    cube0.x = 0;
    cube0.y = 9;
    cube0.z = 0;
    scene.addChild(cube0);
    manager.addCube(cube0, 1);
    for (let x = 0; x < 100; x += 3)
        for (let z = 0; z < 100; z += 3)
        {
            let cube = create_cube(ct.gl, scene.idMap.get("cube0").faces.tex);
            cube.id = "cube" + x + "," + z;
            cube.x = x;
            cube.y = 6;
            cube.z = z;
            scene.addChild(cube);
            // manager.addCube(cube, 1);
        }
    {
        let objObj = await ObjC.fromWavefrontObj(await (await fetch("./yunjin/yunjin.obj")).text(), "./yunjin/");
        let obj = objObj.createSceneObject(ct.gl, cube0.program);
        obj.id = "yunjin";
        scene.addChild(obj);
    }
    {
        let objObj = await ObjC.fromWavefrontObj(await (await fetch("./ying/ying.obj")).text(), "./ying/");
        let obj = objObj.createSceneObject(ct.gl, cube0.program);
        obj.id = "ying";
        obj.x = 15;
        scene.addChild(obj);
    }
    //scene.obje.x = scene.obje.z = camera.x = camera.z = 100000;

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

    keyboardBind(document.body, e =>
    {
        if (e.hold)
            keyMap.set(e.key, true);
        else
            keyMap.set(e.key, false);
        if (e.key == "c")
        {
            if (e.hold)
                camera.fov = degToRad * 80;
            else
                camera.fov = degToRad * 125;
        }
    })


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