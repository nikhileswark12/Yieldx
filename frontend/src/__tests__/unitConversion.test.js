import { describe, it, expect } from 'vitest';
import { acresToHectares, hectaresToAcres } from '../utils/unitConversion';

describe('Unit Conversion Utils', () => {
  it('should accurately convert acres to hectares', () => {
    expect(acresToHectares(1)).toBeCloseTo(0.404686, 4);
    expect(acresToHectares(5)).toBeCloseTo(2.02343, 4);
  });

  it('should accurately convert hectares to acres', () => {
    expect(hectaresToAcres(1)).toBeCloseTo(2.47105, 4);
    expect(hectaresToAcres(5)).toBeCloseTo(12.35525, 4);
  });

  it('should handle round-trip accuracy within reasonable precision', () => {
    const originalAcres = 10;
    const toHectares = acresToHectares(originalAcres);
    const backToAcres = hectaresToAcres(toHectares);
    // 10 * 0.404686 * 2.47105 = 9.999995703
    expect(Math.abs(backToAcres - originalAcres)).toBeLessThan(0.001);
  });
});
