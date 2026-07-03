export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 64;

export const BlockRegistry = {
    0: { id: 0, name: 'air', solid: false, transparent: true, color: 0x000000 },
    1: { id: 1, name: 'grass', solid: true, transparent: false, color: 0x557a2b },
    2: { id: 2, name: 'dirt', solid: true, transparent: false, color: 0x866043 },
    3: { id: 3, name: 'stone', solid: true, transparent: false, color: 0x808080 },
    4: { id: 4, name: 'wood', solid: true, transparent: false, color: 0x5c4033 },
    5: { id: 5, name: 'leaves', solid: true, transparent: true, color: 0x2e8b57 }
};

export const GameState = {
    player: {
        position: { x: 8, y: 45, z: 8 },
        velocity: { x: 0, y: 0, z: 0 },
        rotation: { yaw: 0, pitch: 0 },
        onGround: false,
        eyeHeight: 1.62,
        speed: 5,
        jumpForce: 8.5,
        reach: 6,
        hp: 100,
        maxHp: 100,
        isDead: false
    },
    hotbar: { slots: [1, 2, 3, 4], selectedIndex: 0 },
    world: { chunks: new Map(), time: 6000 } // 0 a 24000 (Midday = 6000, Night = 18000)
};

// Event Bus minimalista integrado
export const EventBus = {
    listeners: {},
    on(ev, cb) { (this.listeners[ev] ??= []).push(cb); },
    emit(ev, data) { (this.listeners[ev] || []).forEach(cb => cb(data)); }
};

function pseudoNoise2D(x, z) {
    let n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453123;
    return (n - Math.floor(n));
}

export class Chunk {
    constructor(cx, cz) {
        this.cx = cx;
        this.cz = cz;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
        this.dirty = true;
        this.mesh = null;
    }
    index(x, y, z) { return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x; }

    generate() {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const wx = this.cx * CHUNK_SIZE + x;
                const wz = this.cz * CHUNK_SIZE + z;
                const height = Math.floor(25 + pseudoNoise2D(wx*0.05, wz*0.05) * 12);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    let blockId = 0;
                    if (y < height - 3) blockId = 3;
                    else if (y < height - 1) blockId = 2;
                    else if (y === height - 1) blockId = 1;
                    this.blocks[this.index(x, y, z)] = blockId;
                }

                // Generación procedimental de árboles (Fase 3: Estructuras)
                if (x === 8 && z === 8 && pseudoNoise2D(wx, wz) > 0.4) {
                    this.generateTree(x, height, z);
                }
            }
        }
    }

    generateTree(tx, ty, tz) {
        if (ty + 6 >= CHUNK_HEIGHT) return;
        // Tronco
        for (let h = 0; h < 4; h++) {
            this.blocks[this.index(tx, ty + h, tz)] = 4; // wood
        }
        // Copa de hojas
        for (let ox = -1; ox <= 1; ox++) {
            for (let oz = -1; oz <= 1; oz++) {
                for (let oy = 3; oy <= 4; oy++) {
                    if (tx + ox >= 0 && tx + ox < CHUNK_SIZE && tz + oz >= 0 && tz + oz < CHUNK_SIZE) {
                        if (ox === 0 && oz === 0 && oy === 3) continue; // No sobrescribir tronco
                        this.blocks[this.index(tx + ox, ty + oy, tz + oz)] = 5; // leaves
                    }
                }
            }
        }
    }
}

export const WorldManager = {
    getChunkKey(cx, cz) { return `${cx},${cz}`; },
    getBlock(x, y, z) {
        if (y < 0 || y >= CHUNK_HEIGHT) return 0;
        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const chunk = GameState.world.chunks.get(this.getChunkKey(cx, cz));
        if (!chunk) return 0;
        return chunk.blocks[chunk.index(((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE, y, ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE)];
    },
    setBlock(x, y, z, blockId) {
        if (y < 0 || y >= CHUNK_HEIGHT) return;
        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const chunk = GameState.world.chunks.get(this.getChunkKey(cx, cz));
        if (chunk) {
            const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
            const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
            chunk.blocks[chunk.index(lx, y, lz)] = blockId;
            chunk.dirty = true;
            EventBus.emit('chunk:dirty', { cx, cz });
        }
    }
};