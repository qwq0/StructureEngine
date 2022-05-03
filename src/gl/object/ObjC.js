import { forEach } from "../../util/forEach.js";
import { ObjFaces } from "../scene/ObjFaces.js";
import { SceneObject } from "../scene/SceneObject.js";
import { Texture } from "../texture.js";
import { MtlC } from "./MtlC.js";
import { MtlCMaterial } from "./MtlCMaterial.js";
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
     * @param {import("../shader/glslProgram.js").glslProgram} program
     */
    createSceneObject(gl, program)
    {
        var ret = new SceneObject();
        var texMap = new Map();
        forEach(this.faces, o =>
        {
            var obj = new SceneObject();
            if (!texMap.has(o.tex))
                texMap.set(o.tex, new Texture(gl, o.tex));
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
        ret.faces.push(faces);

        /**
         * 添加面
         * @param {[string, string, string]} vert 三个顶点索引 每个顶点索引为一个包含多索引的字符串
         */
        function addFace(vert)
        {
            var positions = [];
            var texcoords = [];
            var normals = [];
            for (var i = 0; i < 3; i++)
            {
                var parts = vert[i].split("/");
                if (parts[0]) // 顶点索引
                {
                    var objInd = parseInt(parts[0]);
                    positions.push(ret.positions[objInd + (objInd >= 0 ? 0 : ret.positions.length)]);
                }
                else
                    positions.push(null);
                if (parts[1]) // 纹理索引
                {
                    var objInd = parseInt(parts[1]);
                    texcoords.push(ret.texcoords[objInd + (objInd >= 0 ? 0 : ret.texcoords.length)]);
                }
                else
                    texcoords.push(null);
                if (parts[2]) // 法线索引
                {
                    var objInd = parseInt(parts[2]);
                    normals.push(ret.normals[objInd + (objInd >= 0 ? 0 : ret.normals.length)]);
                }
                else
                    normals.push(null);
            }
            var v1 = [ // 三角形的一条边向量
                positions[1][0] - positions[0][0],
                positions[1][1] - positions[0][1],
                positions[1][2] - positions[0][2]
            ];
            var v2 = [ // 三角形的一条边向量
                positions[2][0] - positions[1][0],
                positions[2][1] - positions[1][1],
                positions[2][2] - positions[1][2]
            ];
            var defaultNormal = [ // 默认法线向量(未归一化)
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0]
            ];
            for (var i = 0; i < 3; i++)
            {
                if (positions[i])
                    faces.pos.push(...positions[i]);
                else
                    faces.pos.push(0, 0, 0);
                if (texcoords[i])
                    faces.texPos.push(...texcoords[i]);
                else
                    faces.texPos.push(0, 0, 0);
                if (normals[i])
                    faces.norm.push(...normals[i]);
                else
                    faces.norm.push(...defaultNormal);
            }
        }

        for (var oInd = 0; oInd < arr.length; oInd++)
        {
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
                    faces = new ObjCFaces();
                    ret.faces.push(faces);
                    var material = ret.mtl.materialMap.get(parts[0]);
                    faces.tex = material.diffuseMap;
                    break;
                default:
                    console.warn("unhandled type in obj:", type);
            }
        }

        return ret;
    }
}

