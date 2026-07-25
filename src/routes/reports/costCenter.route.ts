import express from 'express';
import { CostCenter } from '../../controllers/reports/costCenter.controller';

const router = express.Router();

router.get('/costcenter-list', CostCenter.getCostCenter);
router.post('/costcenter-create', CostCenter.createCostCenter);
router.put('/costcenter-update', CostCenter.updateCostCenter);
router.get('/costcenter-category', CostCenter.getCostCenterCategory);
router.post('/costcenter-category', CostCenter.createCostCategory);
router.delete('/costcenter-category', CostCenter.deleteCostCategory);
router.put('/costcenter-category', CostCenter.updateCostCategory);
router.get('/costcenter-category-dropdown', CostCenter.costCategoryDropDown);
router.get('/costcenter-involved-reports', CostCenter.costCenterInvolvedReports);
router.get('/costcenter-employee-reports', CostCenter.costCenterEmployeeReports);

export default router;
