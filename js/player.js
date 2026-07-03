import { GameState } from './state.js';

const keys = { w: false, a: false, s: false, d: false, space: false };

export function initPlayerControls() {
    const canvas = document.getElementById('game-canvas');

    // Hacer click en el canvas activa el bloqueo del cursor
    canvas.addEventListener('click', () => {
        if (document.pointerLockElement !== canvas) {
            canvas.requestPointerLock();
        }
    });

    // Escuchar el movimiento del ratón para rotar la cámara
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement !== canvas) return;

        const sensitivity = 0.002;
        const p = GameState.player;

        p.rotation.yaw -= e.movementX * sensitivity;
        p.rotation.pitch -= e.movementY * sensitivity;

        // Limitar el cabeceo (Pitch) para evitar que la cámara se invierta (Gimbal Lock)
        const maxPitch = Math.PI / 2 - 0.05;
        p.rotation.pitch = Math.max(-maxPitch, Math.min(maxPitch, p.rotation.pitch));
    });

    // Capturar presiones de teclas
    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': keys.w = true; break;
            case 'KeyS': keys.s = true; break;
            case 'KeyA': keys.a = true; break;
            case 'KeyD': keys.d = true; break;
            case 'Space': keys.space = true; break;
        }
    });

    // Capturar liberación de teclas
    window.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': keys.w = false; break;
            case 'KeyS': keys.s = false; break;
            case 'KeyA': keys.a = false; break;
            case 'KeyD': keys.d = false; break;
            case 'Space': keys.space = false; break;
        }
    });
}

// Calcula los vectores de velocidad horizontal basados en la dirección de la mirada del jugador
export function updatePlayerMovement() {
    const p = GameState.player;
    let forward = 0;
    let strafe = 0;

    if (keys.w) forward += 1;
    if (keys.s) forward -= 1;
    if (keys.a) strafe -= 1;
    if (keys.d) strafe += 1;

    // Calcular dirección basada en el Yaw (rotación horizontal)
    const sinYaw = Math.sin(p.rotation.yaw);
    const cosYaw = Math.cos(p.rotation.yaw);

    let moveX = strafe * cosYaw - forward * sinYaw;
    let moveZ = strafe * sinYaw + forward * cosYaw;

    // Normalizar vector de movimiento para evitar velocidad diagonal extra
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
        moveX /= len;
        moveZ /= len;
    }

    // Aplicar velocidad base definida en el GameState
    p.velocity.x = moveX * p.speed;
    p.velocity.z = moveZ * p.speed;

    // Gestionar el salto si está tocando el suelo
    if (keys.space && p.onGround) {
        p.velocity.y = p.jumpForce;
        p.onGround = false;
    }
}