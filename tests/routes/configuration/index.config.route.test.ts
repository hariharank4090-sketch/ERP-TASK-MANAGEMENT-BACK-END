import { describe, it, expect } from 'vitest';
import configRoutes from '../../../src/routes/configuration/index.config.route';

describe('Configuration Index Route', () => {
  it('mounts subrouters properly', () => {
    expect(configRoutes).toBeDefined();
    expect(configRoutes.stack.length).toBeGreaterThanOrEqual(2);
  });
});
