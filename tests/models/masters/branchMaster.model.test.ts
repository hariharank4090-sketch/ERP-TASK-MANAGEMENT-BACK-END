import { describe, it, expect } from 'vitest';
import {
  initBranchModel,
  branchCreateSchema,
  branchUpdateSchema,
  branchQuerySchema,
  branchIdSchema,
} from '../../../src/models/masters/branchMaster/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Branch Master Model & Schemas', () => {
  it('initializes the Branch_Master Sequelize model', () => {
    const sequelize = getDefaultConnection();
    const BranchModel = initBranchModel(sequelize);

    expect(BranchModel).toBeDefined();
    expect(BranchModel.tableName).toBe('tbl_Branch_Master');
    expect(BranchModel.rawAttributes.BranchId).toBeDefined();
    expect(BranchModel.rawAttributes.BranchName).toBeDefined();
    expect(BranchModel.rawAttributes.BranchCode).toBeDefined();
  });

  it('validates branchCreateSchema with correct data', () => {
    const validData = {
      BranchName: 'Main Branch',
      BranchCode: 'BR001',
      E_Mail: 'branch@example.com',
      BranchCity: 'Chennai',
    };

    const res = branchCreateSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('validates branchUpdateSchema partial input', () => {
    const updateData = {
      BranchName: 'Updated Branch Name',
    };

    const res = branchUpdateSchema.safeParse(updateData);
    expect(res.success).toBe(true);
  });

  it('validates branchQuerySchema default values', () => {
    const query = branchQuerySchema.parse({});
    expect(query.page).toBe(1);
    expect(query.limit).toBe(20);
    expect(query.sortBy).toBe('BranchId');
    expect(query.sortOrder).toBe('ASC');
  });

  it('validates branchIdSchema', () => {
    expect(branchIdSchema.safeParse({ id: 5 }).success).toBe(true);
    expect(branchIdSchema.safeParse({ id: 'invalid' }).success).toBe(false);
  });
});
