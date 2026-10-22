import { describe, it, expect } from 'vitest';
import models, {
  Attendance,
  EmployeeMaster,
} from '../../../src/models/Attendance/Sales Person/Attendance.model';

describe('Sales Person Attendance Model', () => {
  it('exports Attendance and EmployeeMaster models and default export', () => {
    expect(models).toBeDefined();
    expect(models.Attendance).toBe(Attendance);
    expect(models.EmployeeMaster).toBe(EmployeeMaster);
  });

  it('validates Attendance schema and attributes', () => {
    expect(Attendance.tableName).toBe('tbl_Attendance');
    expect(Attendance.rawAttributes.Id).toBeDefined();
    expect(Attendance.rawAttributes.UserId).toBeDefined();
    expect(Attendance.rawAttributes.Start_KM).toBeDefined();
    expect(Attendance.rawAttributes.End_KM).toBeDefined();
    expect(Attendance.rawAttributes.Latitude).toBeDefined();
    expect(Attendance.rawAttributes.Longitude).toBeDefined();
    expect(Attendance.rawAttributes.IsSalesPerson).toBeDefined();
    expect(Attendance.rawAttributes.Active_Status).toBeDefined();
  });

  it('validates EmployeeMaster schema in sales person model context', () => {
    expect(EmployeeMaster.tableName).toBe('tbl_Employee_Master');
    expect(EmployeeMaster.rawAttributes.id).toBeDefined();
    expect(EmployeeMaster.rawAttributes.Emp_Name).toBeDefined();
    expect(EmployeeMaster.rawAttributes.Mobile_No).toBeDefined();
    expect(EmployeeMaster.rawAttributes.Department).toBeDefined();
  });
});
