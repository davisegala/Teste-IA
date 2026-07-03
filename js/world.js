import { GameState } from './state.js';
import { CHUNK_SIZE, CHUNK_HEIGHT } from './chunk.js';

export const WorldManager = {
    // Retorna o ID do bloco em qualquer coordenada global X, Y, Z do mundo
    getBlock(x, y, z) {
        if (y < 0 || y >= CHUNK_HEIGHT) return 0; // Fora dos limites verticais é vácuo/ar

        // Encontra o ID do chunk contendo esta coordenada coordenada
        const cx = Math.floor(x / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        const key = `${cx},${cz}`;

        const chunk = GameState.world.chunks.get(key);
        if (!chunk || !chunk.generated) return 0; // Se não existe ou não gerou, assume ar

        // Calcula coordenadas locais dentro do chunk correspondente
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        return chunk.blocks[chunk.index(lx, y, lz)];
    }
};