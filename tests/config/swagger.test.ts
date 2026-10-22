import { describe, it, expect } from 'vitest';
import { swaggerSpec } from '../../src/config/swagger';

describe('Swagger Documentation Config', () => {
  it('generates an OpenAPI 3.0 specification object', () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec).toHaveProperty('openapi', '3.0.0');
    expect(swaggerSpec).toHaveProperty('info');
    expect((swaggerSpec as any).info.title).toBe('Backend API');
  });

  it('defines bearer authentication security schema', () => {
    const components = (swaggerSpec as any).components;
    expect(components).toBeDefined();
    expect(components.securitySchemes).toHaveProperty('bearerAuth');
    expect(components.securitySchemes.bearerAuth.scheme).toBe('bearer');
  });
});
