"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDropdowns = exports.getCompanyDropdown = exports.getProjectsDropdown = exports.getTaskDropdown = exports.searchEmployeesController = exports.getEmployeeDropdown = exports.getProjectStatusDropdown = exports.getProjectHeadDropdown = void 0;
const dropdown_model_1 = __importDefault(require("../../models/dropdown/dropdown.model"));
// ─── Project Heads ────────────────────────────────────────────────────────────
const getProjectHeadDropdown = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data = await dropdown_model_1.default.getProjectHeads(activeOnly, req);
        res.status(200).json({
            success: true,
            message: 'Project heads retrieved successfully',
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ getProjectHeadDropdown:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve project heads',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.getProjectHeadDropdown = getProjectHeadDropdown;
// ─── Project Status ───────────────────────────────────────────────────────────
const getProjectStatusDropdown = async (req, res) => {
    try {
        const data = await dropdown_model_1.default.getProjectStatus();
        res.status(200).json({
            success: true,
            message: 'Project status options retrieved successfully',
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ getProjectStatusDropdown:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve project status options',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.getProjectStatusDropdown = getProjectStatusDropdown;
// ─── Employees ────────────────────────────────────────────────────────────────
const getEmployeeDropdown = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data = await dropdown_model_1.default.getEmployees(activeOnly, req);
        res.status(200).json({
            success: true,
            message: 'Employees retrieved successfully',
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ getEmployeeDropdown:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve employees',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.getEmployeeDropdown = getEmployeeDropdown;
// ─── Search Employees ─────────────────────────────────────────────────────────
const searchEmployeesController = async (req, res) => {
    try {
        const { search, activeOnly = 'true' } = req.query;
        if (!search || typeof search !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Search term is required',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (search.length < 2) {
            res.status(400).json({
                success: false,
                message: 'Search term must be at least 2 characters',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const data = await dropdown_model_1.default.searchEmployees(search, activeOnly !== 'false', req);
        res.status(200).json({
            success: true,
            message: 'Employees search completed successfully',
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ searchEmployeesController:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search employees',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.searchEmployeesController = searchEmployeesController;
// ─── Tasks ────────────────────────────────────────────────────────────────────
const getTaskDropdown = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data = await dropdown_model_1.default.getTasks(activeOnly, req);
        res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ getTaskDropdown:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve tasks',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.getTaskDropdown = getTaskDropdown;
// ─── Projects ─────────────────────────────────────────────────────────────────
const getProjectsDropdown = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data = await dropdown_model_1.default.getProjects(activeOnly, req);
        res.status(200).json({
            success: true,
            message: 'Projects retrieved successfully',
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ getProjectsDropdown:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve projects',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.getProjectsDropdown = getProjectsDropdown;
// ─── Company ──────────────────────────────────────────────────────────────────
const getCompanyDropdown = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data = await dropdown_model_1.default.getCompany(activeOnly, req);
        res.status(200).json({
            success: true,
            message: 'Company retrieved successfully',
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ getCompanyDropdown:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve company',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.getCompanyDropdown = getCompanyDropdown;
// ─── All Dropdowns ────────────────────────────────────────────────────────────
const getAllDropdowns = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data = await dropdown_model_1.default.getAllDropdowns(activeOnly, req);
        res.status(200).json({
            success: true,
            message: 'All dropdowns retrieved successfully',
            data,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ getAllDropdowns:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dropdowns',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.getAllDropdowns = getAllDropdowns;
exports.default = {
    getProjectHeadDropdown: exports.getProjectHeadDropdown,
    getProjectStatusDropdown: exports.getProjectStatusDropdown,
    getEmployeeDropdown: exports.getEmployeeDropdown,
    searchEmployeesController: exports.searchEmployeesController,
    getTaskDropdown: exports.getTaskDropdown,
    getProjectsDropdown: exports.getProjectsDropdown,
    getCompanyDropdown: exports.getCompanyDropdown,
    getAllDropdowns: exports.getAllDropdowns,
};
