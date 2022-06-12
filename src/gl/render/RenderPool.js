import { SceneObject } from "../scene/SceneObject.js";

/**
 * 渲染池
 * 管理渲染列表
 * (此类基于webgl渲染)
 */
export class RenderPool
{
    /**
     * @type {Array<SceneObject | Array<SceneObject>>}
     */
    rList = [];
}