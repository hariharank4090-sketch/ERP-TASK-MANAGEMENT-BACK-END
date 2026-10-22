import { describe, it, expect } from 'vitest';
import {
  Task,
  ProjectSchedule,
  initTaskModel,
  initProjectScheduleModel,
  defineTaskAssociations,
  TaskModel,
  ProjectScheduleModel,
  taskCreateSchema,
  taskUpdateSchema,
  taskIdSchema,
  taskQuerySchema,
  formatTaskForResponse,
} from '../../../src/models/masters/task/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Task Model & Schemas', () => {
  it('initializes Task and ProjectSchedule models and associations', () => {
    const sequelize = getDefaultConnection();
    const tModel = initTaskModel(sequelize);
    const sModel = initProjectScheduleModel(sequelize);
    defineTaskAssociations();

    expect(tModel).toBe(Task);
    expect(sModel).toBe(ProjectSchedule);
    expect(TaskModel).toBeDefined();
    expect(ProjectScheduleModel).toBeDefined();
    expect(Task.tableName).toBe('tbl_Task');
  });

  it('validates taskCreateSchema', () => {
    const valid = {
      Task_Name: 'Setup CI/CD Pipeline',
      Task_Desc: 'Automate testing and deployment',
      Task_Type_Id: 1,
      Company_Id: 1,
      Project_Id: 2,
    };

    const res = taskCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates taskUpdateSchema, taskIdSchema, and taskQuerySchema', () => {
    expect(taskUpdateSchema.safeParse({ Task_Name: 'Updated Task' }).success).toBe(true);
    expect(taskIdSchema.safeParse({ id: 1 }).success).toBe(true);
    expect(taskQuerySchema.safeParse({}).success).toBe(true);
  });

  it('formats task for response', () => {
    const raw = {
      Task_Id: 1,
      Task_Name: 'Sample Task',
      Project_Name: 'Main Project',
    };

    const formatted = formatTaskForResponse(raw);
    expect(formatted.Task_Name).toBe('Sample Task');
  });
});
