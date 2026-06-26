import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ZodError } from 'zod';
import {
  created,
  updated,
  deleted,
  servError,
  notFound,
} from '../../../responseObject';
import {
  initLeaveModel,
  formatLeaveForResponse,
  leaveCreateSchema,
  leaveUpdateSchema,
  leaveQuerySchema,
  leaveIdSchema,
  LeaveCreateInput,
  LeaveUpdateInput,
  LeaveQueryParams,
  formatDateForSQLServer,
  formatDateTimeForSQLServer,
} from '../../../models/masters/leave/leave.model';

// ─── Zod Validation Helper ────────────────────────────────────────────────────
const validateWithZod = <T>(
  schema: any,
  data: any
): { success: boolean; data?: T; errors?: Array<{ field: string; message: string }> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodIssues = error.issues || (error as any).errors || [];
      return {
        success: false,
        errors: zodIssues.map((err: any) => ({
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
const getLeaveModel = (req: Request) => {
  const sequelize = (req as any).companyDB;
  if (!sequelize) throw new Error('Database connection not available');
  return initLeaveModel(sequelize);
};

// ─── Permission Check ─────────────────────────────────────────────────────────
const checkUserPermission = (req: Request, permission?: string): boolean => {
  const user = (req as any).user;
  if (!user) return false;
  if (user.UserTypeId === 0) return true;

  if (permission === 'create_leave' && ![1, 2, 3].includes(user.UserTypeId)) return false;
  if (permission === 'update_leave' && ![1, 2].includes(user.UserTypeId)) return false;
  if (permission === 'delete_leave' && user.UserTypeId !== 1) return false;
  if (permission === 'view_leave' && ![1, 2, 3].includes(user.UserTypeId)) return false;
  if (permission === 'approve_leave' && ![1, 2].includes(user.UserTypeId)) return false;

  return true;
};

const handleForbiddenError = (res: Response, msg?: string) =>
  res.status(403).json({
    success: false,
    message: msg || 'Access denied. You do not have permission to perform this action.',
    error: 'FORBIDDEN',
  });

// ─── GET All Leaves ───────────────────────────────────────────────────────────
export const getLeaveList = async (req: Request, res: Response) => {
  try {
    if (!checkUserPermission(req, 'view_leave')) {
      return handleForbiddenError(res, 'You do not have permission to view leave records');
    }

    const Leave = getLeaveModel(req);

    const validation = validateWithZod<LeaveQueryParams>(leaveQuerySchema, req.query);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const { UserId, UserTypeId, FromDate, ToDate } = validation.data!;

    const whereClause: any = {};

    if (UserId && (UserTypeId === 3 || !UserTypeId)) {
      whereClause.User_Id = UserId;
    } else if (UserId && UserId !== 0) {
      whereClause.User_Id = UserId;
    }

    if (FromDate) {
      whereClause.FromDate = { [Op.gte]: new Date(FromDate) };
    }
    if (ToDate) {
      whereClause.ToDate = { [Op.lte]: new Date(ToDate) };
    }

    const leaves = await Leave.findAll({
      where: whereClause,
      order: [['Id', 'DESC']],
    });

    const formatted = leaves.map((l) => formatLeaveForResponse(l));

    return res.status(200).json({
      success: true,
      message: 'Leave records retrieved successfully',
      data: formatted,
      totalRecords: formatted.length,
    });
  } catch (error: any) {
    console.error('Error fetching leave list:', error);
    return servError(error, res);
  }
};

// ─── GET Leave By ID ──────────────────────────────────────────────────────────
export const getLeaveById = async (req: Request, res: Response) => {
  try {
    if (!checkUserPermission(req, 'view_leave')) {
      return handleForbiddenError(res, 'You do not have permission to view leave records');
    }

    const Leave = getLeaveModel(req);

    const validation = validateWithZod<{ Id: number }>(leaveIdSchema, { Id: parseInt(req.params.id) });
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const leave = await Leave.findByPk(validation.data!.Id);
    if (!leave) return notFound(res, 'Leave record not found');

    return res.status(200).json({
      success: true,
      message: 'Leave record retrieved successfully',
      data: formatLeaveForResponse(leave),
    });
  } catch (error: any) {
    console.error('Error fetching leave by ID:', error);
    return servError(error, res);
  }
};

// ─── GET Approve Data ─────────────────────────────────────────────────────────
export const getApproveData = async (req: Request, res: Response) => {
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

    const formatted = leaves.map((l) => formatLeaveForResponse(l));

    return res.status(200).json({
      success: true,
      message: 'Approve data retrieved successfully',
      data: formatted,
      totalRecords: formatted.length,
    });
  } catch (error: any) {
    console.error('Error fetching approve data:', error);
    return servError(error, res);
  }
};

// ─── GET Leave Statistics ─────────────────────────────────────────────────────
export const getLeaveStatistics = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error fetching leave statistics:', error);
    return servError(error, res);
  }
};

// ─── POST Apply Leave (CORRECTED - Direct data structure) ─────────────────────
export const applyLeave = async (req: Request, res: Response) => {
  try {
    if (!checkUserPermission(req, 'create_leave')) {
      return handleForbiddenError(res, 'You do not have permission to apply leave');
    }

    const sequelize = (req as any).companyDB;
    if (!sequelize) throw new Error('Database connection not available');
    
    const validation = validateWithZod<LeaveCreateInput>(leaveCreateSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const leaveData = validation.data!;
    
    // Format dates properly for SQL Server
    const fromDate = leaveData.FromDate instanceof Date ? formatDateForSQLServer(leaveData.FromDate) : leaveData.FromDate;
    const toDate = leaveData.ToDate instanceof Date ? formatDateForSQLServer(leaveData.ToDate) : leaveData.ToDate;
    const currentDateTime = formatDateTimeForSQLServer(new Date());
    
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
    const formattedRecord = formatLeaveForResponse(insertedRecord);
    
    // Return response matching GET endpoint structure
    return res.status(201).json({
      success: true,
      message: 'Leave applied successfully',
      data: formattedRecord
    });
  } catch (error: any) {
    console.error('Error applying leave:', error);
    
    // Handle specific database errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Database validation error',
        errors: error.errors.map((e: any) => ({ field: e.path, message: e.message }))
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
    
    return servError(error, res);
  }
};

// ─── PUT Update / Approve Leave (CORRECTED) ───────────────────────────────────
export const updateLeave = async (req: Request, res: Response) => {
  try {
    if (!checkUserPermission(req, 'update_leave')) {
      return handleForbiddenError(res, 'You do not have permission to update leave');
    }

    const sequelize = (req as any).companyDB;
    if (!sequelize) throw new Error('Database connection not available');

    const validation = validateWithZod<LeaveUpdateInput>(leaveUpdateSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const { Id, LeaveType_Id, Approver_Reason, Approved_By, Status } = validation.data!;

    // Check if record exists
    const checkQuery = `SELECT Id FROM tbl_Leave_Master WHERE Id = :Id`;
    const existingRecord = await sequelize.query(checkQuery, {
      replacements: { Id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!existingRecord || existingRecord.length === 0) {
      return notFound(res, 'Leave record not found');
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const replacements: any = { Id };
    
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
      replacements.Approved_At = formatDateTimeForSQLServer(new Date());
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
    const formattedRecord = formatLeaveForResponse(updatedRecord);

    return res.status(200).json({
      success: true,
      message: 'Leave updated successfully',
      data: formattedRecord,
    });
  } catch (error: any) {
    console.error('Error updating leave:', error);
    return servError(error, res);
  }
};

// ─── DELETE Leave ─────────────────────────────────────────────────────────────
export const deleteLeave = async (req: Request, res: Response) => {
  try {
    if (!checkUserPermission(req, 'delete_leave')) {
      return handleForbiddenError(res, 'You do not have permission to delete leave records');
    }

    const sequelize = (req as any).companyDB;
    if (!sequelize) throw new Error('Database connection not available');

    const validation = validateWithZod<{ Id: number }>(leaveIdSchema, { Id: req.body.Id });
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const { Id } = validation.data!;

    const deleteQuery = `DELETE FROM tbl_Leave_Master WHERE Id = :Id`;
    const result = await sequelize.query(deleteQuery, {
      replacements: { Id },
      type: sequelize.QueryTypes.DELETE
    });

    if (result[1] === 0) {
      return notFound(res, 'Leave record not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Leave record deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting leave:', error);
    return servError(error, res);
  }
};

// ─── GET Status Options ───────────────────────────────────────────────────────
export const getStatusOptions = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error fetching status options:', error);
    return servError(error, res);
  }
};