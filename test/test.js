/**
 * 此文件为测试文件
 * 非项目示例
 * @file 测试文件
 */
import { degToRad } from "../src/gl/util/math.js";
import { Manager } from "../src/manager/Manager.js";
import { create_cube, initContext, ObjC, touchBind, KeyboardMap } from "../src/index.js";
import { Light } from "../src/gl/Light.js";
import { create_square } from "../src/gl/shape/square.js";
import { m4 } from "../src/math/m4.js";
import { TextureTable } from "../src/gl/texture/TextureTable.js";
import { mouseRotatingBind } from "../src/controller/preset/mouseRotating.js";
import { keyboardWASD } from "../src/controller/preset/keyboardWASD.js";


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
            "fps: " + Math.floor(fpsCount * (10 / 3)),
            "cameraPos: " + camera.x.toFixed(2) + ", " + camera.y.toFixed(2) + ", " + camera.z.toFixed(2),
        ]).join("\n");
        fpsCount = 0;
    }, 300);

    /* 创建场景和相机等 */
    var ct = initContext(canvas);
    var scene = ct.createScene();
    var camera = scene.createCamera();
    var keyMap = new KeyboardMap();
    var manager = new Manager();
    var texTab = new TextureTable(ct.gl);
    await manager.waitInit();
    var lastTimeStamp = 0;

    var light = new Light(scene);
    camera.lights.push(light);

    var wasdUpdate = keyboardWASD(camera);
    /**
     * 绘制函数 每帧调用
     * @param {number} timeStamp 
     */
    function draw(timeStamp)
    {
        var timeChange = timeStamp - lastTimeStamp;
        lastTimeStamp = timeStamp;
        fpsCount++;

        wasdUpdate(timeChange * 0.02 * (keyMap.get("Shift") ? 2.1 : 1));

        if (window.lock) // 将灯光锁定到相机位置
            light.cMat = m4.perspective(camera.fov, camera.gl.canvas.clientHeight / camera.gl.canvas.clientWidth, camera.near, camera.far). // 透视投影矩阵
                rotateXYZ(-camera.rx, -camera.ry, -camera.rz). // 反向旋转
                translation(-camera.x, -camera.y, -camera.z); // 反向平移
        //light.renderShadow();

        ct.clearFramebuffer();
        camera.draw();

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    scene.obje.setPosition(camera.x = 0, camera.y = 0, camera.z = 0);

    /* 向场景添加物体 */

    let square = create_square(ct.gl, light.shadowTex.depthTex);
    square.setScale(64, 64, 1);
    square.setPosition(0, 0, 100);
    scene.addChild(square);
    {
        let cubeF = create_cube(ct.gl, texTab.fromUrl("./cube.png"));
        cubeF.id = "cubeF";
        cubeF.setScale(16, 1, 16);
        cubeF.setPosition(0, -10, 0);
        scene.addChild(cubeF);
        manager.addCube(cubeF, 0);
    }
    {
        let cube0 = create_cube(ct.gl, texTab.fromUrl("./WoodFloor045_1K_Color.jpg"));
        cube0.id = "cube0";
        cube0.setPosition(0, 3, 0);
        scene.addChild(cube0);
        manager.addCube(cube0, 1);
    }
    {
        let cubeF = create_cube(ct.gl, texTab.fromUrl("./cube.png"));
        cubeF.id = "cubeF1";
        cubeF.setScale(30, 1, 30);
        cubeF.setPosition(15, -10, 25);
        scene.addChild(cubeF);
        manager.addCube(cubeF, 0);
    }
    for (let x = 0; x < 20; x += 3)
        for (let y = 0; y < 20; y += 3)
            for (let z = 0; z < 20; z += 3)
            {
                let cube = create_cube(ct.gl, texTab.fromUrl("./WoodFloor045_1K_Color.jpg"));
                cube.id = "cube" + x + "," + y + "," + z;
                cube.setPosition(x + 10, y, z + 20);
                //let quat = v4.Euler2Quaternion(0.5, 0, 0);
                //cube.rx = quat.x;
                //cube.ry = quat.y;
                //cube.rz = quat.z;
                //cube.rw = quat.w;
                scene.addChild(cube);
                manager.addCube(cube, 1);
            }
    (async () =>
    {
        let objObj = await ObjC.fromWavefrontObj(await (await fetch("./yunjin/yunjin.obj")).text(), "./yunjin/");
        let obj = objObj.createSceneObject(ct.gl);
        obj.id = "yunjin";
        scene.addChild(obj);
    })();
    (async () =>
    {
        let objObj = await ObjC.fromWavefrontObj(await (await fetch("./ying/ying.obj")).text(), "./ying/");
        let obj = objObj.createSceneObject(ct.gl);
        obj.id = "ying";
        obj.setPosition(15, 0, 0);
        scene.addChild(obj);
    })();


    /* 添加输入响应处理 */

    keyMap.bindDown("c", () => camera.fov = degToRad * 80);
    keyMap.bindUp("c", () => camera.fov = degToRad * 125);

    mouseRotatingBind(camera);

    {
        let LBDiv = document.body.appendChild(document.createElement("div"));
        LBDiv.style.position = "fixed";
        LBDiv.style.height = "0";
        LBDiv.style.width = "0";
        LBDiv.style.left = "0";
        LBDiv.style.bottom = "0";
        LBDiv.style.userSelect = "none";
        let RBDiv = document.body.appendChild(document.createElement("div"));
        RBDiv.style.position = "fixed";
        RBDiv.style.height = "0";
        RBDiv.style.width = "0";
        RBDiv.style.right = "0";
        RBDiv.style.bottom = "0";
        RBDiv.style.userSelect = "none";
        let addButton = (/** @type {HTMLDivElement} */ holder, /** @type {string} */ text,
            /** @type {string | number} */ x, /** @type {string | number} */ y, /** @type {string | number} */ w, /** @type {string | number} */ h,
            /** @type {Function} */ callback) =>
        {
            let button = holder.appendChild(document.createElement("div"));
            button.innerText = text;
            button.style.position = "absolute";
            button.style.left = x + "px";
            button.style.top = y + "px";
            button.style.width = w + "px";
            button.style.height = h + "px";
            button.style.lineHeight = h + "px";
            button.style.textAlign = "center";
            button.addEventListener("touchstart", () => { callback(true); });
            button.addEventListener("touchend", () => { callback(false); });
        };
        let triggerKeyboardEvent = (key, down) =>
        {
            let e = new KeyboardEvent((down ? "keydown" : "keyup"), { key: key });
            document.body.dispatchEvent(e);
        };
        let btSize = 50;
        addButton(LBDiv, "A", (0 + 1) * btSize, (-1 - 1) * btSize, btSize, btSize, down => triggerKeyboardEvent("A", down));
        addButton(LBDiv, "W", (1 + 1) * btSize, (-2 - 1) * btSize, btSize, btSize, down => triggerKeyboardEvent("W", down));
        addButton(LBDiv, "S", (1 + 1) * btSize, (-1 - 1) * btSize, btSize, btSize, down => triggerKeyboardEvent("S", down));
        addButton(LBDiv, "D", (2 + 1) * btSize, (-1 - 1) * btSize, btSize, btSize, down => triggerKeyboardEvent("D", down));
        addButton(RBDiv, "N", (-2 - 1) * btSize, (-1 - 1) * btSize, btSize, btSize, down => triggerKeyboardEvent("N", down));
        addButton(RBDiv, "_", (-1 - 1) * btSize, (-1 - 1) * btSize, btSize, btSize, down => triggerKeyboardEvent(" ", down));
        addButton(RBDiv, "c", (-2 - 1) * btSize, (-2 - 1) * btSize, btSize, btSize, down => triggerKeyboardEvent("C", down));
        addButton(RBDiv, "Shift", (-1 - 1) * btSize, (-2 - 1) * btSize, btSize, btSize, down => triggerKeyboardEvent("Shift", down));
    }
})();