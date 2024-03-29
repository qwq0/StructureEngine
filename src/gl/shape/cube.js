import { ObjFaces } from "../scene/ObjFaces.js";
import { SceneObject } from "../scene/SceneObject.js";

var cubeVer = new Float32Array([
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,

    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,

    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,

    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,

    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,

    0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5
]);
var cubeNormal = new Float32Array([
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0
]);
var cubeTexOff = new Float32Array([
    1 / 3, 0,
    0, 0,
    0, 1 / 2,
    1 / 3, 0,
    0, 1 / 2,
    1 / 3, 1 / 2,

    1 / 3, 1 / 2,
    0, 1 / 2,
    1 / 3, 1,
    0, 1 / 2,
    0, 1,
    1 / 3, 1,

    2 / 3, 1 / 2,
    2 / 3, 0,
    1 / 3, 0,
    2 / 3, 1 / 2,
    1 / 3, 0,
    1 / 3, 1 / 2,

    1 / 3, 1 / 2,
    1 / 3, 1,
    2 / 3, 1 / 2,
    1 / 3, 1,
    2 / 3, 1,
    2 / 3, 1 / 2,

    1, 1 / 2,
    1, 0,
    2 / 3, 0,
    1, 1 / 2,
    2 / 3, 0,
    2 / 3, 1 / 2,

    2 / 3, 1 / 2,
    2 / 3, 1,
    1, 1 / 2,
    2 / 3, 1,
    1, 1,
    1, 1 / 2
]);

/**
 * 相同纹理对应相同实例
 * @type {Map<import("../texture/Texture").Texture, ObjFaces>}
 */
var instanceMap = new Map();
/**
 * @param {import("../texture/Texture").Texture} tex
 * @returns {SceneObject}
 */
export function create_cube(tex)
{
    var obje = new SceneObject();

    var faces = instanceMap.get(tex);
    if (!faces)
        instanceMap.set(tex, (faces = new ObjFaces(cubeVer, tex, cubeTexOff, cubeNormal, WebGL2RenderingContext.TRIANGLES)));
    obje.faces = faces;
    return obje;
}