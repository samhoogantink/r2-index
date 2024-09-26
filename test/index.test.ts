import { Miniflare } from 'miniflare';
import { describe, it, expect } from 'vitest';

// Load Test data
import { OBJECT_CREATE_PUT_PAYLOAD, OBJECT_CREATE_COPY_PAYLOAD, OBJECT_CREATE_DELETE_PAYLOAD } from './test-data';

// Load Test plugins
import R2Index, { D1Provider } from './../src/index';

describe('Create Miniflare and R2Index', async () => {
    const miniflare = new Miniflare({
        modules: true,
        script: 'export default { fetch: () => new Response(null, { status: 404 }) };',
        d1Databases: ['TEST_DATABASE']
    });
    const d1Database = await miniflare.getD1Database('TEST_DATABASE');

    // Create the R2Index
    const r2Index = new R2Index({
        accountIds: ['3f4b7e3dcab231cbfdaa90a6a28bd548'],
        bucketNames: ['my-bucket'],
        allowedActions: ['PutObject', 'CopyObject', 'DeleteObject'],
        provider: new D1Provider(d1Database)
    });

    it('Populate the test database', async () => {
        // Populate the database. In production, this should only be done once
        await expect(r2Index.getProvider().populate()).resolves.not.toThrow();
    });

    it('Test Object-Create Notification', async () => {
        await expect(r2Index.handleNotification(OBJECT_CREATE_PUT_PAYLOAD as any)).resolves.not.toThrow();
    });

    it('Test Object-Copy Notification', async () => {
        await expect(r2Index.handleNotification(OBJECT_CREATE_COPY_PAYLOAD as any)).resolves.not.toThrow();
    });

    it('Test Object-Delete Notification', async () => {
        await expect(r2Index.handleNotification(OBJECT_CREATE_DELETE_PAYLOAD as any)).resolves.not.toThrow();
    });

    it('Test Results', async () => {
        const result = await r2Index.getProvider().listObjects();

        expect(result.length).toBeGreaterThanOrEqual(1);
    });
});