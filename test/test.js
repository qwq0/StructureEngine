/**
 * 此文件为测试文件
 * 非项目示例
 * @file 测试文件
 */
import { keyboardBind } from "../src/controller/keyboard.js";
import { touchBind } from "../src/controller/touch.js";
import { degToRad } from "../src/gl/util/math.js";
import { Camera, create_cube, initContext, Scenes, Texture } from "../src/index.js";
import { Manager } from "../src/manager/manager.js";

var canvas = document.body.appendChild(document.createElement("canvas"));
canvas.style.position = "fixed";
canvas.style.left = "0px";
canvas.style.top = "0px";
canvas.style.width = "100%";
canvas.style.height = "100%";

var gl = initContext(canvas);
var scenes = new Scenes(gl);
var camera = new Camera(scenes);
var keyMap = new Map();
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
        camera.y += timeChange * speed;
    if (keyMap.get("n"))
        camera.y -= timeChange * speed;
    camera.draw();
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);


let cubeF = create_cube(gl, new Texture(gl, "./cube.png"));
cubeF.sx = 16;
cubeF.y = -10;
cubeF.sz = 16;
scenes.obje.c.push(cubeF);
let cube0 = create_cube(gl, new Texture(gl, "./WoodFloor045_1K_Color.jpg"));
cube0.x = 0;
cube0.y = 9;
cube0.z = 0;
scenes.obje.c.push(cube0);

function mousemove(e)
{
    var rx = camera.rx - (e.movementY * 0.005);
    var ry = camera.ry - (e.movementX * 0.005);
    if (rx < degToRad * -90)
        rx = degToRad * -90;
    if (rx > degToRad * 90)
        rx = degToRad * 90;
    if (ry < degToRad * -180)
        ry = degToRad * 180;
    if (ry > degToRad * 180)
        ry = degToRad * -180;
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
            camera.fov = degToRad * 30;
        else
            camera.fov = degToRad * 90;
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

var man = new Manager();

man.woker.addEventListener("message", (e) =>
{
    var data = e.data;
    if (data.objects)
    {
        var info = data.objects[0];
        // console.log(info);
        cube0.x = info[0];
        cube0.y = info[1];
        cube0.z = info[2];
        cube0.rx = info[3];
        cube0.ry = info[4];
        cube0.rz = info[5];
        cube0.rw = info[6];
    }
    else if (data.isReady)
        man.woker.postMessage(1);
    else
        console.log(e);
});

// debug
window["screenObj"] = scenes;
window["camera"] = camera;