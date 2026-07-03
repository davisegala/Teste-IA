// ... (Mantener las importaciones e initRenderer anteriores intactas)

export function updateCameraFromState() {
    const p = GameState.player;

    // Sincronizar posición de los ojos
    camera.position.set(p.position.x, p.position.y + p.eyeHeight, p.position.z);

    // Reconstruir la dirección de la mirada usando matrices de rotación básicas de Three.js
    const target = new THREE.Vector3(0, 0, -1);
    // Aplicar rotación vertical (Pitch) y luego horizontal (Yaw)
    target.applyAxisAngle(new THREE.Vector3(1, 0, 0), p.rotation.pitch);
    target.applyAxisAngle(new THREE.Vector3(0, 1, 0), p.rotation.yaw);
    
    target.add(camera.position);
    camera.lookAt(target);
}

export function render() {
    // Sincroniza la cámara antes de pintar el frame gráfico
    updateCameraFromState();
    renderer.render(scene, camera);
}