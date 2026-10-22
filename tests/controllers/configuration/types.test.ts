import { describe, it, expect } from 'vitest';
import { mapDbToApi, type MenuRowDB } from '../../../src/controllers/configuration/types';

describe('Configuration Menu Types & Mappers', () => {
  it('maps database menu row to API menu format', () => {
    const dbRow: MenuRowDB = {
      id: 5,
      name: 'User Management',
      menu_type: 1,
      parent_id: null,
      url: '/users',
      tUrl: null,
      rUrl: null,
      actionType: null,
      display_order: 2,
      is_active: 1,
      created_at: new Date(),
    };

    const apiRow = mapDbToApi(dbRow);

    expect(apiRow.menuId).toBe(5);
    expect(apiRow.slug).toBe('User Management');
    expect(apiRow.title).toBe('User Management');
    expect(apiRow.isActive).toBe(true);
    expect(apiRow.sortOrder).toBe(2);
    expect(apiRow.isVisible).toBe(true);
  });
});
