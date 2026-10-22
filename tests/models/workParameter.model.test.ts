import { describe, it, expect } from 'vitest';
import {
  WorkParameter,
  initializeWorkParameterModel,
  workParameterCreateSchema,
  workParameterUpdateSchema,
  workParameterQuerySchema,
  workParameterIdSchema,
} from '../../src/models/workParamter/type.model';
import { getDefaultConnection } from '../../src/config/database.config';

describe('Work Parameter Model & Schemas', () => {
  it('initializes WorkParameter model', () => {
    const sequelize = getDefaultConnection();
    const model = initializeWorkParameterModel(sequelize);

    expect(model).toBe(WorkParameter);
    expect(model.tableName).toBe('tbl_Work_Paramet_DT');
    expect(model.rawAttributes.Work_Id).toBeDefined();
  });

  it('validates workParameterCreateSchema', () => {
    const valid = {
      Work_Id: 1,
      Task_Id: 2,
      Param_Id: 3,
      Default_Value: '45',
    };

    const res = workParameterCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates workParameterUpdateSchema, query, and ID schemas', () => {
    expect(workParameterUpdateSchema.safeParse({ Default_Value: '50' }).success).toBe(true);
    expect(workParameterQuerySchema.safeParse({}).success).toBe(true);
    expect(workParameterIdSchema.safeParse({ id: 5 }).success).toBe(true);
  });
});
