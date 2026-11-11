import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const instances: any[] = [];
  const ormInstances: any[] = [];
  return { instances, ormInstances, failSql: false, failOrm: false };
});
vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));
vi.mock('fs', () => ({ default: {
  existsSync: () => true,
  readFileSync: () => JSON.stringify([
    { id: 991, name: 'A', host: 'localhost', user: 'test', password: 'test', database: 'PoolTestA' },
    { id: 992, name: 'B', host: 'localhost', user: 'test', password: 'test', database: 'PoolTestB' },
  ]),
} }));
vi.mock('mssql', () => ({ default: {
  ConnectionPool: class {
    connected = false;
    connect = vi.fn(async () => {
      await Promise.resolve();
      if (mocks.failSql) throw new Error('SQL unavailable');
      this.connected = true;
      return this;
    });
    close = vi.fn(async () => { this.connected = false; });
    constructor(public config: any) { mocks.instances.push(this); }
  },
} }));
vi.mock('sequelize', () => ({
  Transaction: { ISOLATION_LEVELS: { READ_COMMITTED: 'READ COMMITTED' } },
  Sequelize: class {
    authenticate = vi.fn(async () => {
      await Promise.resolve();
      if (mocks.failOrm) throw new Error('ORM unavailable');
    });
    query = vi.fn(async () => [[]]);
    close = vi.fn(async () => {});
    constructor(public config: any) { mocks.ormInstances.push(this); }
  },
}));

import {
  closeAllCompanyConnections, getCompanyDatabase,
  getCompanySqlConnection, getDefaultSqlConnection,
} from '../../src/config/database.config';

beforeEach(async () => {
  await closeAllCompanyConnections();
  mocks.instances.length = 0;
  mocks.ormInstances.length = 0;
  mocks.failSql = false;
  mocks.failOrm = false;
});

describe('Database pool reuse', () => {
  it('shares one SQL pool for concurrent company ID and name requests', async () => {
    const pools = await Promise.all([
      getCompanySqlConnection(991), getCompanySqlConnection('PoolTestA'),
      getCompanySqlConnection(991),
    ]);
    expect(mocks.instances).toHaveLength(1);
    expect(pools.every(pool => pool === pools[0])).toBe(true);
    expect(await getCompanySqlConnection(991)).toBe(pools[0]);
  });

  it('keeps default and different company SQL pools isolated', async () => {
    const pools = await Promise.all([
      getDefaultSqlConnection(), getDefaultSqlConnection(),
      getCompanySqlConnection(991), getCompanySqlConnection(992),
    ]);
    expect(mocks.instances).toHaveLength(3);
    expect(pools[0]).toBe(pools[1]);
    expect(pools[0]).not.toBe(pools[2]);
    expect(pools[2]).not.toBe(pools[3]);
    expect(mocks.instances.map(pool => pool.config.database)).toContain('PoolTestB');
  });

  it('releases failed SQL pools and permits a later retry', async () => {
    mocks.failSql = true;
    await expect(getCompanySqlConnection(991)).rejects.toThrow('SQL unavailable');
    await expect(getDefaultSqlConnection()).rejects.toThrow('SQL unavailable');
    expect(mocks.instances.every(pool => pool.close.mock.calls.length === 1)).toBe(true);
    mocks.failSql = false;
    await expect(getCompanySqlConnection(991)).resolves.toBeDefined();
    await expect(getDefaultSqlConnection()).resolves.toBeDefined();
  });

  it('shares company Sequelize initialization during concurrent requests', async () => {
    const connections = await Promise.all([
      getCompanyDatabase(991), getCompanyDatabase('PoolTestA'), getCompanyDatabase(991),
    ]);
    expect(mocks.ormInstances).toHaveLength(1);
    expect(connections.every(connection => connection === connections[0])).toBe(true);
    expect(mocks.ormInstances[0].authenticate).toHaveBeenCalledTimes(1);
    expect(mocks.ormInstances[0].config.pool.idle).toBe(60000);
  });

  it('closes failed Sequelize initialization and permits a later retry', async () => {
    mocks.failOrm = true;
    await expect(getCompanyDatabase(991)).rejects.toThrow('ORM unavailable');
    expect(mocks.ormInstances[0].close).toHaveBeenCalledTimes(1);
    mocks.failOrm = false;
    await expect(getCompanyDatabase(991)).resolves.toBeDefined();
    expect(mocks.ormInstances).toHaveLength(2);
  });

  it('waits for pending connections and closes them during shutdown', async () => {
    const pending = [getCompanySqlConnection(991), getDefaultSqlConnection(), getCompanyDatabase(991)];
    await closeAllCompanyConnections();
    await Promise.all(pending);
    expect(mocks.instances.every(pool => !pool.connected)).toBe(true);
    expect(mocks.ormInstances[0].close).toHaveBeenCalledTimes(1);
  });
});
