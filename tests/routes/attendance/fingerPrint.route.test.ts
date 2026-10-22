import { describe, it, expect } from 'vitest';
import fingerPrintRoutes from '../../../src/routes/attendance/fingerPrint.route';

describe('Attendance FingerPrint Route', () => {
  it('exposes registered fingerPrint endpoints', () => {
    expect(fingerPrintRoutes).toBeDefined();
    expect(fingerPrintRoutes.stack.length).toBeGreaterThan(5);
  });

  it('contains expected fingerprint attendance route paths', () => {
    const routePaths = fingerPrintRoutes.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => layer.route.path);

    expect(routePaths).toContain('/today');
    expect(routePaths).toContain('/summary');
    expect(routePaths).toContain('/stats');
    expect(routePaths).toContain('/month/:year/:month');
  });
});
