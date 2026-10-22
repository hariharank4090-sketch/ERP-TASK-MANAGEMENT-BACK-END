import { describe, it, expect } from 'vitest';
import {
  TaskDetail_Master,
  initTaskDetailModel,
  taskDetailCreateSchema,
  taskDetailUpdateSchema,
  taskDetailBulkUpdateSchema,
  taskDetailQuerySchema,
  taskDetailIdSchema,
} from '../../src/models/taskDetails/type.model';
import { getDefaultConnection } from '../../src/config/database.config';

describe('Task Details Model & Schemas', () => {
  it('initializes TaskDetail_Master model', () => {
    const sequelize = getDefaultConnection();
    const model = initTaskDetailModel(sequelize);

    expect(model).toBe(TaskDetail_Master);
    expect(model.tableName).toBe('tbl_Task_Details');
    expect(model.rawAttributes.Id).toBeDefined();
  });

  it('validates taskDetailCreateSchema', () => {
    const valid = {
      Project_Id: 1,
      Sch_Id: 10,
      Task_Id: 5,
      Emp_Ids: [2],
    };

    const res = taskDetailCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates taskDetailUpdateSchema and bulk update schema', () => {
    expect(taskDetailUpdateSchema.safeParse({ Sch_Id: 2 }).success).toBe(true);
    const bulk = {
      projectId: 1,
      schId: 10,
      taskId: 5,
      empId: 2,
    };
    expect(taskDetailBulkUpdateSchema.safeParse(bulk).success).toBe(true);
  });

  it('validates query and ID schemas', () => {
    expect(taskDetailQuerySchema.safeParse({}).success).toBe(true);
    expect(taskDetailIdSchema.safeParse({ id: 1 }).success).toBe(true);
  });
});
