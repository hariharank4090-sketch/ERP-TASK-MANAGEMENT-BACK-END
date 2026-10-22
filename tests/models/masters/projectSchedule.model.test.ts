import { describe, it, expect } from 'vitest';
import {
  ScheduleCreateSchema,
  ScheduleUpdateSchema,
  ScheduleStatusUpdateSchema,
  ScheduleDetailSchema,
  ScheduleQuerySchema,
  ScheduleIdSchema,
} from '../../../src/models/masters/ProjectSchedule/schedule.type.model';

describe('Project Schedule Model Schemas', () => {
  it('validates ScheduleCreateSchema', () => {
    const valid = {
      Sch_No: 'SCH-001',
      Task_Id: 5,
      Task_Type_Id: 1,
      Sch_Plan_Id: 1,
      Sch_Start_Date: '2026-05-01',
      Sch_End_Date: '2026-05-10',
      Sch_Est_Start_Time: '09:00',
      Sch_Est_End_Time: '17:00',
      Task_Sch_Duaration: 8,
      Entry_By: 10,
    };

    const res = ScheduleCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates ScheduleUpdateSchema', () => {
    const update = {
      Update_By: 1,
      Sch_Status: 2,
    };

    const res = ScheduleUpdateSchema.safeParse(update);
    expect(res.success).toBe(true);
  });

  it('validates ScheduleStatusUpdateSchema', () => {
    const res = ScheduleStatusUpdateSchema.safeParse({ status: 3, Update_By: 1 });
    expect(res.success).toBe(true);
  });

  it('validates ScheduleDetailSchema', () => {
    const detail = {
      Task_Work_Date: '2026-05-01',
      Task_Start_Time: '09:00',
      Task_End_Time: '17:00',
    };

    const res = ScheduleDetailSchema.safeParse(detail);
    expect(res.success).toBe(true);
  });

  it('validates ScheduleQuerySchema and ScheduleIdSchema', () => {
    const q = ScheduleQuerySchema.parse({});
    expect(q.page).toBe(1);
    expect(q.limit).toBe(20);

    expect(ScheduleIdSchema.safeParse({ id: '10' }).success).toBe(true);
  });
});
