import D1Provider from './providers/d1-provider';

// Exceptions
import { R2IndexInvalidAccountIdError, R2IndexInvalidActionError, R2IndexInvalidBucketNameError, R2IndexObjectNotFoundError } from './exceptions';

// Models
import type { 
    R2IndexProvider,
    R2IndexConfig, R2IndexConfigInit, R2IndexNotificationPayload, R2IndexNotificationActions, 
    R2IndexSavePutObjectPayloadObject, R2IndexSaveCopyObjectPayloadSource,

    // For export
    R2IndexSavePutObjectPayload,
    R2IndexSaveCopyObjectPayload,
    R2IndexDeleteObjectPayload,
    R2IndexDatabaseObject
} from './types';

export default class R2Index {

    private readonly config: R2IndexConfig;

    public constructor(config: R2IndexConfigInit) {
        this.config = {
            accountIds: [],
            allowedActions: [],
            bucketNames: [],
            shouldThrow: true,
            ...config
        };
    }

    /**
     * Get the provider
     * @returns The provider
     * @since 1.0.0
     */
    public getProvider() {
        return this.config.provider;
    }

    /**
     * Tests the payload to ensure it is valid
     * @param accountId The Cloudflare account ID
     * @param action The action that was performed
     * @param bucketName The bucket name
     * @throws {Error} If the payload is invalid
     * @since 1.0.0
     */
    private testPayload(accountId: string, action: R2IndexNotificationActions, bucketName: string) {
        if(!accountId || typeof accountId !== 'string' || (this.config.shouldThrow && this.config.accountIds.length && !this.config.accountIds.includes(accountId))) {
            throw new R2IndexInvalidAccountIdError();
        }

        if(!action || typeof action !== 'string' || (this.config.shouldThrow && this.config.allowedActions.length && !this.config.allowedActions.includes(action))) {
            throw new R2IndexInvalidActionError();
        }

        if(!bucketName || typeof bucketName !== 'string' || (this.config.shouldThrow && this.config.bucketNames.length && !this.config.bucketNames.includes(bucketName))) {
            throw new R2IndexInvalidBucketNameError();
        }
    }

    /**
     * Handles an incoming notification
     * @param payload The notification payload
     * @since 1.0.0
     */
    public async handleNotification(payload: R2IndexNotificationPayload): Promise<void> {
        this.testPayload(payload.account, payload.action, payload.bucket); // Test the payload

        const defaultPayload = {
            accountId: payload.account,
            action: payload.action,
            bucketName: payload.bucket,
            eventTime: new Date(payload.eventTime),
        }

        switch(payload.action) {
            case 'PutObject':
            case 'CompleteMultipartUpload':
                await this.config.provider.savePutObject({
                    ...defaultPayload,
                    object: {
                        objectKey: payload.object.key,
                        objectSize: payload.object.size,
                        objectEtag: payload.object.eTag
                    } as R2IndexSavePutObjectPayloadObject
                });
                break;
            case 'CopyObject':
                await this.config.provider.saveCopyObject({
                    ...defaultPayload,
                    object: {
                        objectKey: payload.object.key,
                        objectSize: payload.object.size,
                        objectEtag: payload.object.eTag
                    } as R2IndexSavePutObjectPayloadObject,
                    copySource: {
                        bucketName: payload?.copySource?.bucket,
                        objectKey: payload?.copySource?.object
                    } as R2IndexSaveCopyObjectPayloadSource
                });
                break;
            case 'DeleteObject':
            case 'LifecycleDeletion':
                await this.config.provider.saveDeleteObject({
                    ...defaultPayload,
                    object: {
                        objectKey: payload.object.key,
                    }
                });
                break;
        }
    }   

}

export {
    // Providers
    D1Provider,

    // Exceptions
    R2IndexInvalidAccountIdError,
    R2IndexInvalidActionError,
    R2IndexInvalidBucketNameError,
    R2IndexObjectNotFoundError,
    R2IndexNotificationPayload,

    // Models
    type R2IndexProvider,
    type R2IndexNotificationActions,
    type R2IndexSavePutObjectPayload,
    type R2IndexSaveCopyObjectPayload,
    type R2IndexDeleteObjectPayload,
    type R2IndexDatabaseObject
}