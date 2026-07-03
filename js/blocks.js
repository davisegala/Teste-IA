// Registro de metadados dos blocos (Única fonte de verdade para propriedades dos blocos)
export const BlockRegistry = {
    0: { id: 0, name: 'air',   solid: false, transparent: true },
    1: { id: 1, name: 'grass', solid: true,  transparent: false, hardness: 0.6, drops: 'dirt' },
    2: { id: 2, name: 'dirt',  solid: true,  transparent: false, hardness: 0.5, drops: 'dirt' },
    3: { id: 3, name: 'stone', solid: true,  transparent: false, hardness: 1.5, drops: 'cobblestone', requiresTool: 'pickaxe' }
};

// Mapeamento temporário de cores para a Fase 1 (enquanto não usamos o Texture Atlas)
export const BlockColors = {
    1: 0x557a2b, // Verde grama
    2: 0x866043, // Marrom terra
    3: 0x737373  // Cinza pedra
};