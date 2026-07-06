import * as THREE from 'three';
import { BlockRegistry } from './Registry.js';
import { PerlinNoise, hash3 } from './Noise.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 64;

function isCaveAt(worldX, y, worldZ) {
    const caveNoise = PerlinNoise.noise3D(worldX * 0.06, y * 0.09, worldZ * 0.06);
    return caveNoise > 0.62; // Threshold exato da especificação técnica
}

export const WorldManager = {
    chunks: {},
    scene: null,

    init(scene) { this.scene = scene; },
    getChunkKey(cx, cz) { return `${cx},${cz}`; },

    getBlockAt(wx, wy, wz) {
        const cx = Math.floor(wx / CHUNK_SIZE);
        const cz = Math.floor(wz / CHUNK_SIZE);
        const chunk = this.chunks[this.getChunkKey(cx, cz)];
        if (!chunk) return 0;
        const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        if (wy < 0 || wy >= CHUNK_HEIGHT) return 0;
        return chunk.blocks[lx + wy * CHUNK_SIZE + lz * CHUNK_SIZE * CHUNK_HEIGHT] || 0;
    },

    setBlockAt(wx, wy, wz, blockId) {
        const cx = Math.floor(wx / CHUNK_SIZE);
        const cz = Math.floor(wz / CHUNK_SIZE);
        const chunk = this.chunks[this.getChunkKey(cx, cz)];
        if (!chunk) return;
        const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        if (wy >= 0 && wy < CHUNK_HEIGHT) {
            chunk.blocks[lx + wy * CHUNK_SIZE + (((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE) * CHUNK_SIZE * CHUNK_HEIGHT] = blockId;
            this.rebuildChunkMesh(chunk);
        }
    },

    generateChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        if (this.chunks[key]) return this.chunks[key];

        const chunk = { cx, cz, blocks: new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE), mesh: null };

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = cx * CHUNK_SIZE + x;
                const worldZ = cz * CHUNK_SIZE + z;
                const height = Math.floor(PerlinNoise.noise(worldX * 0.05, worldZ * 0.05));

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    let blockId = 0;
                    if (y < height - 4) {
                        blockId = 3; // Pedra base
                        const r = hash3(worldX, y, worldZ);
                        if (y < 40 && r < 0.010) blockId = 11;
                        else if (y < 55 && r < 0.020) blockId = 10;
                        else if (y < 60 && r < 0.035) blockId = 9;
                        else if (r < 0.060) blockId = 8;

                        // INTEGRAÇÃO: Esculpir Cavernas sem perfurar teto ou chão vazio (Seção 1.3)
                        if (y > 4 && y < height - 6 && isCaveAt(worldX, y, worldZ)) {
                            blockId = 0;
                        }
                    } else if (y < height - 1) blockId = 2;
                    else if (y === height - 1) blockId = 1;
                    
                    chunk.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT] = blockId;
                }
            }
        }
        this.chunks[key] = chunk;
        this.rebuildChunkMesh(chunk);
        return chunk;
    },

    rebuildChunkMesh(chunk) {
        if (chunk.mesh) this.scene.remove(chunk.mesh);
        const geometry = new THREE.BufferGeometry();
        const positions = [], colors = [], indices = [];
        let vertexCount = 0;

        const faces = [
            { dir: [0, 1, 0], corners: [[0,1,1], [1,1,1], [1,1,0], [0,1,0]] },
            { dir: [0, -1, 0], corners: [[0,0,0], [1,0,0], [1,0,1], [0,0,1]] },
            { dir: [0, 0, 1], corners: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]] },
            { dir: [0, 0, -1], corners: [[1,0,0], [0,0,0], [0,1,0], [1,1,0]] },
            { dir: [-1, 0, 0], corners: [[0,0,0], [0,0,1], [0,1,1], [0,1,0]] },
            { dir: [1, 0, 0], corners: [[1,0,1], [1,0,0], [1,1,0], [1,1,1]] }
        ];

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.blocks[x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT];
                    if (blockId === 0) continue;

                    const blockDef = BlockRegistry[blockId];
                    const tColor = new THREE.Color(blockDef ? blockDef.color : 0xffffff);
                    const wx = chunk.cx * CHUNK_SIZE + x;
                    const wz = chunk.cz * CHUNK_SIZE + z;

                    for (const face of faces) {
                        const neighbor = this.getBlockAt(wx + face.dir[0], y + face.dir[1], wz + face.dir[2]);
                        const nDef = BlockRegistry[neighbor];
                        if (!nDef || nDef.transparent || !nDef.solid) {
                            for (const c of face.corners) {
                                positions.push(wx + c[0], y + c[1], wz + c[2]);
                                colors.push(tColor.r, tColor.g, tColor.b);
                            }
                            indices.push(vertexCount, vertexCount+1, vertexCount+2, vertexCount, vertexCount+2, vertexCount+3);
                            vertexCount += 4;
                        }
                    }
                }
            }
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        chunk.mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ vertexColors: true }));
        this.scene.add(chunk.mesh);
    },

    updateStreaming(pos) {
        const pcx = Math.floor(pos.x / CHUNK_SIZE);
        const pcz = Math.floor(pos.z / CHUNK_SIZE);
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) this.generateChunk(pcx + x, pcz + z);
        }
    }
};