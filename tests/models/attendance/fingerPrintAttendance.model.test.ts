import { describe, it, expect } from 'vitest';
import models, {
  EmployeeMaster,
  EmployeeDesignation,
  User,
  LeaveMaster,
  DefaultLeave,
} from '../../../src/models/Attendance/Fingerprint/fingerPrintAttendance.model';

describe('Fingerprint Attendance Models', () => {
  it('exports all expected models and default bundle', () => {
    expect(models).toBeDefined();
    expect(models.EmployeeMaster).toBe(EmployeeMaster);
    expect(models.EmployeeDesignation).toBe(EmployeeDesignation);
    expect(models.User).toBe(User);
    expect(models.LeaveMaster).toBe(LeaveMaster);
    expect(models.DefaultLeave).toBe(DefaultLeave);
  });

  it('verifies EmployeeMaster configuration and attributes', () => {
    expect(EmployeeMaster.tableName).toBe('tbl_Employee_Master');
    expect(EmployeeMaster.rawAttributes.id).toBeDefined();
    expect(EmployeeMaster.rawAttributes.fingerPrintEmpId).toBeDefined();
    expect(EmployeeMaster.rawAttributes.Emp_Name).toBeDefined();
    expect(EmployeeMaster.rawAttributes.Active_Status).toBeDefined();
  });

  it('verifies EmployeeDesignation configuration and attributes', () => {
    expect(EmployeeDesignation.tableName).toBe('tbl_Employee_Designation');
    expect(EmployeeDesignation.rawAttributes.Designation_Id).toBeDefined();
    expect(EmployeeDesignation.rawAttributes.Designation).toBeDefined();
  });

  it('verifies User model configuration and attributes', () => {
    expect(User.tableName).toBe('tbl_Users');
    expect(User.rawAttributes.UserId).toBeDefined();
    expect(User.rawAttributes.Name).toBeDefined();
  });

  it('verifies LeaveMaster model configuration and attributes', () => {
    expect(LeaveMaster.tableName).toBe('tbl_Leave_Master');
    expect(LeaveMaster.rawAttributes.LeaveId).toBeDefined();
    expect(LeaveMaster.rawAttributes.User_Id).toBeDefined();
    expect(LeaveMaster.rawAttributes.FromDate).toBeDefined();
    expect(LeaveMaster.rawAttributes.ToDate).toBeDefined();
    expect(LeaveMaster.rawAttributes.Status).toBeDefined();
  });

  it('verifies DefaultLeave model configuration and attributes', () => {
    expect(DefaultLeave.tableName).toBe('tbl_Default_Leave');
    expect(DefaultLeave.rawAttributes.SNo).toBeDefined();
    expect(DefaultLeave.rawAttributes.Date).toBeDefined();
    expect(DefaultLeave.rawAttributes.Description).toBeDefined();
  });
});
