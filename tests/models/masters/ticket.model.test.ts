import { describe, it, expect } from 'vitest';
import {
  TicketGenInfo,
  initTicketGenInfoModel,
  TicketCategory,
  initTicketCategoryModel,
  ticketQuerySchema,
} from '../../../src/models/masters/ticket/ticket.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Ticket Master Model & Schemas', () => {
  it('initializes TicketGenInfo and TicketCategory models', () => {
    const sequelize = getDefaultConnection();
    const tModel = initTicketGenInfoModel(sequelize);
    const cModel = initTicketCategoryModel(sequelize);

    expect(tModel).toBe(TicketGenInfo);
    expect(tModel.tableName).toBe('tbl_Ticket_Gen_Info');
    expect(cModel).toBe(TicketCategory);
    expect(cModel.tableName).toBe('tbl_Category');
  });

  it('validates ticketQuerySchema', () => {
    const q = ticketQuerySchema.parse({
      User_Id: '123',
      page: 1,
      pageSize: 20,
    });
    expect(q.User_Id).toBe('123');
    expect(q.page).toBe(1);
    expect(q.pageSize).toBe(20);
  });
});
