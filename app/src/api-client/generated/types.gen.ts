// This file is auto-generated by @hey-api/openapi-ts

export type HttpValidationError = {
    detail?: Array<ValidationError>;
};

/**
 * UserInfo Schema for Pydantic.
 *
 * Inherits from UserInfoBaseSchema. Add any customization here.
 */
export type UserInfo = {
    id: string;
    birthday?: string | null;
};

export type ValidationError = {
    loc: Array<string | number>;
    msg: string;
    type: string;
};

export type HealthCheckApiHealthGetData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/health';
};

export type HealthCheckApiHealthGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type UserInfoApiUserIdGetData = {
    body?: never;
    path: {
        id: string;
    };
    query?: never;
    url: '/api/user/{id}';
};

export type UserInfoApiUserIdGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type UserInfoApiUserIdGetError = UserInfoApiUserIdGetErrors[keyof UserInfoApiUserIdGetErrors];

export type UserInfoApiUserIdGetResponses = {
    /**
     * Successful Response
     */
    200: UserInfo;
};

export type UserInfoApiUserIdGetResponse = UserInfoApiUserIdGetResponses[keyof UserInfoApiUserIdGetResponses];

export type ClientOptions = {
    baseUrl: `${string}://${string}` | (string & {});
};