/**
 * 此文件在worker中
 */
import { initAmmo, Scene } from "./Bullet/Scene.js";

(async function ()
{
    await initAmmo();

    /**
     * 场景上下文
     * @type {scene}
     */
    var scene = null;

    var interval = null; // 定时循环号
    function initLoop()
    {
        scene = new Scene();
        scene.initscene(); // 初始化

        var last = Date.now();
        function mainLoop() // 主循环
        {
            var now = Date.now();
            var info = scene.simulate(now - last);
            if (info.objects.length > 0)
                postMessage(info);
            last = now;
        }
        if (interval) clearInterval(interval);
        interval = setInterval(mainLoop, 1000 / 60);
    }

    onmessage = function (e) // 接受来自主线程的信息
    {
        var data = e.data;
        if (data.objects)
        {
            /**
             * @type {Array}
             */
            var objA = data.objects;
            for (var i = 0; i < objA.length; i++)
            {
                var o = objA[i];
                scene.addCube(o.sn, o.x, o.y, o.z, o.mass, o.sx, o.sy, o.sz);
            }
        }
        else if (data.isReady)
            initLoop();
    }
    postMessage({ isReady: true }); // 发送已准备好信息
})();