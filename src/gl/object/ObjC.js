import { v3, V3 } from "../../math/v3.js";
import { forEach } from "../../util/forEach.js";
import { ObjFaces } from "../scene/ObjFaces.js";
import { SceneObject } from "../scene/SceneObject.js";
import { Texture } from "../texture/Texture.js";
import { MtlC } from "./MtlC.js";
import { ObjCFaces } from "./ObjCFaces.js";

/**
 * 多顶点的物体模型封装
 * (对wavefrontObj的封装)
 */
export class ObjC
{
    /**
     * 顶点坐标数组
     * @type {Array<Array<number>>}
     */
    positions = [];

    /**
     * 纹理坐标数组
     * @type {Array<Array<number>>}
     */
    texcoords = [];

    /**
     * 法线方向数组
     * @type {Array<Array<number>>}
     */
    normals = [];

    /**
     * 面
     * @type {Array<ObjCFaces>}
     */
    faces = [];

    /**
     * 关联的mtl
     * @type {MtlC}
     */
    mtl = null;


    constructor()
    {
        // 由于WavefrontObj中索引从1开始所以将第0个位置占用
        this.positions.push([0, 0, 0]);
        this.normals.push([0, 0, 0]);
        this.texcoords.push([0, 0]);
    }

    /**
     * 以此模型创建物体
     * @returns {SceneObject}
     * @param {WebGL2RenderingContext} gl
     * @param {import("../shader/GlslProgram.js").GlslProgram} program
     */
    createSceneObject(gl, program)
    {
        var ret = new SceneObject();
        var texMap = new Map(); // 防止生成获取相同url的纹理
        forEach(this.faces, o =>
        {
            var obj = new SceneObject();
            if (!texMap.has(o.tex))
                texMap.set(o.tex, Texture.fromImage(gl, o.tex));
            obj.faces = new ObjFaces(o.pos, texMap.get(o.tex), o.texPos, o.norm);
            obj.faces.update(gl, obj.program = program);
            ret.addChild(obj);
        });
        return ret;
    }

    /**
     * 从WavefrontObj字符串解析
     * @param {string} srcStr
     * @param {string} [folderPath]
     * @returns {Promise<ObjC>}
     */
    static async fromWavefrontObj(srcStr, folderPath = "")
    {
        var ret = new ObjC();
        var arr = srcStr.split("\n");

        var faces = new ObjCFaces();

        /** @type {Map<number, v3>} */
        var defaultNormalMap = new Map();
        /** @type {Array<[number, number]>} */
        var defaultNormalList = [];
        /**
         * 添加面
         * @param {[string, string, string]} vert 三个顶点索引 每个顶点索引为一个包含多索引的字符串
         */
        function addFace(vert)
        {
            var positionsInd = [-1, -1, -1];
            /** @type {Array<v3>} */
            var positions = [null, null, null];
            var texcoords = [null, null, null];
            var normals = [null, null, null];
            for (var i = 0; i < 3; i++)
            {
                var parts = vert[i].split("/");
                if (parts[0]) // 顶点索引
                {
                    var objInd = parseInt(parts[0]);
                    positions[i] = V3(ret.positions[
                        positionsInd[i] = (objInd + (objInd >= 0 ? 0 : ret.positions.length))
                    ]);
                }
                else
                    positions[i] = new v3();
                if (parts[1]) // 纹理索引
                {
                    var objInd = parseInt(parts[1]);
                    texcoords[i] = ret.texcoords[objInd + (objInd >= 0 ? 0 : ret.texcoords.length)];
                }
                if (parts[2]) // 法线索引
                {
                    var objInd = parseInt(parts[2]);
                    normals[i] = ret.normals[objInd + (objInd >= 0 ? 0 : ret.normals.length)];
                }
            }
            var vec1 = positions[1].sub(positions[0]); // 三角形的一条边向量
            var vec2 = positions[2].sub(positions[1]); // 三角形的另一条边向量
            var defaultNormal = vec1.cross(vec2).normalize().mulNum(Math.PI - vec1.angleTo(vec2)); // 默认法线向量乘夹角作为倍率
            for (var i = 0; i < 3; i++)
            {
                if (positions[i])
                    faces.pos.push(positions[i].x, positions[i].y, positions[i].z);
                else
                    faces.pos.push(0, 0, 0);
                if (texcoords[i])
                    faces.texPos.push(...texcoords[i]);
                else
                    faces.texPos.push(0, 0);
                if (normals[i])
                    faces.norm.push(...normals[i]);
                else
                { // 缺省法线
                    var ind = positionsInd[i];
                    defaultNormalMap.set(ind,
                        defaultNormal.add(
                            defaultNormalMap.has(ind) ? defaultNormalMap.get(ind) : new v3()
                        )
                    );
                    defaultNormalList.push([faces.norm.length, ind]);
                    faces.norm.push(0, 0, 0);
                }
            }
        }
        /**
         * 设置缺省的法线
         */
        function setDefaultNormal()
        {
            forEach(defaultNormalList, o =>
            {
                var ind = o[0];
                var defaultNormal = defaultNormalMap.get(o[1]).normalize(); // 默认法线向量
                faces.norm[ind] = defaultNormal.x;
                faces.norm[ind + 1] = defaultNormal.y;
                faces.norm[ind + 2] = defaultNormal.z;
            });
            defaultNormalList.length = 0;
            defaultNormalMap.clear();
        }

        for (var oInd = 0; oInd < arr.length; oInd++)
        { // 解析单行指令
            var oStr = arr[oInd].trim();
            if (oStr == "" || oStr[0] == "#")
                continue;
            var parts = oStr.split(/\s+/);
            var type = parts.shift();

            switch (type)
            {
                case "v": // 顶点坐标
                    ret.positions.push(parts.slice(0, 3).map(parseFloat));
                    if (parts.length > 3) // 非标准情况 顶点声明中附带顶点颜色
                        console.warn("type v with color");
                    break;
                case "vt": // 纹理坐标
                    ret.texcoords.push(parts.map(parseFloat));
                    break;
                case "vn": // 法线坐标
                    ret.normals.push(parts.map(parseFloat));
                    break;
                case "f": // 面
                    var trianNum = parts.length - 2;
                    for (var i = 0; i < trianNum; i++)
                    {
                        addFace([parts[0], parts[i + 1], parts[i + 2]]);
                    }
                    break;
                case "mtllib": // 关联mtl文件
                    ret.mtl = MtlC.fromString(await (await fetch(folderPath + parts[0])).text(), folderPath);
                    break;
                case "usemtl": // 使用材质(在mtl中定义)
                    // 处理之前的面
                    setDefaultNormal();
                    if (faces.pos.length > 0)
                        ret.faces.push(faces);
                    // 新的面
                    faces = new ObjCFaces();
                    var material = ret.mtl.materialMap.get(parts[0]);
                    faces.tex = material.diffuseMap;
                    break;
                default:
                    console.warn("unhandled type in obj:", type);
            }
        }

        setDefaultNormal();
        ret.faces.push(faces);

        return ret;
    }
}
