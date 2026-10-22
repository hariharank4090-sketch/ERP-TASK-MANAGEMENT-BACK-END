import { describe, it, expect } from 'vitest';
import appMenuController from '../../../src/controllers/configuration/menuManagement/index';

describe('Menu Management Controller', () => {
  it('instantiates appMenu controller and provides endpoint handlers', () => {
    expect(appMenuController).toBeDefined();
    expect(typeof appMenuController.newAppMenu).toBe('function');
    expect(typeof appMenuController.userRights).toBe('function');
  });
});
