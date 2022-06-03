import { GUIObject } from "./GUIObject.js";

/**
 * 用户界面
 * 此类用于渲染用户界面
 * 使用webgl直接绘制ui
 * 管理一个ui树
 */
export class GUI
{
    /**
     * @type {GUIObject}
     */
    obje = null;

    constructor()
    {
        this.obje = new GUIObject();
    }

    /**
     * 绘制界面
     */
    draw()
    {
        this.drawTr(this.obje);
    }

    /**
     * 遍历绘制ui树
     * @param {GUIObject} obje
     */
    drawTr(obje)
    {
        if (obje.c) // 递归子节点
            obje.c.forEach(o => this.drawTr(o));
    }
}