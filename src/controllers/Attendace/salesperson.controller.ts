import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { servError, dataFound, noData, invalidInput, success, failed } from '../../responseObject';
import { checkIsNumber, ISOString, isEqualNumber } from '../../helper_functions';
import { getUserType } from '../../middleware/miniAPIs';
import uploadFile from '../../middleware/uploadMiddleware';
import getImageIfExist from '../../middleware/getImageIfExist';
import fileRemoverMiddleware from '../../middleware/unSyncFile';
import {
    AttendanceRecord,
    EmployeewiseStatsRow,
    DepartmentRow,
    EmployeeRow,
    AddAttendanceInput,
    CloseAttendanceInput,
    AttendanceSummary,
    AttendanceStats
} from '../../models/Attendance/Sales Person/Attendance.model';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toArr = <T>(arr: unknown): T[] => (Array.isArray(arr) ? arr : []);

const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const isValidDate = (dateStr: string): boolean =>
    !isNaN(new Date(dateStr).getTime());

/**
 * Safely calls getImageIfExist by coercing null | undefined → empty string.
 */
const safeImage = (folder: string, name: string | null | undefined): string | null =>
    getImageIfExist(folder, name ?? '');

// ─── Core Attendance Controllers ──────────────────────────────────────────────

export const addAttendance = async (req: Request, res: Response): Promise<Response> => {
    try {
        await uploadFile(req, res, 2, 'Start_KM_Pic');

        const fileName: string | undefined = req?.file?.filename;
        const filePath: string | undefined = req?.file?.path;

        const { UserId, Start_KM, Latitude, Longitude } = req.body as AddAttendanceInput;
        const db = req.companyDB;

        if (!db) {
            if (filePath) {
                await fileRemoverMiddleware(filePath);
            }
            return servError(new Error('Company database connection not found'), res);
        }

        if (!checkIsNumber(UserId)) {
            if (filePath) {
                await fileRemoverMiddleware(filePath);
            }
            return invalidInput(res, 'UserId is required');
        }

        const isSalesPerson: number = (await getUserType(Number(UserId))) == 6 ? 1 : 0;

        const result = await db.query(
            `INSERT INTO tbl_Attendance 
                (UserId, Start_Date, Start_KM, Latitude, Longitude, Start_KM_ImageName, Start_KM_ImagePath, IsSalesPerson, Active_Status)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    Number(UserId),
                    new Date(),
                    Start_KM ? Number(Start_KM) : null,
                    Latitude || null,
                    Longitude || null,
                    fileName || null,
                    filePath || null,
                    isSalesPerson,
                    1
                ],
                type: QueryTypes.INSERT
            }
        );

        if (result && result[1] > 0) {
            return success(res, 'Attendance Noted!');
        } else {
            return failed(res, 'Failed to Add Attendance');
        }
    } catch (e) {
        console.error('Error in addAttendance:', e);
        return servError(e, res);
    }
};

export const closeAttendance = async (req: Request, res: Response): Promise<Response> => {
    try {
        await uploadFile(req, res, 2, 'End_KM_Pic');

        const fileName: string | undefined = req?.file?.filename;
        const filePath: string | undefined = req?.file?.path;

        const { Id, End_KM, Description } = req.body as CloseAttendanceInput;
        const db = req.companyDB;

        if (!db) {
            if (filePath) {
                await fileRemoverMiddleware(filePath);
            }
            return servError(new Error('Company database connection not found'), res);
        }

        if (!checkIsNumber(Id)) {
            if (filePath) {
                await fileRemoverMiddleware(filePath);
            }
            return invalidInput(res, 'Id is required');
        }

        const result = await db.query(
            `UPDATE tbl_Attendance 
            SET
                End_Date = ?,
                End_KM = ?,
                End_KM_ImageName = ?,
                End_KM_ImagePath = ?,
                WorkSummary = ?,
                Active_Status = ?
            WHERE Id = ?`,
            {
                replacements: [
                    new Date(),
                    End_KM ? Number(End_KM) : null,
                    fileName || null,
                    filePath || null,
                    Description || null,
                    0,
                    Number(Id)
                ],
                type: QueryTypes.UPDATE
            }
        );

        if (result && result[1] > 0) {
            return success(res, 'Attendance Closed');
        } else {
            return failed(res, 'Failed to Close Attendance');
        }
    } catch (e) {
        console.error('Error in closeAttendance:', e);
        return servError(e, res);
    }
};

// ─── Query Controllers ────────────────────────────────────────────────────────

export const getAttendanceHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const db = req.companyDB;
        if (!db) return servError(new Error('Company database connection not found'), res);

        const { From, To } = req.query;

        // Build the base query
        let query = `
            SELECT
                a.Id,
                a.UserId,
                a.Start_Date,
                a.End_Date,
                a.Start_KM,
                a.End_KM,
                a.Latitude,
                a.Longitude,
                a.Start_KM_ImageName,
                a.End_KM_ImageName,
                a.Start_KM_ImagePath,
                a.End_KM_ImagePath,
                a.WorkSummary,
                a.IsSalesPerson,
                a.Active_Status,
                u.Name AS User_Name,
                u.BranchId AS Branch_Id
            FROM tbl_Attendance AS a
            LEFT JOIN tbl_Users AS u ON u.UserId = a.UserId
            WHERE 1=1
        `;

        const replacements: any[] = [];

        // Add date filters only if both From and To are provided
        if (From && To && isValidDate(From as string) && isValidDate(To as string)) {
            query += ` AND CAST(a.Start_Date AS DATE) >= CAST(? AS DATE)
                      AND CAST(a.Start_Date AS DATE) <= CAST(? AS DATE)`;
            replacements.push(From, To);
        }

        // Order by Start_Date descending to show latest first
        query += ` ORDER BY a.Start_Date DESC, a.UserId`;

        const result = await db.query(query, {
            replacements,
            type: QueryTypes.SELECT
        });

        if (result && result.length > 0) {
            const withImg: AttendanceRecord[] = (result as any[]).map((o: any) => ({
                ...o,
                Id: String(o.Id),
                startKmImageUrl: safeImage('attendance', o.Start_KM_ImageName),
                endKmImageUrl: safeImage('attendance', o.End_KM_ImageName),
            }));
            return dataFound(res, withImg);
        } else {
            return noData(res);
        }
    } catch (e) {
        console.error('Error in getAttendanceHistory:', e);
        return servError(e, res);
    }
};

export const getTodayAttendance = async (req: Request, res: Response): Promise<Response> => {
    try {
        const db = req.companyDB;
        if (!db) return servError(new Error('Company database connection not found'), res);

        const today = formatDateToString(new Date());
        
        const result = await db.query(
            `SELECT
                a.Id,
                a.UserId,
                a.Start_Date,
                a.End_Date,
                a.Start_KM,
                a.End_KM,
                a.Latitude,
                a.Longitude,
                a.Start_KM_ImageName,
                a.End_KM_ImageName,
                a.Start_KM_ImagePath,
                a.End_KM_ImagePath,
                a.WorkSummary,
                a.IsSalesPerson,
                a.Active_Status,
                u.Name AS User_Name,
                u.BranchId AS Branch_Id
            FROM tbl_Attendance AS a
            LEFT JOIN tbl_Users AS u ON u.UserId = a.UserId
            WHERE CAST(a.Start_Date AS DATE) = CAST(? AS DATE)
                AND a.Active_Status = 1
            ORDER BY a.Start_Date DESC`,
            {
                replacements: [today],
                type: QueryTypes.SELECT
            }
        );

        if (result && result.length > 0) {
            const withImg: AttendanceRecord[] = (result as any[]).map((o: any) => ({
                ...o,
                startKmImageUrl: safeImage('attendance', o.Start_KM_ImageName),
                endKmImageUrl: safeImage('attendance', o.End_KM_ImageName),
            }));
            return dataFound(res, withImg);
        } else {
            return noData(res);
        }
    } catch (e) {
        console.error('Error in getTodayAttendance:', e);
        return servError(e, res);
    }
};

export const getMyLastAttendance = async (req: Request, res: Response): Promise<Response> => {
    try {
        const db = req.companyDB;
        if (!db) return servError(new Error('Company database connection not found'), res);

        const { UserId } = req.query;

        if (!checkIsNumber(UserId)) {
            return invalidInput(res, 'UserId is required');
        }

        const result = await db.query(
            `SELECT TOP 1 
                Id,
                UserId,
                Start_Date,
                End_Date,
                Start_KM,
                End_KM,
                Latitude,
                Longitude,
                Start_KM_ImageName,
                End_KM_ImageName,
                Start_KM_ImagePath,
                End_KM_ImagePath,
                WorkSummary,
                IsSalesPerson,
                Active_Status
            FROM tbl_Attendance 
            WHERE UserId = ?
            ORDER BY Start_Date DESC`,
            {
                replacements: [Number(UserId)],
                type: QueryTypes.SELECT
            }
        );

        if (result && result.length > 0) {
            const withImg: AttendanceRecord[] = (result as any[]).map((o: any) => ({
                ...o,
                startKmImageUrl: safeImage('attendance', o.Start_KM_ImageName),
                endKmImageUrl: safeImage('attendance', o.End_KM_ImageName),
            }));
            return dataFound(res, withImg);
        } else {
            return noData(res);
        }
    } catch (e) {
        console.error('Error in getMyLastAttendance:', e);
        return servError(e, res);
    }
};

export const getAttendanceByDateRange = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return invalidInput(res, 'startDate and endDate are required');
        }

        if (!isValidDate(startDate as string) || !isValidDate(endDate as string)) {
            return invalidInput(res, 'Invalid date format. Use YYYY-MM-DD');
        }

        // Create a new request object with the correct query parameters
        const newReq: any = {
            ...req,
            query: {
                ...req.query,
                From: startDate,
                To: endDate
            }
        };
        
        return getAttendanceHistory(newReq as Request, res);
    } catch (e) {
        console.error('Error in getAttendanceByDateRange:', e);
        return servError(e, res);
    }
};

export const getMonthlyAttendance = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { year, month } = req.params;

        if (!year || !month) {
            return invalidInput(res, 'year and month are required');
        }

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);

        // Create a new request object with the correct query parameters
        const newReq: any = {
            ...req,
            query: {
                ...req.query,
                From: formatDateToString(startDate),
                To: formatDateToString(endDate)
            }
        };
        
        return getAttendanceHistory(newReq as Request, res);
    } catch (e) {
        console.error('Error in getMonthlyAttendance:', e);
        return servError(e, res);
    }
};

export const getEmployeeAttendanceSummary = async (req: Request, res: Response): Promise<Response> => {
    try {
        const db = req.companyDB;
        if (!db) return servError(new Error('Company database connection not found'), res);

        const { UserId, month, year } = req.query;

        if (!UserId) {
            return invalidInput(res, 'UserId is required');
        }

        const yearNum = year ? Number(year) : new Date().getFullYear();
        const monthNum = month ? Number(month) - 1 : new Date().getMonth();

        const startDate = new Date(yearNum, monthNum, 1);
        const endDate = new Date(yearNum, monthNum + 1, 0);

        const fromDateStr = formatDateToString(startDate);
        const toDateStr = formatDateToString(endDate);

        const result = await db.query(
            `SELECT 
                COUNT(*) AS totalDays,
                SUM(CASE WHEN Active_Status = 0 THEN 1 ELSE 0 END) AS closedDays,
                SUM(CASE WHEN Active_Status = 1 THEN 1 ELSE 0 END) AS openDays
            FROM tbl_Attendance
            WHERE UserId = ?
                AND CAST(Start_Date AS DATE) >= CAST(? AS DATE)
                AND CAST(Start_Date AS DATE) <= CAST(? AS DATE)`,
            {
                replacements: [Number(UserId), fromDateStr, toDateStr],
                type: QueryTypes.SELECT
            }
        );

        const record = result && result[0] ? (result as any[])[0] : null;
        
        const summary: AttendanceSummary = {
            userId: UserId as string,
            month: monthNum + 1,
            year: yearNum,
            totalDays: record?.totalDays || 0,
            closedDays: record?.closedDays || 0,
            openDays: record?.openDays || 0,
            completionRate: record?.totalDays > 0
                ? Number(((record.closedDays / record.totalDays) * 100).toFixed(2))
                : 0,
        };

        return dataFound(res, [summary]);
    } catch (e) {
        console.error('Error in getEmployeeAttendanceSummary:', e);
        return servError(e, res);
    }
};

export const getAttendanceStats = async (req: Request, res: Response): Promise<Response> => {
    try {
        const db = req.companyDB;
        if (!db) return servError(new Error('Company database connection not found'), res);

        const { FromDate, ToDate, UserTypeID } = req.query;

        if (!FromDate || !ToDate) {
            return invalidInput(res, 'FromDate and ToDate are required');
        }

        const isSalesPerson: boolean = UserTypeID ? Number(UserTypeID) === 6 : false;

        let query = `
            SELECT
                COUNT(DISTINCT UserId) AS totalEmployees,
                SUM(CASE WHEN Active_Status = 0 THEN 1 ELSE 0 END) AS totalClosed,
                SUM(CASE WHEN Active_Status = 1 THEN 1 ELSE 0 END) AS totalOpen,
                AVG(CASE WHEN Active_Status = 0 THEN 100 ELSE 0 END) AS completionRate
            FROM tbl_Attendance
            WHERE CAST(Start_Date AS DATE) >= CAST(? AS DATE)
                AND CAST(Start_Date AS DATE) <= CAST(? AS DATE)
        `;

        const replacements: any[] = [FromDate as string, ToDate as string];

        if (isSalesPerson) {
            query += ` AND IsSalesPerson = 1`;
        }

        const result = await db.query(query, {
            replacements,
            type: QueryTypes.SELECT
        });

        const stats: AttendanceStats = {
            totalEmployees: (result && result[0] ? (result as any[])[0]?.totalEmployees : 0) || 0,
            totalClosed: (result && result[0] ? (result as any[])[0]?.totalClosed : 0) || 0,
            totalOpen: (result && result[0] ? (result as any[])[0]?.totalOpen : 0) || 0,
            completionRate: Number(((result && result[0] ? (result as any[])[0]?.completionRate : 0) || 0).toFixed(2)),
        };

        return dataFound(res, [stats]);
    } catch (e) {
        console.error('Error in getAttendanceStats:', e);
        return servError(e, res);
    }
};

// ─── Department & Employee Controllers ─────────────────────────────────────────

export const getDepartment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const db = req.companyDB;
        if (!db) return servError(new Error('Company database connection not found'), res);

        const result = await db.query(
            `SELECT DISTINCT Department AS value, Department AS label
            FROM tbl_Employee_Master
            WHERE Department IS NOT NULL AND Department != ''
            ORDER BY Department`,
            {
                type: QueryTypes.SELECT
            }
        );

        const departments: DepartmentRow[] = (result as any[]).map((row: any) => ({
            value: row.value,
            label: row.label
        }));

        return departments.length > 0 ? dataFound(res, departments) : noData(res);
    } catch (e) {
        console.error('Error in getDepartment:', e);
        return servError(e, res);
    }
};

export const getEmployeesByDepartment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const db = req.companyDB;
        if (!db) return servError(new Error('Company database connection not found'), res);

        const { department } = req.body as { department?: string };

        if (!department) {
            return invalidInput(res, 'Department is required');
        }

        const result = await db.query(
            `SELECT Emp_Name AS label, Emp_Id AS value
            FROM tbl_Employee_Master
            WHERE Department = ?
            ORDER BY Emp_Name`,
            {
                replacements: [department],
                type: QueryTypes.SELECT
            }
        );

        const employees: EmployeeRow[] = (result as any[]).map((row: any) => ({
            label: row.label,
            value: row.value
        }));

        return employees.length > 0 ? dataFound(res, employees) : noData(res);
    } catch (e) {
        console.error('Error in getEmployeesByDepartment:', e);
        return servError(e, res);
    }
};

// ─── Advanced Analytics ────────────────────────────────────────────────────────

export const employeewise = async (req: Request, res: Response): Promise<Response> => {
    try {
        const db = req.companyDB;
        if (!db) return servError(new Error('Company database connection not found'), res);

        const FromDate: string = req.query?.FromDate
            ? ISOString(req.query.FromDate as string)
            : formatDateToString(new Date());
        const ToDate: string = req.query?.ToDate
            ? ISOString(req.query.ToDate as string)
            : formatDateToString(new Date());

        if (!FromDate || !ToDate) {
            return invalidInput(res, 'FromDate and ToDate are required');
        }

        const query = `
            WITH RankedLogs AS (
                SELECT 
                    em.User_Mgt_Id,          
                    u.Name AS username,
                    ISNULL(NULLIF(em.Department, ''), 'Unassigned') AS Department,
                    em.Sex,
                    pd.EmployeeCode,        
                    al.AttendanceDate AS LogDateTime,           
                    CAST(al.AttendanceDate AS DATE) AS LogDate
                FROM tbl_Employee_Master em
                LEFT JOIN tbl_Users u ON u.UserId = em.User_Mgt_Id
                LEFT JOIN etimetracklite1.dbo.Employees pd 
                    ON CAST(pd.EmployeeCode AS NVARCHAR(50)) = em.fingerPrintEmpId
                LEFT JOIN etimetracklite1.dbo.AttendanceLogs al 
                    ON al.EmployeeId = pd.EmployeeId 
                WHERE CAST(al.AttendanceDate AS DATE) BETWEEN ? AND ?
                    AND CAST(al.PunchRecords AS NVARCHAR(MAX)) IS NOT NULL  
                    AND LTRIM(RTRIM(CAST(al.PunchRecords AS NVARCHAR(MAX)))) <> ''
            ),
            EmployeeCounts AS (
                SELECT
                    SUM(CASE WHEN Sex = 'Male' THEN 1 ELSE 0 END) AS TotalMaleEmployees,
                    SUM(CASE WHEN Sex = 'Female' THEN 1 ELSE 0 END) AS TotalFemaleEmployees,
                    COUNT(*) AS TotalEmployees
                FROM tbl_Employee_Master
            ),
            PresentCounts AS (
                SELECT
                    COUNT(DISTINCT ISNULL(NULLIF(Department, ''), 'Unassigned')) AS TotalDepartmentsPresentToday,
                    SUM(CASE WHEN Sex = 'Male' THEN 1 ELSE 0 END) AS TotalMalePresentToday,
                    SUM(CASE WHEN Sex = 'Female' THEN 1 ELSE 0 END) AS TotalFemalePresentToday,
                    COUNT(DISTINCT User_Mgt_Id) AS TotalPresentToday
                FROM RankedLogs
            ),
            TotalDepartmentList AS (
                SELECT COUNT(DISTINCT ISNULL(NULLIF(Department, ''), 'Unassigned')) AS TotalDepartments
                FROM tbl_Employee_Master
            ),
            DepartmentDetails AS (
                SELECT
                    ISNULL(NULLIF(Department, ''), 'Unassigned') AS Department,
                    SUM(CASE WHEN Sex = 'Male' THEN 1 ELSE 0 END) AS TotalMaleEmployees,
                    SUM(CASE WHEN Sex = 'Female' THEN 1 ELSE 0 END) AS TotalFemaleEmployees,
                    COUNT(*) AS TotalEmployees
                FROM tbl_Employee_Master
                GROUP BY ISNULL(NULLIF(Department, ''), 'Unassigned')
            ),
            DepartmentPresentCounts AS (
                SELECT
                    ISNULL(NULLIF(Department, ''), 'Unassigned') AS Department,
                    SUM(CASE WHEN Sex = 'Male' THEN 1 ELSE 0 END) AS TotalMalePresentToday,
                    SUM(CASE WHEN Sex = 'Female' THEN 1 ELSE 0 END) AS TotalFemalePresentToday,
                    COUNT(DISTINCT User_Mgt_Id) AS TotalPresentToday
                FROM RankedLogs
                GROUP BY ISNULL(NULLIF(Department, ''), 'Unassigned')
            ),
            DepartmentEmployeeDetails AS (
                SELECT
                    ISNULL(NULLIF(Department, ''), 'Unassigned') AS Department,
                    (
                        SELECT 
                            em_inner.Emp_Name,
                            em_inner.Sex,
                            em_inner.Designation
                        FROM tbl_Employee_Master em_inner
                        WHERE ISNULL(NULLIF(em_inner.Department, ''), 'Unassigned') = ISNULL(NULLIF(em.Department, ''), 'Unassigned')
                        FOR JSON PATH
                    ) AS Employees
                FROM tbl_Employee_Master em
                GROUP BY ISNULL(NULLIF(Department, ''), 'Unassigned')
            ),
            DepartmentWiseStats AS (
                SELECT
                    dd.Department,
                    dd.TotalMaleEmployees,
                    dd.TotalFemaleEmployees,
                    dd.TotalEmployees,
                    ISNULL(dpc.TotalMalePresentToday, 0) AS TotalMalePresentToday,
                    ISNULL(dpc.TotalFemalePresentToday, 0) AS TotalFemalePresentToday,
                    ISNULL(dpc.TotalPresentToday, 0) AS TotalPresentToday,
                    ded.Employees
                FROM DepartmentDetails dd
                LEFT JOIN DepartmentPresentCounts dpc ON dd.Department = dpc.Department
                LEFT JOIN DepartmentEmployeeDetails ded ON dd.Department = ded.Department
            )
            SELECT
                ec.TotalMaleEmployees,
                ec.TotalFemaleEmployees,
                ec.TotalEmployees,
                td.TotalDepartments,
                pc.TotalDepartmentsPresentToday,
                pc.TotalMalePresentToday,
                pc.TotalFemalePresentToday,
                pc.TotalPresentToday,
                (
                    SELECT 
                        dws.Department,
                        dws.TotalMaleEmployees,
                        dws.TotalFemaleEmployees,
                        dws.TotalEmployees,
                        dws.TotalMalePresentToday,
                        dws.TotalFemalePresentToday,
                        dws.TotalPresentToday,
                        dws.Employees
                    FROM DepartmentWiseStats dws
                    FOR JSON PATH
                ) AS DepartmentWiseCounts
            FROM EmployeeCounts ec
            CROSS JOIN PresentCounts pc
            CROSS JOIN TotalDepartmentList td;
        `;

        const result = await db.query(query, {
            replacements: [FromDate, ToDate],
            type: QueryTypes.SELECT
        });

        if (result && result.length > 0) {
            const parsedData: EmployeewiseStatsRow[] = (result as any[]).map((row: any) => ({
                ...row,
                DepartmentWiseCounts: row.DepartmentWiseCounts ? JSON.parse(row.DepartmentWiseCounts) : []
            }));
            return dataFound(res, parsedData);
        } else {
            return noData(res);
        }
    } catch (e) {
        console.error('Error in employeewise:', e);
        return servError(e, res);
    }
};

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
    addAttendance,
    closeAttendance,
    getAttendanceHistory,
    getTodayAttendance,
    getMyLastAttendance,
    getAttendanceByDateRange,
    getMonthlyAttendance,
    getEmployeeAttendanceSummary,
    getAttendanceStats,
    getDepartment,
    getEmployeesByDepartment,
    employeewise,
};