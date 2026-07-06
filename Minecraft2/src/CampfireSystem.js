import { ItemRegistry } from './Registry.js';
import { EventBus } from './EventBus.js';
import { SoundSystem } from './SoundSystem.js';

export const CampfireSystem = {
    activeCampfires: {},
    currentInteractingPos: null,

    getCampfire(posKey) {
        return this.activeCampfires[posKey] ??= {
            inputSlot: null, fuelSlot: null, outputSlot: null,
            burnTimeRemaining: 0, cookProgress: 0, maxCookProgress: 100
        };
    },

    tick(deltaTime) {
        for (const key in this.activeCampfires) {
            const fire = this.activeCampfires[key];
            let isBurning = fire.burnTimeRemaining > 0;

            if (isBurning) {
                fire.burnTimeRemaining -= deltaTime * 150;
                if (Math.random() < 0.15) SoundSystem.play('fire'); // Efeito sonoro estalado
            }

            const inputDef = fire.inputSlot ? ItemRegistry[fire.inputSlot.itemId] : null;
            const hasWork = inputDef && inputDef.smeltResult;

            // Consumir Carvão se a lenha apagar e houver trabalho na fila
            if (fire.burnTimeRemaining <= 0 && hasWork && fire.fuelSlot && fire.fuelSlot.count > 0) {
                const fuelDef = ItemRegistry[fire.fuelSlot.itemId];
                if (fuelDef?.fuelValue) {
                    fire.burnTimeRemaining = fuelDef.fuelValue;
                    fire.fuelSlot.count--;
                    if(fire.fuelSlot.count === 0) fire.fuelSlot = null;
                    isBurning = true;
                    EventBus.emit('campfire:ui_update');
                }
            }

            // Progresso de Fundição
            if (isBurning && hasWork) {
                fire.cookProgress += deltaTime * 40;
                if (fire.cookProgress >= fire.maxCookProgress) {
                    fire.cookProgress = 0;
                    const resultId = inputDef.smeltResult;
                    fire.inputSlot.count--;
                    if (fire.inputSlot.count === 0) fire.inputSlot = null;

                    if (!fire.outputSlot) fire.outputSlot = { itemId: resultId, count: 1 };
                    else if (fire.outputSlot.itemId === resultId) fire.outputSlot.count++;

                    SoundSystem.play('craft');
                    EventBus.emit('campfire:ui_update');
                }
            } else {
                fire.cookProgress = Math.max(0, fire.cookProgress - deltaTime * 20);
            }
        }
    },

    openUI(posKey, renderCallback) {
        this.currentInteractingPos = posKey;
        document.getElementById('campfire-modal')?.classList.remove('hidden');
        this.renderUI(renderCallback);
    },

    closeUI() {
        this.currentInteractingPos = null;
        document.getElementById('campfire-modal')?.classList.add('hidden');
    },

    renderUI(renderCallback) {
        if (!this.currentInteractingPos) return;
        const fire = this.getCampfire(this.currentInteractingPos);

        this.updateDOMSlot(document.getElementById('campfire-input-slot'), fire.inputSlot);
        this.updateDOMSlot(document.getElementById('campfire-fuel-slot'), fire.fuelSlot);
        this.updateDOMSlot(document.getElementById('campfire-output-slot'), fire.outputSlot);

        const icon = document.getElementById('campfire-fire-icon');
        if (icon) icon.style.opacity = fire.burnTimeRemaining > 0 ? "1" : "0.2";

        if (renderCallback) renderCallback();
    },

    updateDOMSlot(el, slot) {
        if (!el) return;
        el.innerHTML = '';
        if (slot && slot.count > 0) {
            const def = ItemRegistry[slot.itemId];
            el.innerHTML = `<span class="slot-icon" style="background:#${def?.color?.toString(16) || '888'}"></span>
                            <span class="slot-count">${slot.count}</span>`;
        }
    }
};

EventBus.on('campfire:ui_update', () => CampfireSystem.renderUI());