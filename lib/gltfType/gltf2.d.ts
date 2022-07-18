export {GlTF};
/**
 * Accessor
 * A typed view into a buffer view that contains raw binary data.
 */
declare interface Accessor {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * glTF Id
     * The index of the bufferView.
     */
    bufferView?: number;
    /**
     * The offset relative to the start of the buffer view in bytes.
     */
    byteOffset?: number;
    /**
     * The datatype of the accessor's components.
     */
    componentType: /* The datatype of the accessor's components. */ 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number;
    /**
     * Specifies whether integer data values are normalized before usage.
     */
    normalized?: boolean;
    /**
     * The number of elements referenced by this accessor.
     */
    count: number;
    /**
     * Specifies if the accessor's elements are scalars, vectors, or matrices.
     */
    type: /* Specifies if the accessor's elements are scalars, vectors, or matrices. */ "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4" | string;
    /**
     * Maximum value of each component in this accessor.
     */
    max?: [
        number,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?
    ];
    /**
     * Minimum value of each component in this accessor.
     */
    min?: [
        number,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?,
        number?
    ];
    /**
     * Accessor Sparse
     * Sparse storage of elements that deviate from their initialization value.
     */
    sparse?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * Number of deviating accessor values stored in the sparse array.
         */
        count: number;
        /**
         * Accessor Sparse Indices
         * An object pointing to a buffer view containing the indices of deviating accessor values. The number of indices is equal to `count`. Indices **MUST** strictly increase.
         */
        indices: {
            extensions?: /**
             * Extension
             * JSON object with extension-specific objects.
             */
            Extension;
            extras?: /**
             * Extras
             * Application-specific data.
             */
            Extras;
            /**
             * glTF Id
             * The index of the buffer view with sparse indices. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined. The buffer view and the optional `byteOffset` **MUST** be aligned to the `componentType` byte length.
             */
            bufferView: number;
            /**
             * The offset relative to the start of the buffer view in bytes.
             */
            byteOffset?: number;
            /**
             * The indices data type.
             */
            componentType: /* The indices data type. */ 5121 | 5123 | 5125 | number;
        };
        /**
         * Accessor Sparse Values
         * An object pointing to a buffer view containing the deviating accessor values.
         */
        values: {
            extensions?: /**
             * Extension
             * JSON object with extension-specific objects.
             */
            Extension;
            extras?: /**
             * Extras
             * Application-specific data.
             */
            Extras;
            /**
             * glTF Id
             * The index of the bufferView with sparse values. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined.
             */
            bufferView: number;
            /**
             * The offset relative to the start of the bufferView in bytes.
             */
            byteOffset?: number;
        };
    };
}
/**
 * Accessor Sparse Indices
 * An object pointing to a buffer view containing the indices of deviating accessor values. The number of indices is equal to `accessor.sparse.count`. Indices **MUST** strictly increase.
 */
declare interface AccessorSparseIndices {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * glTF Id
     * The index of the buffer view with sparse indices. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined. The buffer view and the optional `byteOffset` **MUST** be aligned to the `componentType` byte length.
     */
    bufferView: number;
    /**
     * The offset relative to the start of the buffer view in bytes.
     */
    byteOffset?: number;
    /**
     * The indices data type.
     */
    componentType: /* The indices data type. */ 5121 | 5123 | 5125 | number;
}
/**
 * Accessor Sparse
 * Sparse storage of accessor values that deviate from their initialization value.
 */
declare interface AccessorSparse {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * Number of deviating accessor values stored in the sparse array.
     */
    count: number;
    /**
     * Accessor Sparse Indices
     * An object pointing to a buffer view containing the indices of deviating accessor values. The number of indices is equal to `count`. Indices **MUST** strictly increase.
     */
    indices: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * glTF Id
         * The index of the buffer view with sparse indices. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined. The buffer view and the optional `byteOffset` **MUST** be aligned to the `componentType` byte length.
         */
        bufferView: number;
        /**
         * The offset relative to the start of the buffer view in bytes.
         */
        byteOffset?: number;
        /**
         * The indices data type.
         */
        componentType: /* The indices data type. */ 5121 | 5123 | 5125 | number;
    };
    /**
     * Accessor Sparse Values
     * An object pointing to a buffer view containing the deviating accessor values.
     */
    values: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * glTF Id
         * The index of the bufferView with sparse values. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined.
         */
        bufferView: number;
        /**
         * The offset relative to the start of the bufferView in bytes.
         */
        byteOffset?: number;
    };
}
/**
 * Accessor Sparse Values
 * An object pointing to a buffer view containing the deviating accessor values. The number of elements is equal to `accessor.sparse.count` times number of components. The elements have the same component type as the base accessor. The elements are tightly packed. Data **MUST** be aligned following the same rules as the base accessor.
 */
declare interface AccessorSparseValues {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * glTF Id
     * The index of the bufferView with sparse values. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined.
     */
    bufferView: number;
    /**
     * The offset relative to the start of the bufferView in bytes.
     */
    byteOffset?: number;
}
/**
 * Animation Channel
 * An animation channel combines an animation sampler with a target property being animated.
 */
declare interface AnimationChannel {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * glTF Id
     * The index of a sampler in this animation used to compute the value for the target.
     */
    sampler: number;
    /**
     * Animation Channel Target
     * The descriptor of the animated property.
     */
    target: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * glTF Id
         * The index of the node to animate. When undefined, the animated object **MAY** be defined by an extension.
         */
        node?: number;
        /**
         * The name of the node's TRS property to animate, or the `"weights"` of the Morph Targets it instantiates. For the `"translation"` property, the values that are provided by the sampler are the translation along the X, Y, and Z axes. For the `"rotation"` property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the `"scale"` property, the values are the scaling factors along the X, Y, and Z axes.
         */
        path: /* The name of the node's TRS property to animate, or the `"weights"` of the Morph Targets it instantiates. For the `"translation"` property, the values that are provided by the sampler are the translation along the X, Y, and Z axes. For the `"rotation"` property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the `"scale"` property, the values are the scaling factors along the X, Y, and Z axes. */ "translation" | "rotation" | "scale" | "weights" | string;
    };
}
/**
 * Animation Channel Target
 * The descriptor of the animated property.
 */
declare interface AnimationChannelTarget {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * glTF Id
     * The index of the node to animate. When undefined, the animated object **MAY** be defined by an extension.
     */
    node?: number;
    /**
     * The name of the node's TRS property to animate, or the `"weights"` of the Morph Targets it instantiates. For the `"translation"` property, the values that are provided by the sampler are the translation along the X, Y, and Z axes. For the `"rotation"` property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the `"scale"` property, the values are the scaling factors along the X, Y, and Z axes.
     */
    path: /* The name of the node's TRS property to animate, or the `"weights"` of the Morph Targets it instantiates. For the `"translation"` property, the values that are provided by the sampler are the translation along the X, Y, and Z axes. For the `"rotation"` property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the `"scale"` property, the values are the scaling factors along the X, Y, and Z axes. */ "translation" | "rotation" | "scale" | "weights" | string;
}
/**
 * Animation Sampler
 * An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm.
 */
declare interface AnimationSampler {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * glTF Id
     * The index of an accessor containing keyframe timestamps.
     */
    input: number;
    /**
     * Interpolation algorithm.
     */
    interpolation?: /* Interpolation algorithm. */ "LINEAR" | "STEP" | "CUBICSPLINE" | string;
    /**
     * glTF Id
     * The index of an accessor, containing keyframe output values.
     */
    output: number;
}
/**
 * Animation
 * A keyframe animation.
 */
declare interface Animation {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * An array of animation channels. An animation channel combines an animation sampler with a target property being animated. Different channels of the same animation **MUST NOT** have the same targets.
     */
    channels: [
        /**
         * Animation Channel
         * An animation channel combines an animation sampler with a target property being animated.
         */
        AnimationChannel,
        .../**
         * Animation Channel
         * An animation channel combines an animation sampler with a target property being animated.
         */
        AnimationChannel[]
    ];
    /**
     * An array of animation samplers. An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm.
     */
    samplers: [
        /**
         * Animation Sampler
         * An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm.
         */
        AnimationSampler,
        .../**
         * Animation Sampler
         * An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm.
         */
        AnimationSampler[]
    ];
}
/**
 * Asset
 * Metadata about the glTF asset.
 */
declare interface Asset {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * A copyright message suitable for display to credit the content creator.
     */
    copyright?: string;
    /**
     * Tool that generated this glTF model.  Useful for debugging.
     */
    generator?: string;
    /**
     * The glTF version in the form of `<major>.<minor>` that this asset targets.
     */
    version: string; // ^[0-9]+\.[0-9]+$
    /**
     * The minimum glTF version in the form of `<major>.<minor>` that this asset targets. This property **MUST NOT** be greater than the asset version.
     */
    minVersion?: string; // ^[0-9]+\.[0-9]+$
}
/**
 * Buffer
 * A buffer points to binary geometry, animation, or skins.
 */
declare interface Buffer {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * The URI (or IRI) of the buffer.
     */
    uri?: string; // iri-reference
    /**
     * The length of the buffer in bytes.
     */
    byteLength: number;
}
/**
 * Buffer View
 * A view into a buffer generally representing a subset of the buffer.
 */
declare interface BufferView {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * glTF Id
     * The index of the buffer.
     */
    buffer: number;
    /**
     * The offset into the buffer in bytes.
     */
    byteOffset?: number;
    /**
     * The length of the bufferView in bytes.
     */
    byteLength: number;
    /**
     * The stride, in bytes.
     */
    byteStride?: number;
    /**
     * The hint representing the intended GPU buffer type to use with this buffer view.
     */
    target?: /* The hint representing the intended GPU buffer type to use with this buffer view. */ 34962 | 34963 | number;
}
/**
 * Camera Orthographic
 * An orthographic camera containing properties to create an orthographic projection matrix.
 */
declare interface CameraOrthographic {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The floating-point horizontal magnification of the view. This value **MUST NOT** be equal to zero. This value **SHOULD NOT** be negative.
     */
    xmag: number;
    /**
     * The floating-point vertical magnification of the view. This value **MUST NOT** be equal to zero. This value **SHOULD NOT** be negative.
     */
    ymag: number;
    /**
     * The floating-point distance to the far clipping plane. This value **MUST NOT** be equal to zero. `zfar` **MUST** be greater than `znear`.
     */
    zfar: number;
    /**
     * The floating-point distance to the near clipping plane.
     */
    znear: number;
}
/**
 * Camera Perspective
 * A perspective camera containing properties to create a perspective projection matrix.
 */
declare interface CameraPerspective {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The floating-point aspect ratio of the field of view.
     */
    aspectRatio?: number;
    /**
     * The floating-point vertical field of view in radians. This value **SHOULD** be less than π.
     */
    yfov: number;
    /**
     * The floating-point distance to the far clipping plane.
     */
    zfar?: number;
    /**
     * The floating-point distance to the near clipping plane.
     */
    znear: number;
}
/**
 * Camera
 * A camera's projection.  A node **MAY** reference a camera to apply a transform to place the camera in the scene.
 */
declare interface Camera {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * Camera Orthographic
     * An orthographic camera containing properties to create an orthographic projection matrix. This property **MUST NOT** be defined when `perspective` is defined.
     */
    orthographic?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * The floating-point horizontal magnification of the view. This value **MUST NOT** be equal to zero. This value **SHOULD NOT** be negative.
         */
        xmag: number;
        /**
         * The floating-point vertical magnification of the view. This value **MUST NOT** be equal to zero. This value **SHOULD NOT** be negative.
         */
        ymag: number;
        /**
         * The floating-point distance to the far clipping plane. This value **MUST NOT** be equal to zero. `zfar` **MUST** be greater than `znear`.
         */
        zfar: number;
        /**
         * The floating-point distance to the near clipping plane.
         */
        znear: number;
    };
    /**
     * Camera Perspective
     * A perspective camera containing properties to create a perspective projection matrix. This property **MUST NOT** be defined when `orthographic` is defined.
     */
    perspective?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * The floating-point aspect ratio of the field of view.
         */
        aspectRatio?: number;
        /**
         * The floating-point vertical field of view in radians. This value **SHOULD** be less than π.
         */
        yfov: number;
        /**
         * The floating-point distance to the far clipping plane.
         */
        zfar?: number;
        /**
         * The floating-point distance to the near clipping plane.
         */
        znear: number;
    };
    /**
     * Specifies if the camera uses a perspective or orthographic projection.
     */
    type: /* Specifies if the camera uses a perspective or orthographic projection. */ "perspective" | "orthographic" | string;
}
/**
 * Extension
 * JSON object with extension-specific objects.
 */
declare interface Extension {
    [name: string]: {
        [key: string]: any;
    };
}
/**
 * Extras
 * Application-specific data.
 */
declare type Extras = any;
/**
 * glTF Child of Root Property
 */
declare interface GlTFChildOfRootProperty {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
}
/**
 * glTF Property
 */
declare interface GlTFProperty {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
}
/**
 * glTF
 * The root object for a glTF asset.
 */
declare interface GlTF {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * Names of glTF extensions used in this asset.
     */
    extensionsUsed?: [
        string,
        ...string[]
    ];
    /**
     * Names of glTF extensions required to properly load this asset.
     */
    extensionsRequired?: [
        string,
        ...string[]
    ];
    /**
     * An array of accessors.
     */
    accessors?: [
        /**
         * Accessor
         * A typed view into a buffer view that contains raw binary data.
         */
        Accessor,
        .../**
         * Accessor
         * A typed view into a buffer view that contains raw binary data.
         */
        Accessor[]
    ];
    /**
     * An array of keyframe animations.
     */
    animations?: [
        /**
         * Animation
         * A keyframe animation.
         */
        Animation,
        .../**
         * Animation
         * A keyframe animation.
         */
        Animation[]
    ];
    /**
     * Asset
     * Metadata about the glTF asset.
     */
    asset: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * A copyright message suitable for display to credit the content creator.
         */
        copyright?: string;
        /**
         * Tool that generated this glTF model.  Useful for debugging.
         */
        generator?: string;
        /**
         * The glTF version in the form of `<major>.<minor>` that this asset targets.
         */
        version: string; // ^[0-9]+\.[0-9]+$
        /**
         * The minimum glTF version in the form of `<major>.<minor>` that this asset targets. This property **MUST NOT** be greater than the asset version.
         */
        minVersion?: string; // ^[0-9]+\.[0-9]+$
    };
    /**
     * An array of buffers.
     */
    buffers?: [
        /**
         * Buffer
         * A buffer points to binary geometry, animation, or skins.
         */
        Buffer,
        .../**
         * Buffer
         * A buffer points to binary geometry, animation, or skins.
         */
        Buffer[]
    ];
    /**
     * An array of bufferViews.
     */
    bufferViews?: [
        /**
         * Buffer View
         * A view into a buffer generally representing a subset of the buffer.
         */
        BufferView,
        .../**
         * Buffer View
         * A view into a buffer generally representing a subset of the buffer.
         */
        BufferView[]
    ];
    /**
     * An array of cameras.
     */
    cameras?: [
        /**
         * Camera
         * A camera's projection.  A node **MAY** reference a camera to apply a transform to place the camera in the scene.
         */
        Camera,
        .../**
         * Camera
         * A camera's projection.  A node **MAY** reference a camera to apply a transform to place the camera in the scene.
         */
        Camera[]
    ];
    /**
     * An array of images.
     */
    images?: [
        /**
         * Image
         * Image data used to create a texture. Image **MAY** be referenced by an URI (or IRI) or a buffer view index.
         */
        Image,
        .../**
         * Image
         * Image data used to create a texture. Image **MAY** be referenced by an URI (or IRI) or a buffer view index.
         */
        Image[]
    ];
    /**
     * An array of materials.
     */
    materials?: [
        /**
         * Material
         * The material appearance of a primitive.
         */
        Material,
        .../**
         * Material
         * The material appearance of a primitive.
         */
        Material[]
    ];
    /**
     * An array of meshes.
     */
    meshes?: [
        /**
         * Mesh
         * A set of primitives to be rendered.  Its global transform is defined by a node that references it.
         */
        Mesh,
        .../**
         * Mesh
         * A set of primitives to be rendered.  Its global transform is defined by a node that references it.
         */
        Mesh[]
    ];
    /**
     * An array of nodes.
     */
    nodes?: [
        /**
         * Node
         * A node in the node hierarchy.  When the node contains `skin`, all `mesh.primitives` **MUST** contain `JOINTS_0` and `WEIGHTS_0` attributes.  A node **MAY** have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), `matrix` **MUST NOT** be present.
         */
        Node,
        .../**
         * Node
         * A node in the node hierarchy.  When the node contains `skin`, all `mesh.primitives` **MUST** contain `JOINTS_0` and `WEIGHTS_0` attributes.  A node **MAY** have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), `matrix` **MUST NOT** be present.
         */
        Node[]
    ];
    /**
     * An array of samplers.
     */
    samplers?: [
        /**
         * Sampler
         * Texture sampler properties for filtering and wrapping modes.
         */
        Sampler,
        .../**
         * Sampler
         * Texture sampler properties for filtering and wrapping modes.
         */
        Sampler[]
    ];
    /**
     * glTF Id
     * The index of the default scene.
     */
    scene?: number;
    /**
     * An array of scenes.
     */
    scenes?: [
        /**
         * Scene
         * The root nodes of a scene.
         */
        Scene,
        .../**
         * Scene
         * The root nodes of a scene.
         */
        Scene[]
    ];
    /**
     * An array of skins.
     */
    skins?: [
        /**
         * Skin
         * Joints and matrices defining a skin.
         */
        Skin,
        .../**
         * Skin
         * Joints and matrices defining a skin.
         */
        Skin[]
    ];
    /**
     * An array of textures.
     */
    textures?: [
        /**
         * Texture
         * A texture and its sampler.
         */
        Texture,
        .../**
         * Texture
         * A texture and its sampler.
         */
        Texture[]
    ];
}
/**
 * glTF Id
 */
declare type GlTFid = number;
/**
 * Image
 * Image data used to create a texture. Image **MAY** be referenced by an URI (or IRI) or a buffer view index.
 */
declare type Image = /**
 * Image
 * Image data used to create a texture. Image **MAY** be referenced by an URI (or IRI) or a buffer view index.
 */
{
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * The URI (or IRI) of the image.
     */
    uri: string; // iri-reference
    /**
     * The image's media type. This field **MUST** be defined when `bufferView` is defined.
     */
    mimeType?: /* The image's media type. This field **MUST** be defined when `bufferView` is defined. */ "image/jpeg" | "image/png" | string;
    /**
     * glTF Id
     * The index of the bufferView that contains the image. This field **MUST NOT** be defined when `uri` is defined.
     */
    bufferView?: number;
} | {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * The URI (or IRI) of the image.
     */
    uri?: string; // iri-reference
    /**
     * The image's media type. This field **MUST** be defined when `bufferView` is defined.
     */
    mimeType?: /* The image's media type. This field **MUST** be defined when `bufferView` is defined. */ "image/jpeg" | "image/png" | string;
    /**
     * glTF Id
     * The index of the bufferView that contains the image. This field **MUST NOT** be defined when `uri` is defined.
     */
    bufferView: number;
};
/**
 * Material Normal Texture Info
 * Reference to a texture.
 */
declare interface MaterialNormalTextureInfo {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * glTF Id
     * The index of the texture.
     */
    index: number;
    /**
     * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
     */
    texCoord?: number;
    /**
     * The scalar parameter applied to each normal vector of the normal texture.
     */
    scale?: number;
}
/**
 * Material Occlusion Texture Info
 * Reference to a texture.
 */
declare interface MaterialOcclusionTextureInfo {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * glTF Id
     * The index of the texture.
     */
    index: number;
    /**
     * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
     */
    texCoord?: number;
    /**
     * A scalar multiplier controlling the amount of occlusion applied.
     */
    strength?: number;
}
/**
 * Material PBR Metallic Roughness
 * A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology.
 */
declare interface MaterialPbrMetallicRoughness {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The factors for the base color of the material.
     */
    baseColorFactor?: [
        number,
        number,
        number,
        number
    ];
    /**
     * Texture Info
     * The base color texture.
     */
    baseColorTexture?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * glTF Id
         * The index of the texture.
         */
        index: number;
        /**
         * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
         */
        texCoord?: number;
    };
    /**
     * The factor for the metalness of the material.
     */
    metallicFactor?: number;
    /**
     * The factor for the roughness of the material.
     */
    roughnessFactor?: number;
    /**
     * Texture Info
     * The metallic-roughness texture.
     */
    metallicRoughnessTexture?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * glTF Id
         * The index of the texture.
         */
        index: number;
        /**
         * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
         */
        texCoord?: number;
    };
}
/**
 * Material
 * The material appearance of a primitive.
 */
declare interface Material {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * Material PBR Metallic Roughness
     * A set of parameter values that are used to define the metallic-roughness material model from Physically Based Rendering (PBR) methodology. When undefined, all the default values of `pbrMetallicRoughness` **MUST** apply.
     */
    pbrMetallicRoughness?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * The factors for the base color of the material.
         */
        baseColorFactor?: [
            number,
            number,
            number,
            number
        ];
        /**
         * Texture Info
         * The base color texture.
         */
        baseColorTexture?: {
            extensions?: /**
             * Extension
             * JSON object with extension-specific objects.
             */
            Extension;
            extras?: /**
             * Extras
             * Application-specific data.
             */
            Extras;
            /**
             * glTF Id
             * The index of the texture.
             */
            index: number;
            /**
             * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
             */
            texCoord?: number;
        };
        /**
         * The factor for the metalness of the material.
         */
        metallicFactor?: number;
        /**
         * The factor for the roughness of the material.
         */
        roughnessFactor?: number;
        /**
         * Texture Info
         * The metallic-roughness texture.
         */
        metallicRoughnessTexture?: {
            extensions?: /**
             * Extension
             * JSON object with extension-specific objects.
             */
            Extension;
            extras?: /**
             * Extras
             * Application-specific data.
             */
            Extras;
            /**
             * glTF Id
             * The index of the texture.
             */
            index: number;
            /**
             * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
             */
            texCoord?: number;
        };
    };
    /**
     * Material Normal Texture Info
     * The tangent space normal texture.
     */
    normalTexture?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * glTF Id
         * The index of the texture.
         */
        index: number;
        /**
         * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
         */
        texCoord?: number;
        /**
         * The scalar parameter applied to each normal vector of the normal texture.
         */
        scale?: number;
    };
    /**
     * Material Occlusion Texture Info
     * The occlusion texture.
     */
    occlusionTexture?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * glTF Id
         * The index of the texture.
         */
        index: number;
        /**
         * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
         */
        texCoord?: number;
        /**
         * A scalar multiplier controlling the amount of occlusion applied.
         */
        strength?: number;
    };
    /**
     * Texture Info
     * The emissive texture.
     */
    emissiveTexture?: {
        extensions?: /**
         * Extension
         * JSON object with extension-specific objects.
         */
        Extension;
        extras?: /**
         * Extras
         * Application-specific data.
         */
        Extras;
        /**
         * glTF Id
         * The index of the texture.
         */
        index: number;
        /**
         * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
         */
        texCoord?: number;
    };
    /**
     * The factors for the emissive color of the material.
     */
    emissiveFactor?: [
        number,
        number,
        number
    ];
    /**
     * The alpha rendering mode of the material.
     */
    alphaMode?: /* The alpha rendering mode of the material. */ "OPAQUE" | "MASK" | "BLEND" | string;
    /**
     * The alpha cutoff value of the material.
     */
    alphaCutoff?: number;
    /**
     * Specifies whether the material is double sided.
     */
    doubleSided?: boolean;
}
/**
 * Mesh Primitive
 * Geometry to be rendered with the given material.
 */
declare interface MeshPrimitive {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * A plain JSON object, where each key corresponds to a mesh attribute semantic and each value is the index of the accessor containing attribute's data.
     */
    attributes: {
        [name: string]: /* glTF Id */ GlTFid;
    };
    /**
     * glTF Id
     * The index of the accessor that contains the vertex indices.
     */
    indices?: number;
    /**
     * glTF Id
     * The index of the material to apply to this primitive when rendering.
     */
    material?: number;
    /**
     * The topology type of primitives to render.
     */
    mode?: /* The topology type of primitives to render. */ 0 | 1 | 2 | 3 | 4 | 5 | 6 | number;
    /**
     * An array of morph targets.
     */
    targets?: [
        {
            [name: string]: /* glTF Id */ GlTFid;
        },
        ...{
            [name: string]: /* glTF Id */ GlTFid;
        }[]
    ];
}
/**
 * Mesh
 * A set of primitives to be rendered.  Its global transform is defined by a node that references it.
 */
declare interface Mesh {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * An array of primitives, each defining geometry to be rendered.
     */
    primitives: [
        /**
         * Mesh Primitive
         * Geometry to be rendered with the given material.
         */
        MeshPrimitive,
        .../**
         * Mesh Primitive
         * Geometry to be rendered with the given material.
         */
        MeshPrimitive[]
    ];
    /**
     * Array of weights to be applied to the morph targets. The number of array elements **MUST** match the number of morph targets.
     */
    weights?: [
        number,
        ...number[]
    ];
}
/**
 * Node
 * A node in the node hierarchy.  When the node contains `skin`, all `mesh.primitives` **MUST** contain `JOINTS_0` and `WEIGHTS_0` attributes.  A node **MAY** have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), `matrix` **MUST NOT** be present.
 */
declare interface Node {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * glTF Id
     * The index of the camera referenced by this node.
     */
    camera?: number;
    /**
     * The indices of this node's children.
     */
    children?: [
        /* glTF Id */ GlTFid,
        .../* glTF Id */ GlTFid[]
    ];
    /**
     * glTF Id
     * The index of the skin referenced by this node.
     */
    skin?: number;
    /**
     * A floating-point 4x4 transformation matrix stored in column-major order.
     */
    matrix?: [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
    ];
    /**
     * glTF Id
     * The index of the mesh in this node.
     */
    mesh?: number;
    /**
     * The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar.
     */
    rotation?: [
        number,
        number,
        number,
        number
    ];
    /**
     * The node's non-uniform scale, given as the scaling factors along the x, y, and z axes.
     */
    scale?: [
        number,
        number,
        number
    ];
    /**
     * The node's translation along the x, y, and z axes.
     */
    translation?: [
        number,
        number,
        number
    ];
    /**
     * The weights of the instantiated morph target. The number of array elements **MUST** match the number of morph targets of the referenced mesh. When defined, `mesh` **MUST** also be defined.
     */
    weights?: [
        number,
        ...number[]
    ];
}
/**
 * Sampler
 * Texture sampler properties for filtering and wrapping modes.
 */
declare interface Sampler {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * Magnification filter.
     */
    magFilter?: /* Magnification filter. */ 9728 | 9729 | number;
    /**
     * Minification filter.
     */
    minFilter?: /* Minification filter. */ 9728 | 9729 | 9984 | 9985 | 9986 | 9987 | number;
    /**
     * S (U) wrapping mode.
     */
    wrapS?: /* S (U) wrapping mode. */ 33071 | 33648 | 10497 | number;
    /**
     * T (V) wrapping mode.
     */
    wrapT?: /* T (V) wrapping mode. */ 33071 | 33648 | 10497 | number;
}
/**
 * Scene
 * The root nodes of a scene.
 */
declare interface Scene {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * The indices of each root node.
     */
    nodes?: [
        /* glTF Id */ GlTFid,
        .../* glTF Id */ GlTFid[]
    ];
}
/**
 * Skin
 * Joints and matrices defining a skin.
 */
declare interface Skin {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * glTF Id
     * The index of the accessor containing the floating-point 4x4 inverse-bind matrices.
     */
    inverseBindMatrices?: number;
    /**
     * glTF Id
     * The index of the node used as a skeleton root.
     */
    skeleton?: number;
    /**
     * Indices of skeleton nodes, used as joints in this skin.
     */
    joints: [
        /* glTF Id */ GlTFid,
        .../* glTF Id */ GlTFid[]
    ];
}
/**
 * Texture Info
 * Reference to a texture.
 */
declare interface TextureInfo {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * glTF Id
     * The index of the texture.
     */
    index: number;
    /**
     * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
     */
    texCoord?: number;
}
/**
 * Texture
 * A texture and its sampler.
 */
declare interface Texture {
    extensions?: /**
     * Extension
     * JSON object with extension-specific objects.
     */
    Extension;
    extras?: /**
     * Extras
     * Application-specific data.
     */
    Extras;
    /**
     * The user-defined name of this object.
     */
    name?: string;
    /**
     * glTF Id
     * The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering **SHOULD** be used.
     */
    sampler?: number;
    /**
     * glTF Id
     * The index of the image used by this texture. When undefined, an extension or other mechanism **SHOULD** supply an alternate texture source, otherwise behavior is undefined.
     */
    source?: number;
}
