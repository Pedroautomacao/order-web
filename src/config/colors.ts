/**
 * Configuração de cores do Uai System (white-label).
 *
 * Estas cores são os tokens da MARCA PADRÃO (Uai System). Para adaptar a
 * plataforma a um cliente específico, basta sobrescrever `primary`,
 * `secondary` e `tertiary` aqui — todo o tema deriva destes valores.
 *
 * Paleta: verde esmeralda (frescor/confiança/higiene, adequado a alimentos),
 * teal profundo (apoio/info) e âmbar (destaque/atenção), sobre neutros
 * quentes claros e alto contraste.
 */

export const colors = {
  // Cor primária — verde esmeralda (navegação, botões principais, marca)
  primary: {
    lighter: '#e6f4ee',
    light: '#4a9a7e',
    main: '#1f7a5c',
    dark: '#155c44',
    contrastText: '#ffffff',
  },
  // Cor secundária — teal profundo (apoio, cabeçalhos, info)
  secondary: {
    lighter: '#e2f0f3',
    light: '#3c8092',
    main: '#0f5b6b',
    dark: '#0a4250',
    contrastText: '#ffffff',
  },
  // Cor terciária / acento — âmbar (destaques, atenção, prioridade)
  tertiary: {
    lighter: '#fdf0e4',
    light: '#f0a468',
    main: '#e8853a',
    dark: '#c26a26',
    contrastText: '#ffffff',
  },

  // Semânticas
  success: '#1f7a5c',
  warning: '#e8853a',
  error: '#c0392b',
  info: '#0f5b6b',

  // Neutros quentes
  background: '#f6f7f5',
  surface: '#ffffff',
  surfaceContainer: '#eef0ec',
  textPrimary: '#1a201d',
  textSecondary: '#4a544f',
  outline: '#c5ccc8',
  outlineStrong: '#7a847f',
} as const

export default colors
