import { describe, it, expect } from 'vitest';
import {
  Employee,
  initEmployeeModel,
  EmployeeDesignation,
  initEmployeeDesignationModel,
  employeeCreateSchema,
  employeeUpdateSchema,
  employeeQuerySchema,
  employeeIdSchema,
  formatEmployeeForResponse,
} from '../../../src/models/masters/employee/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Employee Model & Schemas', () => {
  it('initializes Employee and EmployeeDesignation models', () => {
    const sequelize = getDefaultConnection();
    const empModel = initEmployeeModel(sequelize);
    const desModel = initEmployeeDesignationModel(sequelize);

    expect(empModel).toBe(Employee);
    expect(empModel.tableName).toBe('tbl_Employee_Master');
    expect(desModel).toBe(EmployeeDesignation);
    expect(desModel.tableName).toBe('tbl_Employee_Designation');
  });

  it('validates employeeCreateSchema', () => {
    const valid = {
      Emp_Code: 'EMP001',
      Emp_Name: 'John Employee',
      Designation: 1,
      Mobile_No: '9876543210',
      Salary: 50000,
    };

    const res = employeeCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates employeeUpdateSchema', () => {
    const res = employeeUpdateSchema.safeParse({ Emp_Name: 'Jane' });
    expect(res.success).toBe(true);
  });

  it('validates employeeQuerySchema and employeeIdSchema', () => {
    const q = employeeQuerySchema.parse({ branch: 2, designation: 1 });
    expect(q.branch).toBe(2);
    expect(q.designation).toBe(1);

    expect(employeeIdSchema.safeParse({ id: 99 }).success).toBe(true);
  });

  it('formats employee for response', () => {
    const raw = {
      Emp_Id: 1,
      Emp_Name: 'Dev',
      IsActive: 1,
      Daily_Report_Check: 1,
    };

    const formatted = formatEmployeeForResponse(raw);
    expect(formatted.Emp_Id).toBe(1);
    expect(formatted.Emp_Name).toBe('Dev');
  });
});
