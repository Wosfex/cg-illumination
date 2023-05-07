import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreateBox, CreatePolygon, Size } from '@babylonjs/core';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            }

        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene'+ idx](idx);
        });
    }

    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                // translate negative x
                case 'a':
                    // this.active_light gives the index of the .lights
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;

                // translate positive x
                case 'd':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;

                //translate negative y
                case 'f':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;

                // translate positive y
                case 'r':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;

                //translate negative z
                case 'w':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;

                // translate positive z
                case 's':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
            }
          });

        

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene1(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 60.0, 70.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 0.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 15.0), scene);
        light1.diffuse = new Color3(-0.6627, -0.6627, -0.6627);
        light1.specular = new Color3(-0.6627, -0.6627, -0.6627);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.45, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models //
        let cloud1 = CreateSphere('sphere', {segments: 20}, scene);
        cloud1.position = new Vector3(1.0, 7.5, 3.0);
        cloud1.metadata = {
            mat_color: new Color3(1.0, 1.0, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 5,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cloud1.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cloud1);
    
        let cloud2 = CreateSphere('sphere', {segments: 20}, scene);
        cloud2.position = new Vector3(0.5, 7.5, 3.0);
        cloud2.metadata = {
            mat_color: new Color3(1.0, 1.0, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 5,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cloud2.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cloud2);

        let cloud3 = CreateSphere('sphere', {segments: 20}, scene);
        cloud3.position = new Vector3(0.3, 7.5, 2.5);
        cloud3.metadata = {
            mat_color: new Color3(1.0, 1.0, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 5,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cloud3.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cloud3);

        let cloud4 = CreateSphere('sphere', {segments: 20}, scene);
        cloud4.position = new Vector3(0.7, 7.8, 2.5);
        cloud4.metadata = {
            mat_color: new Color3(1.0, 1.0, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 5,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cloud4.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cloud4);

        let cloud5 = CreateSphere('sphere', {segments: 20}, scene);
        cloud5.position = new Vector3(1.0, 7.5, 3.5);
        cloud5.metadata = {
            mat_color: new Color3(1.0, 1.0, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 5,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cloud5.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cloud5);

        let cloud6 = CreateSphere('sphere', {segments: 20}, scene);
        cloud6.position = new Vector3(0.8, 7.5, 2.0);
        cloud6.metadata = {
            mat_color: new Color3(1.0, 1.0, 1.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 5,
            texture_scale: new Vector2(1.0, 1.0)
        }
        cloud6.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(cloud6);

        let customHouse = new Mesh("custom", scene);
        let housePositions = [
            // Walls
            0,0,0, 4,0,0, 4,4,0, // 0,1,2
            0,0,0, 0,4,0, 4,4,0, // 3,4,5

            0,0,0, 0,0,4, 0,4,4, // 6,7,8
            0,0,0, 0,4,0, 0,4,4, // 9,10,11

            0,0,4, 4,0,4, 4,4,4, // 12,13,14
            0,0,4, 0,4,4, 4,4,4, // 15,16,17

            4,0,4, 4,4,4, 4,0,0, // 18,19,20
            4,4,4, 4,4,0, 4,0,0, // 21,22,23  
            
            // Roof triangles
            0,4,0, 4,4,0, 2,6,0, // 24,25,26
            4,4,4, 0,4,4, 2,6,4, // 27,28,29

            // roof
            0,4,0, 0,4,4, 2,6,4, // 30,31,32
            0,4,0, 2,6,4, 2,6,0, // 33,34,35

            4,4,0, 4,4,4, 2,6,0, // 36,37,38
            4,4,4, 2,6,4, 2,6,0, // 39,40,41

            // doorway top
            1,3,0, 1,3,-1, 3,3,0, // 42,43,44
            3,3,0, 3,3,-1, 1,3,-1, // 45,46,47

            //doorway sides
            1,3,0, 1,0,0, 1,0,-1, // 48,49,50
            1,3,0, 1,3,-1, 1,0,-1, // 51,52,53

            3,3,0, 3,0,0, 3,0,-1, // 54,55,56
            3,3,0, 3,3,-1, 3,0,-1 // 57,58,59
        ]
        let houseIndices = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59];

        let houseNormals = [];
        
        customHouse.metadata = {
            mat_color: new Color3(0.66, 0.66, 0.66),
            mat_texture: white_texture,
            mat_specular: new Color3(0.5, 0.5, 0.5),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        };

        // Imported VertexData, found guide online about how to calculate normals automatically
        VertexData.ComputeNormals(housePositions, houseIndices, houseNormals);
        var vertexData = new VertexData();
        vertexData.positions = housePositions;
        vertexData.indices = houseIndices;
        vertexData.normals = houseNormals;
        vertexData.applyToMesh(customHouse, true);

        customHouse.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(customHouse);


        
        
        // Added code, starter taken from a guide on babylon.js key list
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                // translate negative x
                case 'a':
                    // this.active_light gives the index of the .lights
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;

                // translate positive x
                case 'd':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;

                //translate negative y
                case 'f':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;

                // translate positive y
                case 'r':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;

                //translate negative z
                case 'w':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;

                // translate positive z
                case 's':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
            }
          });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // This would be light changing stuff here
            // this.active_light = 0;
            // current_scene.lights.push(light0);
            // ...
            

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }


    createScene2(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.76, 0.69, 0.502),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let pyramid1 = CreateBox('rectangle', {segments: 32, size: 4, height: 0.1}, scene);
        pyramid1.position = new Vector3(-4.5, -0.9, 6.0);
        pyramid1.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        pyramid1.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(pyramid1);
        
        // Added code, starter taken from a guide on babylon.js key list
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                // translate negative x
                case 'a':
                    // this.active_light gives the index of the .lights
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;

                // translate positive x
                case 'd':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;

                //translate negative y
                case 'f':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;

                // translate positive y
                case 'r':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;

                //translate negative z
                case 'w':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;

                // translate positive z
                case 's':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
            }
          });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene3(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(0.1, 0.5, 1.0);
        light0.specular = new Color3(0.1, 0.5, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        let light2 = new PointLight('light2', new Vector3(3.0, 2.0, 4), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light2);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/worldheightmap.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.95),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);
        
        // Added code, starter taken from a guide on babylon.js key list
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                // translate negative x
                case 'a':
                    // this.active_light gives the index of the .lights
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;

                // translate positive x
                case 'd':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x+1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z
                        );
                    break;

                //translate negative y
                case 'f':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y-1, current_scene.lights[this.active_light].position.z
                        );
                    break;

                // translate positive y
                case 'r':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y+1, current_scene.lights[this.active_light].position.z
                        );
                    break;

                //translate negative z
                case 'w':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z-1
                        );
                    break;

                // translate positive z
                case 's':
                    current_scene.lights[this.active_light].position = new Vector3(
                        current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z+1
                        );
                    break;
            }
          });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }


    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
    
    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer }
