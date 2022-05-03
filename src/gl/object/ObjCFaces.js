/**
 * ObjC类中(相同材质的)一些面封装
 */
export class ObjCFaces
{
    /**
     * 顶点坐标
     * 每个顶点3个(1个向量)
     * 每个面9个(每个面3个顶点)
     * @type {Array<number>}
     */
    pos = [];

    /**
     * 纹理坐标
     * @type {Array<number>}
     */
    texPos = [];

    /**
     * 法线方向
     * @type {Array<number>}
     */
    norm = [];

    /**
     * 漫反射颜色贴图
     * @type {string}
     */
    tex = "";
}