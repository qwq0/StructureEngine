/**
 * MtlC类中的单个材质的封装
 */
export class MtlCMaterial
{
    /**
     * 镜面反射度
     * @type {number}
     */
    shininess;

    /**
     * 环境色
     * @type {Array<number>}
     */
    ambient;

    /**
     * 漫反射色
     * @type {Array<number>}
     */
    diffuse;

    /**
     * 高光色
     * @type {Array<number>}
     */
    specular;

    /**
     * 发光色
     * @type {Array<number>}
     */
    emissive;

    /**
     * 光密度
     * @type {number}
     */
    opticalDensity;

    /**
     * 透明度(不透明度)
     * @type {number}
     */
    opacity;

    /**
     * 照明类型
     * @type {number}
     */
    illum;

    /**
     * 漫反射颜色贴图
     * @type {string}
     */
    diffuseMap;

    /**
     * 镜面反射度标量贴图
     * @type {string}
     */
    specularMap;

    /**
     * 法线贴图
     * @type {string}
     */
    normalMap;

}