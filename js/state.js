export const GameState = {
    meta: {
        saveVersion: '1.0.0',
        seed: 1337,
        createdAt: Date.now(),
        lastSaved: null,
    },
    player: {
        position: { x: 0, y: 10, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        rotation: { yaw: 0, pitch: 0 },
        onGround: false,
        reach: 5,
        speed: 4.317,
        jumpForce: 8.4,
        eyeHeight: 1.62,
    },
    world: {
        chunks: new Map(),
        modifiedBlocks: new Map(),
        time: 0,
        dayLengthTicks: 24000,
    },
    entities: [],
    settings: {
        renderDistance: 4,
        fov: 75,
        invertY: false,
    }
};