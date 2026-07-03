import { CHUNK_SIZE, CHUNK_HEIGHT } from './chunk.js';

export function generateChunk(chunk, seed) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
            const worldX = chunk.cx * CHUNK_SIZE + x;
            const worldZ = chunk.cz * CHUNK_SIZE + z;
            
            // Função pseudo-aleatória determinística para simular ondulação do relevo na Fase 1
            const baseNoise = Math.sin(worldX * 0.1) * Math.cos(worldZ * 0.1);
            const height = Math.floor(64 + baseNoise * 6); // Altura da superfície oscilando entre 58 e 70

            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                let blockId = 0; // Air
                
                if (y < height - 4) {
                    blockId = 3; // Stone
                } else if (y < height - 1) {
                    blockId = 2; // Dirt
                } else if (y === height - 1) {
                    blockId = 1; // Grass
                }
                
                chunk.blocks[chunk.index(x, y, z)] = blockId;
            }
        }
    }
    chunk.generated = true;
    chunk.dirty = true;
}