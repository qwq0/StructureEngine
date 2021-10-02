import { touchBind } from "../src/controller/touch.js";
import { degToRad } from "../src/gl/util/math.js";
import { Camera, create_cube, initContext, Scenes, Texture } from "../src/index.js";

var canvas = document.body.appendChild(document.createElement("canvas"));
canvas.style.position = "fixed";
canvas.style.left = "0px";
canvas.style.top = "0px";
canvas.style.width = "100%";
canvas.style.height = "100%";

var gl = initContext(canvas);
var scenes = new Scenes();
var camera = new Camera(scenes, gl);
var keyMap = new Map();
var lastTimeStamp = 0;
var speed = 0.1;
function draw(timeStamp)
{
    lastTimeStamp = timeStamp;
    if (keyMap.get("w"))
    {
        camera.x -= Math.sin(camera.ry) * speed;
        camera.z -= Math.cos(camera.ry) * speed;
    }
    if (keyMap.get("s"))
    {
        camera.x += Math.sin(camera.ry) * speed;
        camera.z += Math.cos(camera.ry) * speed;
    }
    if (keyMap.get("a"))
    {
        camera.x -= Math.cos(camera.ry) * speed;
        camera.z += Math.sin(camera.ry) * speed;
    }
    if (keyMap.get("d"))
    {
        camera.x += Math.cos(camera.ry) * speed;
        camera.z -= Math.sin(camera.ry) * speed;
    }
    if (keyMap.get(" "))
        camera.y += speed;
    if (keyMap.get("n"))
        camera.y -= speed;
    camera.draw();
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

var tex = new Texture(gl, "./cube.png");
var cubeCount = 0;
for (var x = -2; x < 3; x++)
    for (var y = -2; y < 3; y++)
        for (var z = -2; z < 3; z++)
        {
            let cube = create_cube(gl, tex);
            cube.x = x * 2;
            cube.y = y * 2;
            cube.z = z * 2;
            scenes.obje.c.push(cube);
            cubeCount++;
        }
console.log("cube count:", cubeCount);


function mousemove(e)
{
    var rx = camera.rx - e.movementY * 0.008;
    var ry = camera.ry - e.movementX * 0.008;
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
window.addEventListener("keydown", e => keyMap.set(e.key, true));
window.addEventListener("keyup", e => keyMap.set(e.key, false));


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


// debug
window.screenObj = scenes;
window.camera = camera;