/**
 * 此文件在worker中
 */
import { initAmmo, Scenes } from "./Bullet/Scenes.js";

(async function ()
{
    await initAmmo();

    /*
        使用Bullet接口
        Bullet的Api文档: https://pybullet.org/Bullet/BulletFull/
    */

    var interval = null; // 定时循环号

    onmessage = function (event) // 接受来自主线程的信息
    {
        var scenes = new Scenes();
        scenes.initScenes(); // 初始化

        var last = Date.now();
        function mainLoop() // 主循环
        {
            var now = Date.now();
            var info = scenes.simulate(now - last);
            if (info.objects.length > 0)
                postMessage(info);
            last = now;
        }
        if (interval) clearInterval(interval);
        interval = setInterval(mainLoop, 1000 / 60);
    }
    postMessage({ isReady: true }); // 发送已准备好信息
})();