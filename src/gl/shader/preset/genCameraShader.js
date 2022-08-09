import { ShaderBPart } from "../builder/ShaderBPart.js";
import { ShaderBuilder } from "../builder/ShaderBuilder.js";
import { shaderBuilderUtil as sbt } from "../builder/shaderBuilderUtil";

/**
 * 生成相机着色器
 */
export function genCameraShader()
{
    var builder = new ShaderBuilder();
    var vertexShaderPart = new ShaderBPart();
    vertexShaderPart.setPart([
        sbt.raw("gl_Position = u_cameraMatrix * u_worldMatrix * a_position"), // 转换到视图中坐标
        sbt.raw("v_texcoord = a_texcoord"), // 纹理坐标(插值)
        sbt.raw("v_thisPos = (u_worldMatrix * a_position).xyz"), // 顶点世界坐标(插值)
        sbt.raw("v_normal = a_normalMatrix * a_normal"), // 法线(插值)

        sbt.raw("v_lightP = u_lightMat * u_worldMatrix * a_position"), // 物体在灯光视图中的坐标
    ]);
    var fragmentShaderPart = new ShaderBPart();
    fragmentShaderPart.setPart([
        sbt.defineVariable("vec3", "normal", SBENode.raw("normalize(v_normal)")), // 法线(归一化)

        sbt.defineVariable("vec3", "lightP", SBENode.raw("v_lightP.xyz / v_lightP.w")), // 物体在灯光视图中的坐标 归一化w
        sbt.raw("lightP.x *= 0.5"),
        sbt.raw("lightP.y *= 0.5"),
        sbt.raw("lightP.x += 0.5"),
        sbt.raw("lightP.y += 0.5"),

        sbt.defineVariable("vec3", "lightDir", SBENode.raw("normalize(vec3(0.3, -0.3, -1.0))")), // 灯光方向向量
        sbt.defineVariable("float", "diffLight", SBENode.raw("max(dot(normal, -lightDir), 0.0)")), // 平行光漫反射
        sbt.defineVariable("float", "reflLight", SBENode.raw("pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0)")), // 平行光镜面反射
        sbt.defineVariable("float", "factorLight", // 阴影
            SBENode.raw("lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0") // xy在贴图范围内
                .and("lightP.z>=-1.0 && lightP.z<=1.0") // z在贴图范围内
                .and("texture(u_texS, lightP.xy).r + 0.001 * (1.0 - dot(normal,-lightDir)) < lightP.z * 0.5 + 0.5") // 实际深度更大 则在阴影内
                .condition("0.0", "1.0")
        ),
        sbt.defineVariable("float", "lightResult", SBENode.raw("0.45 + (diffLight * 0.5 + reflLight * 0.08) * factorLight")), // 光的总影响


        sbt.raw("outColor = texture(u_texture, v_texcoord).rgb * lightResult") // 最终颜色
    ]);

    {
        ([
            new GlslGenParam("mat4", "u_lightMat") // 灯光投影矩阵
        ]).forEach(o => pGenerator.vUniform.set(o.id, o));
        ([
            new GlslGenParam("vec4", "v_lightP") // 灯光投影矩阵转换后的坐标
        ]).forEach(o => pGenerator.fIn.set(o.id, o));
        ([
            new GlslGenParam("sampler2D", "u_texS") // 阴影贴图
        ]).forEach(o => pGenerator.fUniform.set(o.id, o));
    }
}