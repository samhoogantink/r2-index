type Nullable<T> = T | null;

type R2IndexPluginConfig = {
    /**
     * The provider to use
     * @since 1.0.0
     */
    provider: R2IndexProvider;
}

/**
 * The default
 */
type R2IndexDefaultConfig = {
    /**
     * The account IDs to allow. If empty, all account IDs are allowed
     * @since 1.0.0
     * @default []
     */
    accountIds: string[];
    /**
     * The actions to allow. If empty, all actions are allowed
     * @since 1.0.0
     * @default []
     */
    allowedActions: R2IndexNotificationActions[];
    /**
     * The bucket names to allow. If empty, all bucket names are allowed
     * @since 1.0.0
     * @default []
     */
    bucketNames: string[];
    /**
     * Whether to throw errors, if the payload is invalid
     * @since 1.0.0
     * @default true
     */
    shouldThrow: boolean;
}

/**
 * The default config
 * @since 1.0.0
 */
export type R2IndexConfig = R2IndexDefaultConfig & R2IndexPluginConfig;

/**
 * The default config, but made fields optional
 * @since 1.0.0
 */
export type R2IndexConfigInit = {
    [key in keyof R2IndexDefaultConfig]?: R2IndexDefaultConfig[key];
} & R2IndexPluginConfig;

export type R2IndexNotificationActions = 'PutObject' | 'CopyObject' | 'CompleteMultipartUpload' | 'DeleteObject' | 'LifecycleDeletion';

/**
 * Payload for incoming notifications
 * @since 1.0.0
 */
export type R2IndexNotificationPayload = {
    account: string;
    action: R2IndexNotificationActions;
    bucket: string;
    object: {
        key: string;
        size?: number;
        eTag?: string;
    };
    eventTime: string;
    copySource?: {
        bucket: string;
        object: string;
    };
}

/**
 * Default payload for saving object entries to the plugin storage
 * @since 1.0.0
 */
export type R2IndexDefaultObjectPayload = {
    accountId: string;
    action: R2IndexNotificationActions;
    bucketName: string;
    eventTime: Date;
}

export type R2IndexDefaultObjectDataPayload = {
    objectKey: string;
}

export type R2IndexSavePutObjectPayloadObject = R2IndexDefaultObjectDataPayload & {
    objectSize: number;
    objectEtag: string;
}

/**
 * Payload for saving put object entries to the plugin storage
 * @since 1.0.0
 */
export type R2IndexSavePutObjectPayload = R2IndexDefaultObjectPayload & {
    object: R2IndexSavePutObjectPayloadObject;
}

/**
 * Copy source object
 * @since 1.0.0
 */
export type R2IndexSaveCopyObjectPayloadSource = {
    bucketName: string;
    objectKey: string;
}

/**
 * Payload for saving copy object entries to the plugin storage
 * @since 1.0.0
 */
export type R2IndexSaveCopyObjectPayload = R2IndexDefaultObjectPayload & {
    object: R2IndexSavePutObjectPayloadObject;
    copySource: R2IndexSaveCopyObjectPayloadSource;
}

/**
 * Payload for delete object entries to the plugin storage
 * @since 1.0.0
 */
export type R2IndexDeleteObjectPayload = R2IndexDefaultObjectPayload & {
    object: R2IndexDefaultObjectDataPayload;
}

/**
 * This is the object that is saved to the database
 * @since 1.0.0
 */
export type R2IndexDatabaseObject = Omit<R2IndexDefaultObjectPayload, 'action'> & {
    object: R2IndexSavePutObjectPayloadObject;
    copySource: Nullable<R2IndexSaveCopyObjectPayloadSource>;
};

/**
 * Implementation for R2 Index Providers
 * @since 1.0.0
 */
export declare interface R2IndexProvider {
    /**
     * Populates the database. This should create the necessary tables and indexes.
     * @since 1.0.0
     */
    populate(): Promise<void>;

    /**
     * Saves a put object payload
     * @param payload The payload
     * @since 1.0.0
     */
    savePutObject(payload: R2IndexSavePutObjectPayload): Promise<void>;

    /**
     * Saves a copy object payload
     * @param payload The payload
     * @since 1.0.0
     */
    saveCopyObject(payload: R2IndexSaveCopyObjectPayload): Promise<void>;

    /**
     * Saves a delete object payload
     * @param payload The payload
     * @since 1.0.0
     */
    saveDeleteObject(payload: R2IndexDeleteObjectPayload): Promise<void>;

    /**
     * Lists all objects
     * @since 1.0.0
     * @todo Implement filters
     */
    listObjects(): Promise<R2IndexDatabaseObject[]>;

    /**
     * Gets an object
     * @param accountId The account ID
     * @param bucketName The bucket name
     * @param objectKey The object key
     * @since 1.0.0
     * @throws {R2IndexObjectNotFoundError} if the object is not found
     */
    getObject(accountId: string, bucketName: string, objectKey: string): Promise<R2IndexDatabaseObject>;
}