import { z } from "zod";
import { DataTypes, Model, Sequelize } from 'sequelize';

// ─────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────

export interface WorkMasterAttributes {
    SNo: number;
    Work_Id: number;
    Sch_Id: number;
    Task_Id: number;
    Emp_Id: number;
    Work_Dt: Date;
    Work_Done?: string | null;
    Start_Time?: Date | null;
    End_Time?: Date | null;
    Tot_Minutes?: number | null;
    Work_Status?: number | null;
    Entry_By?: number | null;
    Entry_Date?: Date | null;
    Update_By?: number | null;
    Update_Date?: Date | null;
    Process_Id?: number | null;
}

export interface WorkWithDetails extends WorkMasterAttributes {
    Task_Name: string | null;
    Project_Id: number | null;
    Project_Name: string | null;
    Sch_No: string | null;
    Sch_Date: Date | null;
    Task_Type_Id: number | null;
    Sch_Plan_Id: number | null;
    Task_Sch_Timer_Based: boolean | null;
    Sch_Est_Start_Time: Date | null;
    Sch_Est_End_Time: Date | null;
    Task_Sch_Duaration: number | null;
    Sch_Status: number | null;
    parameters: string | null;
}

// ─────────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────────

export const workParameterSchema = z.object({
    Param_Id: z.number(),
    Default_Value: z.string().optional().nullable(),
    Current_Value: z.string().optional().nullable(),
});

/**
 * CREATE schema — Work_Id is NOT accepted from the client.
 * The DB generates it automatically (IDENTITY column or sequence).
 */
export const workMasterCreateSchema = z.object({
    Sch_Id: z.number().positive('Schedule ID must be a positive number'),
    Task_Id: z.number().positive('Task ID must be a positive number'),
    Emp_Id: z.number().positive('Employee ID must be a positive number'),
    Work_Dt: z.string().or(z.date()).transform(val => new Date(val)),
    Work_Done: z.string().optional().nullable(),
    Start_Time: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
    End_Time: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
    Tot_Minutes: z.number().min(0).optional().nullable(),
    Work_Status: z.number().min(1).max(3).optional().default(1),
    Entry_By: z.number().optional().nullable(),
    Process_Id: z.number().optional().nullable(),
    Parameters: z.array(workParameterSchema).optional().default([])
});

export const workMasterUpdateSchema = z.object({
    Sch_Id: z.number().positive().optional(),
    Task_Id: z.number().positive().optional(),
    Emp_Id: z.number().positive().optional(),
    Work_Dt: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
    Work_Done: z.string().optional().nullable(),
    Start_Time: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
    End_Time: z.string().or(z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
    Tot_Minutes: z.number().min(0).optional().nullable(),
    Work_Status: z.number().min(1).max(3).optional(),
    Update_By: z.number().optional().nullable(),
    Process_Id: z.number().optional().nullable(),
    Parameters: z.array(workParameterSchema).optional()
});

export const workMasterQuerySchema = z.object({
    search: z.string().optional(),
    empId: z.coerce.number().positive().optional(),
    taskId: z.coerce.number().positive().optional(),
    schId: z.coerce.number().positive().optional(),
    fromDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    toDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    workStatus: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
    sortBy: z.enum(['Work_Id', 'Work_Dt', 'Work_Status', 'Emp_Id', 'Task_Id']).default('Work_Dt'),
    sortOrder: z.enum(['ASC', 'DESC']).default('DESC')
});

export const workMasterIdSchema = z.object({
    id: z.coerce.number().int().positive('Valid Work SNo is required')
});

export type WorkMasterCreateInput = z.infer<typeof workMasterCreateSchema>;
export type WorkMasterUpdateInput = z.infer<typeof workMasterUpdateSchema>;
export type WorkMasterQueryParams = z.infer<typeof workMasterQuerySchema>;

// ─────────────────────────────────────────────────────────────────
// SEQUELIZE MODEL
// ─────────────────────────────────────────────────────────────────

export class WorkMaster extends Model<WorkMasterAttributes, WorkMasterAttributes> implements WorkMasterAttributes {
    declare SNo: number;
    declare Work_Id: number;
    declare Sch_Id: number;
    declare Task_Id: number;
    declare Emp_Id: number;
    declare Work_Dt: Date;
    declare Work_Done: string | null;
    declare Start_Time: Date | null;
    declare End_Time: Date | null;
    declare Tot_Minutes: number | null;
    declare Work_Status: number | null;
    declare Entry_By: number | null;
    declare Entry_Date: Date | null;
    declare Update_By: number | null;
    declare Update_Date: Date | null;
    declare Process_Id: number | null;
}

export function initializeWorkMasterModel(sequelize: Sequelize): typeof WorkMaster {
    WorkMaster.init(
        {
            SNo: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            Work_Id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            Sch_Id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            Task_Id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            Emp_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Work_Dt: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                validate: { isDate: true }
            },
            Work_Done: { type: DataTypes.TEXT, allowNull: true },
            Start_Time: { type: DataTypes.DATE, allowNull: true },
            End_Time: { type: DataTypes.DATE, allowNull: true },
            Tot_Minutes: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: { min: { args: [0], msg: 'Tot_Minutes must be positive' } }
            },
            Work_Status: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1,
                validate: { isIn: [[1, 2, 3]] }
            },
            Entry_By: { type: DataTypes.INTEGER, allowNull: true },
            Entry_Date: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
            Update_By: { type: DataTypes.INTEGER, allowNull: true },
            Update_Date: { type: DataTypes.DATE, allowNull: true },
            Process_Id: { type: DataTypes.INTEGER, allowNull: true },
        },
        {
            sequelize,
            tableName: 'tbl_Work_Master',
            modelName: 'WorkMaster',
            timestamps: false,
            freezeTableName: true,
            indexes: [
                { fields: ['Work_Id'] },
                { fields: ['Emp_Id'] },
                { fields: ['Task_Id'] },
                { fields: ['Work_Dt'] },
                { fields: ['Work_Status'] },
                { fields: ['Sch_Id'] }
            ]
        }
    );
    return WorkMaster;
}