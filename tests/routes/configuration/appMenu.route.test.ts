import { describe, it, expect } from 'vitest';
import appMenuRoutes from '../../../src/routes/configuration/appMenu.route';

describe('Configuration AppMenu Route', () => {
  it('exposes express router with route stack', () => {
    expect(appMenuRoutes).toBeDefined();
    expect(appMenuRoutes.stack.length).toBeGreaterThan(0);
  });
});
