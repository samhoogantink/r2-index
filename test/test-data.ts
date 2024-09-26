export const OBJECT_CREATE_PUT_PAYLOAD = {
    "account": "3f4b7e3dcab231cbfdaa90a6a28bd548",
    "action": "PutObject",
    "bucket": "my-bucket",
    "object": {
        "key": "my-original-object",
        "size": 65536,
        "eTag": "c846ff7a18f28c2e262116d6e8719ef0"
    },
    "eventTime": "2024-05-24T19:36:44.379Z"
};

export const OBJECT_CREATE_COPY_PAYLOAD = {
    "account": "3f4b7e3dcab231cbfdaa90a6a28bd548",
    "action": "CopyObject",
    "bucket": "my-bucket",
    "object": {
        "key": "my-copied-object",
        "size": 65536,
        "eTag": "c846ff7a18f28c2e262116d6e8719ef0"
    },
    "eventTime": "2024-05-24T19:36:44.379Z",
    "copySource": {
        "bucket": "my-bucket",
        "object": "my-original-object"
    }
};

export const OBJECT_CREATE_DELETE_PAYLOAD = {
    "account": "3f4b7e3dcab231cbfdaa90a6a28bd548",
    "action": "DeleteObject",
    "bucket": "my-bucket",
    "object": {
        "key": "my-original-object"
    },
    "eventTime": "2024-05-24T19:36:44.379Z"
};