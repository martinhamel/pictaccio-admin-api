export const Languages = [
    'en',
    'fr'
] as const;

export type Language = typeof Languages[number];
