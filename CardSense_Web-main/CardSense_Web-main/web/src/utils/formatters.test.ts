/**
 * Formatters Utility Tests
 * 
 * Tests for utility functions that format currency, dates, percentages, and numbers.
 * 
 * Expectations:
 * - formatCurrency: correctly formats numbers as USD currency
 * - formatDate: parses ISO strings and formats as 'MMM dd, yyyy'
 * - formatDateTime: parses ISO strings and formats with time
 * - formatPercent: formats numbers as percentages with 1 decimal place
 * - formatNumber: formats numbers with thousand separators
 * 
 * Run this test file:
 *   npm test -- formatters.test.ts
 */

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  formatNumber,
} from './formatters';

describe('formatCurrency', () => {
  it('formats positive numbers as USD currency', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative numbers as USD currency', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    expect(formatCurrency(999999.99)).toBe('$999,999.99');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
    expect(formatCurrency(10.994)).toBe('$10.99');
  });
});

describe('formatDate', () => {
  it('formats valid ISO date strings', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
    expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
    expect(formatDate('2023-06-01')).toBe('Jun 01, 2023');
  });

  it('formats ISO datetime strings (ignores time)', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toBe('Jan 15, 2024');
    expect(formatDate('2024-07-04T23:59:59.999Z')).toBe('Jul 04, 2024');
  });

  it('returns original string for invalid dates', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date');
    expect(formatDate('')).toBe('');
    expect(formatDate('not a date')).toBe('not a date');
  });
});

describe('formatDateTime', () => {
  it('formats valid ISO datetime strings with time', () => {
    // Note: time display depends on local timezone, so we check pattern
    const result = formatDateTime('2024-01-15T10:30:00Z');
    expect(result).toMatch(/Jan 15, 2024/);
    expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });

  it('handles datetime with different times', () => {
    const morning = formatDateTime('2024-06-15T08:00:00Z');
    const evening = formatDateTime('2024-06-15T20:00:00Z');
    
    expect(morning).toMatch(/Jun 15, 2024/);
    expect(evening).toMatch(/Jun 15, 2024/);
  });

  it('returns original string for invalid dates', () => {
    expect(formatDateTime('invalid')).toBe('invalid');
    expect(formatDateTime('')).toBe('');
  });
});

describe('formatPercent', () => {
  it('formats numbers as percentages with 1 decimal place', () => {
    expect(formatPercent(50)).toBe('50.0%');
    expect(formatPercent(75.5)).toBe('75.5%');
    expect(formatPercent(100)).toBe('100.0%');
  });

  it('formats zero correctly', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('handles decimal precision', () => {
    expect(formatPercent(33.333)).toBe('33.3%');
    expect(formatPercent(66.666)).toBe('66.7%');
    expect(formatPercent(99.95)).toBe('100.0%');
  });

  it('handles percentages over 100', () => {
    expect(formatPercent(150)).toBe('150.0%');
    expect(formatPercent(200.5)).toBe('200.5%');
  });

  it('handles negative percentages', () => {
    expect(formatPercent(-10)).toBe('-10.0%');
    expect(formatPercent(-25.5)).toBe('-25.5%');
  });
});

describe('formatNumber', () => {
  it('formats numbers with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(999999999)).toBe('999,999,999');
  });

  it('handles small numbers without separators', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(999)).toBe('999');
  });

  it('handles decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(1000.001)).toBe('1,000.001');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
    expect(formatNumber(-1234567)).toBe('-1,234,567');
  });
});


