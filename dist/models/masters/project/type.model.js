"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = exports.Project = exports.formatProjectForResponse = exports.getProjectStatusText = exports.getStatusText = exports.projectQuerySchema = exports.projectIdSchema = exports.projectUpdateSchema = exports.projectCreateSchema = void 0;
exports.initProjectModel = initProjectModel;
// models/masters/project/type.model.ts
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const sequalizer_1 = require("../../../config/sequalizer");
// Zod schemas for validation
exports.projectCreateSchema = zod_1.z.object({
    Project_Name: zod_1.z.string()
        .min(1, 'Project name is required')
        .max(255, 'Project name must be 255 characters or less')
        .trim(),
    Project_Desc: zod_1.z.string()
        .max(1000, 'Project description must be 1000 characters or less')
        .trim()
        .optional()
        .nullable()
        .default(null),
    Company_Id: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .optional()
        .nullable()
        .default(null),
    Project_Head: zod_1.z.coerce.number()
        .int('Project head ID must be an integer')
        .positive('Project head ID must be positive')
        .optional()
        .nullable()
        .default(null),
    Est_Start_Dt: zod_1.z.union([zod_1.z.string(), zod_1.z.date()])
        .transform(val => {
        if (typeof val === 'string') {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return date;
        }
        return val;
    })
        .refine(val => val instanceof Date && !isNaN(val.getTime()), {
        message: 'Valid estimated start date is required',
    }),
    Est_End_Dt: zod_1.z.union([zod_1.z.string(), zod_1.z.date()])
        .transform(val => {
        if (typeof val === 'string') {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return date;
        }
        return val;
    })
        .refine(val => val instanceof Date && !isNaN(val.getTime()), {
        message: 'Valid estimated end date is required',
    }),
    Project_Status: zod_1.z.coerce.number()
        .int('Project status must be an integer')
        .min(0, 'Project status must be 0 or greater')
        .max(5, 'Project status must be 5 or less')
        .optional()
        .nullable()
        .default(1),
    IsActive: zod_1.z.union([zod_1.z.boolean(), zod_1.z.number(), zod_1.z.string()])
        .transform(val => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true' || val === '1')
                return 1;
            if (val.toLowerCase() === 'false' || val === '0')
                return 0;
        }
        if (typeof val === 'number')
            return val;
        if (typeof val === 'boolean')
            return val ? 1 : 0;
        return 1;
    })
        .refine(val => val === 0 || val === 1, {
        message: 'IsActive must be 0 or 1',
    })
        .optional()
        .default(1),
}).refine(data => data.Est_End_Dt >= data.Est_Start_Dt, {
    message: 'End date must be after or equal to start date',
    path: ['Est_End_Dt'],
});
exports.projectUpdateSchema = zod_1.z.object({
    Project_Name: zod_1.z.string()
        .min(1, 'Project name is required')
        .max(255, 'Project name must be 255 characters or less')
        .trim()
        .optional(),
    Project_Desc: zod_1.z.string()
        .max(1000, 'Project description must be 1000 characters or less')
        .trim()
        .optional()
        .nullable(),
    Company_Id: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .optional()
        .nullable(),
    Project_Head: zod_1.z.coerce.number()
        .int('Project head ID must be an integer')
        .positive('Project head ID must be positive')
        .optional()
        .nullable(),
    Est_Start_Dt: zod_1.z.union([zod_1.z.string(), zod_1.z.date()])
        .transform(val => {
        if (typeof val === 'string') {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return date;
        }
        return val;
    })
        .refine(val => val instanceof Date && !isNaN(val.getTime()) || val === undefined, {
        message: 'Valid estimated start date is required',
    })
        .optional(),
    Est_End_Dt: zod_1.z.union([zod_1.z.string(), zod_1.z.date()])
        .transform(val => {
        if (typeof val === 'string') {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return date;
        }
        return val;
    })
        .refine(val => val instanceof Date && !isNaN(val.getTime()) || val === undefined, {
        message: 'Valid estimated end date is required',
    })
        .optional(),
    Project_Status: zod_1.z.coerce.number()
        .int('Project status must be an integer')
        .min(0, 'Project status must be 0 or greater')
        .max(5, 'Project status must be 5 or less')
        .optional()
        .nullable(),
    IsActive: zod_1.z.union([zod_1.z.boolean(), zod_1.z.number(), zod_1.z.string()])
        .transform(val => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true' || val === '1')
                return 1;
            if (val.toLowerCase() === 'false' || val === '0')
                return 0;
        }
        if (typeof val === 'number')
            return val;
        if (typeof val === 'boolean')
            return val ? 1 : 0;
        return undefined;
    })
        .refine(val => val === undefined || val === 0 || val === 1, {
        message: 'IsActive must be 0 or 1',
    })
        .optional()
        .nullable(),
}).refine(data => {
    if (data.Est_Start_Dt && data.Est_End_Dt) {
        return data.Est_End_Dt >= data.Est_Start_Dt;
    }
    return true;
}, {
    message: 'End date must be after or equal to start date',
    path: ['Est_End_Dt'],
});
exports.projectIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int('Project ID must be an integer')
        .positive('Valid project ID is required')
});
exports.projectQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number()
        .int('Page must be an integer')
        .positive('Page must be positive')
        .default(1)
        .optional(),
    limit: zod_1.z.coerce.number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(20)
        .optional(),
    search: zod_1.z.string()
        .optional()
        .nullable(),
    Project_Name: zod_1.z.string()
        .optional()
        .nullable(),
    Company_Id: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .optional()
        .nullable(),
    Project_Status: zod_1.z.coerce.number()
        .int('Project status must be an integer')
        .min(0, 'Project status must be 0 or greater')
        .max(5, 'Project status must be 5 or less')
        .optional()
        .nullable(),
    Project_Head: zod_1.z.coerce.number()
        .int('Project head ID must be an integer')
        .positive('Project head ID must be positive')
        .optional()
        .nullable(),
    IsActive: zod_1.z.coerce.number()
        .int('IsActive must be an integer')
        .min(0, 'IsActive must be 0 or 1')
        .max(1, 'IsActive must be 0 or 1')
        .optional()
        .nullable(),
    startDate: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
        .optional()
        .nullable(),
    endDate: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
        .optional()
        .nullable(),
    sortBy: zod_1.z.enum([
        'Project_Id',
        'Project_Name',
        'Est_Start_Dt',
        'Est_End_Dt',
        'Entry_Date',
        'Update_Date',
        'IsActive',
        'Project_Status'
    ])
        .default('Project_Id')
        .optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('DESC')
        .optional(),
});
// Helper functions for status conversion
const getStatusText = (status) => {
    if (status === 1)
        return 'Active';
    if (status === 0)
        return 'Inactive';
    return 'Unknown';
};
exports.getStatusText = getStatusText;
const getProjectStatusText = (status) => {
    const statusMap = {
        0: 'Not Started',
        1: 'Planning',
        2: 'In Progress',
        3: 'On Hold',
        4: 'Completed',
        5: 'Cancelled'
    };
    return status !== null && statusMap[status] ? statusMap[status] : 'Unknown';
};
exports.getProjectStatusText = getProjectStatusText;
// Function to format project for response
const formatProjectForResponse = (project) => {
    const projectData = project.get ? project.get({ plain: true }) : project;
    return {
        ...projectData,
        statusText: (0, exports.getStatusText)(projectData.IsActive),
        projectStatusText: (0, exports.getProjectStatusText)(projectData.Project_Status)
    };
};
exports.formatProjectForResponse = formatProjectForResponse;
// Model class definition (without initialization)
class Project extends sequelize_1.Model {
    Project_Id;
    Project_Name;
    Project_Desc;
    Company_Id;
    Project_Head;
    Est_Start_Dt;
    Est_End_Dt;
    Project_Status;
    Entry_By;
    Entry_Date;
    Update_By;
    Update_Date;
    IsActive;
}
exports.Project = Project;
// Function to initialize Project model with a specific Sequelize instance
function initProjectModel(sequelize) {
    Project.init({
        Project_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'Project_Id'
        },
        Project_Name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            field: 'Project_Name'
        },
        Project_Desc: {
            type: sequelize_1.DataTypes.STRING(1000),
            allowNull: true,
            field: 'Project_Desc'
        },
        Company_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Company_Id'
        },
        Project_Head: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Project_Head'
        },
        Est_Start_Dt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Est_Start_Dt'
        },
        Est_End_Dt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Est_End_Dt'
        },
        Project_Status: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Project_Status',
            defaultValue: 1
        },
        Entry_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Entry_By',
            defaultValue: 1
        },
        Entry_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Entry_Date',
            defaultValue: sequelize_1.DataTypes.NOW
        },
        Update_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Update_By'
        },
        Update_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Update_Date'
        },
        IsActive: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'IsActive',
            defaultValue: 1
        }
    }, {
        sequelize,
        tableName: 'tbl_Project_Master',
        modelName: 'Project',
        timestamps: false,
        hooks: {
            beforeUpdate: (project) => {
                project.Update_Date = new Date();
            },
            beforeCreate: (project) => {
                if (!project.Entry_Date) {
                    project.Entry_Date = new Date();
                }
                if (project.IsActive === undefined || project.IsActive === null) {
                    project.IsActive = 1;
                }
                if (project.Project_Status === undefined || project.Project_Status === null) {
                    project.Project_Status = 1;
                }
            }
        }
    });
    return Project;
}
exports.ProjectModel = initProjectModel(sequalizer_1.sequelize);
exports.default = exports.ProjectModel;
