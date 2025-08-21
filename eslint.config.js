import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Habilita variables globales como `window`, `document`
        ...globals.node     // Habilita variables globales como `require`, `process`
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],// Permite variables sin usar si comienzan con "_"
      'eqeqeq': ['error', 'always'],// Obliga a usar === en vez de ==
      'no-undef': 'error',// Marca como error usar variables no definidas
      'no-empty': ['warn', { allowEmptyCatch: true }],// Permite catch {} vacío, pero da warning si otros bloques están vacíos
      'prefer-const': 'warn', // Sugiere usar const si no se reasigna la variable
      'no-var': 'error',// Prohíbe completamente el uso de `var`
      'semi': ['error', 'always'],// Requiere punto y coma al final de las líneas
      'no-shadow': 'warn',// Da advertencia si sombreas variables del scope padre
      'no-magic-numbers': ['warn', { ignore: [0, 1], ignoreArrayIndexes: true }] //Evita usar números mágicos en el código, para que sean declarados como constantes.
    }
  }
];
