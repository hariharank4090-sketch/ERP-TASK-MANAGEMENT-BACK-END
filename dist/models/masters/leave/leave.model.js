"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveModel = exports.Leave = exports.formatDateTimeForSQLServer = exports.formatDateForSQLServer = exports.formatLeaveForResponse = exports.getStatusText = exports.leaveQuerySchema = exports.leaveIdSchema = exports.leaveUpdateSchema = exports.leaveCreateSchema = void 0;
exports.initLeaveModel = initLeaveModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
// ─── Zod Schemas ──────────────────────────────────────────────────────────────
exports.leaveCreateSchema = zod_1.z.object({
    User_Id: zod_1.z.coerce
        .number()
        .int('User_Id must be an integer')
        .positive('User_Id must be positive'),
    FromDate: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).transform((val) => {
        const date = typeof val === 'string' ? new Date(val) : val;
        if (isNaN(date.getTime()))
            throw new Error('Invalid FromDate');
        return date;
    }),
    ToDate: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).transform((val) => {
        const date = typeof val === 'string' ? new Date(val) : val;
        if (isNaN(date.getTime()))
            throw new Error('Invalid ToDate');
        return date;
    }),
    Session: zod_1.z.enum(['FN', 'AN', 'Full']).default('Full'),
    NoOfDays: zod_1.z.coerce.number().min(0.5, 'NoOfDays must be at least 0.5'),
    LeaveType_Id: zod_1.z.coerce
        .number()
        .int('LeaveType_Id must be an integer')
        .positive('LeaveType_Id must be positive')
        .optional()
        .nullable()
        .default(null),
    Department: zod_1.z.string().max(100).optional().nullable().default(null),
    InCharge: zod_1.z.coerce
        .number()
        .int('InCharge must be an integer')
        .optional()
        .nullable()
        .default(null),
    Reason: zod_1.z.string().max(500).optional().nullable().default(null),
    Created_By: zod_1.z.coerce
        .number()
        .int('Created_By must be an integer')
        .optional()
        .nullable()
        .default(null),
    Status: zod_1.z.string().optional().nullable().default('Pending'),
}).refine((data) => {
    const from = new Date(data.FromDate);
    const to = new Date(data.ToDate);
    return to >= from;
}, {
    message: 'ToDate must be after or equal to FromDate',
    path: ['ToDate'],
});
exports.leaveUpdateSchema = zod_1.z.object({
    Id: zod_1.z.coerce.number().int('Id must be an integer').positive('Valid Id is required'),
    LeaveType_Id: zod_1.z.coerce
        .number()
        .int('LeaveType_Id must be an integer')
        .positive('LeaveType_Id must be positive')
        .optional()
        .nullable(),
    Approver_Reason: zod_1.z.string().max(500).optional().nullable(),
    Approved_By: zod_1.z.coerce.number().int('Approved_By must be an integer').optional().nullable(),
    Status: zod_1.z.enum(['Pending', 'Approved', 'Rejected']).optional().nullable(),
});
exports.leaveIdSchema = zod_1.z.object({
    Id: zod_1.z.coerce.number().int('Id must be an integer').positive('Valid Id is required'),
});
exports.leaveQuerySchema = zod_1.z.object({
    UserId: zod_1.z.coerce.number().int().optional().nullable(),
    UserTypeId: zod_1.z.coerce.number().int().optional().nullable(),
    FromDate: zod_1.z.string().optional().nullable(),
    ToDate: zod_1.z.string().optional().nullable(),
});
// ─── Helper Functions ─────────────────────────────────────────────────────────
const getStatusText = (status) => {
    if (!status)
        return 'Pending';
    return status;
};
exports.getStatusText = getStatusText;
const formatLeaveForResponse = (leave) => {
    const leaveData = leave.get ? leave.get({ plain: true }) : leave;
    return {
        ...leaveData,
        statusText: (0, exports.getStatusText)(leaveData.Status),
    };
};
exports.formatLeaveForResponse = formatLeaveForResponse;
// Helper function to format date for SQL Server (without timezone)
const formatDateForSQLServer = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
exports.formatDateForSQLServer = formatDateForSQLServer;
// Helper function to format datetime for SQL Server (without timezone)
const formatDateTimeForSQLServer = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
};
exports.formatDateTimeForSQLServer = formatDateTimeForSQLServer;
// ─── Model Class ──────────────────────────────────────────────────────────────
class Leave extends sequelize_1.Model {
}
exports.Leave = Leave;
// ─── Init Function ────────────────────────────────────────────────────────────
function initLeaveModel(sequelize) {
    Leave.init({
        Id: {
            type: sequelize_1.DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'Id',
        },
        User_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
            field: 'User_Id',
        },
        FromDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            field: 'FromDate',
        },
        ToDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            field: 'ToDate',
        },
        Session: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'Full',
            field: 'Session',
        },
        NoOfDays: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
            field: 'NoOfDays',
        },
        LeaveType_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: true,
            field: 'LeaveType_Id',
        },
        Department: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Department',
        },
        InCharge: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: true,
            field: 'InCharge',
        },
        Reason: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'Reason',
        },
        Created_By: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: true,
            field: 'Created_By',
        },
        Created_At: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Created_At',
        },
        Approved_By: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: true,
            field: 'Approved_By',
        },
        Approved_At: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Approved_At',
        },
        Approver_Reason: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'Approver_Reason',
        },
        Status: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            defaultValue: 'Pending',
            field: 'Status',
        },
    }, {
        sequelize,
        tableName: 'tbl_Leave_Master',
        modelName: 'Leave',
        timestamps: false,
    });
    return Leave;
}
// ─── Default Export ───────────────────────────────────────────────────────────
const sequalizer_1 = require("../../../config/sequalizer");
exports.LeaveModel = initLeaveModel(sequalizer_1.sequelize);
exports.default = exports.LeaveModel;
