export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 128;

// As 6 direções adjacentes para o algoritmo de Culling
export const FACE_DIRECTIONS = [
    { dx:  1, dy:  0, dz:  0, name: 'right'  }, // +X
    { dx: -1, dy:  0, dz:  0, name: 'left'   }, // -X
    { dx:  0, dy:  1, dz:  0, name: 'top'    }, // +Y
    { dx:  0, dy: -1, dz:  0, name: 'bottom' }, // -Y
    { dx:  0, dy:  0, dz:  1, name: 'forward'}, // +Z
    { dx:  0, dy:  0, dz: -1, name: 'back'    }  // -Z
];

export class Chunk {
    constructor(chunkX, chunkZ) {
        this.cx = chunkX;
        this.cz = chunkZ;
        // Alocação linear otimizada para performance de memória
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
        this.dirty = true;
        this.mesh = null;
        this.generated = false;
    }

    // Traduz coordenadas locais tridimensionais (0..15, 0..127, 0..15) para o índice flat do array
    index(x, y, z) {
        return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
    }
}