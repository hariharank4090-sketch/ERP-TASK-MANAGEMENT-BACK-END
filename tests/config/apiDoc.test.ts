import { describe, it, expect, vi } from 'vitest';
import { listRoutes } from '../../src/config/apiDoc';
import express from 'express';

describe('API Doc Generator (apiDoc)', () => {
  it('renders API explorer HTML response for express application', () => {
    const app = express();
    app.get('/api/test-route', (_req, res) => { res.send('ok'); });

    const res: any = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    listRoutes(app as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
    const html = res.send.mock.calls[0][0];
    expect(typeof html).toBe('string');
    expect(html).toContain('API Explorer');
  });
});
