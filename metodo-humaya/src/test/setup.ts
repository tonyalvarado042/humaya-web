import { configure } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import '@/i18n';

/**
 * Los servicios mock simulan 200–400 ms de red, y varias pantallas encadenan
 * cuatro consultas antes de pintar. El segundo por defecto de Testing Library
 * queda corto y genera fallos intermitentes.
 */
configure({ asyncUtilTimeout: 3000 });
