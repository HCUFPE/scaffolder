import { describe, expect, it } from 'vitest';
import indexHtml from '../index.html?raw';

/**
 * Guardrails da identidade visual Clínica Digital UFPE.
 *
 * Verificações estáticas sobre o código-fonte dos componentes e páginas,
 * garantindo que a governança de cores e marca definida em `index.css`
 * não seja contornada por classes de paleta diretas.
 */

const sources = import.meta.glob(
  ['./components/**/*.tsx', './pages/**/*.tsx', './App.tsx', '!./**/*.spec.tsx'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const files = Object.entries(sources);

function findMatches(pattern: RegExp) {
  return files.flatMap(([path, content]) =>
    content
      .split('\n')
      .map((line, index) => ({ path, line: index + 1, text: line.trim() }))
      .filter(({ text }) => pattern.test(text)),
  );
}

describe('Identidade visual — guardrails estáticos', () => {
  it('encontra os arquivos de componentes e páginas a verificar', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('não usa cores de marca legadas blue-*, slate-* ou indigo-*', () => {
    const matches = findMatches(/\b(?:blue|slate|indigo)-\d{2,3}\b/);
    expect(matches).toEqual([]);
  });

  it('não usa paletas Tailwind diretas no lugar dos tokens semânticos', () => {
    const matches = findMatches(
      /\b(?:bg|text|border|ring|from|to|via|shadow|fill|stroke|outline|divide|placeholder|decoration)-(?:gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
    );
    expect(matches).toEqual([]);
  });

  it('restringe tokens de maturidade digital a componentes de maturidade', () => {
    const matches = findMatches(/maturity-/).filter(({ path }) => !/maturity/i.test(path));
    expect(matches).toEqual([]);
  });

  it('não exibe AS ou AppStart como marca visível nas superfícies do produto', () => {
    const visibleBrand = findMatches(/AppStart|>\s*AS\s*</);
    expect(visibleBrand).toEqual([]);
  });

  it('identifica Clínica Digital UFPE nos metadados do documento', () => {
    expect(indexHtml).toMatch(/<title>Clínica Digital UFPE<\/title>/);
    expect(indexHtml).not.toMatch(/<title>[^<]*AppStart/);
    expect(indexHtml).toMatch(/<link rel="icon"[^>]*href="\/favicon\.svg"/);
  });
});
