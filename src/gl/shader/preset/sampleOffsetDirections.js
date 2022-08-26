const { SBStatement } = require("../builder/SBStatement");

/**
 * vec3采样偏移方向向量
 */
const sampleOffsetDirectionsV3 = SBStatement.defineConst("vec3[]", "sampleOffsetDirectionsV3", SBENode.constructArray("vec3", [
    SBENode.callFunc("vec3", "0.0", "0.0", "0.0"),

    SBENode.callFunc("vec3", "1.0", "1.0", "0.0"),
    SBENode.callFunc("vec3", "-1.0", "1.0", "0.0"),
    SBENode.callFunc("vec3", "1.0", "-1.0", "0.0"),
    SBENode.callFunc("vec3", "-1.0", "-1.0", "0.0"),

    SBENode.callFunc("vec3", "0.0", "1.0", "1.0"),
    SBENode.callFunc("vec3", "0.0", "-1.0", "1.0"),
    SBENode.callFunc("vec3", "0.0", "1.0", "-1.0"),
    SBENode.callFunc("vec3", "0.0", "-1.0", "-1.0"),

    SBENode.callFunc("vec3", "1.0", "0.0", "1.0"),
    SBENode.callFunc("vec3", "-1.0", "0.0", "1.0"),
    SBENode.callFunc("vec3", "1.0", "0.0", "-1.0"),
    SBENode.callFunc("vec3", "-1.0", "0.0", "-1.0"),

    SBENode.callFunc("vec3", "1.0", "1.0", "1.0"),
    SBENode.callFunc("vec3", "1.0", "1.0", "-1.0"),
    SBENode.callFunc("vec3", "1.0", "-1.0", "1.0"),
    SBENode.callFunc("vec3", "1.0", "-1.0", "-1.0"),
    SBENode.callFunc("vec3", "-1.0", "1.0", "1.0"),
    SBENode.callFunc("vec3", "-1.0", "1.0", "-1.0"),
    SBENode.callFunc("vec3", "-1.0", "-1.0", "1.0"),
    SBENode.callFunc("vec3", "-1.0", "-1.0", "-1.0")
]));

/**
 * vec2采样偏移方向向量
 */
const sampleOffsetDirectionsV2 = SBStatement.defineConst("vec2[]", "sampleOffsetDirectionsV2", SBENode.constructArray("vec2", [
    SBENode.callFunc("vec2", "0.0", "0.0"),

    SBENode.callFunc("vec2", "1.0", "0.0"),
    SBENode.callFunc("vec2", "-1.0", "0.0"),
    
    SBENode.callFunc("vec2", "0.0", "1.0"),
    SBENode.callFunc("vec2", "0.0", "-1.0"),

    SBENode.callFunc("vec2", "1.0", "1.0"),
    SBENode.callFunc("vec2", "1.0", "-1.0"),
    SBENode.callFunc("vec2", "-1.0", "1.0"),
    SBENode.callFunc("vec2", "-1.0", "-1.0"),
]));