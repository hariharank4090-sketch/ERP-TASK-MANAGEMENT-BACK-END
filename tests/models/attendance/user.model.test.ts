import { describe, it, expect } from 'vitest';
import {
  userCreateSchema,
  userUpdateSchema,
  userQuerySchema,
  userIdSchema,
} from '../../../src/models/Attendance/user/User.model';

describe('Attendance User Zod Schemas', () => {
  describe('userCreateSchema', () => {
    it('validates a correct user create payload', () => {
      const validData = {
        UserName: 'john_doe',
        Password: 'strongPassword123',
        Name: 'John Doe',
        UserTypeId: 6,
      };

      const result = userCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.UserName).toBe('john_doe');
        expect(result.data.UserTypeId).toBe(6);
        expect(result.data.UDel_Flag).toBe(false);
      }
    });

    it('rejects short passwords', () => {
      const invalidData = {
        UserName: 'john_doe',
        Password: '123',
      };

      const result = userCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('requires UserName', () => {
      const invalidData = {
        Password: 'password123',
      };

      const result = userCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('userUpdateSchema', () => {
    it('allows partial user updates', () => {
      const partialData = {
        Name: 'Updated Name',
        UDel_Flag: true,
      };

      const result = userUpdateSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.Name).toBe('Updated Name');
        expect(result.data.UDel_Flag).toBe(true);
      }
    });
  });

  describe('userQuerySchema', () => {
    it('applies default pagination and sorting', () => {
      const parsed = userQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
      expect(parsed.sortBy).toBe('UserId');
      expect(parsed.sortOrder).toBe('ASC');
    });

    it('coerces query params properly', () => {
      const parsed = userQuerySchema.parse({
        page: '2',
        limit: '50',
        companyId: '10',
      });
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(50);
      expect(parsed.companyId).toBe(10);
    });
  });

  describe('userIdSchema', () => {
    it('parses positive numeric ID', () => {
      const parsed = userIdSchema.parse({ id: '15' });
      expect(parsed.id).toBe(15);
    });

    it('rejects invalid or negative ID', () => {
      expect(userIdSchema.safeParse({ id: '-5' }).success).toBe(false);
      expect(userIdSchema.safeParse({ id: 'abc' }).success).toBe(false);
    });
  });
});
