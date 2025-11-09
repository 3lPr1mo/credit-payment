import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('should format integer prices correctly in COP', () => {
    expect(formatPrice(1000)).toBe('$\u00A01.000');
    expect(formatPrice(50000)).toBe('$\u00A050.000');
    expect(formatPrice(250000)).toBe('$\u00A0250.000');
  });

  it('should format decimal prices by removing fractional digits', () => {
    expect(formatPrice(1000.99)).toBe('$\u00A01.001');
    expect(formatPrice(1000.50)).toBe('$\u00A01.001');
    expect(formatPrice(1000.49)).toBe('$\u00A01.000');
    expect(formatPrice(1000.10)).toBe('$\u00A01.000');
  });

  it('should handle zero correctly', () => {
    expect(formatPrice(0)).toBe('$\u00A00');
  });

  it('should format negative prices correctly', () => {
    expect(formatPrice(-1000)).toBe('-$\u00A01.000');
    expect(formatPrice(-50000)).toBe('-$\u00A050.000');
  });

  it('should handle large numbers correctly', () => {
    expect(formatPrice(1000000)).toBe('$\u00A01.000.000');
    expect(formatPrice(5000000)).toBe('$\u00A05.000.000');
    expect(formatPrice(123456789)).toBe('$\u00A0123.456.789');
  });

  it('should format small positive numbers correctly', () => {
    expect(formatPrice(1)).toBe('$\u00A01');
    expect(formatPrice(10)).toBe('$\u00A010');
    expect(formatPrice(100)).toBe('$\u00A0100');
  });

  it('should handle edge cases with very small decimals', () => {
    expect(formatPrice(0.01)).toBe('$\u00A00');
    expect(formatPrice(0.99)).toBe('$\u00A01');
    expect(formatPrice(1.001)).toBe('$\u00A01');
  });

  it('should maintain Colombian peso currency format', () => {
    const result = formatPrice(25000);
    expect(result).toMatch(/^\$\u00A0[\d.]+$/); // Should start with $ and non-breaking space, then contain only digits and dots
    expect(result).toBe('$\u00A025.000');
  });

  it('should handle floating point precision issues', () => {
    expect(formatPrice(0.1 + 0.2)).toBe('$\u00A00'); // 0.30000000000000004
    expect(formatPrice(1.1 + 1.2)).toBe('$\u00A02'); // 2.3000000000000003
  });
});
