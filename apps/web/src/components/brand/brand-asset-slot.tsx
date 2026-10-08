import { ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BRAND_ASSETS, type BrandAssetVariant } from './brand-assets';

export interface BrandAssetSlotProps {
  variant: BrandAssetVariant;
  /** Texto alternativo específico do contexto. Padrão: definido no registro. */
  alt?: string;
  /**
   * Origem explícita do ativo. Por padrão, a origem vem do registro central
   * (`brand-assets.ts`); use esta prop apenas em casos excepcionais/testes.
   */
  src?: string;
  className?: string;
}

/**
 * Slot dimensional de marca.
 *
 * Reserva uma área de conteúdo com largura e altura exatas e uma área de
 * proteção externa (padding do contêiner). Sem arquivo oficial configurado,
 * exibe um placeholder neutro e identificado; com arquivo, exibe a imagem
 * contida (`object-fit: contain`) sem corte, deformação ou reflow.
 */
export function BrandAssetSlot({ variant, alt, src, className }: BrandAssetSlotProps) {
  const definition = BRAND_ASSETS[variant];
  const source = src ?? definition.src;
  const altText = alt ?? definition.alt;
  const { width, height, protection } = definition;
  const isPlaceholder = !source;
  const showLabel = width >= 100;

  return (
    <span
      data-brand-slot={variant}
      data-state={isPlaceholder ? 'placeholder' : 'asset'}
      className={twMerge(clsx('inline-flex shrink-0 grow-0 box-content', className))}
      style={{ padding: protection }}
    >
      <span
        data-testid={`brand-slot-content-${variant}`}
        className="relative block shrink-0 grow-0 overflow-hidden"
        style={{ width, height, minWidth: width, minHeight: height, maxWidth: width, maxHeight: height }}
      >
        {isPlaceholder ? (
          <span
            role="img"
            aria-label={`${altText} (marca provisória)`}
            title={`Placeholder provisório: ${definition.assetName} — ${width} × ${height} px`}
            className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-sm border border-dashed border-current text-center leading-none opacity-70"
          >
            {showLabel ? (
              <>
                <span aria-hidden="true" className="text-[10px] font-bold uppercase tracking-wide">
                  {definition.assetName}
                </span>
                <span aria-hidden="true" className="text-[9px] font-normal">
                  Placeholder · {width} × {height} px
                </span>
              </>
            ) : (
              <ImageIcon aria-hidden="true" className="h-3.5 w-3.5" />
            )}
          </span>
        ) : (
          <img
            src={source}
            alt={altText}
            width={width}
            height={height}
            draggable={false}
            className="block h-full w-full object-contain"
          />
        )}
      </span>
    </span>
  );
}
