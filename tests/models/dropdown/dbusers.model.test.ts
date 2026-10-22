import { describe, it, expect, vi } from 'vitest';
import { User, userQuerySchema, userIdSchema } from '../../../src/models/dropdown/dbusers.model';
import { getDefaultConnection } from '../../../src/config/database.config';
import type { Sequelize } from 'sequelize';

describe('Dropdown DB Users Model', () => {
  it('initializes the User model on a Sequelize instance', () => {
    const sequelize = getDefaultConnection();
    const UserModel = User.initialize(sequelize);

    expect(UserModel).toBeDefined();
    expect(UserModel.tableName).toBe('tbl_Users');
    expect(UserModel.rawAttributes.UserId).toBeDefined();
    expect(UserModel.rawAttributes.Name).toBeDefined();
    expect(UserModel.rawAttributes.UserName).toBeDefined();
  });

  it('retrieves next ID using query helper', async () => {
    const mockSequelize = {
      query: vi.fn().mockResolvedValue([{ nextId: 42 }]),
    } as unknown as Sequelize;

    const nextId = await User.getNextId(mockSequelize);
    expect(nextId).toBe(42);
    expect(mockSequelize.query).toHaveBeenCalled();
  });

  it('validates userQuerySchema defaults and coercion', () => {
    const parsed = userQuerySchema.parse({
      search: 'alice',
      activeOnly: false,
    });
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
    expect(parsed.search).toBe('alice');
    expect(parsed.activeOnly).toBe(false);
  });

  it('validates userIdSchema for valid and invalid inputs', () => {
    expect(userIdSchema.safeParse({ id: 10 }).success).toBe(true);
    expect(userIdSchema.safeParse({ id: 0 }).success).toBe(false);
    expect(userIdSchema.safeParse({ id: 'non-number' }).success).toBe(false);
  });
});
