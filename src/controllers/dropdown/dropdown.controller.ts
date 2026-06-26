// src/controllers/dropdown/dropdown.controller.ts
import { Request, Response } from 'express';
import dropdownModel         from '../../models/dropdown/dropdown.model';

interface ApiResponse {
    success:   boolean;
    message:   string;
    data?:     any;
    count?:    number;
    error?:    string;
    timestamp: string;
}

// ─── Project Heads ────────────────────────────────────────────────────────────

export const getProjectHeadDropdown = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data       = await dropdownModel.getProjectHeads(activeOnly, req);

        res.status(200).json(<ApiResponse>{
            success:   true,
            message:   'Project heads retrieved successfully',
            data,
            count:     data.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ getProjectHeadDropdown:', error);
        res.status(500).json(<ApiResponse>{
            success:   false,
            message:   'Failed to retrieve project heads',
            error:     error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};

// ─── Project Status ───────────────────────────────────────────────────────────

export const getProjectStatusDropdown = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await dropdownModel.getProjectStatus();

        res.status(200).json(<ApiResponse>{
            success:   true,
            message:   'Project status options retrieved successfully',
            data,
            count:     data.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ getProjectStatusDropdown:', error);
        res.status(500).json(<ApiResponse>{
            success:   false,
            message:   'Failed to retrieve project status options',
            error:     error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};

// ─── Employees ────────────────────────────────────────────────────────────────

export const getEmployeeDropdown = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data       = await dropdownModel.getEmployees(activeOnly, req);

        res.status(200).json(<ApiResponse>{
            success:   true,
            message:   'Employees retrieved successfully',
            data,
            count:     data.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ getEmployeeDropdown:', error);
        res.status(500).json(<ApiResponse>{
            success:   false,
            message:   'Failed to retrieve employees',
            error:     error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};

// ─── Search Employees ─────────────────────────────────────────────────────────

export const searchEmployeesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, activeOnly = 'true' } = req.query as Record<string, string>;

        if (!search || typeof search !== 'string') {
            res.status(400).json(<ApiResponse>{
                success:   false,
                message:   'Search term is required',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        if (search.length < 2) {
            res.status(400).json(<ApiResponse>{
                success:   false,
                message:   'Search term must be at least 2 characters',
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const data = await dropdownModel.searchEmployees(search, activeOnly !== 'false', req);

        res.status(200).json(<ApiResponse>{
            success:   true,
            message:   'Employees search completed successfully',
            data,
            count:     data.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ searchEmployeesController:', error);
        res.status(500).json(<ApiResponse>{
            success:   false,
            message:   'Failed to search employees',
            error:     error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const getTaskDropdown = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data       = await dropdownModel.getTasks(activeOnly, req);

        res.status(200).json(<ApiResponse>{
            success:   true,
            message:   'Tasks retrieved successfully',
            data,
            count:     data.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ getTaskDropdown:', error);
        res.status(500).json(<ApiResponse>{
            success:   false,
            message:   'Failed to retrieve tasks',
            error:     error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const getProjectsDropdown = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data       = await dropdownModel.getProjects(activeOnly, req);

        res.status(200).json(<ApiResponse>{
            success:   true,
            message:   'Projects retrieved successfully',
            data,
            count:     data.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ getProjectsDropdown:', error);
        res.status(500).json(<ApiResponse>{
            success:   false,
            message:   'Failed to retrieve projects',
            error:     error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};

// ─── Company ──────────────────────────────────────────────────────────────────

export const getCompanyDropdown = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data       = await dropdownModel.getCompany(activeOnly, req);

        res.status(200).json(<ApiResponse>{
            success:   true,
            message:   'Company retrieved successfully',
            data,
            count:     data.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ getCompanyDropdown:', error);
        res.status(500).json(<ApiResponse>{
            success:   false,
            message:   'Failed to retrieve company',
            error:     error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};

// ─── All Dropdowns ────────────────────────────────────────────────────────────

export const getAllDropdowns = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const data       = await dropdownModel.getAllDropdowns(activeOnly, req);

        res.status(200).json(<ApiResponse>{
            success:   true,
            message:   'All dropdowns retrieved successfully',
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ getAllDropdowns:', error);
        res.status(500).json(<ApiResponse>{
            success:   false,
            message:   'Failed to retrieve dropdowns',
            error:     error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
};

export default {
    getProjectHeadDropdown,
    getProjectStatusDropdown,
    getEmployeeDropdown,
    searchEmployeesController,
    getTaskDropdown,
    getProjectsDropdown,
    getCompanyDropdown,
    getAllDropdowns,
};