"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsForDropdown = exports.reactivateProject = exports.hardDeleteProject = exports.getStatusOptions = exports.getProjectStatistics = exports.toggleProjectStatus = exports.getProjectsWithNoProjectHead = exports.getProjectsWithNoCompany = exports.deleteProject = exports.updateProject = exports.createProject = exports.getActiveProjects = exports.getProjectsByStatus = exports.getProjectsByProjectHead = exports.getProjectsByCompany = exports.getProjectById = exports.getAllProjects = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const responseObject_1 = require("../../../responseObject");
const type_model_1 = require("../../../models/masters/project/type.model");
const type_model_2 = require("../../../models/masters/project/type.model");
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
const getProjectModel = (req) => {
    const sequelize = req.companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return (0, type_model_1.initProjectModel)(sequelize);
};
// Enhanced error handler for 403 Forbidden
const handleForbiddenError = (res, customMessage) => {
    return res.status(403).json({
        success: false,
        message: customMessage || 'Access denied. You do not have permission to perform this action.',
        error: 'FORBIDDEN'
    });
};
// Check user permissions
const checkUserPermission = (req, requiredPermission) => {
    const user = req.user;
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
const getAllProjects = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Build where clause
        const whereClause = {};
        // Add company filter if user has company restriction
        const user = req.user;
        if (user && user.currentCompanyId) {
            whereClause.Company_Id = user.currentCompanyId;
        }
        // Use raw query for performance on large datasets
        const sequelize = req.companyDB;
        let whereStr = '1=1';
        const replacements = {};
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
        const formattedProjects = projects.map((project) => ({
            ...project,
            statusText: (0, type_model_1.getStatusText)(project.IsActive),
            projectStatusText: (0, type_model_1.getProjectStatusText)(project.Project_Status)
        }));
        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: formattedProjects
        });
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getAllProjects = getAllProjects;
/**
 * Get project by ID
 */
const getProjectById = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Validate ID parameter
        const validation = validateWithZod(type_model_2.projectIdSchema, { id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { id } = validation.data;
        const project = await Project.findByPk(id);
        if (!project) {
            return (0, responseObject_1.notFound)(res, 'Project not found');
        }
        // Check if user has access to this project
        const user = req.user;
        if (user && user.currentCompanyId && project.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to access this project');
        }
        // Format project with status text
        const formattedProject = (0, type_model_1.formatProjectForResponse)(project);
        return res.status(200).json({
            success: true,
            message: 'Project retrieved successfully',
            data: formattedProject
        });
    }
    catch (error) {
        console.error('Error fetching project:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getProjectById = getProjectById;
/**
 * Get projects by company ID
 */
const getProjectsByCompany = async (req, res) => {
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
        const user = req.user;
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
        const formattedProjects = projects.map(project => (0, type_model_1.formatProjectForResponse)(project));
        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: formattedProjects
        });
    }
    catch (error) {
        console.error('Error fetching projects by company:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getProjectsByCompany = getProjectsByCompany;
/**
 * Get projects by project head ID
 */
const getProjectsByProjectHead = async (req, res) => {
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
        const formattedProjects = projects.map(project => (0, type_model_1.formatProjectForResponse)(project));
        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: formattedProjects
        });
    }
    catch (error) {
        console.error('Error fetching projects by project head:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getProjectsByProjectHead = getProjectsByProjectHead;
/**
 * Get projects by status
 */
const getProjectsByStatus = async (req, res) => {
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
        const formattedProjects = projects.map(project => (0, type_model_1.formatProjectForResponse)(project));
        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data: formattedProjects
        });
    }
    catch (error) {
        console.error('Error fetching projects by status:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getProjectsByStatus = getProjectsByStatus;
/**
 * Get active projects
 */
const getActiveProjects = async (req, res) => {
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
        const formattedProjects = projects.map(project => (0, type_model_1.formatProjectForResponse)(project));
        return res.status(200).json({
            success: true,
            message: 'Active projects retrieved successfully',
            data: formattedProjects
        });
    }
    catch (error) {
        console.error('Error fetching active projects:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getActiveProjects = getActiveProjects;
/**
 * Create new project
 */
const createProject = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_projects')) {
            return handleForbiddenError(res, 'You do not have permission to create projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Validate request body
        const validation = validateWithZod(type_model_2.projectCreateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const projectData = validation.data;
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
        const user = req.user;
        // Prepare project data with additional fields
        const finalProjectData = {
            ...projectData,
            Project_Name: projectData.Project_Name.trim(),
            Project_Desc: projectData.Project_Desc ? projectData.Project_Desc.trim() : null,
            Company_Id: req.currentCompanyId || projectData.Company_Id || null,
            Project_Head: projectData.Project_Head || null,
            Project_Status: projectData.Project_Status || 1,
            Entry_By: user?.Global_User_ID || 1,
            Entry_Date: new Date(),
            IsActive: projectData.IsActive || 1
        };
        const project = await Project.create(finalProjectData);
        // Format project with status text
        const formattedProject = (0, type_model_1.formatProjectForResponse)(project);
        return (0, responseObject_1.created)(res, {
            success: true,
            message: 'Project created successfully',
            data: formattedProject
        });
    }
    catch (error) {
        console.error('Error creating project:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.createProject = createProject;
/**
 * Update project
 */
const updateProject = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_projects')) {
            return handleForbiddenError(res, 'You do not have permission to update projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Validate ID parameter
        const idValidation = validateWithZod(type_model_2.projectIdSchema, { id: parseInt(req.params.id) });
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }
        const { id } = idValidation.data;
        // Validate request body
        const bodyValidation = validateWithZod(type_model_2.projectUpdateSchema, req.body);
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }
        const updateData = bodyValidation.data;
        const project = await Project.findByPk(id);
        if (!project) {
            return (0, responseObject_1.notFound)(res, 'Project not found');
        }
        // Check if user has access to this project
        const user = req.user;
        if (user && user.currentCompanyId && project.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to update this project');
        }
        // Check for duplicate project name if Project_Name is being updated
        if (updateData.Project_Name && updateData.Project_Name !== project.Project_Name) {
            const existingProject = await Project.findOne({
                where: {
                    Project_Id: { [sequelize_1.Op.ne]: id },
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
        const finalUpdateData = {};
        if (updateData.Project_Name !== undefined)
            finalUpdateData.Project_Name = updateData.Project_Name.trim();
        if (updateData.Project_Desc !== undefined)
            finalUpdateData.Project_Desc = updateData.Project_Desc ? updateData.Project_Desc.trim() : null;
        if (updateData.Company_Id !== undefined)
            finalUpdateData.Company_Id = updateData.Company_Id;
        if (updateData.Project_Head !== undefined)
            finalUpdateData.Project_Head = updateData.Project_Head;
        if (updateData.Est_Start_Dt !== undefined)
            finalUpdateData.Est_Start_Dt = updateData.Est_Start_Dt;
        if (updateData.Est_End_Dt !== undefined)
            finalUpdateData.Est_End_Dt = updateData.Est_End_Dt;
        if (updateData.Project_Status !== undefined)
            finalUpdateData.Project_Status = updateData.Project_Status;
        if (updateData.IsActive !== undefined)
            finalUpdateData.IsActive = updateData.IsActive;
        // Add update metadata
        finalUpdateData.Update_By = user?.Global_User_ID || 1;
        finalUpdateData.Update_Date = new Date();
        await project.update(finalUpdateData);
        const updatedProject = await Project.findByPk(id);
        if (!updatedProject) {
            return (0, responseObject_1.notFound)(res, 'Project not found after update');
        }
        // Format project with status text
        const formattedProject = (0, type_model_1.formatProjectForResponse)(updatedProject);
        return (0, responseObject_1.updated)(res, {
            success: true,
            message: 'Project updated successfully',
            data: formattedProject
        });
    }
    catch (error) {
        console.error('Error updating project:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.updateProject = updateProject;
/**
 * Delete project (soft delete)
 */
const deleteProject = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_projects')) {
            return handleForbiddenError(res, 'You do not have permission to delete projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Validate ID parameter
        const validation = validateWithZod(type_model_2.projectIdSchema, { id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { id } = validation.data;
        const project = await Project.findByPk(id);
        if (!project) {
            return (0, responseObject_1.notFound)(res, 'Project not found');
        }
        // Check if user has access to this project
        const user = req.user;
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
    }
    catch (error) {
        console.error('Error deleting project:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.deleteProject = deleteProject;
/**
 * Get projects with no company
 */
const getProjectsWithNoCompany = async (req, res) => {
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
        const formattedProjects = projects.map(project => (0, type_model_1.formatProjectForResponse)(project));
        return res.status(200).json({
            success: true,
            message: 'Projects with no company retrieved successfully',
            data: formattedProjects
        });
    }
    catch (error) {
        console.error('Error fetching projects with no company:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getProjectsWithNoCompany = getProjectsWithNoCompany;
/**
 * Get projects with no project head
 */
const getProjectsWithNoProjectHead = async (req, res) => {
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
        const formattedProjects = projects.map(project => (0, type_model_1.formatProjectForResponse)(project));
        return res.status(200).json({
            success: true,
            message: 'Projects with no project head retrieved successfully',
            data: formattedProjects
        });
    }
    catch (error) {
        console.error('Error fetching projects with no project head:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getProjectsWithNoProjectHead = getProjectsWithNoProjectHead;
/**
 * Toggle project active status
 */
const toggleProjectStatus = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_projects')) {
            return handleForbiddenError(res, 'You do not have permission to update projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Validate ID parameter
        const idValidation = validateWithZod(type_model_2.projectIdSchema, { id: parseInt(req.params.id) });
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }
        const { id } = idValidation.data;
        const project = await Project.findByPk(id);
        if (!project) {
            return (0, responseObject_1.notFound)(res, 'Project not found');
        }
        // Check if user has access to this project
        const user = req.user;
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
            return (0, responseObject_1.notFound)(res, 'Project not found after update');
        }
        const formattedProject = (0, type_model_1.formatProjectForResponse)(updatedProject);
        return (0, responseObject_1.updated)(res, {
            success: true,
            message: `Project ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
            data: formattedProject
        });
    }
    catch (error) {
        console.error('Error toggling project status:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.toggleProjectStatus = toggleProjectStatus;
/**
 * Get projects statistics
 */
const getProjectStatistics = async (req, res) => {
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
        const statusCounts = {};
        const statusTextMap = {};
        for (let i = 0; i <= 5; i++) {
            const count = await Project.count({ where: { Project_Status: i, IsActive: 1 } });
            statusCounts[`status_${i}`] = count;
            statusTextMap[`status_${i}_text`] = (0, type_model_1.getProjectStatusText)(i);
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
    }
    catch (error) {
        console.error('Error fetching project statistics:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getProjectStatistics = getProjectStatistics;
/**
 * Get all status options for dropdown
 */
const getStatusOptions = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching status options:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getStatusOptions = getStatusOptions;
/**
 * Hard delete project (permanent delete)
 */
const hardDeleteProject = async (req, res) => {
    try {
        // Check authentication and permission (admin only)
        if (!checkUserPermission(req, 'admin_delete_projects')) {
            return handleForbiddenError(res, 'You do not have permission to permanently delete projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Validate ID parameter
        const validation = validateWithZod(type_model_2.projectIdSchema, { id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { id } = validation.data;
        const project = await Project.findByPk(id);
        if (!project) {
            return (0, responseObject_1.notFound)(res, 'Project not found');
        }
        await project.destroy();
        return res.status(200).json({
            success: true,
            message: 'Project permanently deleted successfully'
        });
    }
    catch (error) {
        console.error('Error hard deleting project:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.hardDeleteProject = hardDeleteProject;
/**
 * Reactivate project
 */
const reactivateProject = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_projects')) {
            return handleForbiddenError(res, 'You do not have permission to reactivate projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Validate ID parameter
        const validation = validateWithZod(type_model_2.projectIdSchema, { id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { id } = validation.data;
        const project = await Project.findByPk(id);
        if (!project) {
            return (0, responseObject_1.notFound)(res, 'Project not found');
        }
        // Check if user has access to this project
        const user = req.user;
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
            return (0, responseObject_1.notFound)(res, 'Project not found after update');
        }
        // Format project with status text
        const formattedProject = (0, type_model_1.formatProjectForResponse)(updatedProject);
        return (0, responseObject_1.updated)(res, {
            success: true,
            message: 'Project reactivated successfully',
            data: formattedProject
        });
    }
    catch (error) {
        console.error('Error reactivating project:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.reactivateProject = reactivateProject;
/**
 * Get projects for dropdown (simplified response for dropdown components)
 * Returns all project fields with Project_Id as string for frontend compatibility
 */
const getProjectsForDropdown = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_projects')) {
            return handleForbiddenError(res, 'You do not have permission to view projects');
        }
        // Get the Project model for this company's database
        const Project = getProjectModel(req);
        // Build where clause
        const whereClause = {
            IsActive: 1 // Only active projects for dropdown
        };
        // Add company filter if user has company restriction
        const user = req.user;
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
                statusText: (0, type_model_1.getStatusText)(projectData.IsActive ?? 1),
                projectStatusText: (0, type_model_1.getProjectStatusText)(projectData.Project_Status ?? 1)
            };
        });
        return res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully for dropdown',
            data: formattedProjects
        });
    }
    catch (error) {
        console.error('Error fetching projects for dropdown:', error);
        return (0, responseObject_1.servError)(res, error.message || 'Internal server error');
    }
};
exports.getProjectsForDropdown = getProjectsForDropdown;
