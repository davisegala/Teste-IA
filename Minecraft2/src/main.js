import * as THREE from 'three';
import { SoundSystem } from './SoundSystem.js';
import { EventBus } from './EventBus.js';
import { ItemRegistry, BlockRegistry } from './Registry.js';
import { WorldManager } from './WorldManager.js';
import { PlayerHand } from './PlayerHand.js';
import { CampfireSystem } from './CampfireSystem.js';

let scene, camera, renderer, clock;
let hotbar = Array(9).fill(null);
let selectedHotbarIndex = 0;
let uiOpen = false;
let playerPos = new THREE.Vector3(0, 52, 0);

// Itens básicos iniciais concedidos para testar o sistema
hotbar[0] = { itemId: 'wood_log', count: 12 };
hotbar[1] = { itemId: 'coal', count: 16 };
hotbar[2] = { itemId: 'campfire', count: 2 };

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 53, 4);
    camera.lookAt(0, 52, 0);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    WorldManager.init(scene);
    PlayerHand.init(camera, scene);
    
    setupControls();
    updateHotbarUI();
    PlayerHand.updateHandItem(hotbar[selectedHotbarIndex]?.itemId);

    animate();
}

function setupControls() {
    window.addEventListener('keydown', (e) => {
        if(e.key === 'e' || e.key === 'E') {
            uiOpen = !uiOpen;
            if(!uiOpen) {
                document.getElementById('inventory-modal').classList.add('hidden');
                CampfireSystem.closeUI();
            } else {
                document.getElementById('inventory-modal').classList.remove('hidden');
            }
        }
        if(!uiOpen && e.key >= '1' && e.key <= '9') {
            selectedHotbarIndex = parseInt(e.key) - 1;
            updateHotbarUI();
            PlayerHand.updateHandItem(hotbar[selectedHotbarIndex]?.itemId);
        }
    });

    window.addEventListener('mousedown', (e) => {
        if (uiOpen) return;
        
        // Simulação vetorial linear para extração/interação à frente
        const tx = Math.round(playerPos.x);
        const ty = Math.round(playerPos.y - 1);
        const tz = Math.round(playerPos.z - 3);

        if (e.button === 0) { // Clique Esquerdo: Minerar
            PlayerHand.swing();
            const targetBlock = WorldManager.getBlockAt(tx, ty, tz);
            if (targetBlock !== 0) {
                const def = BlockRegistry[targetBlock];
                WorldManager.setBlockAt(tx, ty, tz, 0);
                SoundSystem.play('break');
                if (def?.dropItem) addInventoryItem(def.dropItem, 1);
            }
        } else if (e.button === 2) { // Clique Direito: Colocar Bloco / Interagir
            const currentBlock = WorldManager.getBlockAt(tx, ty, tz);
            const blockDef = BlockRegistry[currentBlock];

            // Se for fogueira interativa, abrir menu dedicado
            if (blockDef && blockDef.interactable === 'campfire') {
                uiOpen = true;
                CampfireSystem.openUI(`${tx},${ty},${tz}`, renderCampfirePlayerGrid);
            } else {
                const activeSlot = hotbar[selectedHotbarIndex];
                if (activeSlot) {
                    const itemDef = ItemRegistry[activeSlot.itemId];
                    if (itemDef?.category === 'block') {
                        WorldManager.setBlockAt(tx, ty + 1, tz, itemDef.placesBlockId);
                        activeSlot.count--;
                        if(activeSlot.count <= 0) hotbar[selectedHotbarIndex] = null;
                        updateHotbarUI();
                        PlayerHand.updateHandItem(hotbar[selectedHotbarIndex]?.itemId);
                    }
                }
            }
        }
    });

    document.getElementById('btn-close-inv')?.addEventListener('click', () => {
        uiOpen = false;
        document.getElementById('inventory-modal').classList.add('hidden');
    });

    document.getElementById('btn-close-campfire')?.addEventListener('click', () => {
        uiOpen = false;
        CampfireSystem.closeUI();
    });
}

function addInventoryItem(itemId, amount) {
    for(let i=0; i<9; i++) {
        if(hotbar[i] && hotbar[i].itemId === itemId) { hotbar[i].count += amount; updateHotbarUI(); return; }
    }
    for(let i=0; i<9; i++) {
        if(!hotbar[i]) { hotbar[i] = { itemId, count: amount }; updateHotbarUI(); return; }
    }
}

function updateHotbarUI() {
    const slots = document.querySelectorAll('.hotbar-slot');
    slots.forEach((slot, idx) => {
        slot.classList.toggle('selected', idx === selectedHotbarIndex);
        const data = hotbar[idx];
        slot.innerHTML = '';
        if(data) {
            const def = ItemRegistry[data.itemId];
            slot.innerHTML = `<div class="slot-icon" style="background:#${def?.color?.toString(16) || '555'}"></div>
                              <span class="slot-count">${data.count || ''}</span>`;
        }
    });
}

function renderCampfirePlayerGrid() {
    const gridEl = document.getElementById('campfire-player-inv');
    if (!gridEl) return;
    gridEl.innerHTML = '';
    hotbar.forEach((slot, i) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'inv-slot';
        if (slot) {
            const def = ItemRegistry[slot.itemId];
            slotEl.innerHTML = `<span class="slot-icon" style="background:#${def?.color?.toString(16)}"></span>
                                <span class="slot-count">${slot.count}</span>`;
            
            slotEl.addEventListener('click', () => {
                const fire = CampfireSystem.getCampfire(CampfireSystem.currentInteractingPos);
                if (def.fuelValue && !fire.fuelSlot) {
                    fire.fuelSlot = { itemId: slot.itemId, count: 1 };
                    slot.count--;
                } else if (def.smeltResult && !fire.inputSlot) {
                    fire.inputSlot = { itemId: slot.itemId, count: 1 };
                    slot.count--;
                }
                if(slot.count <= 0) hotbar[i] = null;
                updateHotbarUI();
                CampfireSystem.renderUI(renderCampfirePlayerGrid);
            });
        }
        gridEl.appendChild(slotEl);
    });
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    CampfireSystem.tick(delta);
    WorldManager.updateStreaming(playerPos);
    renderer.render(scene, camera);
}

window.onload = () => { init(); };