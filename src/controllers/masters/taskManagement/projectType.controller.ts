// controllers/masters/taskManagement/projectType.controller.ts
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
import { initProjectModel, getProjectStatusText, formatProjectForResponse, getStatusText } from '../../../models/masters/project/type.model';
import {
    projectCreateSchema,
    projectUpdateSchema,
    projectIdSchema,
    ProjectCreateInput,
    ProjectUpdateInput
} from '../../../models/masters/project/type.model';

const validateWithZod = <T>(schema: any, data: any): {
    success: boolean;
    data?: T;
    errors?: Array<{ field: string; message: string }>
} => {
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
                    message: err.message || 'Validation error'
                }))
            };
        }
        return {
            success: false,
            errors: [{ field: 'unknown', message: 'Validation failed' }]
        };
    }
};

// Helper to get Project model with the correct database connection
const getProjectModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initProjectModel(sequelize);
};

// Enhanced error handler for 403 Forbidden
const handleForbiddenError = (res: Response, customMessage?: string) => {
    return res.status(403).json({
        success: false,
        message: customMessage || 'Access denied. You do not have permission to perform this action.',
        error: 'FORBIDDEN'
    });
};

// Check user permissions
const checkUserPermission = (req: Request, requiredPermission?: string): boolean => {
    const user = (req as any).user;
    
    if (!user) {
        return false;
    }
    
    // UserTypeId 0 = Super Admin - full access
    if (user.UserTypeId === 0) {
        return true;
    }
    
    // Add your permission logic here based on UserTypeId
    if (requiredPermission === 'create_projects' && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'update_projects' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'delete_projects' && user.UserTypeId !== 1) {
        return false;
    }
    if (requiredPermission === 'view_projects' && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(user.UserTypeId)) {
        return false;
    }
    
    return true;
};

/**
 * Get all projects (no pagination, no filters)
 */
export const getAllProjects = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Build where clause
        const whereClause: any = {};
        
        // Add company filter if user has company restriction
        const user = (req as any).user;
        if (user && user.currentCompanyId) {
            whereClause.Company_Id = user.currentCompanyId;
        }

        // Use raw query for performance on large datasets
        const sequelize = (req as any).companyDB;
        let whereStr = '1=1';
        const replacements: any = {};
        
        if (user && user.currentCompanyId) {
            whereStr += ' AND Company_Id = :companyId';
            replacements.companyId = user.currentCompanyId;
        }

        const rawQuery = `
            SELECT * FROM tbl_Project_Master WITH (NOLOCK)
            WHERE ${whereStr}
            ORDER BY Project_Id DESC
        `;
        
        const projects = await sequelize.query(rawQuery, {
            replacements,
            type: sequelize.QueryTypes?.SELECT || 'SELECT'
        });

        // Format projects with status text
        const formattedProjects = projects.map((project: any) => ({
            ...project,
            statusText: getStatusText(project.IsActive),
            projectStatusText: getProjectStatusText(project.Project_Status)
        }));

        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: formattedProjects
        });

    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get project by ID
 */
export const getProjectById = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(projectIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const project = await Project.findByPk(id);
        
        if (!project) {
            return notFound(res, 'Project not found');
        }
        
        // Check if user has access to this project
        const user = (req as any).user;
        if (user && user.currentCompanyId && project.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to access this project');
        }

        // Format project with status text
        const formattedProject = formatProjectForResponse(project);

        return res.status(200).json({
            success: true,
            message: 'Project retrieved successfully',
            data: formattedProject
        });

    } catch (error: any) {
        console.error('Error fetching project:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get projects by company ID
 */
export const getProjectsByCompany = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        const { companyId } = req.params;
        
        if (!companyId || isNaN(parseInt(companyId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid company ID is required'
            });
        }
        
        // Check if user has access to this company
        const user = (req as any).user;
        if (user && user.currentCompanyId && parseInt(companyId) !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to view projects for this company');
        }

        const projects = await Project.findAll({
            where: { 
                Company_Id: parseInt(companyId),
                IsActive: 1 
            },
            order: [['Project_Name', 'ASC']]
        });

        // Format projects with status text
        const formattedProjects = projects.map(project => formatProjectForResponse(project));

        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: formattedProjects
        });

    } catch (error: any) {
        console.error('Error fetching projects by company:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get projects by project head ID
 */
export const getProjectsByProjectHead = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        const { projectHeadId } = req.params;
        
        if (!projectHeadId || isNaN(parseInt(projectHeadId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid project head ID is required'
            });
        }

        const projects = await Project.findAll({
            where: { 
                Project_Head: parseInt(projectHeadId),
                IsActive: 1 
            },
            order: [['Project_Name', 'ASC']]
        });

        // Format projects with status text
        const formattedProjects = projects.map(project => formatProjectForResponse(project));

        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: formattedProjects
        });

    } catch (error: any) {
        console.error('Error fetching projects by project head:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get projects by status
 */
export const getProjectsByStatus = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        const { status } = req.params;
        
        if (!status || isNaN(parseInt(status))) {
            return res.status(400).json({
                success: false,
                message: 'Valid project status is required'
            });
        }

        const statusNum = parseInt(status);
        if (statusNum < 0 || statusNum > 5) {
            return res.status(400).json({
                success: false,
                message: 'Project status must be between 0 and 5'
            });
        }

        const projects = await Project.findAll({
            where: { 
                Project_Status: statusNum,
                IsActive: 1 
            },
            order: [['Project_Name', 'ASC']]
        });

        // Format projects with status text
        const formattedProjects = projects.map(project => formatProjectForResponse(project));

        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: formattedProjects
        });

    } catch (error: any) {
        console.error('Error fetching projects by status:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get active projects
 */
export const getActiveProjects = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        const projects = await Project.findAll({
            where: { 
                IsActive: 1 
            },
            order: [['Project_Name', 'ASC']]
        });

        // Format projects with status text
        const formattedProjects = projects.map(project => formatProjectForResponse(project));

        return res.status(200).json({
            success: true,
            message: 'Active projects retrieved successfully',
            data: formattedProjects
        });

    } catch (error: any) {
        console.error('Error fetching active projects:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Create new project
 */
export const createProject = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_projects')) {
            return handleForbiddenError(res, 'You do not have permission to create projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Validate request body
        const validation = validateWithZod<ProjectCreateInput>(projectCreateSchema, req.body);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const projectData = validation.data!;

        // Check for duplicate project name
        const existingProject = await Project.findOne({
            where: {
                Project_Name: projectData.Project_Name.trim()
            }
        });

        if (existingProject) {
            return res.status(409).json({
                success: false,
                message: 'Project with this name already exists'
            });
        }

        // Get user from request (set by authentication middleware)
        const user = (req as any).user;
        
        // Prepare project data with additional fields
        const finalProjectData: any = {
            ...projectData,
            Project_Name: projectData.Project_Name.trim(),
            Project_Desc: projectData.Project_Desc ? projectData.Project_Desc.trim() : null,
            Company_Id: (req as any).currentCompanyId || projectData.Company_Id || null,
            Project_Head: projectData.Project_Head || null,
            Project_Status: projectData.Project_Status || 1,
            Entry_By: user?.Global_User_ID || 1,
            Entry_Date: new Date(),
            IsActive: projectData.IsActive || 1
        };

        const project = await Project.create(finalProjectData);
        
        // Format project with status text
        const formattedProject = formatProjectForResponse(project);
        
        return created(res, {
            success: true,
            message: 'Project created successfully',
            data: formattedProject
        });

    } catch (error: any) {
        console.error('Error creating project:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Update project
 */
export const updateProject = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_projects')) {
            return handleForbiddenError(res, 'You do not have permission to update projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(projectIdSchema, { id: parseInt(req.params.id) });
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Validate request body
        const bodyValidation = validateWithZod<ProjectUpdateInput>(projectUpdateSchema, req.body);
        
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }

        const updateData = bodyValidation.data!;

        const project = await Project.findByPk(id);
        
        if (!project) {
            return notFound(res, 'Project not found');
        }
        
        // Check if user has access to this project
        const user = (req as any).user;
        if (user && user.currentCompanyId && project.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to update this project');
        }

        // Check for duplicate project name if Project_Name is being updated
        if (updateData.Project_Name && updateData.Project_Name !== project.Project_Name) {
            
            const existingProject = await Project.findOne({
                where: {
                    Project_Id: { [Op.ne]: id },
                    Project_Name: updateData.Project_Name.trim()
                }
            });

            if (existingProject) {
                return res.status(409).json({
                    success: false,
                    message: 'Another project with this name already exists'
                });
            }
        }

        // Prepare update data
        const finalUpdateData: any = {};
        if (updateData.Project_Name !== undefined) finalUpdateData.Project_Name = updateData.Project_Name.trim();
        if (updateData.Project_Desc !== undefined) finalUpdateData.Project_Desc = updateData.Project_Desc ? updateData.Project_Desc.trim() : null;
        if (updateData.Company_Id !== undefined) finalUpdateData.Company_Id = updateData.Company_Id;
        if (updateData.Project_Head !== undefined) finalUpdateData.Project_Head = updateData.Project_Head;
        if (updateData.Est_Start_Dt !== undefined) finalUpdateData.Est_Start_Dt = updateData.Est_Start_Dt;
        if (updateData.Est_End_Dt !== undefined) finalUpdateData.Est_End_Dt = updateData.Est_End_Dt;
        if (updateData.Project_Status !== undefined) finalUpdateData.Project_Status = updateData.Project_Status;
        if (updateData.IsActive !== undefined) finalUpdateData.IsActive = updateData.IsActive;
        
        // Add update metadata
        finalUpdateData.Update_By = user?.Global_User_ID || 1;
        finalUpdateData.Update_Date = new Date();

        await project.update(finalUpdateData);
        
        const updatedProject = await Project.findByPk(id);
        
        if (!updatedProject) {
            return notFound(res, 'Project not found after update');
        }

        // Format project with status text
        const formattedProject = formatProjectForResponse(updatedProject);
        
        return updated(res, {
            success: true,
            message: 'Project updated successfully',
            data: formattedProject
        });

    } catch (error: any) {
        console.error('Error updating project:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Delete project (soft delete)
 */
export const deleteProject = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_projects')) {
            return handleForbiddenError(res, 'You do not have permission to delete projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(projectIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const project = await Project.findByPk(id);
        
        if (!project) {
            return notFound(res, 'Project not found');
        }
        
        // Check if user has access to this project
        const user = (req as any).user;
        if (user && user.currentCompanyId && project.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to delete this project');
        }

        // Soft delete: Set IsActive to 0
        await project.update({
            IsActive: 0,
            Update_By: user?.Global_User_ID || 1,
            Update_Date: new Date()
        });
        
        return res.status(200).json({
            success: true,
            message: 'Project deactivated successfully'
        });

    } catch (error: any) {
        console.error('Error deleting project:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get projects with no company
 */
export const getProjectsWithNoCompany = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        const projects = await Project.findAll({
            where: { 
                Company_Id: null,
                IsActive: 1 
            },
            order: [['Project_Name', 'ASC']]
        });

        const formattedProjects = projects.map(project => formatProjectForResponse(project));

        return res.status(200).json({
            success: true,
            message: 'Projects with no company retrieved successfully',
            data: formattedProjects
        });

    } catch (error: any) {
        console.error('Error fetching projects with no company:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get projects with no project head
 */
export const getProjectsWithNoProjectHead = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        const projects = await Project.findAll({
            where: { 
                Project_Head: null,
                IsActive: 1 
            },
            order: [['Project_Name', 'ASC']]
        });

        const formattedProjects = projects.map(project => formatProjectForResponse(project));

        return res.status(200).json({
            success: true,
            message: 'Projects with no project head retrieved successfully',
            data: formattedProjects
        });

    } catch (error: any) {
        console.error('Error fetching projects with no project head:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Toggle project active status
 */
export const toggleProjectStatus = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_projects')) {
            return handleForbiddenError(res, 'You do not have permission to update projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(projectIdSchema, { id: parseInt(req.params.id) });
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        const project = await Project.findByPk(id);
        
        if (!project) {
            return notFound(res, 'Project not found');
        }
        
        // Check if user has access to this project
        const user = (req as any).user;
        if (user && user.currentCompanyId && project.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to modify this project');
        }

        // Toggle active status (1 to 0, 0 to 1)
        const newStatus = project.IsActive === 1 ? 0 : 1;
        
        await project.update({
            IsActive: newStatus,
            Update_By: user?.Global_User_ID || 1,
            Update_Date: new Date()
        });

        const updatedProject = await Project.findByPk(id);
        
        if (!updatedProject) {
            return notFound(res, 'Project not found after update');
        }

        const formattedProject = formatProjectForResponse(updatedProject);

        return updated(res, {
            success: true,
            message: `Project ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
            data: formattedProject
        });

    } catch (error: any) {
        console.error('Error toggling project status:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get projects statistics
 */
export const getProjectStatistics = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view project statistics');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        const totalProjects = await Project.count();
        const activeProjects = await Project.count({ where: { IsActive: 1 } });
        const inactiveProjects = await Project.count({ where: { IsActive: 0 } });
        
        // Count projects by status
        const statusCounts: any = {};
        const statusTextMap: any = {};
        for (let i = 0; i <= 5; i++) {
            const count = await Project.count({ where: { Project_Status: i, IsActive: 1 } });
            statusCounts[`status_${i}`] = count;
            statusTextMap[`status_${i}_text`] = getProjectStatusText(i);
        }

        // Count projects with no company
        const noCompanyCount = await Project.count({ 
            where: { 
                Company_Id: null,
                IsActive: 1 
            } 
        });

        // Count projects with no project head
        const noProjectHeadCount = await Project.count({ 
            where: { 
                Project_Head: null,
                IsActive: 1 
            } 
        });

        return res.status(200).json({
            success: true,
            message: 'Project statistics retrieved successfully',
            data: {
                totalProjects,
                activeProjects: {
                    count: activeProjects,
                    text: 'Active'
                },
                inactiveProjects: {
                    count: inactiveProjects,
                    text: 'Inactive'
                },
                statusCounts,
                statusTextMap,
                noCompanyCount,
                noProjectHeadCount
            }
        });

    } catch (error: any) {
        console.error('Error fetching project statistics:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get all status options for dropdown
 */
export const getStatusOptions = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view status options');
        }
        
        const activeStatusOptions = [
            { value: 1, label: 'Active' },
            { value: 0, label: 'Inactive' }
        ];

        const projectStatusOptions = [
            { value: 0, label: 'Not Started' },
            { value: 1, label: 'Planning' },
            { value: 2, label: 'In Progress' },
            { value: 3, label: 'On Hold' },
            { value: 4, label: 'Completed' },
            { value: 5, label: 'Cancelled' }
        ];

        return res.status(200).json({
            success: true,
            message: 'Status options retrieved successfully',
            data: {
                activeStatus: activeStatusOptions,
                projectStatus: projectStatusOptions
            }
        });

    } catch (error: any) {
        console.error('Error fetching status options:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Hard delete project (permanent delete)
 */
export const hardDeleteProject = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission (admin only)
        if (!checkUserPermission(req, 'admin_delete_projects')) {
            return handleForbiddenError(res, 'You do not have permission to permanently delete projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(projectIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const project = await Project.findByPk(id);
        
        if (!project) {
            return notFound(res, 'Project not found');
        }

        await project.destroy();
        
        return res.status(200).json({
            success: true,
            message: 'Project permanently deleted successfully'
        });

    } catch (error: any) {
        console.error('Error hard deleting project:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Reactivate project
 */
export const reactivateProject = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_projects')) {
            return handleForbiddenError(res, 'You do not have permission to reactivate projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(projectIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const project = await Project.findByPk(id);
        
        if (!project) {
            return notFound(res, 'Project not found');
        }
        
        // Check if user has access to this project
        const user = (req as any).user;
        if (user && user.currentCompanyId && project.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to reactivate this project');
        }

        // Set project to active
        await project.update({
            IsActive: 1,
            Update_By: user?.Global_User_ID || 1,
            Update_Date: new Date()
        });

        const updatedProject = await Project.findByPk(id);
        
        if (!updatedProject) {
            return notFound(res, 'Project not found after update');
        }

        // Format project with status text
        const formattedProject = formatProjectForResponse(updatedProject);

        return updated(res, {
            success: true,
            message: 'Project reactivated successfully',
            data: formattedProject
        });

    } catch (error: any) {
        console.error('Error reactivating project:', error);
        return servError(res, error.message || 'Internal server error');
    }
};

/**
 * Get projects for dropdown (simplified response for dropdown components)
 * Returns all project fields with Project_Id as string for frontend compatibility
 */
export const getProjectsForDropdown = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        
        // Build where clause
        const whereClause: any = {
            IsActive: 1  // Only active projects for dropdown
        };
        
        // Add company filter if user has company restriction
        const user = (req as any).user;
        if (user && user.currentCompanyId) {
            whereClause.Company_Id = user.currentCompanyId;
        }

        const projects = await Project.findAll({
            where: whereClause,
            order: [['Project_Name', 'ASC']]
        });

        // Format projects with status text for dropdown
        const formattedProjects = projects.map(project => {
            const projectData = project.get({ plain: true });
            return {
                Project_Id: String(projectData.Project_Id),
                Project_Name: projectData.Project_Name,
                Project_Desc: projectData.Project_Desc,
                Company_Id: projectData.Company_Id,
                Project_Head: projectData.Project_Head,
                Est_Start_Dt: projectData.Est_Start_Dt,
                Est_End_Dt: projectData.Est_End_Dt,
                Project_Status: projectData.Project_Status,
                Entry_By: projectData.Entry_By,
                Entry_Date: projectData.Entry_Date,
                Update_By: projectData.Update_By,
                Update_Date: projectData.Update_Date,
                IsActive: projectData.IsActive,
                statusText: getStatusText(projectData.IsActive ?? 1),
                projectStatusText: getProjectStatusText(projectData.Project_Status ?? 1)
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully for dropdown',
            data: formattedProjects
        });

    } catch (error: any) {
        console.error('Error fetching projects for dropdown:', error);
        return servError(res, error.message || 'Internal server error');
    }
};