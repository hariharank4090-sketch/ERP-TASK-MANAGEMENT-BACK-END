import { describe, it, expect } from 'vitest';
import {
  Process_Master,
  initProcessModel,
  ProcessMasterModel,
  processMasterCreateSchema,
  processMasterUpdateSchema,
  processMasterIdSchema,
  processMasterQuerySchema,
  formatProcessForResponse,
} from '../../../src/models/masters/process/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Process Master Model & Schemas', () => {
  it('initializes Process_Master model', () => {
    const sequelize = getDefaultConnection();
    const model = initProcessModel(sequelize);

    expect(model).toBe(Process_Master);
    expect(model.tableName).toBe('tbl_Process_Master');
    expect(model.rawAttributes.Id).toBeDefined();
    expect(ProcessMasterModel).toBeDefined();
  });

  it('validates processMasterCreateSchema', () => {
    const valid = {
      Process_Name: 'Quality Check',
    };

    const res = processMasterCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates processMasterUpdateSchema and query schemas', () => {
    expect(processMasterUpdateSchema.safeParse({ Process_Name: 'Assembly' }).success).toBe(true);
    expect(processMasterQuerySchema.safeParse({}).success).toBe(true);
    expect(processMasterIdSchema.safeParse({ id: 1 }).success).toBe(true);
  });

  it('formats process for response', () => {
    const formatted = formatProcessForResponse({
      Id: 1,
      Process_Name: 'Test Process',
    });
    expect(formatted.Process_Name).toBe('Test Process');
  });
});
