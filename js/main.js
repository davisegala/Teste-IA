import { GameState } from './state.js';
import { Chunk } from './chunk.js';
import { generateChunk } from './worldgen.js';
import { initRenderer, updateChunkMesh, render } from './renderer.js';
import { initPlayerControls, updatePlayerMovement } from './player.js';
import { updatePhysics } from './physics.js';

let lastTime = 0;

function init() {
    console.log("Inicializando VoxelGame - Controles y Física Activos...");
    
    // 1. Configurar posición de aparición inicial del jugador (sobre el terreno)
    GameState.player.position = { x: 8, y: 72, z: 8 };

    // 2. Inicializar subsistemas
    initRenderer();
    initPlayerControls();
    
    // 3. Crear el primer chunk estable (0,0)
    const initialChunk = new Chunk(0, 0);
    generateChunk(initialChunk, GameState.meta.seed);
    GameState.world.chunks.set("0,0", initialChunk);
    
    // Generar la geometría inicial combinada
    updateChunkMesh(initialChunk);
    
    requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    const clampedDelta = Math.min(deltaTime, 0.1);
    
    // Ejecutar lógica física e inputs independientes del render
    updatePlayerMovement();
    updatePhysics(clampedDelta);
    
    // Dibujar escena actualizada
    render();
}

window.addEventListener('DOMContentLoaded', init);