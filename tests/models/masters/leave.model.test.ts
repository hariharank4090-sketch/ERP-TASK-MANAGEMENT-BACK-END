import { describe, it, expect } from 'vitest';
import {
  Leave,
  initLeaveModel,
  LeaveModel,
  leaveCreateSchema,
  leaveUpdateSchema,
  leaveQuerySchema,
  leaveIdSchema,
  getStatusText,
  formatLeaveForResponse,
  formatDateForSQLServer,
} from '../../../src/models/masters/leave/leave.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Leave Model & Schemas', () => {
  it('initializes Leave model correctly', () => {
    const sequelize = getDefaultConnection();
    const model = initLeaveModel(sequelize);

    expect(model).toBe(Leave);
    expect(model.tableName).toBe('tbl_Leave_Master');
    expect(model.rawAttributes.Id).toBeDefined();
    expect(LeaveModel).toBeDefined();
  });

  it('validates leaveCreateSchema', () => {
    const valid = {
      User_Id: 1,
      FromDate: '2026-03-01',
      ToDate: '2026-03-05',
      NoOfDays: 4,
      Reason: 'Family vacation',
    };

    const res = leaveCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates leaveUpdateSchema and query/id schemas', () => {
    expect(leaveUpdateSchema.safeParse({ Id: 10, Reason: 'Medical' }).success).toBe(true);
    expect(leaveQuerySchema.safeParse({}).success).toBe(true);
    expect(leaveIdSchema.safeParse({ Id: 10 }).success).toBe(true);
  });

  it('checks leave helper formatting functions', () => {
    expect(getStatusText(null)).toBe('Pending');
    expect(getStatusText('Approved')).toBe('Approved');
    expect(getStatusText('Rejected')).toBe('Rejected');

    const formattedDate = formatDateForSQLServer(new Date('2026-05-15'));
    expect(formattedDate).toBeDefined();

    const leaveObj = {
      Id: 10,
      Status: 'Approved',
      FromDate: new Date('2026-05-01'),
      ToDate: new Date('2026-05-02'),
    };
    const res = formatLeaveForResponse(leaveObj);
    expect(res.statusText).toBe('Approved');
  });
});
