import { ObjFaces } from "../scene/ObjFaces.js";
import { SceneObject } from "../scene/SceneObject.js";

var squareVer = new Float32Array([
    -0.5, 0.5, 0,
    0.5, 0.5, 0,
    0.5, -0.5, 0,
    -0.5, 0.5, 0,
    0.5, -0.5, 0,
    -0.5, -0.5, 0,
]);
var squareNormal = new Float32Array([
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1
]);
var squareTexOff = new Float32Array([
    1, 0,
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
]);

/**
 * @returns {SceneObject}
 * @param {import("../texture/Texture").Texture} tex
 */
export function create_square(tex)
{
    var obje = new SceneObject();
    var faces = obje.faces = new ObjFaces(squareVer, tex, squareTexOff, squareNormal, WebGL2RenderingContext.TRIANGLES);


    return obje;
}