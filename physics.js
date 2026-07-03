import { WorldManager, EventBus } from './world.js';

const GRAVITY = -24;
const PLAYER_RADIUS = 0.3;
const PLAYER_HEIGHT = 1.8;
const FALL_DAMAGE_THRESHOLD = -11; // Velocidad vertical a partir de la cual se sufre daño

export function updatePhysics(player, deltaTime) {
    if (player.isDead) return;

    const previousVelocityY = player.velocity.y;
    player.velocity.y += GRAVITY * deltaTime;
    if (player.velocity.y < -40) player.velocity.y = -40;

    player.position.y += player.velocity.y * deltaTime;
    const hitGround = resolveCollisions(player, 'y');

    // Detección de Daño por Caída (Fase 3)
    if (hitGround && previousVelocityY < FALL_DAMAGE_THRESHOLD) {
        const fallVelocity = Math.abs(previousVelocityY);
        const damage = Math.floor((fallVelocity - Math.abs(FALL_DAMAGE_THRESHOLD)) * 5);
        if (damage > 0) {
            player.hp = Math.max(0, player.hp - damage);
            EventBus.emit('player:damaged', player.hp);
        }
    }

    player.position.x += player.velocity.x * deltaTime;
    resolveCollisions(player, 'x');

    player.position.z += player.velocity.z * deltaTime;
    resolveCollisions(player, 'z');
}

function resolveCollisions(player, axis) {
    const minX = Math.floor(player.position.x - PLAYER_RADIUS);
    const maxX = Math.floor(player.position.x + PLAYER_RADIUS);
    const minY = Math.floor(player.position.y);
    const maxY = Math.floor(player.position.y + PLAYER_HEIGHT);
    const minZ = Math.floor(player.position.z - PLAYER_RADIUS);
    const maxZ = Math.floor(player.position.z + PLAYER_RADIUS);
    let hitGround = false;

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                if (WorldManager.getBlock(x, y, z) !== 0) {
                    if (axis === 'y') {
                        if (player.velocity.y < 0) {
                            player.position.y = y + 1;
                            player.onGround = true;
                            hitGround = true;
                        } else if (player.velocity.y > 0) {
                            player.position.y = y - PLAYER_HEIGHT - 0.01;
                        }
                        player.velocity.y = 0;
                        return hitGround;
                    }
                    if (axis === 'x') {
                        if (player.velocity.x > 0) player.position.x = x - PLAYER_RADIUS - 0.01;
                        else if (player.velocity.x < 0) player.position.x = x + 1 + PLAYER_RADIUS + 0.01;
                        player.velocity.x = 0;
                    }
                    if (axis === 'z') {
                        if (player.velocity.z > 0) player.position.z = z - PLAYER_RADIUS - 0.01;
                        else if (player.velocity.z < 0) player.position.z = z + 1 + PLAYER_RADIUS + 0.01;
                        player.velocity.z = 0;
                    }
                }
            }
        }
    }
    if (axis === 'y' && player.velocity.y !== 0) {
        player.onGround = false;
    }
    return hitGround;
}