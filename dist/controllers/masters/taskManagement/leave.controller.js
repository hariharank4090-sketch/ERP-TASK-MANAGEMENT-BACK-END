"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusOptions = exports.deleteLeave = exports.updateLeave = exports.applyLeave = exports.getLeaveStatistics = exports.getApproveData = exports.getLeaveById = exports.getLeaveList = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const responseObject_1 = require("../../../responseObject");
const leave_model_1 = require("../../../models/masters/leave/leave.model");
// ─── Zod Validation Helper ────────────────────────────────────────────────────
const validateWithZod = (schema, data) => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const zodIssues = error.issues || error.errors || [];
            return {
                success: false,
                errors: zodIssues.map((err) => ({
                    field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || 'unknown'),
                    message: err.message || 'Validation error',
                })),
            };
        }
        return {
            success: false,
            errors: [{ field: 'unknown', message: 'Validation failed' }],
        };
    }
};
// ─── Model Helper ─────────────────────────────────────────────────────────────
const getLeaveModel = (req) => {
    const sequelize = req.companyDB;
    if (!sequelize)
        throw new Error('Database connection not available');
    return (0, leave_model_1.initLeaveModel)(sequelize);
};
// ─── Permission Check ─────────────────────────────────────────────────────────
const checkUserPermission = (req, permission) => {
    const user = req.user;
    if (!user)
        return false;
    if (user.UserTypeId === 0)
        return true;
    if (permission === 'create_leave' && ![1, 2, 3].includes(user.UserTypeId))
        return false;
    if (permission === 'update_leave' && ![1, 2].includes(user.UserTypeId))
        return false;
    if (permission === 'delete_leave' && user.UserTypeId !== 1)
        return false;
    if (permission === 'view_leave' && ![1, 2, 3].includes(user.UserTypeId))
        return false;
    if (permission === 'approve_leave' && ![1, 2].includes(user.UserTypeId))
        return false;
    return true;
};
const handleForbiddenError = (res, msg) => res.status(403).json({
    success: false,
    message: msg || 'Access denied. You do not have permission to perform this action.',
    error: 'FORBIDDEN',
});
// ─── GET All Leaves ───────────────────────────────────────────────────────────
const getLeaveList = async (req, res) => {
    try {
        if (!checkUserPermission(req, 'view_leave')) {
            return handleForbiddenError(res, 'You do not have permission to view leave records');
        }
        const Leave = getLeaveModel(req);
        const validation = validateWithZod(leave_model_1.leaveQuerySchema, req.query);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const { UserId, UserTypeId, FromDate, ToDate } = validation.data;
        const whereClause = {};
        if (UserId && (UserTypeId === 3 || !UserTypeId)) {
            whereClause.User_Id = UserId;
        }
        else if (UserId && UserId !== 0) {
            whereClause.User_Id = UserId;
        }
        if (FromDate) {
            whereClause.FromDate = { [sequelize_1.Op.gte]: new Date(FromDate) };
        }
        if (ToDate) {
            whereClause.ToDate = { [sequelize_1.Op.lte]: new Date(ToDate) };
        }
        const leaves = await Leave.findAll({
            where: whereClause,
            order: [['Id', 'DESC']],
        });
        const formatted = leaves.map((l) => (0, leave_model_1.formatLeaveForResponse)(l));
        return res.status(200).json({
            success: true,
            message: 'Leave records retrieved successfully',
            data: formatted,
            totalRecords: formatted.length,
        });
    }
    catch (error) {
        console.error('Error fetching leave list:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getLeaveList = getLeaveList;
// ─── GET Leave By ID ──────────────────────────────────────────────────────────
const getLeaveById = async (req, res) => {
    try {
        if (!checkUserPermission(req, 'view_leave')) {
            return handleForbiddenError(res, 'You do not have permission to view leave records');
        }
        const Leave = getLeaveModel(req);
        const validation = validateWithZod(leave_model_1.leaveIdSchema, { Id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const leave = await Leave.findByPk(validation.data.Id);
        if (!leave)
            return (0, responseObject_1.notFound)(res, 'Leave record not found');
        return res.status(200).json({
            success: true,
            message: 'Leave record retrieved successfully',
            data: (0, leave_model_1.formatLeaveForResponse)(leave),
        });
    }
    catch (error) {
        console.error('Error fetching leave by ID:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getLeaveById = getLeaveById;
// ─── GET Approve Data ─────────────────────────────────────────────────────────
const getApproveData = async (req, res) => {
    try {
        if (!checkUserPermission(req, 'approve_leave')) {
            return handleForbiddenError(res, 'You do not have permission to view approve data');
        }
        const Leave = getLeaveModel(req);
        const { userId } = req.query;
        if (!userId || isNaN(Number(userId))) {
            return res.status(400).json({ success: false, message: 'Valid userId is required' });
        }
        const leaves = await Leave.findAll({
            where: { InCharge: Number(userId) },
            order: [['Id', 'DESC']],
        });
        const formatted = leaves.map((l) => (0, leave_model_1.formatLeaveForResponse)(l));
        return res.status(200).json({
            success: true,
            message: 'Approve data retrieved successfully',
            data: formatted,
            totalRecords: formatted.length,
        });
    }
    catch (error) {
        console.error('Error fetching approve data:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getApproveData = getApproveData;
// ─── GET Leave Statistics ─────────────────────────────────────────────────────
const getLeaveStatistics = async (req, res) => {
    try {
        if (!checkUserPermission(req, 'view_leave')) {
            return handleForbiddenError(res, 'You do not have permission to view leave statistics');
        }
        const Leave = getLeaveModel(req);
        const [total, pending, approved, rejected] = await Promise.all([
            Leave.count(),
            Leave.count({ where: { Status: 'Pending' } }),
            Leave.count({ where: { Status: 'Approved' } }),
            Leave.count({ where: { Status: 'Rejected' } }),
        ]);
        return res.status(200).json({
            success: true,
            message: 'Leave statistics retrieved successfully',
            data: {
                total,
                pending: { count: pending, text: 'Pending' },
                approved: { count: approved, text: 'Approved' },
                rejected: { count: rejected, text: 'Rejected' },
            },
        });
    }
    catch (error) {
        console.error('Error fetching leave statistics:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getLeaveStatistics = getLeaveStatistics;
// ─── POST Apply Leave (CORRECTED - Direct data structure) ─────────────────────
const applyLeave = async (req, res) => {
    try {
        if (!checkUserPermission(req, 'create_leave')) {
            return handleForbiddenError(res, 'You do not have permission to apply leave');
        }
        const sequelize = req.companyDB;
        if (!sequelize)
            throw new Error('Database connection not available');
        const validation = validateWithZod(leave_model_1.leaveCreateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const leaveData = validation.data;
        // Format dates properly for SQL Server
        const fromDate = leaveData.FromDate instanceof Date ? (0, leave_model_1.formatDateForSQLServer)(leaveData.FromDate) : leaveData.FromDate;
        const toDate = leaveData.ToDate instanceof Date ? (0, leave_model_1.formatDateForSQLServer)(leaveData.ToDate) : leaveData.ToDate;
        const currentDateTime = (0, leave_model_1.formatDateTimeForSQLServer)(new Date());
        // Use raw SQL query with proper parameter names (colon syntax)
        const sqlQuery = `
      INSERT INTO tbl_Leave_Master 
        (User_Id, FromDate, ToDate, Session, NoOfDays, LeaveType_Id, 
         Department, InCharge, Reason, Created_By, Created_At, Status)
      OUTPUT INSERTED.*
      VALUES 
        (:User_Id, :FromDate, :ToDate, :Session, :NoOfDays, :LeaveType_Id,
         :Department, :InCharge, :Reason, :Created_By, :Created_At, :Status)
    `;
        const result = await sequelize.query(sqlQuery, {
            replacements: {
                User_Id: leaveData.User_Id,
                FromDate: fromDate,
                ToDate: toDate,
                Session: leaveData.Session,
                NoOfDays: leaveData.NoOfDays,
                LeaveType_Id: leaveData.LeaveType_Id,
                Department: leaveData.Department,
                InCharge: leaveData.InCharge,
                Reason: leaveData.Reason,
                Created_By: leaveData.Created_By,
                Created_At: currentDateTime,
                Status: leaveData.Status || 'Pending'
            },
            type: sequelize.QueryTypes.INSERT,
            plain: true
        });
        // Get the inserted record (handle both array and object results)
        const insertedRecord = Array.isArray(result) ? result[0] : result;
        // Format the record to ensure dates are in ISO format
        const formattedRecord = (0, leave_model_1.formatLeaveForResponse)(insertedRecord);
        // Return response matching GET endpoint structure
        return res.status(201).json({
            success: true,
            message: 'Leave applied successfully',
            data: formattedRecord
        });
    }
    catch (error) {
        console.error('Error applying leave:', error);
        // Handle specific database errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Database validation error',
                errors: error.errors.map((e) => ({ field: e.path, message: e.message }))
            });
        }
        if (error.original?.number === 241) {
            return res.status(400).json({
                success: false,
                message: 'Date conversion error: Please check date formats',
                error: 'Invalid date format provided'
            });
        }
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reference: User, LeaveType, or Department does not exist'
            });
        }
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.applyLeave = applyLeave;
// ─── PUT Update / Approve Leave (CORRECTED) ───────────────────────────────────
const updateLeave = async (req, res) => {
    try {
        if (!checkUserPermission(req, 'update_leave')) {
            return handleForbiddenError(res, 'You do not have permission to update leave');
        }
        const sequelize = req.companyDB;
        if (!sequelize)
            throw new Error('Database connection not available');
        const validation = validateWithZod(leave_model_1.leaveUpdateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const { Id, LeaveType_Id, Approver_Reason, Approved_By, Status } = validation.data;
        // Check if record exists
        const checkQuery = `SELECT Id FROM tbl_Leave_Master WHERE Id = :Id`;
        const existingRecord = await sequelize.query(checkQuery, {
            replacements: { Id },
            type: sequelize.QueryTypes.SELECT,
        });
        if (!existingRecord || existingRecord.length === 0) {
            return (0, responseObject_1.notFound)(res, 'Leave record not found');
        }
        // Build dynamic update query
        const updateFields = [];
        const replacements = { Id };
        if (LeaveType_Id !== undefined) {
            updateFields.push('LeaveType_Id = :LeaveType_Id');
            replacements.LeaveType_Id = LeaveType_Id;
        }
        if (Approver_Reason !== undefined) {
            updateFields.push('Approver_Reason = :Approver_Reason');
            replacements.Approver_Reason = Approver_Reason;
        }
        if (Approved_By !== undefined) {
            updateFields.push('Approved_By = :Approved_By');
            replacements.Approved_By = Approved_By;
        }
        if (Status !== undefined) {
            updateFields.push('Status = :Status');
            updateFields.push('Approved_At = :Approved_At');
            replacements.Status = Status;
            replacements.Approved_At = (0, leave_model_1.formatDateTimeForSQLServer)(new Date());
        }
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        const updateQuery = `
      UPDATE tbl_Leave_Master 
      SET ${updateFields.join(', ')}
      WHERE Id = :Id
    `;
        await sequelize.query(updateQuery, {
            replacements,
            type: sequelize.QueryTypes.UPDATE
        });
        // Fetch updated record
        const selectQuery = `SELECT * FROM tbl_Leave_Master WHERE Id = :Id`;
        const updatedRecord = await sequelize.query(selectQuery, {
            replacements: { Id },
            type: sequelize.QueryTypes.SELECT,
            plain: true
        });
        // Format the response
        const formattedRecord = (0, leave_model_1.formatLeaveForResponse)(updatedRecord);
        return res.status(200).json({
            success: true,
            message: 'Leave updated successfully',
            data: formattedRecord,
        });
    }
    catch (error) {
        console.error('Error updating leave:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.updateLeave = updateLeave;
// ─── DELETE Leave ─────────────────────────────────────────────────────────────
const deleteLeave = async (req, res) => {
    try {
        if (!checkUserPermission(req, 'delete_leave')) {
            return handleForbiddenError(res, 'You do not have permission to delete leave records');
        }
        const sequelize = req.companyDB;
        if (!sequelize)
            throw new Error('Database connection not available');
        const validation = validateWithZod(leave_model_1.leaveIdSchema, { Id: req.body.Id });
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }
        const { Id } = validation.data;
        const deleteQuery = `DELETE FROM tbl_Leave_Master WHERE Id = :Id`;
        const result = await sequelize.query(deleteQuery, {
            replacements: { Id },
            type: sequelize.QueryTypes.DELETE
        });
        if (result[1] === 0) {
            return (0, responseObject_1.notFound)(res, 'Leave record not found');
        }
        return res.status(200).json({
            success: true,
            message: 'Leave record deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting leave:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.deleteLeave = deleteLeave;
// ─── GET Status Options ───────────────────────────────────────────────────────
const getStatusOptions = async (req, res) => {
    try {
        const statusOptions = [
            { value: 'Pending', label: 'Pending' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
        ];
        const sessionOptions = [
            { value: 'FN', label: 'FN (Fore Noon)' },
            { value: 'AN', label: 'AN (After Noon)' },
            { value: 'Full', label: 'Full Day' },
        ];
        return res.status(200).json({
            success: true,
            message: 'Status options retrieved successfully',
            data: { statusOptions, sessionOptions },
        });
    }
    catch (error) {
        console.error('Error fetching status options:', error);
        return (0, responseObject_1.servError)(error, res);
    }
};
exports.getStatusOptions = getStatusOptions;
