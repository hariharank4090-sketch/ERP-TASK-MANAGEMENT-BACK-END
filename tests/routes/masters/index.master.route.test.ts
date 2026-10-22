import { describe, it, expect } from 'vitest';
import mastersRoutes from '../../../src/routes/masters/index.master.route';

describe('Masters Index Route', () => {
  it('mounts all master domain subrouters', () => {
    expect(mastersRoutes).toBeDefined();
    expect(mastersRoutes.stack.length).toBeGreaterThan(10);
  });
});
