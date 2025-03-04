// This file is auto-generated by @hey-api/openapi-ts

import { type Options as ClientOptions, type TDataShape, type Client, formDataBodySerializer } from '@hey-api/client-fetch';
import type { HealthCheckApiGetData, UserInfoApiUserIdGetData, UserInfoApiUserIdGetResponse, UserInfoApiUserIdGetError, GetUsersMementosApiUserUserIdMementoGetData, GetUsersMementosApiUserUserIdMementoGetResponse, GetUsersMementosApiUserUserIdMementoGetError, CreateNewMementoApiUserUserIdMementoPostData, CreateNewMementoApiUserUserIdMementoPostError, UpdateMementoAndImagesApiUserUserIdMementoIdPutData, UpdateMementoAndImagesApiUserUserIdMementoIdPutError } from './types.gen';
import { client as _heyApiClient } from './client.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};

/**
 * Health Check
 * Checks the health of a project.
 *
 * It returns 200 if the project is healthy.
 */
export const healthCheckApiGet = <ThrowOnError extends boolean = false>(options?: Options<HealthCheckApiGetData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<unknown, unknown, ThrowOnError>({
        url: '/api/',
        ...options
    });
};

/**
 * User Info
 * Gets user info for a specific user.
 */
export const userInfoApiUserIdGet = <ThrowOnError extends boolean = false>(options: Options<UserInfoApiUserIdGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<UserInfoApiUserIdGetResponse, UserInfoApiUserIdGetError, ThrowOnError>({
        url: '/api/user/{id}',
        ...options
    });
};

/**
 * Get Users Mementos
 * Gets all the mementos belonging to a user.
 */
export const getUsersMementosApiUserUserIdMementoGet = <ThrowOnError extends boolean = false>(options: Options<GetUsersMementosApiUserUserIdMementoGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetUsersMementosApiUserUserIdMementoGetResponse, GetUsersMementosApiUserUserIdMementoGetError, ThrowOnError>({
        url: '/api/user/{user_id}/memento/',
        ...options
    });
};

/**
 * Create New Memento
 * Post route for creating a new memento.
 *
 * 3 key steps:
 * 1. Creates a memento DB record
 * 2. Uploads associated images to object storage,
 * 3. Stores a metadata DB record for each image.
 *
 * Uses multipart/form-data to upload JSON/binary payloads simultaneously.
 */
export const createNewMementoApiUserUserIdMementoPost = <ThrowOnError extends boolean = false>(options: Options<CreateNewMementoApiUserUserIdMementoPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<unknown, CreateNewMementoApiUserUserIdMementoPostError, ThrowOnError>({
        ...formDataBodySerializer,
        url: '/api/user/{user_id}/memento/',
        ...options,
        headers: {
            'Content-Type': null,
            ...options?.headers
        }
    });
};

/**
 * Update Memento And Images
 * Put route for updating a memento and its associated images.
 *
 * 4 key steps:
 * 1. Updates the memento DB record
 * 2. For new images, uploads files to object storage / creates new DB record
 * 3. Updates any image DB records with new order_index (position could have changed)
 * 4. Delete any images from DB/storage that were removed
 *
 * Uses multipart/form-data to upload JSON/binary payloads simultaneously.
 */
export const updateMementoAndImagesApiUserUserIdMementoIdPut = <ThrowOnError extends boolean = false>(options: Options<UpdateMementoAndImagesApiUserUserIdMementoIdPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<unknown, UpdateMementoAndImagesApiUserUserIdMementoIdPutError, ThrowOnError>({
        ...formDataBodySerializer,
        url: '/api/user/{user_id}/memento/{id}}',
        ...options,
        headers: {
            'Content-Type': null,
            ...options?.headers
        }
    });
};