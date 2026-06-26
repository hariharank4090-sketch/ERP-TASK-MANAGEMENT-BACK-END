// // routes/masters/taskManagement/employeeinvolved.routes.ts
// import express from 'express';
// import {
//     getAllProjectEmployee,
//     getProjectEmployeeById,
//     getProjectEmployeesByProjectId,
//     createProjectEmployee,
//     bulkCreateProjectEmployees,
//     updateProjectEmployee,
//     bulkUpdateProjectEmployees,
//     deleteProjectEmployee,
//     bulkDeleteProjectEmployees,
//     getAllActiveProjectEmployees,
//     getProjectDropdown,
//     getEmployeeDropdown
// } from '../../controllers/masters/taskManagement/employeeinvolved.contoller';
// import { authenticate, authorize } from '../../middleware/auth';

// const router = express.Router();

// // Public GET routes
// router.get('/', getAllProjectEmployee);
// router.get('/active', getAllActiveProjectEmployees);
// router.get('/byProject/:projectId', getProjectEmployeesByProjectId);
// router.get('/:id', getProjectEmployeeById);

// // Dropdown routes
// router.get('/projects/dropdown', getProjectDropdown);
// router.get('/employees/dropdown', getEmployeeDropdown);

// // Protected POST routes (Admin/Manager only)
// router.post('/',
//     authenticate,
//      authorize([]),
//     createProjectEmployee
// );

// router.post('/bulk',
//     authenticate,
//      authorize([]),
//     bulkCreateProjectEmployees
// );

// // Protected PUT routes (Admin/Manager only)
// router.put('/:id',
//     authenticate,
//     authorize([]), 
//     updateProjectEmployee
// );

// router.put('/bulk/update',
//     authenticate,
//     authorize([]),
//     bulkUpdateProjectEmployees
// );

// // Protected DELETE routes (Admin only)
// router.delete('/:id',
//     authenticate,
//     authorize([]), 
//     deleteProjectEmployee
// );

// router.delete('/bulk/delete',
//     authenticate,
//     authorize([]),
//     bulkDeleteProjectEmployees
// );

// export default router;