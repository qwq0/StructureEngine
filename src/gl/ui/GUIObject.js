/**
 * ui树中的元素
 */
export class GUIObject
{
    /** x轴坐标(单位:像素) @type {number} */
    x = 0;
    /** y轴坐标(单位:像素) @type {number} */
    y = 0;
    /** 宽(单位:像素) @type {number} */
    width = 0;
    /** 高(单位:像素) @type {number} */
    height = 0;
    /** x轴缩放倍数 @type {number} */
    sx = 1;
    /** y轴缩放倍数 @type {number} */
    sy = 1;

    /**
     * 绘制图像
     * 包括纹理信息和纹理坐标
     * x y 为起点纹理坐标
     * w h 为终端纹理坐标
     * @type {{
     *  tex: import("../texture/Texture").Texture,
     *  fx: number,
     *  fy: number,
     *  tx: number,
     *  ty: number
     * }}
     */
    img = null;

    /**
     * 子节点
     * @type {Array<GUIObject>}
     */
    c = null;

    /**
     * 添加子节点
     * @param {GUIObject} o
     */
    addChild(o)
    {
        if (!this.c)
            this.c = [];
        this.c.push(o);
    }
}