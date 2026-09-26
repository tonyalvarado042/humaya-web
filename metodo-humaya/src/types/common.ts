/** Los cinco pilares del Método Humaya. */
export type Pillar = 'move' | 'nourish' | 'connect' | 'create' | 'believe';

export type Locale = 'es' | 'en' | 'de' | 'fr';

/**
 * Texto traducible. El español es obligatorio porque es el idioma en el que se
 * escribe el contenido; los demás entran a medida que existan (la Fase 5 hace
 * es y en; de y fr quedan para después).
 */
export type LocalizedText = { es: string } & Partial<Record<Locale, string>>;
