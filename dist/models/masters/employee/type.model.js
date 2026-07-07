"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = exports.formatEmployeeForResponse = exports.employeeIdSchema = exports.employeeQuerySchema = exports.employeeUpdateSchema = exports.employeeCreateSchema = void 0;
exports.initEmployeeModel = initEmployeeModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
// Zod schemas for validation
exports.employeeCreateSchema = zod_1.z.object({
    Branch: zod_1.z.coerce.number()
        .int()
        .positive('Branch ID must be positive')
        .nullable()
        .optional(),
    fingerPrintEmpId: zod_1.z.string()
        .max(100, 'Fingerprint Employee ID cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Emp_Code: zod_1.z.string()
        .min(1, 'Employee Code is required')
        .max(50, 'Employee Code cannot exceed 50 characters')
        .trim(),
    Emp_Name: zod_1.z.string()
        .min(1, 'Employee Name is required')
        .max(255, 'Employee Name cannot exceed 255 characters')
        .trim(),
    Designation: zod_1.z.coerce.number()
        .int()
        .positive('Designation ID must be positive')
        .nullable()
        .optional(),
    DOB: zod_1.z.coerce.date()
        .nullable()
        .optional()
        .refine(date => !date || date <= new Date(), {
        message: 'Date of Birth cannot be in the future'
    }),
    DOJ: zod_1.z.coerce.date()
        .nullable()
        .optional()
        .refine(date => !date || date <= new Date(), {
        message: 'Date of Joining cannot be in the future'
    }),
    Department_ID: zod_1.z.coerce.number()
        .int()
        .positive('Department ID must be positive')
        .nullable()
        .optional(),
    Address_1: zod_1.z.string()
        .max(500, 'Address 1 cannot exceed 500 characters')
        .trim()
        .nullable()
        .optional(),
    Address_2: zod_1.z.string()
        .max(500, 'Address 2 cannot exceed 500 characters')
        .trim()
        .nullable()
        .optional(),
    City: zod_1.z.string()
        .max(100, 'City cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Country: zod_1.z.string()
        .max(100, 'Country cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Pincode: zod_1.z.string()
        .max(10, 'Pincode cannot exceed 10 characters')
        .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
        .trim()
        .nullable()
        .optional(),
    Mobile_No: zod_1.z.string()
        .max(15, 'Mobile number cannot exceed 15 characters')
        .regex(/^(\+91[\-\s]?)?[6789]\d{9}$/, {
        message: 'Invalid Indian mobile number. Must be 10 digits starting with 6,7,8, or 9'
    })
        .trim()
        .nullable()
        .optional(),
    Education: zod_1.z.string()
        .max(255, 'Education cannot exceed 255 characters')
        .trim()
        .nullable()
        .optional(),
    Fathers_Name: zod_1.z.string()
        .max(255, "Father's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Mothers_Name: zod_1.z.string()
        .max(255, "Mother's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Spouse_Name: zod_1.z.string()
        .max(255, "Spouse's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Sex: zod_1.z.enum(['Male', 'Female', 'Other'])
        .nullable()
        .optional(),
    Emp_Religion: zod_1.z.string()
        .max(100, 'Religion cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Salary: zod_1.z.coerce.number()
        .min(0, 'Salary cannot be negative')
        .nullable()
        .optional(),
    Total_Loan: zod_1.z.coerce.number()
        .min(0, 'Total Loan cannot be negative')
        .nullable()
        .optional()
        .default(0),
    Salary_Advance: zod_1.z.coerce.number()
        .min(0, 'Salary Advance cannot be negative')
        .nullable()
        .optional()
        .default(0),
    Due_Loan: zod_1.z.coerce.number()
        .min(0, 'Due Loan cannot be negative')
        .nullable()
        .optional()
        .default(0),
    User_Mgt_Id: zod_1.z.coerce.number()
        .int()
        .positive('User Management ID must be positive')
        .nullable()
        .optional(),
    Entry_By: zod_1.z.coerce.number()
        .int()
        .positive('Entry By must be positive')
        .nullable()
        .optional(),
    Entry_Date: zod_1.z.coerce.date()
        .default(() => new Date()),
    Department: zod_1.z.string()
        .max(100, 'Department cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Location: zod_1.z.string()
        .max(100, 'Location cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional()
});
exports.employeeUpdateSchema = zod_1.z.object({
    Branch: zod_1.z.coerce.number()
        .int()
        .positive('Branch ID must be positive')
        .nullable()
        .optional(),
    fingerPrintEmpId: zod_1.z.string()
        .max(100, 'Fingerprint Employee ID cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Emp_Code: zod_1.z.string()
        .max(50, 'Employee Code cannot exceed 50 characters')
        .trim()
        .optional(),
    Emp_Name: zod_1.z.string()
        .max(255, 'Employee Name cannot exceed 255 characters')
        .trim()
        .optional(),
    Designation: zod_1.z.coerce.number()
        .int()
        .positive('Designation ID must be positive')
        .nullable()
        .optional(),
    DOB: zod_1.z.coerce.date()
        .nullable()
        .optional()
        .refine(date => !date || date <= new Date(), {
        message: 'Date of Birth cannot be in the future'
    }),
    DOJ: zod_1.z.coerce.date()
        .nullable()
        .optional()
        .refine(date => !date || date <= new Date(), {
        message: 'Date of Joining cannot be in the future'
    }),
    Department_ID: zod_1.z.coerce.number()
        .int()
        .positive('Department ID must be positive')
        .nullable()
        .optional(),
    Address_1: zod_1.z.string()
        .max(500, 'Address 1 cannot exceed 500 characters')
        .trim()
        .nullable()
        .optional(),
    Address_2: zod_1.z.string()
        .max(500, 'Address 2 cannot exceed 500 characters')
        .trim()
        .nullable()
        .optional(),
    City: zod_1.z.string()
        .max(100, 'City cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Country: zod_1.z.string()
        .max(100, 'Country cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Pincode: zod_1.z.string()
        .max(10, 'Pincode cannot exceed 10 characters')
        .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
        .trim()
        .nullable()
        .optional(),
    Mobile_No: zod_1.z.string()
        .max(15, 'Mobile number cannot exceed 15 characters')
        .regex(/^(\+91[\-\s]?)?[6789]\d{9}$/, {
        message: 'Invalid Indian mobile number. Must be 10 digits starting with 6,7,8, or 9'
    })
        .trim()
        .nullable()
        .optional(),
    Education: zod_1.z.string()
        .max(255, 'Education cannot exceed 255 characters')
        .trim()
        .nullable()
        .optional(),
    Fathers_Name: zod_1.z.string()
        .max(255, "Father's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Mothers_Name: zod_1.z.string()
        .max(255, "Mother's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Spouse_Name: zod_1.z.string()
        .max(255, "Spouse's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Sex: zod_1.z.enum(['Male', 'Female', 'Other'])
        .nullable()
        .optional(),
    Emp_Religion: zod_1.z.string()
        .max(100, 'Religion cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Salary: zod_1.z.coerce.number()
        .min(0, 'Salary cannot be negative')
        .nullable()
        .optional(),
    Total_Loan: zod_1.z.coerce.number()
        .min(0, 'Total Loan cannot be negative')
        .nullable()
        .optional(),
    Salary_Advance: zod_1.z.coerce.number()
        .min(0, 'Salary Advance cannot be negative')
        .nullable()
        .optional(),
    Due_Loan: zod_1.z.coerce.number()
        .min(0, 'Due Loan cannot be negative')
        .nullable()
        .optional(),
    User_Mgt_Id: zod_1.z.coerce.number()
        .int()
        .positive('User Management ID must be positive')
        .nullable()
        .optional(),
    Department: zod_1.z.string()
        .max(100, 'Department cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Location: zod_1.z.string()
        .max(100, 'Location cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional()
});
exports.employeeQuerySchema = zod_1.z.object({
    branch: zod_1.z.coerce.number()
        .int()
        .positive('Branch ID must be positive')
        .nullable()
        .optional(),
    departmentId: zod_1.z.coerce.number()
        .int()
        .positive('Department ID must be positive')
        .nullable()
        .optional(),
    designation: zod_1.z.coerce.number()
        .int()
        .positive('Designation ID must be positive')
        .nullable()
        .optional(),
    search: zod_1.z.string()
        .max(100, 'Search term too long')
        .trim()
        .optional(),
    sortBy: zod_1.z.enum([
        'Emp_Id',
        'Emp_Code',
        'Emp_Name',
        'DOJ',
        'Department_ID',
        'Salary',
        'Entry_Date'
    ])
        .default('Emp_Id')
        .optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('DESC')
        .optional()
});
exports.employeeIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int()
        .positive('Valid Employee ID is required')
});
// Helper function to format employee for response
const formatEmployeeForResponse = (employee) => {
    const employeeData = employee.get ? employee.get({ plain: true }) : employee;
    return employeeData;
};
exports.formatEmployeeForResponse = formatEmployeeForResponse;
// Model class definition
class Employee extends sequelize_1.Model {
    Emp_Id;
    Branch;
    fingerPrintEmpId;
    Emp_Code;
    Emp_Name;
    Designation;
    DOB;
    DOJ;
    Department_ID;
    Address_1;
    Address_2;
    City;
    Country;
    Pincode;
    Mobile_No;
    Education;
    Fathers_Name;
    Mothers_Name;
    Spouse_Name;
    Sex;
    Emp_Religion;
    Salary;
    Total_Loan;
    Salary_Advance;
    Due_Loan;
    User_Mgt_Id;
    Entry_By;
    Entry_Date;
    Department;
    Location;
}
exports.Employee = Employee;
// Function to initialize Employee model with a specific Sequelize instance
function initEmployeeModel(sequelize) {
    Employee.init({
        Emp_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'Emp_Id'
        },
        Branch: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Branch'
        },
        fingerPrintEmpId: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'fingerPrintEmpId'
        },
        Emp_Code: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'Emp_Code'
        },
        Emp_Name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            field: 'Emp_Name'
        },
        Designation: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Designation'
        },
        DOB: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'DOB'
        },
        DOJ: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'DOJ'
        },
        Department_ID: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Department_ID'
        },
        Address_1: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'Address_1'
        },
        Address_2: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'Address_2'
        },
        City: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'City'
        },
        Country: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Country'
        },
        Pincode: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            field: 'Pincode'
        },
        Mobile_No: {
            type: sequelize_1.DataTypes.STRING(15),
            allowNull: true,
            field: 'Mobile_No'
        },
        Education: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            field: 'Education'
        },
        Fathers_Name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            field: 'Fathers_Name'
        },
        Mothers_Name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            field: 'Mothers_Name'
        },
        Spouse_Name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            field: 'Spouse_Name'
        },
        Sex: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            field: 'Sex'
        },
        Emp_Religion: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Emp_Religion'
        },
        Salary: {
            type: sequelize_1.DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'Salary'
        },
        Total_Loan: {
            type: sequelize_1.DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0,
            field: 'Total_Loan'
        },
        Salary_Advance: {
            type: sequelize_1.DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0,
            field: 'Salary_Advance'
        },
        Due_Loan: {
            type: sequelize_1.DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0,
            field: 'Due_Loan'
        },
        User_Mgt_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'User_Mgt_Id'
        },
        Entry_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Entry_By'
        },
        Entry_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'Entry_Date'
        },
        Department: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Department'
        },
        Location: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Location'
        }
    }, {
        sequelize,
        tableName: 'tbl_Employee_Master',
        modelName: 'Employee',
        timestamps: false
    });
    return Employee;
}
exports.default = Employee;
