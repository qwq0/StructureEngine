import { ObjFaces } from "../scene/ObjFaces.js";
import { SceneObject } from "../scene/SceneObject.js";
import { TextureTable } from "../texture/TextureTable.js";

/**
 * 加载gltf文件
 * @param {string} url
 * @param {WebGL2RenderingContext} gl
 * @returns {Promise<SceneObject>}
 */
export async function loadGLTF(url, gl)
{
    /**
     * 从url加载文件
     * @param {string} url
     * @param {"arrayBuffer" | "json" | "text"} typeFunc 获取的文件类型
     * @returns {Promise<Object | ArrayBuffer | string>}
     */
    async function loadFile(url, typeFunc)
    {
        const response = await fetch(url);
        if (response.ok)
            return await response[typeFunc]();
        else
            throw new Error(`Could not load: ${url}`);

    }
    /**
     * 加载bin二进制文件
     * @param {string} url
     * @returns {Promise<ArrayBuffer>}
     */
    async function loadBinary(url)
    {
        return loadFile(url, "arrayBuffer");
    }
    /**
     * 加载json文件
     * @param {string} url
     * @returns {Promise<object>}
     */
    async function loadJSON(/** @type {string} */ url)
    {
        return loadFile(url, "json");
    }

    /**
     * @type {import("../../../lib/gltfType/gltf2").GlTF}
     */
    var gltf = await loadJSON(url);
    var baseUrl = new URL(url, location.href).href;

    var buffers = await Promise.all(gltf.buffers.map(buffer =>
    { // 载入buffer二进制文件
        return loadBinary((new URL(buffer.uri, baseUrl)).href);
    }));
    const glTypeToTypedArrayMap = {
        "5120": Int8Array,
        "5121": Uint8Array,
        "5122": Int16Array,
        "5123": Uint16Array,
        "5124": Int32Array,
        "5125": Uint32Array,
        "5126": Float32Array
    };
    const accessorTypeToNumComponentsMap = {
        "SCALAR": 1,
        "VEC2": 2,
        "VEC3": 3,
        "VEC4": 4,
        "MAT2": 4,
        "MAT3": 9,
        "MAT4": 16
    };
    var accessors = gltf.accessors.map(o =>
    {
        var bufferView = gltf.bufferViews[o.bufferView];
        var buffer = buffers[bufferView.buffer];
        var numComponents = accessorTypeToNumComponentsMap[o.type];
        return new glTypeToTypedArrayMap[o.componentType](buffer, bufferView.byteOffset, numComponents * o.count);
    });

    var ret = new SceneObject();
    var rootInd = gltf.scenes[gltf.scene].nodes[0];
    var texTab = new TextureTable(gl); // 防止生成获取相同url的纹理

    /**
     * @param {number} nodeInd
     * @param {SceneObject} obj
     */
    function traverse(nodeInd, obj)
    {
        var node = gltf.nodes[nodeInd];
        obj["-REMARK-"] = node.name;
        if (node.mesh)
        {
            let mesh = gltf.meshes[node.mesh];
            let meshP = mesh.primitives;
            meshP.forEach(p =>
            {
                var sObj = new SceneObject();
                if (p.material && gltf.materials[p.material].pbrMetallicRoughness && gltf.materials[p.material].pbrMetallicRoughness.baseColorTexture)
                {
                    sObj.faces = new ObjFaces(
                        accessors[p.attributes.POSITION],
                        texTab.fromUrl(new URL(
                            gltf.images[gltf.textures[gltf.materials[p.material].pbrMetallicRoughness.baseColorTexture.index].source].uri
                            , baseUrl).href
                        ),
                        accessors[p.attributes.TEXCOORD_0],
                        accessors[p.attributes.NORMAL],
                        WebGL2RenderingContext.TRIANGLES,
                        accessors[p.indices]
                    );
                    sObj.faces.update(gl);
                    obj.addChild(sObj);
                }
            });
        }
        if (node.children)
            node.children.forEach(o =>
            {
                var childObj = new SceneObject();
                obj.addChild(childObj);
                traverse(o, childObj);
            });

    }
    traverse(rootInd, ret);

    return ret;
}



/**
 * 对gltf文件的封装
 */
export class GltfC
{ }