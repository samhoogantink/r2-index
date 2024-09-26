/**
 * Throw this error when the provided Cloudflare account ID is invalid.
 * @since 1.0.0
 */
export class R2IndexInvalidAccountIdError extends Error {
    constructor() {
        super();

        this.name = 'R2IndexInvalidAccountId';
        this.message = 'The provided Cloudflare account ID is invalid.';
    }
}

/**
 * Throw this error when the provided action is invalid.
 * @since 1.0.0
 */
export class R2IndexInvalidActionError extends Error {
    constructor() {
        super();

        this.name = 'R2IndexInvalidAction';
        this.message = 'The provided action is invalid.';
    }
}

/**
 * Throw this error when the provided bucket name is invalid.
 * @since 1.0.0
 */
export class R2IndexInvalidBucketNameError extends Error {
    constructor() {
        super();

        this.name = 'R2IndexInvalidBucketName';
        this.message = 'The provided bucket name is invalid.';
    }
}

/**
 * Throw this error when the object was not found.
 * @since 1.0.0
 */
export class R2IndexObjectNotFoundError extends Error {
    constructor() {
        super();

        this.name = 'R2IndexObjectNotFound';
        this.message = 'The object was not found.';
    }
}