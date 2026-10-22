import { describe, it, expect } from 'vitest';
import reportsRoutes from '../../../src/routes/reports/index.reports.route';

describe('Reports Index Route', () => {
  it('mounts staff-based and cost-center subroutes', () => {
    expect(reportsRoutes).toBeDefined();
    expect(reportsRoutes.stack.length).toBeGreaterThanOrEqual(2);
  });
});
