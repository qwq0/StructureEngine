/*
    此文件在worker中
*/
import { getPhyCt } from "./phy/phyInterface/phyContext.js";
import { Scene } from "./phy/Scene.js";

(async function ()
{
    await getPhyCt();

    /**
     * 场景上下文
     * @type {Scene}
     */
    var scene = null;

    var timeoutId = null; // 定时循环编号
    function initLoop()
    {
        scene = new Scene();

        var last = Date.now();
        function mainLoop() // 主循环
        {
            var now = Date.now();
            var et = now - last;
            last = now;
            if (et > 0)
            {
                var info = scene.simulate(et);
                postMessage(info);
            }
            setTimeout(mainLoop, Math.floor((1000 / 60) * 2 - (et)));
        }
        if (timeoutId) clearInterval(timeoutId);
        timeoutId = setTimeout(mainLoop, Math.floor(1000 / 60));
    }

    onmessage = function (e) // 接受来自主线程的信息
    {
        var data = e.data;
        if (data.objects)
        {
            (/** @type {Array} */(data.objects)).forEach(o =>
            {
                if (Array.isArray(o))
                {
                    if (o.length == 8)
                        scene.getSceneObject(o[0]).setPosition(o[1], o[2], o[3], o[4], o[5], o[6], o[7]);
                    else if (o.length == 4)
                        scene.getSceneObject(o[0]).body.setLinearForce(o[1], o[2], o[3]);
                }
                else
                    scene.addCube(o.sn, o.x, o.y, o.z, o.mass, o.sx, o.sy, o.sz);
            });
        }
        else if (data.isReady)
            initLoop();
    }
    postMessage({ isReady: true }); // 发送已准备好信息
})();