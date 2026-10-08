# Ativos de marca — Clínica Digital UFPE

Esta pasta concentra a aplicação da marca no frontend:

| Arquivo | Papel |
|---|---|
| [`brand-assets.ts`](./brand-assets.ts) | Registro central tipado: dimensões, área de proteção, texto alternativo e origem de cada variante |
| [`brand-asset-slot.tsx`](./brand-asset-slot.tsx) | Componente `<BrandAssetSlot />` que reserva o espaço e renderiza placeholder ou arquivo oficial |

> Telas e layouts **nunca** devem declarar `<img>` de marca ou caixas próprias de logotipo. Use sempre `<BrandAssetSlot variant="..." />`.

## Variantes e dimensões

| Variante | Área de conteúdo | Proteção | Uso |
|---|---:|---:|---|
| `header` | 160 × 56 px | 8 px | Sidebar expandida |
| `login` | 240 × 84 px | 12 px | Tela de login |
| `compact` | 32 × 32 px | 4 px | Sidebar recolhida (ícone-cruz) |
| `reduced` | 120 × 42 px | 6 px | Cabeçalho em telas estreitas |
| `institutional-lockup` | 220 × 48 px | 8 px | Rodapé NUTES/UFPE |
| `favicon` | 32 × 32 px | 0 px | Ativo-base do favicon |

As dimensões são decisões de layout e **não devem mudar** quando os arquivos oficiais chegarem. Se a proporção do arquivo for diferente da do slot, a imagem é contida (`object-fit: contain`) e a sobra fica vazia — nunca cortada ou esticada.

## Estado atual

Todas as entradas estão **sem arquivo oficial** (`src: undefined`). O slot exibe um placeholder neutro, tracejado, com o nome do ativo e a dimensão esperada, e expõe `aria-label="… (marca provisória)"`. O placeholder não imita a marca.

O favicon provisório está em [`public/favicon.svg`](../../../public/favicon.svg).

## Substituição pelos arquivos oficiais

Para cada ativo recebido do NUTES/UFPE:

1. **`header` e `login`** (logotipo completo)
   - Copiar para `src/assets/brand/logotipo-completo.svg` (ou `.png`).
   - Em `brand-assets.ts`: `import logotipoCompleto from '../../assets/brand/logotipo-completo.svg';` e definir `src: logotipoCompleto` nas duas entradas (ou usar arquivos distintos, se fornecidos).
2. **`reduced`** (logotipo reduzido) → `src/assets/brand/logotipo-reduzido.svg`, entrada `reduced`.
3. **`compact`** (ícone-cruz) → `src/assets/brand/icone-cruz.svg`, entrada `compact`.
4. **`institutional-lockup`** (assinatura NUTES/UFPE) → `src/assets/brand/lockup-nutes-ufpe.svg`, entrada `institutional-lockup`.
5. **`favicon`**
   - Substituir `public/favicon.svg` pelo favicon oficial (manter o nome ou atualizar o `<link rel="icon">` em `index.html`).
   - Opcionalmente importar o mesmo arquivo na entrada `favicon` do registro.

Após a troca:

- Não alterar `width`, `height` nem `protection`.
- Executar `npm test` (o `brand-asset-slot.spec.tsx` valida dimensões e renderização) e `npm run build`.
- Repetir a revisão visual em 360, 768 e 1440 px, nos temas claro e escuro.

## Regras de uso (Manual de Identidade Visual)

- Não recriar logótipo, ícone-cruz, brasão ou lockup com HTML/CSS/ícones genéricos.
- Não extrair imagens do PDF do manual para produção.
- Não recolorir, rotacionar, cortar ou deformar os arquivos.
- Ícone-cruz isolado apenas em usos compactos de apoio; lockup NUTES/UFPE no rodapé institucional.
