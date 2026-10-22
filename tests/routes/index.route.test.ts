import { describe, it, expect } from 'vitest';
import appRoutes from '../../src/routes/index.route';

describe('Application Root API Routes', () => {
  it('mounts configuration, authorization, masters, attendance, and reports', () => {
    expect(appRoutes).toBeDefined();
    expect(appRoutes.stack.length).toBeGreaterThanOrEqual(5);
  });
});
