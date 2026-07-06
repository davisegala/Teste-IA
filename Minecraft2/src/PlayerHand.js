import * as THREE from 'three';
import { ItemRegistry } from './Registry.js';

let handGroup;
let currentHandItemMesh = null;

export const PlayerHand = {
    init(camera, scene) {
        handGroup = new THREE.Group();
        // Coordenadas locais especificadas (canto inferior direito em primeira pessoa)
        handGroup.position.set(0.35, -0.35, -0.6);
        handGroup.rotation.set(0, Math.PI * 0.15, 0);
        camera.add(handGroup);
        scene.add(camera);
        
        // Renderização do modelo básico do braço do jogador
        const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.4), new THREE.MeshLambertMaterial({ color: 0xe0a96d }));
        armMesh.position.set(0, 0, 0.2);
        handGroup.add(armMesh);
    },

    updateHandItem(itemId) {
        if (currentHandItemMesh) {
            handGroup.remove(currentHandItemMesh);
            if (currentHandItemMesh.geometry) currentHandItemMesh.geometry.dispose();
            currentHandItemMesh = null;
        }

        if (!itemId) return;
        const itemDef = ItemRegistry[itemId];
        if (!itemDef) return;

        let geo;
        if (itemDef.category === 'block') {
            geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        } else {
            geo = new THREE.CylinderGeometry(0.015, 0.015, 0.3);
        }

        currentHandItemMesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: itemDef.color || 0xffffff }));
        currentHandItemMesh.position.set(0, 0.08, -0.1);
        currentHandItemMesh.rotation.set(Math.PI / 4, 0, 0);
        handGroup.add(currentHandItemMesh);
    },

    swing() {
        let elapsed = 0;
        const animateSwing = () => {
            elapsed += 0.15;
            handGroup.rotation.x = -Math.sin(elapsed) * 0.4;
            if (elapsed < Math.PI) requestAnimationFrame(animateSwing);
            else handGroup.rotation.x = 0;
        };
        animateSwing();
    }
};