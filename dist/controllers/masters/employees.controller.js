"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEmployees = exports.getEmployeesByProject = void 0;
const sequalizer_1 = require("../../config/sequalizer");
const sequelize_1 = require("sequelize");
// Get employees by project ID from tbl_Project_Employee
const getEmployeesByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID is required'
            });
        }
        // Query to get employees assigned to this project from tbl_Project_Employee
        const employees = await sequalizer_1.sequelize.query(`
            SELECT DISTINCT 
                e.Emp_Id,
                e.Emp_Name,
                e.Emp_Code,
                e.Department,
                e.Designation,
                e.Email,
                e.Mobile
            FROM tbl_Employee_Master e WITH (NOLOCK)
            INNER JOIN tbl_Project_Employee pe WITH (NOLOCK) ON e.Emp_Id = pe.Emp_Id
            WHERE pe.Project_Id = :projectId 
            AND (pe.Del_Flag IS NULL OR pe.Del_Flag = 0)
            AND (e.Del_Flag IS NULL OR e.Del_Flag = 0)
            ORDER BY e.Emp_Name
        `, {
            replacements: { projectId },
            type: sequelize_1.QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: 'Employees retrieved successfully',
            data: employees
        });
    }
    catch (error) {
        console.error('Error fetching employees by project:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
exports.getEmployeesByProject = getEmployeesByProject;
// Get all employees (existing function)
const getAllEmployees = async (req, res) => {
    try {
        const employees = await sequalizer_1.sequelize.query(`
            SELECT 
                Emp_Id,
                Emp_Name,
                Emp_Code,
                Department,
                Designation,
                Email,
                Mobile
            FROM tbl_Employee_Master WITH (NOLOCK)
            WHERE Del_Flag IS NULL OR Del_Flag = 0
            ORDER BY Emp_Name
        `, {
            type: sequelize_1.QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: 'Employees retrieved successfully',
            data: employees
        });
    }
    catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
exports.getAllEmployees = getAllEmployees;
