/**
 * @param {string} url
 */
async function loadGLTF(url)
{
    async function loadFile(/** @type {string} */ url, /** @type {string} */ typeFunc)
    {
        const response = await fetch(url);
        if (!response.ok)
        {
            throw new Error(`could not load: ${url}`);
        }
        return await response[typeFunc]();
    }
    async function loadBinary(/** @type {string} */ url)
    {
        return loadFile(url, "arrayBuffer");
    }
    async function loadJSON(/** @type {string} */ url)
    {
        return loadFile(url, "json");
    }

    var gltf = await loadJSON(url);
    var baseUrl = new URL(url, location.href);

    gltf.buffers = await Promise.all(gltf.buffers.map((/** @type {{ uri: string }} */ buffer) =>
    {
        var url = new URL(buffer.uri, baseUrl.href);
        return loadBinary(url.href);
    }));

}



/**
 * 对gltf文件的封装
 */
export class GltfC
{ }