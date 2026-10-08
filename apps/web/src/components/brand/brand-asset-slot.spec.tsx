import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandAssetSlot } from './brand-asset-slot';
import { BRAND_ASSETS, type BrandAssetVariant } from './brand-assets';

const EXPECTED_DIMENSIONS: Record<BrandAssetVariant, [number, number]> = {
  header: [160, 56],
  login: [240, 84],
  compact: [32, 32],
  reduced: [120, 42],
  'institutional-lockup': [220, 48],
  favicon: [32, 32],
};

const variants = Object.keys(EXPECTED_DIMENSIONS) as BrandAssetVariant[];

describe('BRAND_ASSETS registry', () => {
  it.each(variants)('defines the exact content dimensions for %s', (variant) => {
    const [width, height] = EXPECTED_DIMENSIONS[variant];
    expect(BRAND_ASSETS[variant].width).toBe(width);
    expect(BRAND_ASSETS[variant].height).toBe(height);
  });

  it('starts without official sources configured', () => {
    for (const variant of variants) {
      expect(BRAND_ASSETS[variant].src).toBeUndefined();
    }
  });
});

describe('BrandAssetSlot', () => {
  it.each(variants)('reserves exactly the configured area for %s', (variant) => {
    const [width, height] = EXPECTED_DIMENSIONS[variant];
    render(<BrandAssetSlot variant={variant} />);

    const content = screen.getByTestId(`brand-slot-content-${variant}`);
    expect(content.style.width).toBe(`${width}px`);
    expect(content.style.height).toBe(`${height}px`);
    expect(content.style.minWidth).toBe(`${width}px`);
    expect(content.style.maxWidth).toBe(`${width}px`);
    expect(content.style.minHeight).toBe(`${height}px`);
    expect(content.style.maxHeight).toBe(`${height}px`);
    expect(content).toHaveClass('shrink-0');
  });

  it('applies the protection area outside the content area', () => {
    const { container } = render(<BrandAssetSlot variant="login" />);
    const slot = container.querySelector('[data-brand-slot="login"]') as HTMLElement;

    expect(slot.style.padding).toBe(`${BRAND_ASSETS.login.protection}px`);
    expect(slot).toContainElement(screen.getByTestId('brand-slot-content-login'));
  });

  it('renders an identified placeholder when no source is configured', () => {
    const { container } = render(<BrandAssetSlot variant="header" />);

    const placeholder = screen.getByRole('img', { name: 'Clínica Digital UFPE (marca provisória)' });
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent('Logotipo completo');
    expect(placeholder).toHaveTextContent('160 × 56 px');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-brand-slot]')).toHaveAttribute('data-state', 'placeholder');
  });

  it('keeps compact placeholders identified through their accessible name', () => {
    render(<BrandAssetSlot variant="compact" />);

    const placeholder = screen.getByRole('img', { name: /marca provisória/ });
    expect(placeholder).toHaveAttribute('title', expect.stringContaining('32 × 32 px'));
  });

  it('uses a context specific alternative text when provided', () => {
    render(<BrandAssetSlot variant="institutional-lockup" alt="Assinatura NUTES UFPE" />);
    expect(
      screen.getByRole('img', { name: 'Assinatura NUTES UFPE (marca provisória)' }),
    ).toBeInTheDocument();
  });

  it('renders a configured image contained within the slot without distortion', () => {
    const { container } = render(<BrandAssetSlot variant="header" src="/brand/logo.svg" />);

    const image = screen.getByRole('img', { name: 'Clínica Digital UFPE' });
    expect(image.tagName).toBe('IMG');
    expect(image).toHaveAttribute('src', '/brand/logo.svg');
    expect(image).toHaveClass('object-contain', 'h-full', 'w-full');
    expect(container.querySelector('[data-brand-slot]')).toHaveAttribute('data-state', 'asset');
    expect(screen.queryByText(/Placeholder/)).not.toBeInTheDocument();
  });

  it('preserves the reserved area when switching from placeholder to image', () => {
    const { rerender } = render(<BrandAssetSlot variant="reduced" />);
    const before = screen.getByTestId('brand-slot-content-reduced');
    const beforeStyle = { width: before.style.width, height: before.style.height };

    rerender(<BrandAssetSlot variant="reduced" src="/brand/wide-logo.png" />);
    const after = screen.getByTestId('brand-slot-content-reduced');

    expect({ width: after.style.width, height: after.style.height }).toEqual(beforeStyle);
    expect(after.querySelector('img')).toHaveClass('object-contain');
  });
});
