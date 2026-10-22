import { describe, it, expect } from 'vitest';
import leaveTypeRoutes from '../../../src/routes/masters/leaveType.route';

describe('Master LeaveType Routes', () => {
  it('exposes registered leaveType endpoints', () => {
    expect(leaveTypeRoutes).toBeDefined();
    expect(leaveTypeRoutes.stack.length).toBeGreaterThan(0);
  });

  it('contains expected leave type route definitions', () => {
    const routePaths = leaveTypeRoutes.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => layer.route.path);

    expect(routePaths).toContain('/');
  });
});
