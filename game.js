import * as THREE from 'three';
import { GameState, Chunk, WorldManager, EventBus } from './world.js';
import { updatePhysics } from './physics.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('game-canvas');
const instructions = document.getElementById('instructions');
const gameOverScreen = document.getElementById('game-over');
const hpFill = document.getElementById('hp-fill');
const debugCoords = document.getElementById('debug-coords');
const debugTime = document.getElementById('debug-time');

const keys = { w: false, a: false, s: false, d: false, space: false };

// Inicialización del Terreno Inicial
for (let cx = -1; cx <= 1; cx++) {
    for (let cz = -1; cz <= 1; cz++) {
        const chunk = new Chunk(cx, cz);
        chunk.generate();
        GameState.world.chunks.set(WorldManager.getChunkKey(cx, cz), chunk);
    }
}

Renderer.init(canvas);
for (const [key, chunk] of GameState.world.chunks) {
    Renderer.renderChunk(key, chunk);
}

// Bloquear el puntero
instructions.addEventListener('click', () => canvas.requestPointerLock());
document.addEventListener('pointerlockchange', () => {
    instructions.style.display = document.pointerLockElement === canvas ? 'none' : 'flex';
});

// Eventos de Teclado y Mouse
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== canvas || GameState.player.isDead) return;
    const p = GameState.player;
    p.rotation.yaw -= e.movementX * 0.0025;
    p.rotation.pitch -= e.movementY * 0.0025;
    p.rotation.pitch = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, p.rotation.pitch));
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyD') keys.d = true;
    if (e.code === 'Space') keys.space = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyD') keys.d = false;
    if (e.code === 'Space') keys.space = false;
});

// Interacción con Bloques (Raycasting)
window.addEventListener('mousedown', (e) => {
    if (document.pointerLockElement !== canvas || GameState.player.isDead) return;
    
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(Renderer.camera.quaternion).normalize();
    const current = new THREE.Vector3(GameState.player.position.x, GameState.player.position.y + GameState.player.eyeHeight, GameState.player.position.z);
    let lastEmpty = null;

    for (let d = 0; d < GameState.player.reach; d += 0.1) {
        current.addScaledVector(dir, 0.1);
        const bx = Math.floor(current.x), by = Math.floor(current.y), bz = Math.floor(current.z);
        const block = WorldManager.getBlock(bx, by, bz);

        if (block !== 0) {
            if (e.button === 0) { // Romper
                WorldManager.setBlock(bx, by, bz, 0);
            } else if (e.button === 2 && lastEmpty) { // Colocar
                const activeId = GameState.hotbar.slots[GameState.hotbar.selectedIndex];
                WorldManager.setBlock(lastEmpty.x, lastEmpty.y, lastEmpty.z, activeId);
            }
            break;
        }
        lastEmpty = { x: bx, y: by, z: bz };
    }
});

// Gestión de Eventos del Bus
EventBus.on('chunk:dirty', ({ cx, cz }) => {
    const chunk = GameState.world.chunks.get(WorldManager.getChunkKey(cx, cz));
    if (chunk) Renderer.renderChunk(WorldManager.getChunkKey(cx, cz), chunk);
});

EventBus.on('player:damaged', (hp) => {
    hpFill.style.width = `${(hp / GameState.player.maxHp) * 100}%`;
    if (hp <= 0) {
        GameState.player.isDead = true;
        document.exitPointerLock();
        gameOverScreen.style.display = 'flex';
    }
});

document.getElementById('respawn-btn').addEventListener('click', () => {
    GameState.player.hp = 100;
    GameState.player.position = { x: 8, y: 45, z: 8 };
    GameState.player.velocity = { x: 0, y: 0, z: 0 };
    GameState.player.isDead = false;
    hpFill.style.width = '100%';
    gameOverScreen.style.display = 'none';
    canvas.requestPointerLock();
});

// Loop Principal
let lastTime = performance.now();

function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Progresión del tiempo (Ciclo de 24 horas en un par de minutos)
    GameState.world.time = (GameState.world.time + dt * 40) % 24000;
    const hours = Math.floor(GameState.world.time / 1000).toString().padStart(2, '0');
    debugTime.textContent = `Hora: ${hours}:00`;

    Renderer.updateSkyAndLighting();

    const p = GameState.player;
    if (!p.isDead) {
        let mx = 0, mz = 0;
        if (keys.w) mz -= 1;
        if (keys.s) mz += 1;
        if (keys.a) mx -= 1;
        if (keys.d) mx += 1;

        const moveDir = new THREE.Vector3(mx, 0, mz).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), p.rotation.yaw);
        p.velocity.x = moveDir.x * p.speed;
        p.velocity.z = moveDir.z * p.speed;

        if (keys.space && p.onGround) {
            p.velocity.y = p.jumpForce;
            p.onGround = false;
        }

        updatePhysics(p, dt);
    }

    // Sincronizar Câmera
    Renderer.camera.position.set(p.position.x, p.position.y + p.eyeHeight, p.position.z);
    const target = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), p.rotation.pitch).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.rotation.yaw).add(Renderer.camera.position);
    Renderer.camera.lookAt(target);

    debugCoords.textContent = `Pos: X: ${p.position.x.toFixed(1)}, Y: ${p.position.y.toFixed(1)}, Z: ${p.position.z.toFixed(1)}`;
    Renderer.threeRenderer.render(Renderer.scene, Renderer.camera);
}

requestAnimationFrame(loop);