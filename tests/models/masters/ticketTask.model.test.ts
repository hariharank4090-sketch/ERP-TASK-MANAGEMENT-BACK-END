import { describe, it, expect } from 'vitest';
import {
  TicketTask,
  initTicketTaskModel,
  ticketTaskCreateSchema,
  ticketTaskUpdateSchema,
  ticketTaskQuerySchema,
  ticketTaskIdSchema,
} from '../../../src/models/masters/ticketTask/ticketTask.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Ticket Task Model & Schemas', () => {
  it('initializes TicketTask model', () => {
    const sequelize = getDefaultConnection();
    const model = initTicketTaskModel(sequelize);

    expect(model).toBe(TicketTask);
    expect(model.tableName).toBe('tbl_Project_Ticket');
    expect(model.rawAttributes.id).toBeDefined();
    expect(model.rawAttributes.Ticket_Id).toBeDefined();
  });

  it('validates ticketTaskCreateSchema', () => {
    const valid = {
      Ticket_Id: 10,
      Task_Id: 5,
      Employee_Involved_Id: 3,
    };

    const res = ticketTaskCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('validates ticketTaskUpdateSchema and query schemas', () => {
    expect(ticketTaskUpdateSchema.safeParse({ Task_Id: 7 }).success).toBe(true);
    expect(ticketTaskQuerySchema.safeParse({}).success).toBe(true);
    expect(ticketTaskIdSchema.safeParse({ id: 1 }).success).toBe(true);
  });
});
