import { describe, it, expect } from 'vitest';
import {
  TaskParametDT,
  initTaskParametDTModel,
  TaskParametDTModel,
  TaskParametDTCreationSchema,
  TaskParametDTUpdateSchema,
  TaskParametDTQuerySchema,
  taskParametDTIdSchema,
  formatTaskParametDTForResponse,
  taskParametDTAccKey,
} from '../../../src/models/masters/TaskEmployeeParameters/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Task Employee Parameters Model & Schemas', () => {
  it('initializes TaskParametDT model correctly', () => {
    const sequelize = getDefaultConnection();
    const model = initTaskParametDTModel(sequelize);

    expect(model).toBe(TaskParametDT);
    expect(model.tableName).toBe('tbl_Task_Paramet_DT');
    expect(TaskParametDTModel).toBeDefined();
  });

  it('validates TaskParametDTCreationSchema', () => {
    const valid = {
      Task_Id: 10,
      Param_Id: 2,
      Default_Value: '100',
    };

    const res = TaskParametDTCreationSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates update, query, and ID schemas', () => {
    expect(TaskParametDTUpdateSchema.safeParse({ Default_Value: '200' }).success).toBe(true);
    expect(TaskParametDTQuerySchema.safeParse({}).success).toBe(true);
    expect(taskParametDTIdSchema.safeParse({ id: 5 }).success).toBe(true);
  });

  it('formats parameter for response and exports access keys', () => {
    const formatted = formatTaskParametDTForResponse({
      Task_Param_Id: 1,
      Task_Id: 10,
    });
    expect(formatted.Task_Param_Id).toBe(1);
    expect(typeof taskParametDTAccKey).toBe('object');
    expect(taskParametDTAccKey).toHaveProperty('Task_Id');
  });
});
