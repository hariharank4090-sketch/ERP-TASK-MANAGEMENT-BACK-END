import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

export interface TicketTaskAttributes {
    id: number;
    project_id?: number | null;
    Ticket_Id?: number | null;
    Est_Sch_Start_Date?: string | null;
    Est_Sch_End_Date?: string | null;
    From_CompanyId?: number | null;
    To_CompanyId?: number | null;
    Employee_Involved_Id?: number | null;
    ticket_acc_date?: string | null;
    tick_com_date?: string | null;
    Task_Id?: number | null;
}

type TicketTaskCreationAttributes = Optional<TicketTaskAttributes, 'id'>;

export class TicketTask extends Model<TicketTaskAttributes, TicketTaskCreationAttributes> implements TicketTaskAttributes {
    declare id: number;
    declare project_id: number | null;
    declare Ticket_Id: number | null;
    declare Est_Sch_Start_Date: string | null;
    declare Est_Sch_End_Date: string | null;
    declare From_CompanyId: number | null;
    declare To_CompanyId: number | null;
    declare Employee_Involved_Id: number | null;
    declare ticket_acc_date: string | null;
    declare tick_com_date: string | null;
    declare Task_Id: number | null;
}

export function initTicketTaskModel(sequelize: Sequelize): typeof TicketTask {
    TicketTask.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                field: 'id'
            },
            project_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'project_id'
            },
            Ticket_Id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Ticket_Id'
            },
            Est_Sch_Start_Date: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Est_Sch_Start_Date'
            },
            Est_Sch_End_Date: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Est_Sch_End_Date'
            },
            From_CompanyId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'From_CompanyId'
            },
            To_CompanyId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'To_CompanyId'
            },
            Employee_Involved_Id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Employee_Involved_Id'
            },
            ticket_acc_date: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'ticket_acc_date'
            },
            tick_com_date: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'tick_com_date'
            },
            Task_Id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                field: 'Task_Id'
            }
        },
        {
            sequelize,
            tableName: 'tbl_Project_Ticket',
            modelName: 'TicketTask',
            timestamps: false,
            freezeTableName: true
        }
    );
    return TicketTask;
}

export const ticketTaskQuerySchema = z.object({
    project_id: z.coerce.number().int().optional(),
    Ticket_Id: z.coerce.number().int().optional(),
    Employee_Involved_Id: z.coerce.number().int().optional(),
    From_CompanyId: z.coerce.number().int().optional(),
    To_CompanyId: z.coerce.number().int().optional(),
    Task_Id: z.coerce.number().int().optional(),
    search: z.string().optional()
});

export type TicketTaskQueryInput = z.infer<typeof ticketTaskQuerySchema>;

const formatToSQLServerDateTime = (val: any): string | null => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const ticketTaskCreateSchema = z.object({
    id: z.coerce.number().int().optional(),
    project_id: z.coerce.number().int().optional().nullable(),
    Ticket_Id: z.coerce.number().int().optional().nullable(),
    Est_Sch_Start_Date: z.union([z.string(), z.date()]).optional().nullable().transform(val => formatToSQLServerDateTime(val)),
    Est_Sch_End_Date: z.union([z.string(), z.date()]).optional().nullable().transform(val => formatToSQLServerDateTime(val)),
    From_CompanyId: z.coerce.number().int().optional().nullable(),
    To_CompanyId: z.coerce.number().int().optional().nullable(),
    Employee_Involved_Id: z.coerce.number().int().optional().nullable(),
    ticket_acc_date: z.union([z.string(), z.date()]).optional().nullable().transform(val => formatToSQLServerDateTime(val)),
    tick_com_date: z.union([z.string(), z.date()]).optional().nullable().transform(val => formatToSQLServerDateTime(val)),
    Task_Id: z.coerce.number().int().optional().nullable(),
});

export type TicketTaskCreateInput = z.infer<typeof ticketTaskCreateSchema>;

export const ticketTaskUpdateSchema = ticketTaskCreateSchema.partial();
export type TicketTaskUpdateInput = z.infer<typeof ticketTaskUpdateSchema>;

export const ticketTaskIdSchema = z.object({
    id: z.coerce.number().int().positive('Valid ID is required')
});
