export const BlockRegistry = {
    0:  { id: 0,  name: 'air',           displayName: 'Ar', solid: false, transparent: true },
    1:  { id: 1,  name: 'grass',         displayName: 'Bloco de Grama', solid: true,  transparent: false, color: 0x4d7227, dropItem: 'dirt' },
    2:  { id: 2,  name: 'dirt',          displayName: 'Terra', solid: true,  transparent: false, color: 0x735135, dropItem: 'dirt' },
    3:  { id: 3,  name: 'stone',         displayName: 'Pedra', solid: true,  transparent: false, color: 0x6e6e6e, dropItem: 'cobblestone' },
    4:  { id: 4,  name: 'wood_log',      displayName: 'Tronco de Madeira', solid: true,  transparent: false, color: 0x402a14, dropItem: 'wood_log' },
    5:  { id: 5,  name: 'leaves',        displayName: 'Folhas', solid: true,  transparent: true,  color: 0x1d4a1d, dropItem: null },
    8:  { id: 8,  name: 'coal_ore',      displayName: 'Minério de Carvão', solid: true,  transparent: false, color: 0x2b2b2b, dropItem: 'coal' },
    9:  { id: 9,  name: 'iron_ore',      displayName: 'Minério de Ferro', solid: true,  transparent: false, color: 0xc2a37a, dropItem: 'raw_iron' }, // Drop alterado para Cru
    10: { id: 10, name: 'gold_ore',      displayName: 'Minério de Ouro', solid: true,  transparent: false, color: 0xe0c341, dropItem: 'raw_gold' },   // Drop alterado para Cru
    11: { id: 11, name: 'diamond_ore',   displayName: 'Minério de Diamante', solid: true,  transparent: false, color: 0x53e0e0, dropItem: 'diamond' },
    12: { id: 12, name: 'campfire',      displayName: 'Fogueira', solid: true, transparent: true, color: 0xe65100, dropItem: 'campfire', interactable: 'campfire', emitsLight: true, lightLevel: 12 }
};

export const ItemRegistry = {
    'dirt':           { displayName: 'Terra',              category: 'block', placesBlockId: 2, color: 0x735135 },
    'cobblestone':    { displayName: 'Pedregulho',         category: 'block', placesBlockId: 3, color: 0x6e6e6e },
    'wood_log':       { displayName: 'Tronco',             category: 'block', placesBlockId: 4, color: 0x402a14 },
    'campfire':       { displayName: 'Fogueira',           category: 'block', placesBlockId: 12, color: 0xe65100 },
    'coal':           { displayName: 'Carvão',             category: 'material', color: 0x1a1a1a, fuelValue: 1600 }, // Queima 1600 ciclos
    'raw_iron':       { displayName: 'Ferro Cru',          category: 'material', color: 0xb09070, smeltResult: 'iron_ingot' },
    'raw_gold':       { displayName: 'Ouro Cru',           category: 'material', color: 0xd4af37, smeltResult: 'gold_ingot' },
    'iron_ingot':     { displayName: 'Lingote de Ferro',   category: 'material', color: 0xd8d8d8 },
    'gold_ingot':     { displayName: 'Lingote de Ouro',    category: 'material', color: 0xffd700 },
    'diamond':        { displayName: 'Diamante',           category: 'material', color: 0x5decf5 },
    'stick':          { displayName: 'Graveto',            category: 'material', color: 0x966f33 }
};

export const RecipeRegistry = [
    { id: 'campfire', gridSize: 2, shapeless: true, ingredients: [{ itemId: 'wood_log', quantity: 1 }, { itemId: 'stick', quantity: 3 }], result: { itemId: 'campfire', quantity: 1 } }
];