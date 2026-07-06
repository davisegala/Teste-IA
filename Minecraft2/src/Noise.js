export const PerlinNoise = {
    noise(x, z) {
        let X = Math.floor(x) & 255;
        let Z = Math.floor(z) & 255;
        let n = Math.sin(X * 12.9898 + Z * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 12 + 40; // Altura base calculada
    },
    noise3D(x, y, z) {
        // Técnica Fallback Multi-Amostra Cruzada (Conforme Seção 1.5)
        const a = Math.abs(Math.sin(x * 12.9898 + y * 54.342 + z * 78.233));
        const b = Math.abs(Math.sin(y * 23.412 + z * 43.123 + x * 91.543));
        const c = Math.abs(Math.sin(z * 87.124 + x * 19.452 + y * 32.198));
        return (a + b + c) / 3;
    }
};

export function hash3(x, y, z) {
    const h = Math.sin(x * 12.9898 + y * 78.233 + z * 137.41) * 43758.5453;
    return h - Math.floor(h);
}