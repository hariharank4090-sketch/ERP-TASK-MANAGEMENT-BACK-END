import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

// Interface for Employee attributes
export interface EmployeeAttributes {
    Emp_Id: number;
    Branch: number | null;
    fingerPrintEmpId: string | null;
    Emp_Code: string | null;
    Emp_Name: string | null;
    Designation: number | null;
    DOB: Date | null;
    DOJ: Date | null;
    Department_ID: number | null;
    Address_1: string | null;
    Address_2: string | null;
    City: string | null;
    Country: string | null;
    Pincode: string | null;
    Mobile_No: string | null;
    Education: string | null;
    Fathers_Name: string | null;
    Mothers_Name: string | null;
    Spouse_Name: string | null;
    Sex: string | null;
    Emp_Religion: string | null;
    Salary: number | null;
    Total_Loan: number | null;
    Salary_Advance: number | null;
    Due_Loan: number | null;
    User_Mgt_Id: number | null;
    Entry_By: number | null;
    Entry_Date: Date | null;
    Department: string | null;
    Location: string | null;
}

export type EmployeeCreationAttributes = Optional<EmployeeAttributes, 'Emp_Id'>;

// Zod schemas for validation
export const employeeCreateSchema = z.object({
    Branch: z.coerce.number()
        .int()
        .positive('Branch ID must be positive')
        .nullable()
        .optional(),
    fingerPrintEmpId: z.string()
        .max(100, 'Fingerprint Employee ID cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Emp_Code: z.string()
        .min(1, 'Employee Code is required')
        .max(50, 'Employee Code cannot exceed 50 characters')
        .trim(),
    Emp_Name: z.string()
        .min(1, 'Employee Name is required')
        .max(255, 'Employee Name cannot exceed 255 characters')
        .trim(),
    Designation: z.coerce.number()
        .int()
        .positive('Designation ID must be positive')
        .nullable()
        .optional(),
    DOB: z.coerce.date()
        .nullable()
        .optional()
        .refine(date => !date || date <= new Date(), {
            message: 'Date of Birth cannot be in the future'
        }),
    DOJ: z.coerce.date()
        .nullable()
        .optional()
        .refine(date => !date || date <= new Date(), {
            message: 'Date of Joining cannot be in the future'
        }),
    Department_ID: z.coerce.number()
        .int()
        .positive('Department ID must be positive')
        .nullable()
        .optional(),
    Address_1: z.string()
        .max(500, 'Address 1 cannot exceed 500 characters')
        .trim()
        .nullable()
        .optional(),
    Address_2: z.string()
        .max(500, 'Address 2 cannot exceed 500 characters')
        .trim()
        .nullable()
        .optional(),
    City: z.string()
        .max(100, 'City cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Country: z.string()
        .max(100, 'Country cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Pincode: z.string()
        .max(10, 'Pincode cannot exceed 10 characters')
        .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
        .trim()
        .nullable()
        .optional(),
    Mobile_No: z.string()
        .max(15, 'Mobile number cannot exceed 15 characters')
        .regex(/^(\+91[\-\s]?)?[6789]\d{9}$/, {
            message: 'Invalid Indian mobile number. Must be 10 digits starting with 6,7,8, or 9'
        })
        .trim()
        .nullable()
        .optional(),
    Education: z.string()
        .max(255, 'Education cannot exceed 255 characters')
        .trim()
        .nullable()
        .optional(),
    Fathers_Name: z.string()
        .max(255, "Father's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Mothers_Name: z.string()
        .max(255, "Mother's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Spouse_Name: z.string()
        .max(255, "Spouse's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Sex: z.enum(['Male', 'Female', 'Other'])
        .nullable()
        .optional(),
    Emp_Religion: z.string()
        .max(100, 'Religion cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Salary: z.coerce.number()
        .min(0, 'Salary cannot be negative')
        .nullable()
        .optional(),
    Total_Loan: z.coerce.number()
        .min(0, 'Total Loan cannot be negative')
        .nullable()
        .optional()
        .default(0),
    Salary_Advance: z.coerce.number()
        .min(0, 'Salary Advance cannot be negative')
        .nullable()
        .optional()
        .default(0),
    Due_Loan: z.coerce.number()
        .min(0, 'Due Loan cannot be negative')
        .nullable()
        .optional()
        .default(0),
    User_Mgt_Id: z.coerce.number()
        .int()
        .positive('User Management ID must be positive')
        .nullable()
        .optional(),
    Entry_By: z.coerce.number()
        .int()
        .positive('Entry By must be positive')
        .nullable()
        .optional(),
    Entry_Date: z.coerce.date()
        .default(() => new Date()),
    Department: z.string()
        .max(100, 'Department cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Location: z.string()
        .max(100, 'Location cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional()
});

export const employeeUpdateSchema = z.object({
    Branch: z.coerce.number()
        .int()
        .positive('Branch ID must be positive')
        .nullable()
        .optional(),
    fingerPrintEmpId: z.string()
        .max(100, 'Fingerprint Employee ID cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Emp_Code: z.string()
        .max(50, 'Employee Code cannot exceed 50 characters')
        .trim()
        .optional(),
    Emp_Name: z.string()
        .max(255, 'Employee Name cannot exceed 255 characters')
        .trim()
        .optional(),
    Designation: z.coerce.number()
        .int()
        .positive('Designation ID must be positive')
        .nullable()
        .optional(),
    DOB: z.coerce.date()
        .nullable()
        .optional()
        .refine(date => !date || date <= new Date(), {
            message: 'Date of Birth cannot be in the future'
        }),
    DOJ: z.coerce.date()
        .nullable()
        .optional()
        .refine(date => !date || date <= new Date(), {
            message: 'Date of Joining cannot be in the future'
        }),
    Department_ID: z.coerce.number()
        .int()
        .positive('Department ID must be positive')
        .nullable()
        .optional(),
    Address_1: z.string()
        .max(500, 'Address 1 cannot exceed 500 characters')
        .trim()
        .nullable()
        .optional(),
    Address_2: z.string()
        .max(500, 'Address 2 cannot exceed 500 characters')
        .trim()
        .nullable()
        .optional(),
    City: z.string()
        .max(100, 'City cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Country: z.string()
        .max(100, 'Country cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Pincode: z.string()
        .max(10, 'Pincode cannot exceed 10 characters')
        .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
        .trim()
        .nullable()
        .optional(),
    Mobile_No: z.string()
        .max(15, 'Mobile number cannot exceed 15 characters')
        .regex(/^(\+91[\-\s]?)?[6789]\d{9}$/, {
            message: 'Invalid Indian mobile number. Must be 10 digits starting with 6,7,8, or 9'
        })
        .trim()
        .nullable()
        .optional(),
    Education: z.string()
        .max(255, 'Education cannot exceed 255 characters')
        .trim()
        .nullable()
        .optional(),
    Fathers_Name: z.string()
        .max(255, "Father's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Mothers_Name: z.string()
        .max(255, "Mother's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Spouse_Name: z.string()
        .max(255, "Spouse's Name cannot exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    Sex: z.enum(['Male', 'Female', 'Other'])
        .nullable()
        .optional(),
    Emp_Religion: z.string()
        .max(100, 'Religion cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Salary: z.coerce.number()
        .min(0, 'Salary cannot be negative')
        .nullable()
        .optional(),
    Total_Loan: z.coerce.number()
        .min(0, 'Total Loan cannot be negative')
        .nullable()
        .optional(),
    Salary_Advance: z.coerce.number()
        .min(0, 'Salary Advance cannot be negative')
        .nullable()
        .optional(),
    Due_Loan: z.coerce.number()
        .min(0, 'Due Loan cannot be negative')
        .nullable()
        .optional(),
    User_Mgt_Id: z.coerce.number()
        .int()
        .positive('User Management ID must be positive')
        .nullable()
        .optional(),
    Department: z.string()
        .max(100, 'Department cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional(),
    Location: z.string()
        .max(100, 'Location cannot exceed 100 characters')
        .trim()
        .nullable()
        .optional()
});

export const employeeQuerySchema = z.object({
    branch: z.coerce.number()
        .int()
        .positive('Branch ID must be positive')
        .nullable()
        .optional(),
    departmentId: z.coerce.number()
        .int()
        .positive('Department ID must be positive')
        .nullable()
        .optional(),
    designation: z.coerce.number()
        .int()
        .positive('Designation ID must be positive')
        .nullable()
        .optional(),
    search: z.string()
        .max(100, 'Search term too long')
        .trim()
        .optional(),
    sortBy: z.enum([
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
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('DESC')
        .optional()
});

export const employeeIdSchema = z.object({
    id: z.coerce.number()
        .int()
        .positive('Valid Employee ID is required')
});

// Type exports
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type EmployeeQueryParams = z.infer<typeof employeeQuerySchema>;

// Helper function to format employee for response
export const formatEmployeeForResponse = (employee: any) => {
    const employeeData = employee.get ? employee.get({ plain: true }) : employee;
    return employeeData;
};

// Model class definition
export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes>
    implements EmployeeAttributes {
    public Emp_Id!: number;
    public Branch!: number | null;
    public fingerPrintEmpId!: string | null;
    public Emp_Code!: string | null;
    public Emp_Name!: string | null;
    public Designation!: number | null;
    public DOB!: Date | null;
    public DOJ!: Date | null;
    public Department_ID!: number | null;
    public Address_1!: string | null;
    public Address_2!: string | null;
    public City!: string | null;
    public Country!: string | null;
    public Pincode!: string | null;
    public Mobile_No!: string | null;
    public Education!: string | null;
    public Fathers_Name!: string | null;
    public Mothers_Name!: string | null;
    public Spouse_Name!: string | null;
    public Sex!: string | null;
    public Emp_Religion!: string | null;
    public Salary!: number | null;
    public Total_Loan!: number | null;
    public Salary_Advance!: number | null;
    public Due_Loan!: number | null;
    public User_Mgt_Id!: number | null;
    public Entry_By!: number | null;
    public Entry_Date!: Date | null;
    public Department!: string | null;
    public Location!: string | null;
}

// Function to initialize Employee model with a specific Sequelize instance
export function initEmployeeModel(sequelize: Sequelize): typeof Employee {
    Employee.init(
        {
            Emp_Id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                field: 'Emp_Id'
            },
            Branch: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Branch'
            },
            fingerPrintEmpId: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'fingerPrintEmpId'
            },
            Emp_Code: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'Emp_Code'
            },
            Emp_Name: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'Emp_Name'
            },
            Designation: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Designation'
            },
            DOB: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'DOB'
            },
            DOJ: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'DOJ'
            },
            Department_ID: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Department_ID'
            },
            Address_1: {
                type: DataTypes.STRING(500),
                allowNull: true,
                field: 'Address_1'
            },
            Address_2: {
                type: DataTypes.STRING(500),
                allowNull: true,
                field: 'Address_2'
            },
            City: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'City'
            },
            Country: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'Country'
            },
            Pincode: {
                type: DataTypes.STRING(10),
                allowNull: true,
                field: 'Pincode'
            },
            Mobile_No: {
                type: DataTypes.STRING(15),
                allowNull: true,
                field: 'Mobile_No'
            },
            Education: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'Education'
            },
            Fathers_Name: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'Fathers_Name'
            },
            Mothers_Name: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'Mothers_Name'
            },
            Spouse_Name: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'Spouse_Name'
            },
            Sex: {
                type: DataTypes.STRING(10),
                allowNull: true,
                field: 'Sex'
            },
            Emp_Religion: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'Emp_Religion'
            },
            Salary: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: true,
                field: 'Salary'
            },
            Total_Loan: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0,
                field: 'Total_Loan'
            },
            Salary_Advance: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0,
                field: 'Salary_Advance'
            },
            Due_Loan: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0,
                field: 'Due_Loan'
            },
            User_Mgt_Id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'User_Mgt_Id'
            },
            Entry_By: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Entry_By'
            },
            Entry_Date: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
                field: 'Entry_Date'
            },
            Department: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'Department'
            },
            Location: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'Location'
            }
        },
        {
            sequelize,
            tableName: 'tbl_Employee_Master',
            modelName: 'Employee',
            timestamps: false
        }
    );
    
    return Employee;
}

export default Employee;