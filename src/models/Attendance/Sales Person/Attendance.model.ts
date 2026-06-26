import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';

// ─── Result Interfaces ────────────────────────────────────────────────────────

export interface AttendanceRecord {
    Id: number | string;
    UserId: number;
    Start_Date: Date;
    End_Date?: Date | null;
    Start_KM?: number | null;
    End_KM?: number | null;
    Start_KM_ImageName?: string | null;
    End_KM_ImageName?: string | null;
    Start_KM_ImagePath?: string | null;
    End_KM_ImagePath?: string | null;
    Latitude?: string | null;
    Longitude?: string | null;
    WorkSummary?: string | null;
    IsSalesPerson?: number | null;
    Active_Status?: number | null;
    User_Name?: string | null;
    Branch_Id?: number | null;
    startKmImageUrl?: string | null;
    endKmImageUrl?: string | null;
}

export interface DepartmentRow {
    value: string;
    label: string;
}

export interface EmployeeRow {
    label: string;
    value: number;
}

export interface EmployeewiseStatsRow {
    TotalMaleEmployees: number;
    TotalFemaleEmployees: number;
    TotalEmployees: number;
    TotalDepartments: number;
    TotalDepartmentsPresentToday: number;
    TotalMalePresentToday: number;
    TotalFemalePresentToday: number;
    TotalPresentToday: number;
    DepartmentsPresentToday: string | null;
    DepartmentWiseCounts: string | null;
    AttendanceDetails?: string | null;
    DepartmentList?: string | null;
}

export interface AttendanceHistoryFilter {
    UserId?: string | number;
    UserTypeID: string | number;
    Branch_Id?: string | number;
    From?: string;
    To?: string;
}

export interface AddAttendanceInput {
    UserId: number | string;
    Start_KM?: string | number | null;
    Latitude?: string | number | null;
    Longitude?: string | number | null;
    fileName?: string | null;
    filePath?: string | null;
    isSalesPerson: number;
}

export interface CloseAttendanceInput {
    Id: number | string;
    End_KM?: string | number | null;
    Description?: string | null;
    fileName?: string | null;
    filePath?: string | null;
}

// ─── New Interfaces for Summary and Stats ─────────────────────────────────────

export interface AttendanceSummary {
    userId: string;
    month: number;
    year: number;
    totalDays: number;
    closedDays: number;
    openDays: number;
    completionRate: number;
}

export interface AttendanceStats {
    totalEmployees: number;
    totalClosed: number;
    totalOpen: number;
    completionRate: number;
}

// ─── Sequelize Model: tbl_Attendance ─────────────────────────────────────────

export interface AttendanceAttributes {
    Id: number;
    UserId: number;
    Start_Date?: Date | null;
    End_Date?: Date | null;
    Start_KM?: number | null;
    End_KM?: number | null;
    Start_KM_ImageName?: string | null;
    End_KM_ImageName?: string | null;
    Start_KM_ImagePath?: string | null;
    End_KM_ImagePath?: string | null;
    Latitude?: string | null;
    Longitude?: string | null;
    WorkSummary?: string | null;
    IsSalesPerson?: number | null;
    Active_Status?: number | null;
}

export interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'Id'> {}

export class Attendance
    extends Model<AttendanceAttributes, AttendanceCreationAttributes>
    implements AttendanceAttributes
{
    public Id!: number;
    public UserId!: number;
    public Start_Date!: Date | null;
    public End_Date!: Date | null;
    public Start_KM!: number | null;
    public End_KM!: number | null;
    public Start_KM_ImageName!: string | null;
    public End_KM_ImageName!: string | null;
    public Start_KM_ImagePath!: string | null;
    public End_KM_ImagePath!: string | null;
    public Latitude!: string | null;
    public Longitude!: string | null;
    public WorkSummary!: string | null;
    public IsSalesPerson!: number | null;
    public Active_Status!: number | null;
}

Attendance.init(
    {
        Id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Start_Date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        End_Date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        Start_KM: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        End_KM: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        Start_KM_ImageName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        End_KM_ImageName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Start_KM_ImagePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        End_KM_ImagePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        Latitude: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        Longitude: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        WorkSummary: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        IsSalesPerson: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        Active_Status: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
    },
    {
        sequelize,
        tableName: 'tbl_Attendance',
        timestamps: false,
    }
);

// ─── Sequelize Model: tbl_Employee_Master ─────────────────────────────────────

export interface EmployeeMasterAttributes {
    id: number;
    User_Mgt_Id?: number | null;
    fingerPrintEmpId?: string | null;
    Emp_Name?: string | null;
    Designation?: number | null;
    Department?: string | null;
    Mobile_No?: string | null;
    Email_Id?: string | null;
    Sex?: string | null;
    Active_Status?: number | null;
}

export interface EmployeeMasterCreationAttributes extends Optional<EmployeeMasterAttributes, 'id'> {}

export class EmployeeMaster
    extends Model<EmployeeMasterAttributes, EmployeeMasterCreationAttributes>
    implements EmployeeMasterAttributes
{
    public id!: number;
    public User_Mgt_Id!: number | null;
    public fingerPrintEmpId!: string | null;
    public Emp_Name!: string | null;
    public Designation!: number | null;
    public Department!: string | null;
    public Mobile_No!: string | null;
    public Email_Id!: string | null;
    public Sex!: string | null;
    public Active_Status!: number | null;
}

EmployeeMaster.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        User_Mgt_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        fingerPrintEmpId: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        Emp_Name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Designation: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        Department: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Mobile_No: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        Email_Id: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        Sex: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        Active_Status: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
    },
    {
        sequelize,
        tableName: 'tbl_Employee_Master',
        timestamps: false,
    }
);

export default {
    Attendance,
    EmployeeMaster,
};