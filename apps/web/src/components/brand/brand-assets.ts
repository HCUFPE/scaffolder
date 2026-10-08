/**
 * Registro central de ativos de marca — Clínica Digital UFPE
 * ---------------------------------------------------------------------------
 * Este é o ÚNICO ponto a ser alterado quando os arquivos oficiais forem
 * fornecidos pelo NUTES/UFPE. Consumidores usam apenas `<BrandAssetSlot />`
 * e nunca referenciam arquivos de marca diretamente.
 *
 * Como substituir um placeholder (ver README.md nesta pasta):
 *   1. Copie o SVG/PNG oficial para `src/assets/brand/`.
 *   2. Importe o arquivo aqui e atribua-o ao campo `src` da variante.
 *   3. Não altere `width`/`height`: o slot preserva o layout e a imagem é
 *      contida com `object-fit: contain`, sem corte ou deformação.
 */

export type BrandAssetVariant =
  | 'header'
  | 'login'
  | 'compact'
  | 'reduced'
  | 'institutional-lockup'
  | 'favicon';

export interface BrandAssetDefinition {
  /** Largura exata da área de conteúdo, em px. */
  width: number;
  /** Altura exata da área de conteúdo, em px. */
  height: number;
  /** Área de proteção aplicada fora da área de conteúdo, em px. */
  protection: number;
  /** Nome do ativo oficial esperado (exibido no placeholder). */
  assetName: string;
  /** Texto alternativo padrão do ativo. */
  alt: string;
  /** Origem do arquivo oficial. `undefined` enquanto não fornecido. */
  src?: string;
}

export const BRAND_ASSETS: Readonly<Record<BrandAssetVariant, BrandAssetDefinition>> = {
  header: {
    width: 160,
    height: 56,
    protection: 8,
    assetName: 'Logotipo completo',
    alt: 'Clínica Digital UFPE',
    src: undefined,
  },
  login: {
    width: 240,
    height: 84,
    protection: 12,
    assetName: 'Logotipo completo',
    alt: 'Clínica Digital UFPE',
    src: undefined,
  },
  compact: {
    width: 32,
    height: 32,
    protection: 4,
    assetName: 'Ícone-cruz',
    alt: 'Clínica Digital UFPE',
    src: undefined,
  },
  reduced: {
    width: 120,
    height: 42,
    protection: 6,
    assetName: 'Logotipo reduzido',
    alt: 'Clínica Digital UFPE',
    src: undefined,
  },
  'institutional-lockup': {
    width: 220,
    height: 48,
    protection: 8,
    assetName: 'Assinatura NUTES/UFPE',
    alt: 'NUTES e Universidade Federal de Pernambuco',
    src: undefined,
  },
  favicon: {
    width: 32,
    height: 32,
    protection: 0,
    assetName: 'Favicon',
    alt: 'Clínica Digital UFPE',
    src: undefined,
  },
};
