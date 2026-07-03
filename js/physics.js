import { GameState } from './state.js';
import { WorldManager } from './world.js';

const GRAVITY = -24.0; // Aceleración hacia abajo m/s^2
const TERMINAL_VELOCITY = -40.0;
const PLAYER_RADIUS = 0.3; // Grosor del cuerpo del jugador
const PLAYER_HEIGHT = 1.8; // Altura total de la colisión

export function updatePhysics(deltaTime) {
    const p = GameState.player;

    // 1. Aplicar Gravedad en el eje Y
    p.velocity.y += GRAVITY * deltaTime;
    if (p.velocity.y < TERMINAL_VELOCITY) p.velocity.y = TERMINAL_VELOCITY;

    // 2. Mover y Resolver Eje Y de forma aislada
    p.position.y += p.velocity.y * deltaTime;
    p.onGround = false;
    resolveAxisCollisions('y');

    // 3. Mover y Resolver Eje X
    p.position.x += p.velocity.x * deltaTime;
    resolveAxisCollisions('x');

    // 4. Mover y Resolver Eje Z
    p.position.z += p.velocity.z * deltaTime;
    resolveAxisCollisions('z');
}

function resolveAxisCollisions(axis) {
    const p = GameState.player;

    // Definir la caja de colisión (AABB) del jugador en base a su posición actual
    const minX = Math.floor(p.position.x - PLAYER_RADIUS);
    const maxX = Math.floor(p.position.x + PLAYER_RADIUS);
    const minY = Math.floor(p.position.y);
    const maxY = Math.floor(p.position.y + PLAYER_HEIGHT);
    const minZ = Math.floor(p.position.z - PLAYER_RADIUS);
    const maxZ = Math.floor(p.position.z + PLAYER_RADIUS);

    // Revisar todos los bloques que intersectan el volumen del jugador
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                
                // Si el bloque es sólido, hay colisión que resolver
                if (WorldManager.getBlock(x, y, z) !== 0) {
                    
                    if (axis === 'y') {
                        if (p.velocity.y < 0) { // Cayendo
                            p.position.y = y + 1;
                            p.onGround = true;
                        } else if (p.velocity.y > 0) { // Subiendo / Golpeando el techo
                            p.position.y = y - PLAYER_HEIGHT - 0.001;
                        }
                        p.velocity.y = 0;
                        return;
                    }
                    
                    if (axis === 'x') {
                        if (p.velocity.x > 0) p.position.x = x - PLAYER_RADIUS - 0.001; // Colisión Derecha
                        else if (p.velocity.x < 0) p.position.x = x + 1 + PLAYER_RADIUS + 0.001; // Colisión Izquierda
                        p.velocity.x = 0;
                        return;
                    }
                    
                    if (axis === 'z') {
                        if (p.velocity.z > 0) p.position.z = z - PLAYER_RADIUS - 0.001; // Colisión Frente
                        else if (p.velocity.z < 0) p.position.z = z + 1 + PLAYER_RADIUS + 0.001; // Colisión Atrás
                        p.velocity.z = 0;
                        return;
                    }
                }
            }
        }
    }
}