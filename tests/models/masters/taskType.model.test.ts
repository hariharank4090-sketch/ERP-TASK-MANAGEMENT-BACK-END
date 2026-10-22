import { describe, it, expect } from 'vitest';
import {
  TaskType,
  initTaskTypeModel,
  TaskTypeModel,
  taskTypeCreateSchema,
  taskTypeUpdateSchema,
  taskTypeIdSchema,
  taskTypeQuerySchema,
  getStatusText,
  getDelFlagText,
  getReptativeText,
  formatTaskTypeForResponse,
} from '../../../src/models/masters/taskType/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Task Type Model & Schemas', () => {
  it('initializes TaskType model properly', () => {
    const sequelize = getDefaultConnection();
    const model = initTaskTypeModel(sequelize);

    expect(model).toBe(TaskType);
    expect(model.tableName).toBe('tbl_Task_Type');
    expect(TaskTypeModel).toBeDefined();
  });

  it('validates taskTypeCreateSchema', () => {
    const valid = {
      Task_Type: 'Bug Fix',
      Task_Type_Desc: 'Fixing software issues',
      Project_Id: 1,
      IsActive: 1,
    };

    const res = taskTypeCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates update, query, and ID schemas', () => {
    expect(taskTypeUpdateSchema.safeParse({ Task_Type: 'Hotfix' }).success).toBe(true);
    expect(taskTypeQuerySchema.safeParse({}).success).toBe(true);
    expect(taskTypeIdSchema.safeParse({ id: 2 }).success).toBe(true);
  });

  it('checks status and text helpers', () => {
    expect(getStatusText(1)).toBe('Active');
    expect(getStatusText(0)).toBe('Inactive');
    expect(getDelFlagText(0)).toBe('Active');
    expect(getReptativeText(1)).toBe('Repetitive');
    expect(getReptativeText(0)).toBe('Non-Repetitive');

    const formatted = formatTaskTypeForResponse({
      Task_Type_Id: 1,
      Task_Type: 'Feature',
      Status: 1,
      TT_Del_Flag: 0,
      Is_Reptative: 1,
    });
    expect(formatted.statusText).toBe('Active');
    expect(formatted.isReptativeText).toBe('Repetitive');
  });
});
