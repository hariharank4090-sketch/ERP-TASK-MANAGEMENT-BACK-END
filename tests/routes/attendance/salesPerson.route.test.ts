import { describe, it, expect } from 'vitest';
import salesPersonRoutes from '../../../src/routes/attendance/salesPerson.route';

describe('Attendance SalesPerson Route', () => {
  it('exposes registered salesperson endpoints', () => {
    expect(salesPersonRoutes).toBeDefined();
    expect(salesPersonRoutes.stack.length).toBeGreaterThan(5);
  });

  it('contains expected attendance route paths', () => {
    const routePaths = salesPersonRoutes.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => layer.route.path);

    expect(routePaths).toContain('/last');
    expect(routePaths).toContain('/today');
    expect(routePaths).toContain('/history');
    expect(routePaths).toContain('/stats');
  });
});
