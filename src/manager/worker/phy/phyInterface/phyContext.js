import { Ammo } from "../../../../../lib/ammojs/ammo.js";

export var phyCt = {
    /** @type {typeof Ammo} */
    Ammo: null
};

/**
 * 初始化物理引擎并返回上下文
 * 此函数应仅调用一次
 * @async
 * @returns {Promise<typeof Ammo>}
 */
export function getPhyCt()
{
    return (new Promise((resolve, rejeck) =>
    {
        Ammo(null, "../../../lib/ammojs/ammo.wasm").then(function (Ammo)
        {
            resolve(phyCt.Ammo = Ammo);
        });
    }));
}