import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

// ─── Interface ────────────────────────────────────────────────────────────────
export interface LeaveAttributes {
  Id: number;
  User_Id: number;
  FromDate: Date | string;
  ToDate: Date | string;
  Session: string;
  NoOfDays: number;
  LeaveType_Id: number | null;
  Department: string | null;
  InCharge: number | null;
  Reason: string | null;
  Created_By: number | null;
  Created_At: Date | null;
  Approved_By: number | null;
  Approved_At: Date | null;
  Approver_Reason: string | null;
  Status: string | null;
}

export type LeaveCreationAttributes = Optional<LeaveAttributes, 'Id'>;

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const leaveCreateSchema = z.object({
  User_Id: z.coerce
    .number()
    .int('User_Id must be an integer')
    .positive('User_Id must be positive'),

  FromDate: z.union([z.string(), z.date()]).transform((val) => {
    const date = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(date.getTime())) throw new Error('Invalid FromDate');
    return date;
  }),

  ToDate: z.union([z.string(), z.date()]).transform((val) => {
    const date = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(date.getTime())) throw new Error('Invalid ToDate');
    return date;
  }),

  Session: z.enum(['FN', 'AN', 'Full']).default('Full'),

  NoOfDays: z.coerce.number().min(0.5, 'NoOfDays must be at least 0.5'),

  LeaveType_Id: z.coerce
    .number()
    .int('LeaveType_Id must be an integer')
    .positive('LeaveType_Id must be positive')
    .optional()
    .nullable()
    .default(null),

  Department: z.string().max(100).optional().nullable().default(null),

  InCharge: z.coerce
    .number()
    .int('InCharge must be an integer')
    .optional()
    .nullable()
    .default(null),

  Reason: z.string().max(500).optional().nullable().default(null),

  Created_By: z.coerce
    .number()
    .int('Created_By must be an integer')
    .optional()
    .nullable()
    .default(null),

  Status: z.string().optional().nullable().default('Pending'),
}).refine(
  (data) => {
    const from = new Date(data.FromDate);
    const to = new Date(data.ToDate);
    return to >= from;
  },
  {
    message: 'ToDate must be after or equal to FromDate',
    path: ['ToDate'],
  }
);

export const leaveUpdateSchema = z.object({
  Id: z.coerce.number().int('Id must be an integer').positive('Valid Id is required'),

  LeaveType_Id: z.coerce
    .number()
    .int('LeaveType_Id must be an integer')
    .positive('LeaveType_Id must be positive')
    .optional()
    .nullable(),

  Approver_Reason: z.string().max(500).optional().nullable(),

  Approved_By: z.coerce.number().int('Approved_By must be an integer').optional().nullable(),

  Status: z.enum(['Pending', 'Approved', 'Rejected']).optional().nullable(),
});

export const leaveIdSchema = z.object({
  Id: z.coerce.number().int('Id must be an integer').positive('Valid Id is required'),
});

export const leaveQuerySchema = z.object({
  UserId: z.coerce.number().int().optional().nullable(),
  UserTypeId: z.coerce.number().int().optional().nullable(),
  FromDate: z.string().optional().nullable(),
  ToDate: z.string().optional().nullable(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type LeaveCreateInput = z.infer<typeof leaveCreateSchema>;
export type LeaveUpdateInput = z.infer<typeof leaveUpdateSchema>;
export type LeaveQueryParams = z.infer<typeof leaveQuerySchema>;

// ─── Helper Functions ─────────────────────────────────────────────────────────
export const getStatusText = (status: string | null): string => {
  if (!status) return 'Pending';
  return status;
};

export const formatLeaveForResponse = (leave: any): Record<string, unknown> => {
  const leaveData = leave.get ? leave.get({ plain: true }) : leave;
  return {
    ...leaveData,
    statusText: getStatusText(leaveData.Status),
  };
};

// Helper function to format date for SQL Server (without timezone)
export const formatDateForSQLServer = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Helper function to format datetime for SQL Server (without timezone)
export const formatDateTimeForSQLServer = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
};

// ─── Model Class ──────────────────────────────────────────────────────────────
export class Leave extends Model<LeaveAttributes, LeaveCreationAttributes> {}

// ─── Init Function ────────────────────────────────────────────────────────────
export function initLeaveModel(sequelize: Sequelize): typeof Leave {
  Leave.init(
    {
      Id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'Id',
      },
      User_Id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'User_Id',
      },
      FromDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'FromDate',
      },
      ToDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'ToDate',
      },
      Session: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Full',
        field: 'Session',
      },
      NoOfDays: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: 'NoOfDays',
      },
      LeaveType_Id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'LeaveType_Id',
      },
      Department: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'Department',
      },
      InCharge: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'InCharge',
      },
      Reason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'Reason',
      },
      Created_By: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'Created_By',
      },
      Created_At: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'Created_At',
      },
      Approved_By: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'Approved_By',
      },
      Approved_At: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'Approved_At',
      },
      Approver_Reason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'Approver_Reason',
      },
      Status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Pending',
        field: 'Status',
      },
    },
    {
      sequelize,
      tableName: 'tbl_Leave_Master',
      modelName: 'Leave',
      timestamps: false,
    }
  );

  return Leave;
}

// ─── Default Export ───────────────────────────────────────────────────────────
import { sequelize as defaultSequelize } from '../../../config/sequalizer';
export const LeaveModel = initLeaveModel(defaultSequelize);
export default LeaveModel;