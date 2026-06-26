// src/controllers/masters/taskManagement/employeemaster.controller.ts

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ZodError } from 'zod';
import {
    created,
    updated,
    deleted,
    servError,
    notFound,
    sentData
} from '../../../responseObject';
import {
    initEmployeeModel,
    employeeCreateSchema,
    employeeUpdateSchema,
    employeeQuerySchema,
    employeeIdSchema,
    EmployeeCreateInput,
    EmployeeUpdateInput,
    formatEmployeeForResponse
} from '../../../models/masters/employee/type.model';

// ─────────────────────────────────────────────────────────────────────────────
// VALID SORT FIELDS — only columns that exist on tbl_Employee_Master
// ─────────────────────────────────────────────────────────────────────────────
const VALID_EMPLOYEE_SORT_FIELDS = [
    'Emp_Id',
    'Emp_Code',
    'Emp_Name',
    'DOJ',
    'DOB',
    'Department_ID',
    'Designation',
    'Branch',
    'Salary',
    'Entry_Date',
    'Update_Date',
] as const;

type EmployeeSortField = (typeof VALID_EMPLOYEE_SORT_FIELDS)[number];

const isValidSortField = (field: string): field is EmployeeSortField =>
    (VALID_EMPLOYEE_SORT_FIELDS as readonly string[]).includes(field);

const isValidSortOrder = (order: string): order is 'ASC' | 'DESC' =>
    order === 'ASC' || order === 'DESC';

// ─────────────────────────────────────────────────────────────────────────────

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
        return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
    }
};

const getEmployeeModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) throw new Error('Database connection not available');
    return initEmployeeModel(sequelize);
};

const cleanMobileNumber = (mobileNo: string | null | undefined): string | null => {
    if (!mobileNo || mobileNo.trim() === '') return null;
    let cleaned = mobileNo.replace(/\D/g, '').replace(/^0+/, '');
    if (/^[6789]\d{9}$/.test(cleaned)) return cleaned;
    if (/^91[6789]\d{9}$/.test(cleaned)) return cleaned.substring(2);
    return null;
};

const prepareEmployeeData = (data: any, user?: any) => {
    const preparedData: any = { ...data };

    if (preparedData.DOB && typeof preparedData.DOB === 'string') {
        const dobDate = new Date(preparedData.DOB);
        preparedData.DOB = !isNaN(dobDate.getTime()) ? dobDate : null;
    }

    if (preparedData.DOJ && typeof preparedData.DOJ === 'string') {
        const dojDate = new Date(preparedData.DOJ);
        preparedData.DOJ = !isNaN(dojDate.getTime()) ? dojDate : null;
    }

    if (preparedData.Mobile_No) {
        preparedData.Mobile_No = cleanMobileNumber(preparedData.Mobile_No) ?? null;
    }

    if (preparedData.Total_Loan !== undefined) preparedData.Total_Loan = preparedData.Total_Loan || 0;
    if (preparedData.Salary_Advance !== undefined) preparedData.Salary_Advance = preparedData.Salary_Advance || 0;
    if (preparedData.Due_Loan !== undefined) preparedData.Due_Loan = preparedData.Due_Loan || 0;

    if (!data.Emp_Id) {
        if (!preparedData.Entry_Date) preparedData.Entry_Date = new Date();
        if (user && !preparedData.Entry_By) {
            preparedData.Entry_By = user.Global_User_ID || user.id || 1;
        }
    }

    return preparedData;
};

const handleForbiddenError = (res: Response, customMessage?: string) =>
    res.status(403).json({
        success: false,
        message: customMessage || 'Access denied. You do not have permission to perform this action.',
        error: 'FORBIDDEN',
    });

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-COMPANY PERMISSION MATRIX
// 
// UserTypeId comes from the login response for the CURRENT company
// Each company can have different UserTypeId for the same user
//
// UserTypeId 0  → Super Admin : full access (create, read, update, delete)
// UserTypeId 1  → Admin       : full access (create, read, update, delete)
// UserTypeId 2  → Manager     : create, read, update (no delete)
// UserTypeId 3  → Supervisor  : read, update (no create, no delete)
// UserTypeId 4-10 → Employee  : read only (view only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the current user's permissions for the active company
 * The user object contains UserTypeId specific to the current company
 */
const getUserPermissionsForCurrentCompany = (req: Request): {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    userTypeId: number | null;
    localUserId: number | null;
    globalUserId: number | null;
} => {
    const user = (req as any).user;
    const tokenSession = (req as any).tokenSession;
    
    if (!user) {
        return {
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            userTypeId: null,
            localUserId: null,
            globalUserId: null
        };
    }

    const userTypeId = user.UserTypeId;
    const localUserId = tokenSession?.localUserId || user.Local_User_ID || null;
    const globalUserId = user.Global_User_ID || null;

    // Super Admin (0) and Admin (1) have full access
    if (userTypeId === 0 || userTypeId === 1) {
        return {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            userTypeId,
            localUserId,
            globalUserId
        };
    }

    // Manager (2) can create, read, update but not delete
    if (userTypeId === 2) {
        return {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: false,
            userTypeId,
            localUserId,
            globalUserId
        };
    }

    // Supervisor (3) can read and update only
    if (userTypeId === 3) {
        return {
            canView: true,
            canCreate: false,
            canUpdate: true,
            canDelete: false,
            userTypeId,
            localUserId,
            globalUserId
        };
    }

    // Regular employees (4-10) can only view
    if (userTypeId >= 4 && userTypeId <= 10) {
        return {
            canView: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            userTypeId,
            localUserId,
            globalUserId
        };
    }

    // Default: no permissions
    return {
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        userTypeId,
        localUserId,
        globalUserId
    };
};

/**
 * Check if user has admin-level access for current company
 */
const isAdminForCurrentCompany = (req: Request): boolean => {
    const user = (req as any).user;
    if (!user) return false;
    const userTypeId = user.UserTypeId;
    return userTypeId === 0 || userTypeId === 1;
};

/**
 * Check if user has manager-level or higher access for current company
 */
const isManagerOrHigherForCurrentCompany = (req: Request): boolean => {
    const user = (req as any).user;
    if (!user) return false;
    const userTypeId = user.UserTypeId;
    return userTypeId === 0 || userTypeId === 1 || userTypeId === 2;
};

/**
 * Get the Local_User_ID for the current user in the current company
 */
const getLocalUserIdForCurrentCompany = (req: Request): number | null => {
    const tokenSession = (req as any).tokenSession;
    if (tokenSession?.localUserId != null) return tokenSession.localUserId;
    
    const user = (req as any).user;
    if (user?.Local_User_ID != null) return user.Local_User_ID;
    
    return null;
};

/**
 * Get the Global_User_ID for the current user
 */
const getGlobalUserId = (req: Request): number | null => {
    const user = (req as any).user;
    return user?.Global_User_ID || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL EMPLOYEES (with multi-company permission filtering)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllEmployees = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employees for this company');
        }

        const Employee = getEmployeeModel(req);

        // ── Parse & validate query params ────────────────────────────────────
        const rawBranch     = req.query.branch      as string | undefined;
        const rawDeptId     = req.query.departmentId as string | undefined;
        const rawDesig      = req.query.designation  as string | undefined;
        const rawSearch     = (req.query.search      as string | undefined)?.trim();
        const rawSortBy     = (req.query.sortBy      as string | undefined)?.trim();
        const rawSortOrder  = (req.query.sortOrder   as string | undefined)?.trim().toUpperCase();

        // Numeric conversions
        const branch       = rawBranch  && !isNaN(Number(rawBranch))  ? parseInt(rawBranch)  : undefined;
        const departmentId = rawDeptId  && !isNaN(Number(rawDeptId))  ? parseInt(rawDeptId)  : undefined;
        const designation  = rawDesig   && !isNaN(Number(rawDesig))   ? parseInt(rawDesig)   : undefined;

        // Validate sort field — fall back to 'Emp_Id' if invalid
        let sortField: EmployeeSortField = 'Emp_Id';
        
        if (rawSortBy && isValidSortField(rawSortBy)) {
            sortField = rawSortBy;
        } else if (rawSortBy && !isValidSortField(rawSortBy)) {
            console.warn(
                `⚠️  Invalid sortBy value "${rawSortBy}" received — falling back to "Emp_Id". ` +
                `Valid options: ${VALID_EMPLOYEE_SORT_FIELDS.join(', ')}`
            );
        }

        const sortDirection: 'ASC' | 'DESC' =
            rawSortOrder && isValidSortOrder(rawSortOrder) ? rawSortOrder : 'DESC';

        // ── Build where clause with permission filtering ────────────────────
        const whereClause: any = {};

        // Non-admin users see only records linked to their User_Mgt_Id
        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) {
                whereClause.User_Mgt_Id = localUserId;
                console.log(`🔒 UserTypeId ${permissions.userTypeId} — filtering by User_Mgt_Id = ${localUserId}`);
            } else {
                console.warn('⚠️  localUserId not found in session — returning empty result set');
                return res.status(200).json({
                    success: true,
                    message: 'Employees retrieved successfully',
                    data: [],
                    totalCount: 0,
                    permissions: {
                        canView: permissions.canView,
                        canCreate: permissions.canCreate,
                        canUpdate: permissions.canUpdate,
                        canDelete: permissions.canDelete,
                        userTypeId: permissions.userTypeId
                    }
                });
            }
        } else {
            console.log(`👑 Admin/Manager access (UserTypeId ${permissions.userTypeId}) — returning all employees for this company`);
        }

        // Apply filters
        if (branch !== undefined) whereClause.Branch = branch;
        if (departmentId !== undefined) whereClause.Department_ID = departmentId;
        if (designation !== undefined) whereClause.Designation = designation;

        if (rawSearch) {
            whereClause[Op.or] = [
                { Emp_Code:   { [Op.like]: `%${rawSearch}%` } },
                { Emp_Name:   { [Op.like]: `%${rawSearch}%` } },
                { Mobile_No:  { [Op.like]: `%${rawSearch}%` } },
            ];
        }

        // ── Query ────────────────────────────────────────────────────────────
        const employees = await Employee.findAll({
            where: whereClause,
            order: [[sortField, sortDirection]],
        });

        const formattedEmployees = employees.map((e: any) => formatEmployeeForResponse(e));

        return res.status(200).json({
            success: true,
            message: 'Employees retrieved successfully',
            data: formattedEmployees,
            totalCount: formattedEmployees.length,
            permissions: {
                canView: permissions.canView,
                canCreate: permissions.canCreate,
                canUpdate: permissions.canUpdate,
                canDelete: permissions.canDelete,
                userTypeId: permissions.userTypeId
            }
        });

    } catch (error: any) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.toString(),
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET EMPLOYEE BY ID
// ─────────────────────────────────────────────────────────────────────────────

export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employees for this company');
        }

        const Employee = getEmployeeModel(req);
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Valid employee ID is required' });
        }

        const findFilter: any = { Emp_Id: id };
        
        // Non-admin users can only see their own records
        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) findFilter.User_Mgt_Id = localUserId;
        }

        const employee = await Employee.findOne({ where: findFilter });
        if (!employee) return notFound(res, 'Employee not found');

        return res.status(200).json({
            success: true,
            message: 'Employee retrieved successfully',
            data: formatEmployeeForResponse(employee),
            permissions: {
                canView: permissions.canView,
                canCreate: permissions.canCreate,
                canUpdate: permissions.canUpdate,
                canDelete: permissions.canDelete,
                userTypeId: permissions.userTypeId
            }
        });

    } catch (error: any) {
        console.error('Error fetching employee:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET EMPLOYEE BY CODE
// ─────────────────────────────────────────────────────────────────────────────

export const getEmployeeByCode = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employees for this company');
        }

        const Employee = getEmployeeModel(req);
        const { empCode } = req.params;

        if (!empCode?.trim()) {
            return res.status(400).json({ success: false, message: 'Employee code is required' });
        }

        const findFilter: any = { Emp_Code: empCode.trim() };
        
        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) findFilter.User_Mgt_Id = localUserId;
        }

        const employee = await Employee.findOne({ where: findFilter });
        if (!employee) return notFound(res, 'Employee not found');

        return res.status(200).json({
            success: true,
            message: 'Employee retrieved successfully',
            data: formatEmployeeForResponse(employee),
        });

    } catch (error: any) {
        console.error('Error fetching employee by code:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE EMPLOYEE (Based on current company's permissions)
// ─────────────────────────────────────────────────────────────────────────────

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canCreate) {
            return handleForbiddenError(res, `You do not have permission to create employees for this company. Your role (UserTypeId: ${permissions.userTypeId}) does not allow creation.`);
        }

        const Employee = getEmployeeModel(req);
        const validation = validateWithZod<EmployeeCreateInput>(employeeCreateSchema, req.body);

        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }

        const employeeData = validation.data!;

        if (employeeData.Emp_Code) {
            const existing = await Employee.findOne({ where: { Emp_Code: employeeData.Emp_Code.trim() } });
            if (existing) {
                return res.status(409).json({ success: false, message: 'Employee with this code already exists' });
            }
        }

        const user = (req as any).user;
        const finalData = prepareEmployeeData(employeeData, user);

        // Auto-assign User_Mgt_Id for non-admin users
        if (!isAdminForCurrentCompany(req) && !finalData.User_Mgt_Id) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) finalData.User_Mgt_Id = localUserId;
        }

        const employee = await Employee.create(finalData);

        return created(res, {
            success: true,
            message: 'Employee created successfully',
            data: formatEmployeeForResponse(employee),
        });

    } catch (error: any) {
        console.error('Error creating employee:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE EMPLOYEE (Based on current company's permissions)
// ─────────────────────────────────────────────────────────────────────────────

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canUpdate) {
            return handleForbiddenError(res, `You do not have permission to update employees for this company. Your role (UserTypeId: ${permissions.userTypeId}) does not allow updates.`);
        }

        const Employee = getEmployeeModel(req);
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Valid employee ID is required' });
        }

        const validation = validateWithZod<EmployeeUpdateInput>(employeeUpdateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }

        const updateData = validation.data!;

        const findFilter: any = { Emp_Id: id };
        
        // Non-admin users can only update their own records
        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) findFilter.User_Mgt_Id = localUserId;
        }

        const employee = await Employee.findOne({ where: findFilter });
        if (!employee) return notFound(res, 'Employee not found or you do not have permission to update this employee');

        if (updateData.Emp_Code && updateData.Emp_Code !== employee.Emp_Code) {
            const duplicate = await Employee.findOne({
                where: { Emp_Id: { [Op.ne]: id }, Emp_Code: updateData.Emp_Code.trim() },
            });
            if (duplicate) {
                return res.status(409).json({ success: false, message: 'Another employee with this code already exists' });
            }
        }

        const user = (req as any).user;
        const finalData = prepareEmployeeData(updateData, user);
        delete finalData.Emp_Id;

        await employee.update(finalData);
        const updatedEmployee = await Employee.findByPk(id);

        return updated(res, {
            success: true,
            message: 'Employee updated successfully',
            data: formatEmployeeForResponse(updatedEmployee),
        });

    } catch (error: any) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE EMPLOYEE (Admin only for current company)
// ─────────────────────────────────────────────────────────────────────────────

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canDelete) {
            return handleForbiddenError(res, `You do not have permission to delete employees for this company. Only Super Admin or Admin can delete employees. Your role: UserTypeId ${permissions.userTypeId}`);
        }

        const Employee = getEmployeeModel(req);
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Valid employee ID is required' });
        }

        const employee = await Employee.findOne({ where: { Emp_Id: id } });
        if (!employee) return notFound(res, 'Employee not found');

        await employee.destroy();

        return res.status(200).json({ success: true, message: 'Employee deleted successfully' });

    } catch (error: any) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET EMPLOYEES BY BRANCH
// ─────────────────────────────────────────────────────────────────────────────

export const getEmployeesByBranch = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employees for this company');
        }

        const Employee = getEmployeeModel(req);
        const branchId = parseInt(req.params.branchId);

        if (isNaN(branchId)) {
            return res.status(400).json({ success: false, message: 'Valid branch ID is required' });
        }

        const whereClause: any = { Branch: branchId };
        
        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) whereClause.User_Mgt_Id = localUserId;
        }

        const employees = await Employee.findAll({ where: whereClause, order: [['Emp_Name', 'ASC']] });

        return res.status(200).json({
            success: true,
            message: 'Employees retrieved successfully',
            data: employees.map((e: any) => formatEmployeeForResponse(e)),
        });

    } catch (error: any) {
        console.error('Error fetching employees by branch:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET EMPLOYEES BY DEPARTMENT
// ─────────────────────────────────────────────────────────────────────────────

export const getEmployeesByDepartment = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employees for this company');
        }

        const Employee = getEmployeeModel(req);
        const departmentId = parseInt(req.params.departmentId);

        if (isNaN(departmentId)) {
            return res.status(400).json({ success: false, message: 'Valid department ID is required' });
        }

        const whereClause: any = { Department_ID: departmentId };
        
        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) whereClause.User_Mgt_Id = localUserId;
        }

        const employees = await Employee.findAll({ where: whereClause, order: [['Emp_Name', 'ASC']] });

        return res.status(200).json({
            success: true,
            message: 'Employees retrieved successfully',
            data: employees.map((e: any) => formatEmployeeForResponse(e)),
        });

    } catch (error: any) {
        console.error('Error fetching employees by department:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ACTIVE EMPLOYEES
// ─────────────────────────────────────────────────────────────────────────────

export const getActiveEmployees = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employees for this company');
        }

        const Employee = getEmployeeModel(req);
        const whereClause: any = {};

        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) whereClause.User_Mgt_Id = localUserId;
        }

        const employees = await Employee.findAll({ where: whereClause, order: [['Emp_Name', 'ASC']] });

        return res.status(200).json({
            success: true,
            message: 'Employees retrieved successfully',
            data: employees.map((e: any) => formatEmployeeForResponse(e)),
        });

    } catch (error: any) {
        console.error('Error fetching active employees:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK CREATE EMPLOYEES
// ─────────────────────────────────────────────────────────────────────────────

export const bulkCreateEmployees = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canCreate) {
            return handleForbiddenError(res, `You do not have permission to create employees in bulk for this company.`);
        }

        const Employee = getEmployeeModel(req);
        const employeesData = req.body;

        if (!Array.isArray(employeesData)) {
            return res.status(400).json({ success: false, message: 'Request body must be an array of employee data' });
        }

        const results: any[] = [];
        const errors: any[]  = [];
        const user            = (req as any).user;
        const localUserId     = (!isAdminForCurrentCompany(req)) ? getLocalUserIdForCurrentCompany(req) : null;

        for (const empData of employeesData) {
            const empCode = empData.Emp_Code || 'N/A';
            try {
                if (empData.Emp_Code) {
                    const existing = await Employee.findOne({ where: { Emp_Code: empData.Emp_Code.trim() } });
                    if (existing) {
                        errors.push({ empCode, message: 'Employee code already exists' });
                        continue;
                    }
                }

                const validation = validateWithZod<EmployeeCreateInput>(employeeCreateSchema, empData);
                if (!validation.success) {
                    errors.push({ empCode, errors: validation.errors, message: 'Validation failed' });
                    continue;
                }

                const finalData = prepareEmployeeData(validation.data!, user);
                if (localUserId != null && !finalData.User_Mgt_Id) finalData.User_Mgt_Id = localUserId;

                const employee = await Employee.create(finalData);
                results.push({ empCode, success: true, employeeId: employee.Emp_Id, message: 'Employee created successfully' });

            } catch (error) {
                errors.push({ empCode, message: error instanceof Error ? error.message : 'Unknown error' });
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Bulk employee creation completed',
            created: results.length,
            failed:  errors.length,
            results,
            errors,
        });

    } catch (error: any) {
        console.error('Error in bulk employee creation:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET EMPLOYEE STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

export const getEmployeeStatistics = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employee statistics for this company');
        }

        const Employee     = getEmployeeModel(req);
        const scopeFilter: any = {};

        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) scopeFilter.User_Mgt_Id = localUserId;
        }

        const totalEmployees   = await Employee.count({ where: scopeFilter });
        const genderStats      = await Employee.findAll({
            where: scopeFilter,
            attributes: ['Sex', [Employee.sequelize!.fn('COUNT', Employee.sequelize!.col('Emp_Id')), 'count']],
            group: ['Sex'],
        });
        const departmentStats  = await Employee.findAll({
            where: scopeFilter,
            attributes: [
                'Department_ID', 'Department',
                [Employee.sequelize!.fn('COUNT', Employee.sequelize!.col('Emp_Id')), 'count'],
            ],
            group: ['Department_ID', 'Department'],
        });
        const salaryStats      = await Employee.findOne({
            where: scopeFilter,
            attributes: [
                [Employee.sequelize!.fn('AVG', Employee.sequelize!.col('Salary')), 'averageSalary'],
                [Employee.sequelize!.fn('MAX', Employee.sequelize!.col('Salary')), 'maxSalary'],
                [Employee.sequelize!.fn('MIN', Employee.sequelize!.col('Salary')), 'minSalary'],
                [Employee.sequelize!.fn('SUM', Employee.sequelize!.col('Salary')), 'totalSalary'],
            ],
        });

        return res.status(200).json({
            success: true,
            message: 'Employee statistics fetched successfully',
            data: { totalEmployees, genderDistribution: genderStats, departmentDistribution: departmentStats, salaryStatistics: salaryStats },
        });

    } catch (error: any) {
        console.error('Error fetching employee statistics:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PARTIAL UPDATE EMPLOYEE
// ─────────────────────────────────────────────────────────────────────────────

export const partialUpdateEmployee = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canUpdate) {
            return handleForbiddenError(res, `You do not have permission to update employees for this company.`);
        }

        const Employee = getEmployeeModel(req);
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Valid employee ID is required' });
        }

        const findFilter: any = { Emp_Id: id };
        
        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) findFilter.User_Mgt_Id = localUserId;
        }

        const employee = await Employee.findOne({ where: findFilter });
        if (!employee) return notFound(res, 'Employee not found or you do not have permission to update this employee');

        if (req.body.Emp_Code && req.body.Emp_Code !== employee.Emp_Code) {
            const duplicate = await Employee.findOne({
                where: { Emp_Id: { [Op.ne]: id }, Emp_Code: req.body.Emp_Code.trim() },
            });
            if (duplicate) {
                return res.status(409).json({ success: false, message: 'Another employee with this code already exists' });
            }
        }

        const user       = (req as any).user;
        const updateData = prepareEmployeeData(req.body, user);
        delete updateData.Emp_Id;

        await employee.update(updateData);
        const updatedEmployee = await Employee.findByPk(id);

        return res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: formatEmployeeForResponse(updatedEmployee),
        });

    } catch (error: any) {
        console.error('Error partially updating employee:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH EMPLOYEES
// ─────────────────────────────────────────────────────────────────────────────

export const searchEmployees = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employees for this company');
        }

        const Employee = getEmployeeModel(req);
        const { name, department, designation, branch, city, fromDate, toDate, minSalary, maxSalary } = req.query;
        const whereClause: any = {};

        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) whereClause.User_Mgt_Id = localUserId;
        }

        if (name)        whereClause.Emp_Name     = { [Op.like]: `%${name}%` };
        if (department)  whereClause.Department_ID = parseInt(department as string);
        if (designation) whereClause.Designation   = parseInt(designation as string);
        if (branch)      whereClause.Branch        = parseInt(branch as string);
        if (city)        whereClause.City          = { [Op.like]: `%${city}%` };

        if (fromDate && toDate) {
            whereClause.DOJ = { [Op.between]: [new Date(fromDate as string), new Date(toDate as string)] };
        } else if (fromDate) {
            whereClause.DOJ = { [Op.gte]: new Date(fromDate as string) };
        } else if (toDate) {
            whereClause.DOJ = { [Op.lte]: new Date(toDate as string) };
        }

        if (minSalary) whereClause.Salary = { ...whereClause.Salary, [Op.gte]: parseFloat(minSalary as string) };
        if (maxSalary) whereClause.Salary = { ...whereClause.Salary, [Op.lte]: parseFloat(maxSalary as string) };

        const employees = await Employee.findAll({ where: whereClause, order: [['Emp_Name', 'ASC']] });
        const formatted = employees.map((e: any) => formatEmployeeForResponse(e));

        return res.status(200).json({
            success: true,
            message: 'Employees search completed',
            data: formatted,
            count: formatted.length,
        });

    } catch (error: any) {
        console.error('Error searching employees:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET EMPLOYEE COUNT
// ─────────────────────────────────────────────────────────────────────────────

export const getEmployeeCount = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employee count for this company');
        }

        const Employee    = getEmployeeModel(req);
        const whereClause: any = {};

        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) whereClause.User_Mgt_Id = localUserId;
        }

        const { branch, departmentId, designation } = req.query;
        if (branch) {
            const n = parseInt(branch as string);
            if (!isNaN(n)) whereClause.Branch = n;
        }
        if (departmentId) {
            const n = parseInt(departmentId as string);
            if (!isNaN(n)) whereClause.Department_ID = n;
        }
        if (designation) {
            const n = parseInt(designation as string);
            if (!isNaN(n)) whereClause.Designation = n;
        }

        const count = await Employee.count({ where: whereClause });

        return res.status(200).json({ success: true, message: 'Employee count fetched successfully', data: { count } });

    } catch (error: any) {
        console.error('Error fetching employee count:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET EMPLOYEES BY SALARY RANGE
// ─────────────────────────────────────────────────────────────────────────────

export const getEmployeesBySalaryRange = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        
        if (!permissions.canView) {
            return handleForbiddenError(res, 'You do not have permission to view employees for this company');
        }

        const Employee = getEmployeeModel(req);
        const { minSalary, maxSalary } = req.query;

        if (!minSalary && !maxSalary) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one salary parameter (minSalary or maxSalary)',
            });
        }

        const whereClause: any = {};

        if (!isAdminForCurrentCompany(req)) {
            const localUserId = getLocalUserIdForCurrentCompany(req);
            if (localUserId != null) whereClause.User_Mgt_Id = localUserId;
        }

        if (minSalary) {
            const n = parseFloat(minSalary as string);
            if (!isNaN(n)) whereClause.Salary = { ...whereClause.Salary, [Op.gte]: n };
        }
        if (maxSalary) {
            const n = parseFloat(maxSalary as string);
            if (!isNaN(n)) whereClause.Salary = { ...whereClause.Salary, [Op.lte]: n };
        }

        const employees = await Employee.findAll({
            where: whereClause,
            order: [['Salary', 'DESC'], ['Emp_Name', 'ASC']],
        });

        const formatted = employees.map((e: any) => formatEmployeeForResponse(e));

        return res.status(200).json({
            success: true,
            message: 'Employees fetched by salary range',
            data: formatted,
            count: formatted.length,
        });

    } catch (error: any) {
        console.error('Error fetching employees by salary range:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET CURRENT COMPANY PERMISSIONS (Helper endpoint for frontend)
// ─────────────────────────────────────────────────────────────────────────────

export const getCurrentPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = getUserPermissionsForCurrentCompany(req);
        const currentCompany = (req as any).currentCompany;
        
        return res.status(200).json({
            success: true,
            message: 'Current company permissions retrieved successfully',
            data: {
                companyId: currentCompany?.id || null,
                companyName: currentCompany?.name || null,
                userTypeId: permissions.userTypeId,
                permissions: {
                    canView: permissions.canView,
                    canCreate: permissions.canCreate,
                    canUpdate: permissions.canUpdate,
                    canDelete: permissions.canDelete
                }
            }
        });
    } catch (error: any) {
        console.error('Error getting permissions:', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};