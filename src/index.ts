import R2Index from './r2-index';

// Providers
import D1Provider from './providers/d1-provider';

// Exceptions
import { R2IndexInvalidAccountIdError, R2IndexInvalidActionError, R2IndexInvalidBucketNameError, R2IndexObjectNotFoundError } from './exceptions';

// Models
import type { 
    R2IndexProvider, 
    R2IndexNotificationPayload, 
    R2IndexNotificationActions, 
    R2IndexSavePutObjectPayload,
    R2IndexSaveCopyObjectPayload,
    R2IndexDeleteObjectPayload,
    R2IndexDatabaseObject
} from './types';

// Export everything
export {
    R2Index as default,

    // Providers
    D1Provider,

    // Exceptions
    R2IndexInvalidAccountIdError,
    R2IndexInvalidActionError,
    R2IndexInvalidBucketNameError,
    R2IndexObjectNotFoundError
}

// Export types
export type {
    R2IndexProvider,
    R2IndexNotificationActions,
    R2IndexSavePutObjectPayload,
    R2IndexSaveCopyObjectPayload,
    R2IndexDeleteObjectPayload,
    R2IndexDatabaseObject,
    R2IndexNotificationPayload
}