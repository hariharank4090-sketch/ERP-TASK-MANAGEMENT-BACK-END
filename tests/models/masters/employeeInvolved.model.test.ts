import { describe, it, expect } from 'vitest';
import { getDefaultConnection } from '../../../src/config/database.config';
import { initEmployeeModel } from '../../../src/models/masters/employee/type.model';

// Initialize Employee model first so association can read rawAttributes
initEmployeeModel(getDefaultConnection());

const {
  ProjectEmployee,
  ProjectEmployeeCreationSchema,
  ProjectEmployeeBulkCreateSchema,
  ProjectEmployeeUpdateSchema,
  ProjectEmployeeBulkUpdateSchema,
  ProjectEmployeeQuerySchema,
  ProjectEmployeeIdSchema,
  ProjectIdSchema,
} = await import('../../../src/models/masters/employee involved/type.model');

describe('Project Employee Involved Model & Schemas', () => {
  it('checks ProjectEmployee model class exists', () => {
    expect(ProjectEmployee).toBeDefined();
    expect(ProjectEmployee.tableName).toBe('tbl_Project_Employee');
  });

  it('validates ProjectEmployeeCreationSchema', () => {
    const valid = {
      Project_Id: 10,
      Emp_Id: 5,
    };

    const res = ProjectEmployeeCreationSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates ProjectEmployeeBulkCreateSchema', () => {
    const bulkData = {
      Project_Id: 10,
      Emp_Ids: [1, 2],
    };

    const res = ProjectEmployeeBulkCreateSchema.safeParse(bulkData);
    expect(res.success).toBe(true);
  });

  it('validates ProjectEmployeeUpdateSchema and BulkUpdate', () => {
    const update = { Del_Flag: 0 };
    expect(ProjectEmployeeUpdateSchema.safeParse(update).success).toBe(true);

    const bulkUpdate = {
      Project_Id: 10,
      Emp_Ids: [1, 2],
    };
    expect(ProjectEmployeeBulkUpdateSchema.safeParse(bulkUpdate).success).toBe(true);
  });

  it('validates ProjectEmployeeQuerySchema and ID schemas', () => {
    const q = ProjectEmployeeQuerySchema.parse({});
    expect(q.page).toBe(1);
    expect(q.limit).toBe(50);

    expect(ProjectEmployeeIdSchema.safeParse({ id: 1 }).success).toBe(true);
    expect(ProjectIdSchema.safeParse({ projectId: 10 }).success).toBe(true);
  });
});
