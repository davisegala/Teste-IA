import * as THREE from 'three';
import { GameState, BlockRegistry, CHUNK_SIZE, CHUNK_HEIGHT, WorldManager } from './world.js';

const FACE_DIRECTIONS = [
    { dx:  1, dy:  0, dz:  0, faces: [ [1,1,1], [1,1,0], [1,0,1], [1,0,0] ], norm: [1,0,0] },
    { dx: -1, dy:  0, dz:  0, faces: [ [0,1,0], [0,1,1], [0,0,0], [0,0,1] ], norm: [-1,0,0] },
    { dx:  0, dy:  1, dz:  0, faces: [ [0,1,1], [1,1,1], [0,1,0], [1,1,0] ], norm: [0,1,0] },
    { dx:  0, dy: -1, dz:  0, faces: [ [0,0,0], [1,0,0], [0,0,1], [1,0,1] ], norm: [0,-1,0] },
    { dx:  0, dy:  0, dz:  1, faces: [ [0,1,1], [0,0,1], [1,1,1], [1,0,1] ], norm: [0,0,1] },
    { dx:  0, dy:  0, dz: -1, faces: [ [1,1,0], [1,0,0], [0,1,0], [0,0,0] ], norm: [0,0,-1] }
];

export const Renderer = {
    scene: null, camera: null, threeRenderer: null, material: null,
    ambientLight: null, dirLight: null,

    init(canvas) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
        this.threeRenderer.setPixelRatio(window.devicePixelRatio);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        this.dirLight.position.set(20, 40, 20);
        this.scene.add(this.dirLight);

        this.material = new THREE.MeshLambertMaterial({ vertexColors: true });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    },

    // Ciclo Día/Noche Dinámico (Fase 3: Iluminação Dinâmica)
    updateSkyAndLighting() {
        const time = GameState.world.time;
        // Normaliza el tiempo en un ángulo de radianes
        const angle = (time / 24000) * Math.PI * 2;
        
        // Calcula la intensidad según la altura del sol imaginario
        const sunY = Math.sin(angle);
        const dayIntensity = Math.max(0, sunY); // 0 en la noche, hasta 1 en el día

        // Interpola colores de cielo (Celeste a Oscuro)
        const skyColor = new THREE.Color(0x7ec0ee).multiplyScalar(0.2 + dayIntensity * 0.8);
        this.scene.background = skyColor;
        
        if (this.scene.fog) {
            this.scene.fog.color = skyColor;
        } else {
            this.scene.fog = new THREE.FogExp2(skyColor, 0.03);
        }

        this.ambientLight.intensity = 0.15 + dayIntensity * 0.55;
        this.dirLight.intensity = dayIntensity * 0.8;
        this.dirLight.position.set(Math.cos(angle) * 40, sunY * 40, 20);
    },

    renderChunk(key, chunk) {
        if (chunk.mesh) {
            this.scene.remove(chunk.mesh);
            chunk.mesh.geometry.dispose();
        }

        const positions = [], normals = [], colors = [], indices = [];
        let offset = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.blocks[chunk.index(x, y, z)];
                    if (blockId === 0) continue;

                    const wx = chunk.cx * CHUNK_SIZE + x;
                    const wz = chunk.cz * CHUNK_SIZE + z;
                    const bColor = new THREE.Color(BlockRegistry[blockId].color);

                    for (const dir of FACE_DIRECTIONS) {
                        const neighbor = BlockRegistry[WorldManager.getBlock(wx + dir.dx, y + dir.dy, wz + dir.dz)];
                        if (neighbor && neighbor.solid && !neighbor.transparent) continue;

                        for (const v of dir.faces) {
                            positions.push(wx + v[0], y + v[1], wz + v[2]);
                            normals.push(...dir.norm);
                            colors.push(bColor.r, bColor.g, bColor.b);
                        }
                        indices.push(offset+0, offset+1, offset+2, offset+2, offset+1, offset+3);
                        offset += 4;
                    }
                }
            }
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geom.setIndex(indices);

        const mesh = new THREE.Mesh(geom, this.material);
        this.scene.add(mesh);
        chunk.mesh = mesh;
        chunk.dirty = false;
    }
};