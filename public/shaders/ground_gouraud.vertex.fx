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
uniform float mat_shininess;
uniform vec2 texture_scale;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    specular_illum = vec3(0.0, 0.0, 0.0);

    /* Steps:
        0.5. Modify the position (y) by the heightmap and the scalar
        1. Find nearby uvs, and modify it based on the ground and height
        2. Do all the normalizing and tangent stuff for the light reflection, calculate N, L, R, View for current point
        3. Calculate the colors based on that
    */

    // 0.5
    float amount_of_gray_from_heightmap = texture(heightmap, uv).r;
    float the_modifier = 2.0 * height_scalar * (amount_of_gray_from_heightmap - 0.5);
    // Saving the current world y
    float original_world_y = world_pos.y;
    world_pos.y = world_pos.y + the_modifier;

    // 1.
    // vec3 first_neighbor = position;
    // make a copy of uv, and modify it a little bit
    vec2 first_neighbor_uv = vec2(uv[0] +0.001, uv[1]);
    // float first_modifier = 2.0 * height_scalar * ((texture(heightmap, first_neighbor_uv).r) - 0.5);
    float test2 = 2.0 * height_scalar * (texture(heightmap, first_neighbor_uv).r - 0.5);

    // setting the neighbor to all the positions
    // first_neighbor.x = position.x + (0.001*ground_size.x);
    // // first_neighbor.y = original_world_y + first_modifier;
    // first_neighbor.y = original_world_y + test2;
    // first_neighbor.z = position.z;
    vec3 first_neighbor = vec3(world_pos.x + (0.001*ground_size.x), original_world_y+test2, world_pos.z);

    // ------------------------------------------------

    // do it again, but with y instead of x
    // vec3 second_neighbor = position;
    // move the y a little bit
    vec2 second_neighbor_uv = vec2(uv[0], uv[1] + 0.001);
    // float second_modifier = 2.0 * height_scalar * ((texture(heightmap, second_neighbor_uv).r) - 0.5);
    float test4 = 2.0 * height_scalar * (texture(heightmap, second_neighbor_uv).r - 0.5);

    // // set the neighbor to positions
    // second_neighbor.x = position.x;
    // // second_neighbor.y = original_world_y + second_modifier;
    // second_neighbor.y = original_world_y + test4;
    // second_neighbor.z = position.z + (0.001*ground_size.y);
    vec3 second_neighbor = vec3(world_pos.x, original_world_y + test4, world_pos.z + (0.001*ground_size.y));

    // ------------------------------------------------

    // vec2 neighbor_1_uv = vec2(uv[0] + 0.001, uv[1]);
    // float gray_1 = texture(heightmap, neighbor_1_uv).r;
    // float d_1 = 2.0 * height_scalar * (gray_1 - 0.5);
    // vec4 neighbor_1 = vec4(world_pos.x + 0.001*ground_size.x, og_world_y + d_1, world_pos.z, 1.0);

    // vec2 neighbor_2_uv = vec2(uv[0], uv[1] + 0.001);
    // float gray_2 = texture(heightmap, neighbor_2_uv).r;
    // float d_2 = 2.0 * height_scalar * (gray_2 - 0.5);
    // vec4 neighbor_2 = vec4(world_pos.x, og_world_y + d_2, world_pos.z + 0.001*ground_size.y, 1.0);

    // 2.
    // tanget calcs
    vec3 tangent = first_neighbor - world_pos.xyz;
    vec3 bitangent = second_neighbor - world_pos.xyz;

    vec3 N = normalize(cross(bitangent, tangent));  // surface normal for ground
    vec3 L = normalize(light_positions[0]);         // light normal
    
    vec3 R = normalize(2.0 * dot(N, L) * N - L);    // reflected light normal
    vec3 V = normalize(camera_position);            // normalized camera view

    // diffuse, use the max trick
    diffuse_illum = vec3(light_colors[0] * max(dot(N,L), 0.0));

    // specular, again the max trick
    specular_illum = vec3(light_colors[0] * pow(max(dot(R,V), 0.0), mat_shininess));

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
