import { describe, it, expect } from 'vitest';
import {
  Project,
  initProjectModel,
  ProjectModel,
  projectCreateSchema,
  projectUpdateSchema,
  projectIdSchema,
  projectQuerySchema,
  getStatusText,
  getProjectStatusText,
  formatProjectForResponse,
} from '../../../src/models/masters/project/type.model';
import { getDefaultConnection } from '../../../src/config/database.config';

describe('Project Master Model & Schemas', () => {
  it('initializes Project model successfully', () => {
    const sequelize = getDefaultConnection();
    const model = initProjectModel(sequelize);

    expect(model).toBe(Project);
    expect(model.tableName).toBe('tbl_Project_Master');
    expect(model.rawAttributes.Project_Id).toBeDefined();
    expect(ProjectModel).toBeDefined();
  });

  it('validates projectCreateSchema with valid date range', () => {
    const valid = {
      Project_Name: 'ERP Modernization',
      Est_Start_Dt: '2026-01-01',
      Est_End_Dt: '2026-12-31',
      Company_Id: 1,
      Project_Status: 1,
    };

    const res = projectCreateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects end date earlier than start date', () => {
    const invalid = {
      Project_Name: 'Time Travel Project',
      Est_Start_Dt: '2026-12-31',
      Est_End_Dt: '2026-01-01',
    };

    const res = projectCreateSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('validates projectUpdateSchema, projectIdSchema, and projectQuerySchema', () => {
    expect(projectUpdateSchema.safeParse({ Project_Name: 'Updated' }).success).toBe(true);
    expect(projectIdSchema.safeParse({ id: 10 }).success).toBe(true);
    expect(projectQuerySchema.safeParse({}).success).toBe(true);
  });

  it('checks status conversion and response formatting helpers', () => {
    expect(getStatusText(1)).toBe('Active');
    expect(getStatusText(0)).toBe('Inactive');

    expect(getProjectStatusText(0)).toBe('Not Started');
    expect(getProjectStatusText(2)).toBe('In Progress');
    expect(getProjectStatusText(4)).toBe('Completed');

    const formatted = formatProjectForResponse({
      Project_Id: 5,
      Project_Name: 'Test',
      IsActive: 1,
      Project_Status: 2,
    });
    expect(formatted.statusText).toBe('Active');
    expect(formatted.projectStatusText).toBe('In Progress');
  });
});
