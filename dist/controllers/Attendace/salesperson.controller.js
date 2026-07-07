"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeewise = exports.getEmployeesByDepartment = exports.getDepartment = exports.getAttendanceStats = exports.getEmployeeAttendanceSummary = exports.getMonthlyAttendance = exports.getAttendanceByDateRange = exports.getMyLastAttendance = exports.getTodayAttendance = exports.getAttendanceHistory = exports.closeAttendance = exports.addAttendance = void 0;
const sequelize_1 = require("sequelize");
const responseObject_1 = require("../../responseObject");
const helper_functions_1 = require("../../helper_functions");
const miniAPIs_1 = require("../../middleware/miniAPIs");
const uploadMiddleware_1 = __importDefault(require("../../middleware/uploadMiddleware"));
const getImageIfExist_1 = __importDefault(require("../../middleware/getImageIfExist"));
const unSyncFile_1 = __importDefault(require("../../middleware/unSyncFile"));
// ─── Helpers ──────────────────────────────────────────────────────────────────
const toArr = (arr) => (Array.isArray(arr) ? arr : []);
const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const isValidDate = (dateStr) => !isNaN(new Date(dateStr).getTime());
/**
 * Safely calls getImageIfExist by coercing null | undefined → empty string.
 */
const safeImage = (folder, name) => (0, getImageIfExist_1.default)(folder, name ?? '');
// ─── Core Attendance Controllers ──────────────────────────────────────────────
const addAttendance = async (req, res) => {
    try {
        await (0, uploadMiddleware_1.default)(req, res, 2, 'Start_KM_Pic');
        const fileName = req?.file?.filename;
        const filePath = req?.file?.path;
        const { UserId, Start_KM, Latitude, Longitude } = req.body;
        const db = req.companyDB;
        if (!db) {
            if (filePath) {
                await (0, unSyncFile_1.default)(filePath);
            }
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        }
        if (!(0, helper_functions_1.checkIsNumber)(UserId)) {
            if (filePath) {
                await (0, unSyncFile_1.default)(filePath);
            }
            return (0, responseObject_1.invalidInput)(res, 'UserId is required');
        }
        const isSalesPerson = (await (0, miniAPIs_1.getUserType)(Number(UserId))) == 6 ? 1 : 0;
        const result = await db.query(`INSERT INTO tbl_Attendance 
                (UserId, Start_Date, Start_KM, Latitude, Longitude, Start_KM_ImageName, Start_KM_ImagePath, IsSalesPerson, Active_Status)
            VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?)`, {
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
            type: sequelize_1.QueryTypes.INSERT
        });
        if (result && result[1] > 0) {
            return (0, responseObject_1.success)(res, 'Attendance Noted!');
        }
        else {
            return (0, responseObject_1.failed)(res, 'Failed to Add Attendance');
        }
    }
    catch (e) {
        console.error('Error in addAttendance:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.addAttendance = addAttendance;
const closeAttendance = async (req, res) => {
    try {
        await (0, uploadMiddleware_1.default)(req, res, 2, 'End_KM_Pic');
        const fileName = req?.file?.filename;
        const filePath = req?.file?.path;
        const { Id, End_KM, Description } = req.body;
        const db = req.companyDB;
        if (!db) {
            if (filePath) {
                await (0, unSyncFile_1.default)(filePath);
            }
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        }
        if (!(0, helper_functions_1.checkIsNumber)(Id)) {
            if (filePath) {
                await (0, unSyncFile_1.default)(filePath);
            }
            return (0, responseObject_1.invalidInput)(res, 'Id is required');
        }
        const result = await db.query(`UPDATE tbl_Attendance 
            SET
                End_Date = ?,
                End_KM = ?,
                End_KM_ImageName = ?,
                End_KM_ImagePath = ?,
                WorkSummary = ?,
                Active_Status = ?
            WHERE Id = ?`, {
            replacements: [
                new Date(),
                End_KM ? Number(End_KM) : null,
                fileName || null,
                filePath || null,
                Description || null,
                0,
                Number(Id)
            ],
            type: sequelize_1.QueryTypes.UPDATE
        });
        if (result && result[1] > 0) {
            return (0, responseObject_1.success)(res, 'Attendance Closed');
        }
        else {
            return (0, responseObject_1.failed)(res, 'Failed to Close Attendance');
        }
    }
    catch (e) {
        console.error('Error in closeAttendance:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.closeAttendance = closeAttendance;
// ─── Query Controllers ────────────────────────────────────────────────────────
const getAttendanceHistory = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
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
        const replacements = [];
        // Add date filters only if both From and To are provided
        if (From && To && isValidDate(From) && isValidDate(To)) {
            query += ` AND a.Start_Date >= CAST(? AS DATETIME)
                      AND a.Start_Date < DATEADD(day, 1, CAST(? AS DATETIME))`;
            replacements.push(From, To);
        }
        // Order by Start_Date descending to show latest first
        query += ` ORDER BY a.Start_Date DESC, a.UserId`;
        const result = await db.query(query, {
            replacements,
            type: sequelize_1.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            const withImg = result.map((o) => ({
                ...o,
                Id: String(o.Id),
                startKmImageUrl: safeImage('attendance', o.Start_KM_ImageName),
                endKmImageUrl: safeImage('attendance', o.End_KM_ImageName),
            }));
            return (0, responseObject_1.dataFound)(res, withImg);
        }
        else {
            return (0, responseObject_1.noData)(res);
        }
    }
    catch (e) {
        console.error('Error in getAttendanceHistory:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getAttendanceHistory = getAttendanceHistory;
const getTodayAttendance = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const today = formatDateToString(new Date());
        const result = await db.query(`SELECT
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
            WHERE a.Start_Date >= CAST(? AS DATETIME)
                AND a.Start_Date < DATEADD(day, 1, CAST(? AS DATETIME))
                AND a.Active_Status = 1
            ORDER BY a.Start_Date DESC`, {
            replacements: [today],
            type: sequelize_1.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            const withImg = result.map((o) => ({
                ...o,
                startKmImageUrl: safeImage('attendance', o.Start_KM_ImageName),
                endKmImageUrl: safeImage('attendance', o.End_KM_ImageName),
            }));
            return (0, responseObject_1.dataFound)(res, withImg);
        }
        else {
            return (0, responseObject_1.noData)(res);
        }
    }
    catch (e) {
        console.error('Error in getTodayAttendance:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getTodayAttendance = getTodayAttendance;
const getMyLastAttendance = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { UserId } = req.query;
        if (!(0, helper_functions_1.checkIsNumber)(UserId)) {
            return (0, responseObject_1.invalidInput)(res, 'UserId is required');
        }
        const result = await db.query(`SELECT TOP 1 
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
            ORDER BY Start_Date DESC`, {
            replacements: [Number(UserId)],
            type: sequelize_1.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            const withImg = result.map((o) => ({
                ...o,
                startKmImageUrl: safeImage('attendance', o.Start_KM_ImageName),
                endKmImageUrl: safeImage('attendance', o.End_KM_ImageName),
            }));
            return (0, responseObject_1.dataFound)(res, withImg);
        }
        else {
            return (0, responseObject_1.noData)(res);
        }
    }
    catch (e) {
        console.error('Error in getMyLastAttendance:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getMyLastAttendance = getMyLastAttendance;
const getAttendanceByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return (0, responseObject_1.invalidInput)(res, 'startDate and endDate are required');
        }
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return (0, responseObject_1.invalidInput)(res, 'Invalid date format. Use YYYY-MM-DD');
        }
        // Create a new request object with the correct query parameters
        const newReq = {
            ...req,
            query: {
                ...req.query,
                From: startDate,
                To: endDate
            }
        };
        return (0, exports.getAttendanceHistory)(newReq, res);
    }
    catch (e) {
        console.error('Error in getAttendanceByDateRange:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getAttendanceByDateRange = getAttendanceByDateRange;
const getMonthlyAttendance = async (req, res) => {
    try {
        const { year, month } = req.params;
        if (!year || !month) {
            return (0, responseObject_1.invalidInput)(res, 'year and month are required');
        }
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);
        // Create a new request object with the correct query parameters
        const newReq = {
            ...req,
            query: {
                ...req.query,
                From: formatDateToString(startDate),
                To: formatDateToString(endDate)
            }
        };
        return (0, exports.getAttendanceHistory)(newReq, res);
    }
    catch (e) {
        console.error('Error in getMonthlyAttendance:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getMonthlyAttendance = getMonthlyAttendance;
const getEmployeeAttendanceSummary = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { UserId, month, year } = req.query;
        if (!UserId) {
            return (0, responseObject_1.invalidInput)(res, 'UserId is required');
        }
        const yearNum = year ? Number(year) : new Date().getFullYear();
        const monthNum = month ? Number(month) - 1 : new Date().getMonth();
        const startDate = new Date(yearNum, monthNum, 1);
        const endDate = new Date(yearNum, monthNum + 1, 0);
        const fromDateStr = formatDateToString(startDate);
        const toDateStr = formatDateToString(endDate);
        const result = await db.query(`SELECT 
                COUNT(*) AS totalDays,
                SUM(CASE WHEN Active_Status = 0 THEN 1 ELSE 0 END) AS closedDays,
                SUM(CASE WHEN Active_Status = 1 THEN 1 ELSE 0 END) AS openDays
            FROM tbl_Attendance
            WHERE UserId = ?
                AND Start_Date >= CAST(? AS DATETIME)
                AND Start_Date < DATEADD(day, 1, CAST(? AS DATETIME))`, {
            replacements: [Number(UserId), fromDateStr, toDateStr],
            type: sequelize_1.QueryTypes.SELECT
        });
        const record = result && result[0] ? result[0] : null;
        const summary = {
            userId: UserId,
            month: monthNum + 1,
            year: yearNum,
            totalDays: record?.totalDays || 0,
            closedDays: record?.closedDays || 0,
            openDays: record?.openDays || 0,
            completionRate: record?.totalDays > 0
                ? Number(((record.closedDays / record.totalDays) * 100).toFixed(2))
                : 0,
        };
        return (0, responseObject_1.dataFound)(res, [summary]);
    }
    catch (e) {
        console.error('Error in getEmployeeAttendanceSummary:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getEmployeeAttendanceSummary = getEmployeeAttendanceSummary;
const getAttendanceStats = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { FromDate, ToDate, UserTypeID } = req.query;
        if (!FromDate || !ToDate) {
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
        }
        const isSalesPerson = UserTypeID ? Number(UserTypeID) === 6 : false;
        let query = `
            SELECT
                COUNT(DISTINCT UserId) AS totalEmployees,
                SUM(CASE WHEN Active_Status = 0 THEN 1 ELSE 0 END) AS totalClosed,
                SUM(CASE WHEN Active_Status = 1 THEN 1 ELSE 0 END) AS totalOpen,
                AVG(CASE WHEN Active_Status = 0 THEN 100 ELSE 0 END) AS completionRate
            FROM tbl_Attendance
            WHERE Start_Date >= CAST(? AS DATETIME)
                AND Start_Date < DATEADD(day, 1, CAST(? AS DATETIME))
        `;
        const replacements = [FromDate, ToDate];
        if (isSalesPerson) {
            query += ` AND IsSalesPerson = 1`;
        }
        const result = await db.query(query, {
            replacements,
            type: sequelize_1.QueryTypes.SELECT
        });
        const stats = {
            totalEmployees: (result && result[0] ? result[0]?.totalEmployees : 0) || 0,
            totalClosed: (result && result[0] ? result[0]?.totalClosed : 0) || 0,
            totalOpen: (result && result[0] ? result[0]?.totalOpen : 0) || 0,
            completionRate: Number(((result && result[0] ? result[0]?.completionRate : 0) || 0).toFixed(2)),
        };
        return (0, responseObject_1.dataFound)(res, [stats]);
    }
    catch (e) {
        console.error('Error in getAttendanceStats:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getAttendanceStats = getAttendanceStats;
// ─── Department & Employee Controllers ─────────────────────────────────────────
const getDepartment = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const result = await db.query(`SELECT DISTINCT Department AS value, Department AS label
            FROM tbl_Employee_Master
            WHERE Department IS NOT NULL AND Department != ''
            ORDER BY Department`, {
            type: sequelize_1.QueryTypes.SELECT
        });
        const departments = result.map((row) => ({
            value: row.value,
            label: row.label
        }));
        return departments.length > 0 ? (0, responseObject_1.dataFound)(res, departments) : (0, responseObject_1.noData)(res);
    }
    catch (e) {
        console.error('Error in getDepartment:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getDepartment = getDepartment;
const getEmployeesByDepartment = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { department } = req.body;
        if (!department) {
            return (0, responseObject_1.invalidInput)(res, 'Department is required');
        }
        const result = await db.query(`SELECT Emp_Name AS label, Emp_Id AS value
            FROM tbl_Employee_Master
            WHERE Department = ?
            ORDER BY Emp_Name`, {
            replacements: [department],
            type: sequelize_1.QueryTypes.SELECT
        });
        const employees = result.map((row) => ({
            label: row.label,
            value: row.value
        }));
        return employees.length > 0 ? (0, responseObject_1.dataFound)(res, employees) : (0, responseObject_1.noData)(res);
    }
    catch (e) {
        console.error('Error in getEmployeesByDepartment:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.getEmployeesByDepartment = getEmployeesByDepartment;
// ─── Advanced Analytics ────────────────────────────────────────────────────────
const employeewise = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const FromDate = req.query?.FromDate
            ? (0, helper_functions_1.ISOString)(req.query.FromDate)
            : formatDateToString(new Date());
        const ToDate = req.query?.ToDate
            ? (0, helper_functions_1.ISOString)(req.query.ToDate)
            : formatDateToString(new Date());
        if (!FromDate || !ToDate) {
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
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
                WHERE al.AttendanceDate >= CAST(? AS DATETIME) 
                    AND al.AttendanceDate < DATEADD(day, 1, CAST(? AS DATETIME))
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
            type: sequelize_1.QueryTypes.SELECT
        });
        if (result && result.length > 0) {
            const parsedData = result.map((row) => ({
                ...row,
                DepartmentWiseCounts: row.DepartmentWiseCounts ? JSON.parse(row.DepartmentWiseCounts) : []
            }));
            return (0, responseObject_1.dataFound)(res, parsedData);
        }
        else {
            return (0, responseObject_1.noData)(res);
        }
    }
    catch (e) {
        console.error('Error in employeewise:', e);
        return (0, responseObject_1.servError)(e, res);
    }
};
exports.employeewise = employeewise;
// ─── Default Export ───────────────────────────────────────────────────────────
exports.default = {
    addAttendance: exports.addAttendance,
    closeAttendance: exports.closeAttendance,
    getAttendanceHistory: exports.getAttendanceHistory,
    getTodayAttendance: exports.getTodayAttendance,
    getMyLastAttendance: exports.getMyLastAttendance,
    getAttendanceByDateRange: exports.getAttendanceByDateRange,
    getMonthlyAttendance: exports.getMonthlyAttendance,
    getEmployeeAttendanceSummary: exports.getEmployeeAttendanceSummary,
    getAttendanceStats: exports.getAttendanceStats,
    getDepartment: exports.getDepartment,
    getEmployeesByDepartment: exports.getEmployeesByDepartment,
    employeewise: exports.employeewise,
};
