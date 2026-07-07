"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceSync = exports.getDefaultLeaveById = exports.getDefaultLeavesByDateRange = exports.getAllDefaultLeaves = exports.getAttendanceStats = exports.getPresentEmployees = exports.getAbsentEmployees = exports.getMonthlyAttendance = exports.getAttendanceByDateRange = exports.getDeviceAttendance = exports.getEmployeeAttendance = exports.getEmployeeAttendanceSummary = exports.getTodayAttendance = exports.getFingerprintAttendance = void 0;
const sequelize_1 = require("sequelize");
const responseObject_1 = require("../../responseObject");
// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const isValidDate = (dateStr) => !isNaN(new Date(dateStr).getTime());
// ─── Public controllers ───────────────────────────────────────────────────────
const getFingerprintAttendance = async (req, res) => {
    try {
        const { FromDate, ToDate, FingerPrintId, EmpId } = req.query;
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        if (!FromDate || !ToDate)
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
        if (!isValidDate(FromDate) || !isValidDate(ToDate))
            return (0, responseObject_1.invalidInput)(res, 'Invalid date format. Use YYYY-MM-DD');
        const toDateObj = new Date(ToDate);
        const adjustedToDate = new Date(toDateObj);
        adjustedToDate.setDate(adjustedToDate.getDate() + 1);
        const adjustedToDateStr = adjustedToDate.toISOString();
        let result;
        if (EmpId && EmpId !== '0' && EmpId !== 'ALL') {
            result = await getSingleEmployeeAttendance(db, FromDate, adjustedToDateStr, EmpId);
        }
        else {
            result = await getMultipleEmployeesAttendance(db, FromDate, adjustedToDateStr, FingerPrintId);
        }
        return result.length > 0 ? (0, responseObject_1.dataFound)(res, result) : (0, responseObject_1.noData)(res);
    }
    catch (error) {
        console.error('Error in getFingerprintAttendance:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getFingerprintAttendance = getFingerprintAttendance;
const getTodayAttendance = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const today = formatDateToString(new Date());
        const tomorrow = formatDateToString(new Date(new Date().setDate(new Date().getDate() + 1)));
        const records = await getMultipleEmployeesAttendance(db, today, tomorrow);
        return (0, responseObject_1.dataFound)(res, records);
    }
    catch (error) {
        console.error('Error in getTodayAttendance:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getTodayAttendance = getTodayAttendance;
const getEmployeeAttendanceSummary = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { EmpId, month, year } = req.query;
        if (!EmpId)
            return (0, responseObject_1.invalidInput)(res, 'EmpId is required');
        const yearNum = year ? Number(year) : new Date().getFullYear();
        const monthNum = month ? Number(month) - 1 : new Date().getMonth();
        const startDate = new Date(yearNum, monthNum, 1);
        const endDate = new Date(yearNum, monthNum + 1, 0);
        const fromDateStr = formatDateToString(startDate);
        const toDateStr = new Date(endDate.setDate(endDate.getDate() + 1)).toISOString();
        const records = await getSingleEmployeeAttendance(db, fromDateStr, toDateStr, EmpId);
        const summary = {
            employeeId: EmpId,
            month: monthNum + 1,
            year: yearNum,
            totalDays: records.length,
            presentDays: records.filter(r => r.AttendanceStatus === 'P').length,
            absentDays: records.filter(r => r.AttendanceStatus === 'A').length,
            leaveDays: records.filter(r => r.AttendanceStatus === 'L').length,
            holidayDays: records.filter(r => r.AttendanceStatus === 'H').length,
            defaultLeaveDays: records.filter(r => r.AttendanceStatus === 'DL').length,
            attendancePercentage: records.length > 0
                ? Number(((records.filter(r => r.AttendanceStatus === 'P').length / records.length) * 100).toFixed(2))
                : 0,
        };
        return (0, responseObject_1.dataFound)(res, [summary]);
    }
    catch (error) {
        console.error('Error in getEmployeeAttendanceSummary:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getEmployeeAttendanceSummary = getEmployeeAttendanceSummary;
const getEmployeeAttendance = async (req, res) => {
    try {
        const { empId } = req.params;
        const { FromDate, ToDate } = req.query;
        if (!FromDate || !ToDate)
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
        req.query.EmpId = empId;
        return (0, exports.getFingerprintAttendance)(req, res);
    }
    catch (error) {
        console.error('Error in getEmployeeAttendance:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getEmployeeAttendance = getEmployeeAttendance;
const getDeviceAttendance = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { FromDate, ToDate } = req.query;
        if (!FromDate || !ToDate)
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
        req.query.FingerPrintId = deviceId;
        return (0, exports.getFingerprintAttendance)(req, res);
    }
    catch (error) {
        console.error('Error in getDeviceAttendance:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getDeviceAttendance = getDeviceAttendance;
const getAttendanceByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate)
            return (0, responseObject_1.invalidInput)(res, 'startDate and endDate are required');
        req.query.FromDate = startDate;
        req.query.ToDate = endDate;
        return (0, exports.getFingerprintAttendance)(req, res);
    }
    catch (error) {
        console.error('Error in getAttendanceByDateRange:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getAttendanceByDateRange = getAttendanceByDateRange;
const getMonthlyAttendance = async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);
        req.query.FromDate = formatDateToString(startDate);
        req.query.ToDate = formatDateToString(endDate);
        return (0, exports.getFingerprintAttendance)(req, res);
    }
    catch (error) {
        console.error('Error in getMonthlyAttendance:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getMonthlyAttendance = getMonthlyAttendance;
const getAbsentEmployees = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { FromDate, ToDate } = req.query;
        if (!FromDate || !ToDate)
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
        const adjustedTo = new Date(new Date(ToDate).setDate(new Date(ToDate).getDate() + 1)).toISOString();
        const records = await getMultipleEmployeesAttendance(db, FromDate, adjustedTo);
        return (0, responseObject_1.dataFound)(res, records.filter(r => r.AttendanceStatus === 'A'));
    }
    catch (error) {
        console.error('Error in getAbsentEmployees:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getAbsentEmployees = getAbsentEmployees;
const getPresentEmployees = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { FromDate, ToDate } = req.query;
        if (!FromDate || !ToDate)
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
        const adjustedTo = new Date(new Date(ToDate).setDate(new Date(ToDate).getDate() + 1)).toISOString();
        const records = await getMultipleEmployeesAttendance(db, FromDate, adjustedTo);
        return (0, responseObject_1.dataFound)(res, records.filter(r => r.AttendanceStatus === 'P'));
    }
    catch (error) {
        console.error('Error in getPresentEmployees:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getPresentEmployees = getPresentEmployees;
const getAttendanceStats = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { FromDate, ToDate } = req.query;
        if (!FromDate || !ToDate)
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
        const adjustedTo = new Date(new Date(ToDate).setDate(new Date(ToDate).getDate() + 1)).toISOString();
        const records = await getMultipleEmployeesAttendance(db, FromDate, adjustedTo);
        const uniqueEmployees = [...new Set(records.map(r => r.fingerPrintEmpId))].length;
        const presentCount = records.filter(r => r.AttendanceStatus === 'P').length;
        const absentCount = records.filter(r => r.AttendanceStatus === 'A').length;
        const leaveCount = records.filter(r => r.AttendanceStatus === 'L').length;
        return (0, responseObject_1.dataFound)(res, [{
                totalEmployees: uniqueEmployees,
                totalPresent: presentCount,
                totalAbsent: absentCount,
                totalLeave: leaveCount,
                attendanceRate: records.length > 0
                    ? Number(((presentCount / records.length) * 100).toFixed(2))
                    : 0,
            }]);
    }
    catch (error) {
        console.error('Error in getAttendanceStats:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getAttendanceStats = getAttendanceStats;
// ─── Default Leave controllers ────────────────────────────────────────────────
const getAllDefaultLeaves = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const records = await db.query(`SELECT SNo, Date, Description, Created_By, Created_At, Modified_By, Modified_At
             FROM tbl_Default_Leave
             ORDER BY Date DESC, SNo DESC`, { type: sequelize_1.QueryTypes.SELECT });
        return records.length > 0 ? (0, responseObject_1.dataFound)(res, records) : (0, responseObject_1.noData)(res);
    }
    catch (error) {
        console.error('Error in getAllDefaultLeaves:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getAllDefaultLeaves = getAllDefaultLeaves;
const getDefaultLeavesByDateRange = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { FromDate, ToDate } = req.query;
        if (!FromDate || !ToDate)
            return (0, responseObject_1.invalidInput)(res, 'FromDate and ToDate are required');
        if (!isValidDate(FromDate) || !isValidDate(ToDate))
            return (0, responseObject_1.invalidInput)(res, 'Invalid date format. Use YYYY-MM-DD');
        const records = await db.query(`SELECT SNo, Date, Description, Created_By, Created_At, Modified_By, Modified_At
             FROM tbl_Default_Leave
             WHERE Date >= :FromDate AND Date <= :ToDate
             ORDER BY Date DESC, SNo DESC`, {
            replacements: { FromDate, ToDate },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return records.length > 0 ? (0, responseObject_1.dataFound)(res, records) : (0, responseObject_1.noData)(res);
    }
    catch (error) {
        console.error('Error in getDefaultLeavesByDateRange:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getDefaultLeavesByDateRange = getDefaultLeavesByDateRange;
const getDefaultLeaveById = async (req, res) => {
    try {
        const db = req.companyDB;
        if (!db)
            return (0, responseObject_1.servError)(new Error('Company database connection not found'), res);
        const { id } = req.params;
        if (!id)
            return (0, responseObject_1.invalidInput)(res, 'ID is required');
        const records = await db.query(`SELECT SNo, Date, Description, Created_By, Created_At, Modified_By, Modified_At
             FROM tbl_Default_Leave
             WHERE SNo = :Id`, {
            replacements: { Id: id },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return records.length > 0 ? (0, responseObject_1.dataFound)(res, [records[0]]) : (0, responseObject_1.noData)(res);
    }
    catch (error) {
        console.error('Error in getDefaultLeaveById:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getDefaultLeaveById = getDefaultLeaveById;
// ─── Private helpers ──────────────────────────────────────────────────────────
const getSingleEmployeeAttendance = async (db, FromDate, ToDate, EmpId) => {
    const query = `
        WITH RankedLogs AS (
            SELECT
                em.User_Mgt_Id,
                COALESCE(u.Name, '') AS username,
                u.isActive,
                em.fingerPrintEmpId,
                em.Sex AS Sex,
                al.AttendanceDate AS LogDateTime,
                CAST(al.AttendanceDate AS DATE) AS LogDate,
                ROW_NUMBER() OVER (
                    PARTITION BY em.User_Mgt_Id, CAST(al.AttendanceDate AS DATE)
                    ORDER BY al.AttendanceDate
                ) AS rn,
                COUNT(*) OVER (
                    PARTITION BY em.User_Mgt_Id, CAST(al.AttendanceDate AS DATE)
                ) AS record_count
            FROM tbl_Employee_Master em
            LEFT JOIN tbl_Users u
                ON u.id = em.User_Mgt_Id
            LEFT JOIN etimetracklite1.dbo.Employees pd
                ON CAST(pd.EmployeeCode AS NVARCHAR(50)) = em.fingerPrintEmpId
            LEFT JOIN etimetracklite1.dbo.AttendanceLogs al
                ON al.EmployeeId = pd.EmployeeId
            WHERE
                COALESCE(u.isActive, 0) != 1
                AND al.status != 'Resigned'
                AND al.AttendanceDate >= CAST(:FromDate AS DATETIME)
                AND al.AttendanceDate < CAST(:ToDate AS DATETIME)
                AND em.User_Mgt_Id = :EmpCode
        ),
        DefaultLeaves AS (
            SELECT CAST(Date AS DATE) AS DefaultLeaveDate
            FROM tbl_Default_Leave
            WHERE Date >= CAST(:FromDate AS DATE)
              AND Date <  CAST(:ToDate   AS DATE)
        ),
        PunchDetails AS (
            SELECT
                em.User_Mgt_Id,
                CAST(al.AttendanceDate AS DATE) AS LogDate,
                COALESCE(
                    STRING_AGG(SUBSTRING(al.PunchRecords, 1, 5000), ', '),
                    '[]'
                ) AS PunchDateTimes
            FROM tbl_Employee_Master em
            LEFT JOIN etimetracklite1.dbo.Employees pd
                ON CAST(pd.EmployeeCode AS NVARCHAR(50)) = em.fingerPrintEmpId
            LEFT JOIN etimetracklite1.dbo.AttendanceLogs al
                ON al.EmployeeId = pd.EmployeeId
            WHERE
                al.status != 'Resigned'
                AND ISNULL(CAST(al.PunchRecords AS NVARCHAR(MAX)), '') <> ''
                AND al.AttendanceDate >= CAST(:FromDate AS DATETIME)
                AND al.AttendanceDate < CAST(:ToDate AS DATETIME)
                AND em.User_Mgt_Id = :EmpCode
            GROUP BY em.User_Mgt_Id, CAST(al.AttendanceDate AS DATE)
        ),
        LeaveDays AS (
            SELECT
                lm.User_Id,
                DATEADD(DAY, n.number, CAST(lm.FromDate AS DATE)) AS LeaveDate
            FROM tbl_Leave_Master lm
            CROSS JOIN (
                SELECT number FROM master.dbo.spt_values
                WHERE type = 'P' AND number BETWEEN 0 AND 1000
            ) n
            WHERE
                lm.Status = 'Approved'
                AND DATEADD(DAY, n.number, CAST(lm.FromDate AS DATE)) <= CAST(lm.ToDate AS DATE)
        )
        SELECT
            e.User_Mgt_Id                       AS fingerPrintEmpId,
            COALESCE(d.Designation, 'NOT FOUND') AS Designation_Name,
            COALESCE(rl.username, '')            AS username,
            rl.Sex                               AS Sex,
            rl.LogDate,
            COALESCE(ag.PunchDateTimes, '[]')    AS AttendanceDetails,
            COALESCE(MAX(rl.record_count), 0)    AS TotalRecords,
            CASE
                WHEN DATEPART(WEEKDAY, rl.LogDate) = 1 THEN 'H'
                WHEN EXISTS (
                    SELECT 1 FROM LeaveDays ld
                    WHERE ld.User_Id = e.User_Mgt_Id AND ld.LeaveDate = rl.LogDate
                ) THEN 'L'
                WHEN EXISTS (
                    SELECT 1 FROM DefaultLeaves dl
                    WHERE dl.DefaultLeaveDate = rl.LogDate
                ) THEN 'DL'
                WHEN COALESCE(ag.PunchDateTimes, '') <> '' THEN 'P'
                ELSE 'A'
            END AS AttendanceStatus
        FROM tbl_Employee_Master e
        LEFT JOIN tbl_Employee_Designation d  ON e.Designation    = d.Designation_Id
        LEFT JOIN tbl_Users                u  ON e.User_Mgt_Id    = u.id
        LEFT JOIN RankedLogs               rl ON e.User_Mgt_Id    = rl.User_Mgt_Id
        LEFT JOIN PunchDetails             ag ON ag.User_Mgt_Id   = rl.User_Mgt_Id
                                             AND ag.LogDate        = rl.LogDate
        WHERE
            rl.LogDate IS NOT NULL
            AND rl.LogDate >= CAST(:FromDate AS DATETIME)
            AND rl.LogDate <  CAST(:ToDate   AS DATETIME)
            AND e.User_Mgt_Id = :EmpCode
            AND COALESCE(u.isActive, 0) != 1
        GROUP BY
            e.User_Mgt_Id, d.Designation, rl.username, rl.Sex, rl.LogDate, ag.PunchDateTimes
        ORDER BY rl.LogDate DESC
    `;
    return db.query(query, {
        replacements: { FromDate, ToDate, EmpCode: EmpId },
        type: sequelize_1.QueryTypes.SELECT,
    });
};
const getMultipleEmployeesAttendance = async (db, FromDate, ToDate, FingerPrintId) => {
    const filterCondition = !FingerPrintId || FingerPrintId === 'ALL' || FingerPrintId === '0'
        ? ''
        : "AND em.fingerPrintEmpId = :FingerPrintId";
    const punchFilterCondition = !FingerPrintId || FingerPrintId === 'ALL' || FingerPrintId === '0'
        ? ''
        : "AND pd.EmployeeCode = :FingerPrintId";
    const query = `
 WITH RankedLogs AS (
                SELECT
                     em.fingerPrintEmpId,
                     em.User_Mgt_Id,
                     em.Emp_Name AS username,
                     em.Sex AS Sex,
                     pd.EmployeeCode,
                   pd.EmployeeId,
                  al.AttendanceDate AS LogDateTime,
                    CAST(al.AttendanceDate AS DATE) AS LogDate,
                   ROW_NUMBER() OVER (
                         PARTITION BY em.fingerPrintEmpId, CAST(al.AttendanceDate AS DATE)
                        ORDER BY al.AttendanceDate
                    ) AS rn,
                    COUNT(*) OVER (
                         PARTITION BY em.fingerPrintEmpId, CAST(al.AttendanceDate AS DATE)
                    ) AS record_count
                 FROM tbl_Employee_Master em
                 LEFT JOIN etimetracklite1.dbo.Employees pd
                    ON CAST(pd.EmployeeCode COLLATE DATABASE_DEFAULT AS NVARCHAR(50) ) = em.fingerPrintEmpId COLLATE DATABASE_DEFAULT
                LEFT JOIN etimetracklite1.dbo.AttendanceLogs al
                     ON al.EmployeeId = pd.EmployeeId
                 WHERE
                     al.status != 'Resigned'
                     AND al.AttendanceDate >= CAST(:FromDate AS DATETIME)
                     AND al.AttendanceDate < CAST(:ToDate AS DATETIME)
                     ${filterCondition}
            ),
        DefaultLeaves AS (
            SELECT CAST(Date AS DATE) AS DefaultLeaveDate
            FROM tbl_Default_Leave
            WHERE Date >= CAST(:FromDate AS DATE)
              AND Date <  CAST(:ToDate   AS DATE)
        ),
        PunchDetails AS (
            SELECT
                pd.EmployeeCode,
                CAST(al.AttendanceDate AS DATE) AS LogDate,
                COALESCE(
                    STRING_AGG(SUBSTRING(al.PunchRecords, 1, 5000), ', '),
                    '[]'
                ) AS PunchDateTimes
            FROM etimetracklite1.dbo.Employees pd
            LEFT JOIN etimetracklite1.dbo.AttendanceLogs al
                ON al.EmployeeId = pd.EmployeeId
            WHERE
                al.status != 'Resigned'
                AND ISNULL(CAST(al.PunchRecords AS NVARCHAR(MAX)), '') <> ''
                AND al.AttendanceDate >= CAST(:FromDate AS DATETIME)
                AND al.AttendanceDate < CAST(:ToDate AS DATETIME)
                ${punchFilterCondition}
            GROUP BY pd.EmployeeCode, CAST(al.AttendanceDate AS DATE)
        ),
        LeaveDays AS (
            SELECT
                lm.User_Id,
                DATEADD(DAY, n.number, CAST(lm.FromDate AS DATE)) AS LeaveDate
            FROM tbl_Leave_Master lm
            CROSS JOIN (
                SELECT number FROM master.dbo.spt_values
                WHERE type = 'P' AND number BETWEEN 0 AND 1000
            ) n
            WHERE
                lm.Status = 'Approved'
                AND DATEADD(DAY, n.number, CAST(lm.FromDate AS DATE)) <= CAST(lm.ToDate AS DATE)
        )
        SELECT
            em.fingerPrintEmpId,
            COALESCE(d.Designation, 'NOT FOUND')  AS Designation_Name,
            COALESCE(rl.username, '')              AS username,
            rl.Sex                                 AS Sex,
            rl.LogDate,
            COALESCE(ag.PunchDateTimes, '[]')      AS AttendanceDetails,
            COALESCE(MAX(rl.record_count), 0)      AS TotalRecords,
            CASE
                WHEN DATEPART(WEEKDAY, rl.LogDate) = 1 THEN 'H'
                WHEN EXISTS (
                    SELECT 1 FROM LeaveDays ld
                    WHERE ld.User_Id = rl.User_Mgt_Id AND ld.LeaveDate = rl.LogDate
                ) THEN 'L'
                WHEN EXISTS (
                    SELECT 1 FROM DefaultLeaves dl
                    WHERE dl.DefaultLeaveDate = rl.LogDate
                ) THEN 'DL'
                WHEN COALESCE(ag.PunchDateTimes, '') <> '' THEN 'P'
                ELSE 'A'
            END AS AttendanceStatus
        FROM tbl_Employee_Master em
        LEFT JOIN tbl_Employee_Designation d  ON em.Designation      = d.Designation_Id
        LEFT JOIN RankedLogs               rl ON em.fingerPrintEmpId  = rl.fingerPrintEmpId
        LEFT JOIN PunchDetails             ag ON ag.EmployeeCode      = rl.EmployeeCode
                                             AND ag.LogDate            = rl.LogDate
        WHERE
            rl.LogDate IS NOT NULL
            AND rl.LogDate >= CAST(:FromDate AS DATETIME)
            AND rl.LogDate <  CAST(:ToDate   AS DATETIME)
        GROUP BY
            em.fingerPrintEmpId, d.Designation, rl.username, rl.Sex,
            rl.LogDate, ag.PunchDateTimes, rl.User_Mgt_Id
        ORDER BY rl.LogDate DESC
    `;
    const replacements = { FromDate, ToDate };
    if (FingerPrintId && FingerPrintId !== 'ALL' && FingerPrintId !== '0') {
        replacements.FingerPrintId = FingerPrintId;
    }
    return db.query(query, {
        replacements,
        type: sequelize_1.QueryTypes.SELECT,
    });
};
const attendanceSync = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: "startDate and endDate are required"
            });
        }
        const db = req.companyDB;
        if (!db) {
            return res.status(500).json({ error: "Company database connection not found" });
        }
        try {
            await db.query("EXEC Online_Attendnace_Employee_SP");
        }
        catch (err) {
            // SQL Server Error 2571: User does not have permission to run DBCC DROPCLEANBUFFERS.
            // We ignore this error because it's a server-level cache clear that doesn't affect the data sync.
            if (err.parent && err.parent.number === 2571) {
                console.warn("Ignored DBCC DROPCLEANBUFFERS permission error.");
            }
            else {
                throw err;
            }
        }
        await db.query("EXEC Online_AttendanceLogs_SP @Start_Date = :startDate, @To_Date = :endDate", {
            replacements: { startDate, endDate }
        });
        responseObject_1.dataFound(res, [], "Attendance sync completed successfully", {
            startDate,
            endDate
        });
    }
    catch (e) {
        (0, responseObject_1.servError)(e, res);
    }
};
exports.attendanceSync = attendanceSync;
// ─── Default export ───────────────────────────────────────────────────────────
exports.default = {
    attendanceSync: exports.attendanceSync,
    getFingerprintAttendance: exports.getFingerprintAttendance,
    getTodayAttendance: exports.getTodayAttendance,
    getEmployeeAttendanceSummary: exports.getEmployeeAttendanceSummary,
    getEmployeeAttendance: exports.getEmployeeAttendance,
    getDeviceAttendance: exports.getDeviceAttendance,
    getAttendanceByDateRange: exports.getAttendanceByDateRange,
    getMonthlyAttendance: exports.getMonthlyAttendance,
    getAbsentEmployees: exports.getAbsentEmployees,
    getPresentEmployees: exports.getPresentEmployees,
    getAttendanceStats: exports.getAttendanceStats,
    getAllDefaultLeaves: exports.getAllDefaultLeaves,
    getDefaultLeavesByDateRange: exports.getDefaultLeavesByDateRange,
    getDefaultLeaveById: exports.getDefaultLeaveById,
};
