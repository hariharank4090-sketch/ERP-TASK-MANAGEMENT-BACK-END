import { describe, it, expect } from 'vitest';
import {
  leaveTypeCreateSchema,
  leaveTypeUpdateSchema,
  leaveTypeQuerySchema,
  leaveTypeIdSchema,
} from '../../../src/models/masters/Leave type/leaveType.model';

describe('Leave Type Model Schemas', () => {
  it('validates leaveTypeCreateSchema', () => {
    const valid = {
      LeaveType: 'Sick Leave',
    };

    const res = leaveTypeCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates leaveTypeUpdateSchema', () => {
    const update = {
      LeaveType: 'Casual Leave',
    };

    const res = leaveTypeUpdateSchema.safeParse(update);
    expect(res.success).toBe(true);
  });

  it('validates leaveTypeQuerySchema defaults', () => {
    const q = leaveTypeQuerySchema.parse({});
    expect(q.page).toBe(1);
    expect(q.limit).toBe(20);
    expect(q.sortBy).toBe('Id');
    expect(q.sortOrder).toBe('ASC');
  });

  it('validates leaveTypeIdSchema', () => {
    expect(leaveTypeIdSchema.safeParse({ id: 1 }).success).toBe(true);
    expect(leaveTypeIdSchema.safeParse({ id: -1 }).success).toBe(false);
  });
});
