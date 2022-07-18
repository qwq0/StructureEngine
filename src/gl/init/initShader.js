import { GlslGenerator } from "../shader/generator/GlslGenerator.js";
import { GlslGenParam } from "../shader/generator/GlslGenParam.js";

/**
 * 初始化glsl着色器
 * @param {WebGL2RenderingContext} gl
 * @param {object} program
 */
export function initShader(gl, program)
{
    { // 纯白着色器
        let pGenerator = new GlslGenerator(gl);
        program.white = pGenerator.gen();
    }

    { // 相机着色器(绘制单个物体)
        let pGenerator = new GlslGenerator(gl);

        ([
            new GlslGenParam("mat4", "u_lightMat") // 灯光投影矩阵
        ]).forEach(o => pGenerator.vUniform.set(o.id, o));

        ([
            new GlslGenParam("vec4", "v_lightP") // 灯光投影矩阵转换后的坐标
        ]).forEach(o => pGenerator.fIn.set(o.id, o));

        ([
            new GlslGenParam("sampler2D", "u_texS") // 阴影贴图
        ]).forEach(o => pGenerator.fUniform.set(o.id, o));

        pGenerator.vPart = [
            "v_lightP = u_lightMat * u_worldMatrix * a_position"
        ];

        pGenerator.fPart = [
            "vec3 lightP = v_lightP.xyz / v_lightP.w",
            "lightP.x *= 0.5",
            "lightP.y *= 0.5",
            "lightP.x += 0.5",
            "lightP.y += 0.5",

            "const vec3 lightDir = normalize(vec3(0.3, -0.3, -1.0))", // 灯光方向向量
            "float diffLight = max(dot(normal, -lightDir), 0.0)", // 平行光漫反射
            "float reflLight = pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0)", // 平行光镜面反射
            "float factorLight = (lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0 && lightP.z>=-1.0 && lightP.z<=1.0 && texture(u_texS, lightP.xy).r + 0.001 * (1.0 - dot(normal,-lightDir)) < lightP.z * 0.5 + 0.5) ? 0.0 : 1.0", // 阴影
            "lightResult = 0.45 + (diffLight * 0.5 + reflLight * 0.08) * factorLight" // 光的总影响
        ];
        pGenerator.fOutColor = GlslGenerator.t_fOutColor.light;

        program.camera = pGenerator.gen();
    }

    { // 相机着色器(实例化绘制物体)
        let pGenerator = new GlslGenerator(gl);

        ([
            new GlslGenParam("mat4", "u_lightMat") // 灯光投影矩阵
        ]).forEach(o => pGenerator.vUniform.set(o.id, o));

        ([
            new GlslGenParam("vec4", "v_lightP") // 灯光投影矩阵转换后的坐标
        ]).forEach(o => pGenerator.fIn.set(o.id, o));

        ([
            new GlslGenParam("sampler2D", "u_texS") // 阴影贴图
        ]).forEach(o => pGenerator.fUniform.set(o.id, o));

        pGenerator.vPart = [
            "v_lightP = u_lightMat * u_worldMatrix * a_position"
        ];

        pGenerator.fPart = [
            "vec3 lightP = v_lightP.xyz / v_lightP.w",
            "lightP.x *= 0.5",
            "lightP.y *= 0.5",
            "lightP.x += 0.5",
            "lightP.y += 0.5",

            "const vec3 lightDir = normalize(vec3(0.3, -0.3, -1.0))", // 灯光方向向量
            "float diffLight = max(dot(normal, -lightDir), 0.0)", // 平行光漫反射
            "float reflLight = pow(max(dot(reflect(normalize(u_viewPos - v_thisPos), normal), lightDir), 0.0), 5.0)", // 平行光镜面反射
            "float factorLight = (lightP.x>=0.0 && lightP.x<=1.0 && lightP.y>=0.0 && lightP.y<=1.0 && lightP.z>=-1.0 && lightP.z<=1.0 && texture(u_texS, lightP.xy).r + 0.001 * (1.0 - dot(normal,-lightDir)) < lightP.z * 0.5 + 0.5) ? 0.0 : 1.0", // 阴影
            "lightResult = 0.45 + (diffLight * 0.5 + reflLight * 0.08) * factorLight" // 光的总影响
        ];
        pGenerator.fOutColor = GlslGenerator.t_fOutColor.light;

        pGenerator.vUniform.delete("u_worldMatrix");
        pGenerator.vIn.set("u_worldMatrix", new GlslGenParam("mat4", "u_worldMatrix"));

        program.cameraInstance = pGenerator.gen();
    }
}