#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// height displacement
uniform vec2 ground_size;
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_normal;
out vec2 model_uv;
out vec3 model_xyz;

void main() {
    // This one should be similar to ground_gouraud.vertex
    // yeah it kinda is
    // grabbed stuff from the ground_gouraud.vertex
    // Due to second light, the ground is a very bright green

    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    float amount_of_gray_from_heightmap = texture(heightmap, uv).r;
    float the_modifier = 2.0 * height_scalar * (amount_of_gray_from_heightmap - 0.5);

    float original_world_y = world_pos.y;
    world_pos.y = world_pos.y + the_modifier;

    vec2 first_neighbor_uv = uv;
    first_neighbor_uv.x += 0.001;

    float test2 = 2.0 * height_scalar * (texture(heightmap, first_neighbor_uv).r - 0.5);

    vec3 first_neighbor = vec3(world_pos.x + (0.001*ground_size.x), original_world_y+test2, world_pos.z);

    vec2 second_neighbor_uv = uv;
    second_neighbor_uv.y += 0.001;

    float test4 = 2.0 * height_scalar * (texture(heightmap, second_neighbor_uv).r - 0.5);

    vec3 second_neighbor = vec3(world_pos.x, original_world_y + test4, world_pos.z + (0.001*ground_size.y));

    // tanget calcs
    vec3 tangent = first_neighbor - world_pos.xyz;
    vec3 bitangent = second_neighbor - world_pos.xyz;

    vec3 N = normalize(cross(bitangent, tangent));  // surface normal for ground

    // Pass vertex texcoord onto the fragment shader
    model_normal = N;
    model_uv = uv;
    model_xyz = vec3(world_pos);

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}