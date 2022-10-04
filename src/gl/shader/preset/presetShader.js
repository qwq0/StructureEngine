import { SBENode } from "../builder/SBENode.js";
import { SBFunction } from "../builder/SBFunction.js";
import { SBPart } from "../builder/SBPart.js";
import { SBStatement } from "../builder/SBStatement.js";
import { SBUse } from "../builder/SBUse.js";
import { ShaderBuilder } from "../builder/ShaderBuilder.js";
import { sampleOffsetDirectionsV2, sampleOffsetDirectionsV2Length } from "./sampleOffsetDirections.js";

/**
 * 设置预设着色器到着色器生成器
 * @param {ShaderBuilder} builder
 */
export function presetShader(builder)
{
    let normalize = SBENode.callFunction("normalize");

    {
        let vertexMainFunction = new SBFunction("main"); // 顶点着色器
        builder.setFunction("vertexMain", vertexMainFunction);

        let u_normalMatrix = SBENode.uniform("u_normalMatrix", "mat3"); // 物体的法线矩阵
        let u_cameraMatrix = SBENode.uniform("u_cameraMatrix", "mat4"); // 物体的相机矩阵(包括投影矩阵)
        let u_worldMatrix = builder.flag.ifFlag("instantiated",
            SBENode.in("u_worldMatrix", "mat4"), SBENode.uniform("u_worldMatrix", "mat4")); // 物体的世界矩阵
        let a_position = SBENode.in("a_position", "vec4", 0); // 变化前的顶点坐标
        let a_texcoord = SBENode.in("a_texcoord", "vec2", 1); // 纹理坐标
        let a_normal = SBENode.in("a_normal", "vec3", 2); // 变化前的法线
        let v_texcoord = SBENode.out("v_texcoord", "vec2"); // 纹理坐标
        let v_thisPos = SBENode.out("v_thisPos", "vec3"); // 当前顶点的世界坐标
        let v_normal = SBENode.out("v_normal", "vec3"); // 法线
        let u_lightMat = SBENode.uniform("u_lightMat", "mat4"); // 灯光矩阵
        let v_lightP = SBENode.out("v_lightP", "vec4"); // 顶点在灯光视图中的坐标

        vertexMainFunction.setPart(SBPart.createPart([
            SBENode.raw("gl_Position").assign(u_cameraMatrix.mul(u_worldMatrix.mul(a_position))), // 转换到视图中坐标

            // 当需要渲染颜色时
            builder.flag.ifFlag("color", SBPart.createPart([
                v_texcoord.assign(a_texcoord), // 纹理坐标 (插值)
                v_thisPos.assign(u_worldMatrix.mul(a_position).getMember("xyz")), // 顶点世界坐标 (插值)
                v_normal.assign(normalize(u_normalMatrix.mul(a_normal))), // 法线 (插值)
                v_lightP.assign(u_lightMat.mul(u_worldMatrix).mul(a_position)) // 顶点在灯光视图中的坐标
            ]), SBPart.createPart([]))
        ]));
    }

    {
        let fragmentMainFunction = new SBFunction("main"); // 片段着色器
        builder.setFunction("fragmentMain", fragmentMainFunction);

        let v_texcoord = SBENode.in("v_texcoord", "vec2"); // 纹理坐标
        let v_thisPos = SBENode.in("v_thisPos", "vec3"); // 当前片段的世界坐标
        let v_normal = SBENode.in("v_normal", "vec3"); // 法线
        let u_texture = SBENode.uniform("u_texture", "sampler2D"); // 颜色纹理
        let u_viewPos = SBENode.uniform("u_viewPos", "vec3"); // 视点的世界坐标
        let u_lightPos = SBENode.uniform("u_lightPos", "vec3"); // 灯光的世界坐标
        let outColor = SBENode.out("outColor", "vec4"); // 输出颜色
        let v_lightP = SBENode.in("v_lightP", "vec4"); // 物体在灯光视图中的坐标
        let u_texS = SBENode.uniform("u_texS", "sampler2D"); // 阴影贴图

        let dot = SBENode.callFunction("dot");
        let max = SBENode.callFunction("max");
        let reflect = SBENode.callFunction("reflect");
        let pow = SBENode.callFunction("pow");

        fragmentMainFunction.setPart(builder.flag.ifFlag("color", SBPart.createPart([ // 不渲染颜色将使用空片段着色器
            SBStatement.defineVariable("vec3", "normal", normalize(v_normal)), // 法线(归一化)

            SBStatement.defineVariable("vec3", "lightP", v_lightP.getMember("xyz").div(v_lightP.getMember("w"))), // 物体在灯光视图中的坐标 归一化w

            // 将[-1到1]坐标变换为[0到1](纹理坐标)
            SBENode.raw("lightP.xy = lightP.xy * 0.5 + 0.5"),

            sampleOffsetDirectionsV2,

            SBStatement.defineVariable("vec3", "lightDir", normalize(v_thisPos.sub(u_lightPos))), // 灯光方向向量
            SBStatement.defineVariable("float", "diffLight", max(dot("normal", "-lightDir"), "0.0")), // 平行光漫反射
            SBStatement.defineVariable("float", "reflLight",
                pow(max(dot(reflect(normalize(u_viewPos.sub(v_thisPos)), "normal"), "lightDir"), "0.0"), "5.0")), // 平行光镜面反射
            SBStatement.defineVariable("float", "factorLight", // 阴影
                SBENode.raw("lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0") // xy在贴图范围内
                    .and("lightP.z>=-1.0 && lightP.z<=1.0") // z在贴图范围内
                    .and(SBENode.raw(SBENode.callFunc("texture", u_texS, "lightP.xy").getMember("r"),
                        " <= lightP.z * 0.5 + 0.5")) // 实际深度更大 则在阴影内
                    .condition("0.0", "1.0")
            ),
            SBStatement.raw("for(int i=0;i<", sampleOffsetDirectionsV2Length, ";i++){",
                SBENode.raw("factorLight+=",
                    SBENode.raw("lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0") // xy在贴图范围内
                        .and("lightP.z>=-1.0 && lightP.z<=1.0") // z在贴图范围内
                        .and(SBENode.raw(SBENode.callFunc("texture", u_texS, SBENode.raw("lightP.xy").add("sampleOffsetDirectionsV2[i] * 0.0007")).getMember("r"),
                            " <= lightP.z * 0.5 + 0.5")) // 实际深度更大 则在阴影内
                        .condition("0.0", "1.0")), ";}"),
            SBENode.raw("factorLight /= ", SBENode.callFunc("float", sampleOffsetDirectionsV2Length), " + 1.0"),
            SBStatement.defineVariable("float", "lightResult", SBENode.raw("0.35 + (diffLight * 0.7 + reflLight * 0.18) * factorLight")), // 光的总影响


            outColor.assign(
                SBENode.callFunc("vec4", SBENode.callFunc("texture", u_texture, v_texcoord).getMember("rgb").mul("lightResult"), "1.0")), // 最终颜色
        ]), SBPart.createPart([])));
    }
}