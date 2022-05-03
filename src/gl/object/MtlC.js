import { MtlCMaterial } from "./MtlCMaterial.js";

/**
 * 对mtl文件的封装
 */
export class MtlC
{
    /**
     * 材质map
     * @type {Map<string, MtlCMaterial>}
     */
    materialMap = new Map();

    /**
     * 从mtl字符串解析
     * @param {string} srcStr
     * @param {string} [folderPath]
     * @returns {MtlC}
     */
    static fromString(srcStr, folderPath = "")
    {
        var ret = new MtlC();
        var arr = srcStr.split("\n");

        /**
         * 解析贴图指令的参数
         * @todo 处理可选项参数
         * @param {Array<string>} args
         * @returns {string}
         */
        function parseMapArgs(args)
        {
            return args.join(" ");
        }

        /**
         * 当前材质
         * @type {MtlCMaterial}
         */
        var material = null;
        for (var oInd = 0; oInd < arr.length; oInd++)
        {
            var oStr = arr[oInd].trim();
            if (oStr == "" || oStr[0] == "#")
                continue;
            var parts = oStr.split(/\s+/);
            var type = parts.shift();

            switch (type)
            {
                case "newmtl": // 定义新材质
                    material = new MtlCMaterial();
                    ret.materialMap.set(parts[0], material);
                    break;
                case "Ns": // 镜面反射度
                    material.shininess = parseFloat(parts[0]);
                    break;
                case "Ka": // 环境色
                    material.ambient = parts.map(parseFloat);
                    break;
                case "Kd": // 漫反射色
                    material.diffuse = parts.map(parseFloat);
                    break;
                case "Ks": // 高光色
                    material.specular = parts.map(parseFloat);
                    break;
                case "Ke": // 发光色
                    material.emissive = parts.map(parseFloat);
                    break;
                case "Ni": // 光密度
                    material.opticalDensity = parseFloat(parts[0]);
                    break;
                case "d": // 透明度(不透明度)
                    material.opacity = parseFloat(parts[0]);
                    break;
                case "illum": // 照明类型
                    material.illum = parseInt(parts[0]);
                    break;
                case "map_Kd": // 漫反射颜色贴图
                    material.diffuseMap = folderPath + parseMapArgs(parts);
                    break;
                case "map_Ns": // 镜面反射度标量贴图
                    material.specularMap = folderPath + parseMapArgs(parts);
                    break;
                case "map_Bump": // 凹凸贴图(法线贴图)
                    material.normalMap = folderPath + parseMapArgs(parts);
                    break;
                default:
                    console.warn("unhandled type in mtl:", type);
            }
        };

        return ret;
    }
}