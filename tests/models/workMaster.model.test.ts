import { describe, it, expect } from 'vitest';
import {
  WorkMaster,
  initializeWorkMasterModel,
  workParameterSchema,
  workMasterCreateSchema,
  workMasterUpdateSchema,
  workMasterQuerySchema,
  workMasterIdSchema,
} from '../../src/models/workMaster/type.model';
import { getDefaultConnection } from '../../src/config/database.config';

describe('Work Master Model & Schemas', () => {
  it('initializes WorkMaster model', () => {
    const sequelize = getDefaultConnection();
    const model = initializeWorkMasterModel(sequelize);

    expect(model).toBe(WorkMaster);
    expect(model.tableName).toBe('tbl_Work_Master');
    expect(model.rawAttributes.Work_Id).toBeDefined();
  });

  it('validates workMasterCreateSchema with parameters', () => {
    const valid = {
      Sch_Id: 1,
      Work_Dt: '2026-05-10',
      Emp_Id: 1,
      Task_Id: 2,
      Parameters: [
        { Param_Id: 1, Default_Value: '10' },
      ],
    };

    const res = workMasterCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates update, query, and ID schemas', () => {
    expect(workMasterUpdateSchema.safeParse({ Emp_Id: 2 }).success).toBe(true);
    expect(workMasterQuerySchema.safeParse({}).success).toBe(true);
    expect(workMasterIdSchema.safeParse({ id: 10 }).success).toBe(true);
  });
});
