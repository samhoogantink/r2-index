import { R2IndexObjectNotFoundError } from './../exceptions';

// Models
import type { R2IndexProvider, R2IndexSavePutObjectPayload, R2IndexSaveCopyObjectPayload, R2IndexDeleteObjectPayload } from './../types';

type DatabaseResult = {
    account_id: string;
    bucket_name: string;
    object_name: string;
    object_size: number;
    object_etag: string;
    event_date: string;
    original_bucket_name: string|null;
    original_object_name: string|null;
}

export default class D1Provider implements R2IndexProvider {
    private readonly db: D1Database;

    public constructor(db: D1Database) {
        this.db = db;
    }

    public async populate() {
        await this.db.prepare(`
            CREATE TABLE IF NOT EXISTS objects (
                object_name TEXT NOT NULL,
                bucket_name TEXT NOT NULL,
                account_id TEXT NOT NULL,
                object_size INTEGER NOT NULL,
                object_etag TEXT NOT NULL,
                event_date DATE NOT NULL,
                original_bucket_name TEXT,
                original_object_name TEXT,
                PRIMARY KEY (object_name, bucket_name, account_id)
            );
        `).run();

        // Needs optimization
        await this.db.batch([
            this.db.prepare(`
                CREATE INDEX IF NOT EXISTS objects_account_id ON objects(account_id);
            `),
            this.db.prepare(`
                CREATE INDEX IF NOT EXISTS objects_bucket_name ON objects(bucket_name);
            `),
            this.db.prepare(`
                CREATE INDEX IF NOT EXISTS objects_object_name ON objects(object_name);
            `),
            this.db.prepare(`
                CREATE INDEX IF NOT EXISTS objects_search ON objects(account_id, bucket_name, object_name);
            `),
        ]);
    }

    public async savePutObject(payload: R2IndexSavePutObjectPayload) {
        await this.db.prepare(`
            INSERT INTO objects (
                object_name, bucket_name, account_id, object_size, object_etag, event_date
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(object_name, bucket_name, account_id) 
            DO UPDATE SET
                object_size = excluded.object_size,
                object_etag = excluded.object_etag,
                event_date = excluded.event_date;
        `).bind(
            payload.object.objectKey,
            payload.bucketName,
            payload.accountId,
            payload.object.objectSize,
            payload.object.objectEtag,
            payload.eventTime.toJSON()
        ).run();
    }

    public async saveCopyObject(payload: R2IndexSaveCopyObjectPayload) {
        await this.db.prepare(`
            INSERT INTO objects (
                object_name, bucket_name, account_id, object_size, object_etag, event_date, original_bucket_name, original_object_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(object_name, bucket_name, account_id) 
            DO UPDATE SET
                object_size = excluded.object_size,
                object_etag = excluded.object_etag,
                event_date = excluded.event_date,
                original_bucket_name = excluded.original_bucket_name,
                original_object_name = excluded.original_object_name;
        `).bind(
            payload.object.objectKey,
            payload.bucketName,
            payload.accountId,
            payload.object.objectSize,
            payload.object.objectEtag,
            payload.eventTime.toJSON(),
            payload.copySource.bucketName,
            payload.copySource.objectKey
        ).run();
    }

    public async saveDeleteObject(payload: R2IndexDeleteObjectPayload) {
        await this.db.prepare(`
            DELETE FROM objects WHERE 
                    account_id = ?
                AND bucket_name = ?
                AND object_name = ?;
        `).bind(payload.accountId, payload.bucketName, payload.object.objectKey).run();
    }

    private mapResult(result: DatabaseResult) {
        return {
            accountId: result.account_id,
            bucketName: result.bucket_name,
            eventTime: new Date(result.event_date),
            object: {
                objectKey: result.object_name,
                objectSize: result.object_size,
                objectEtag: result.object_etag
            },
            copySource: result.original_bucket_name && result.original_object_name ? {
                bucketName: result.original_bucket_name,
                objectKey: result.original_object_name
            } : null
        }
    }

    public async listObjects() {
        const result = await this.db.prepare(`
            SELECT * FROM objects;
        `).all<DatabaseResult>();

        return result.results.map(entry => this.mapResult(entry));
    }

    public async getObject(accountId: string, bucketName: string, objectKey: string) {
        const result = await this.db.prepare(`
            SELECT * FROM objects WHERE 
                    account_id = ?
                AND bucket_name = ?
                AND object_name = ?;
        `).bind(accountId, bucketName, objectKey).first<DatabaseResult>();

        if(!result) {
            throw new R2IndexObjectNotFoundError();
        }

        return this.mapResult(result);
    }
}