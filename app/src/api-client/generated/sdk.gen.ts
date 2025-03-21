// This file is auto-generated by @hey-api/openapi-ts

import { type Options as ClientOptions, type TDataShape, type Client, formDataBodySerializer } from '@hey-api/client-fetch';
import type { HealthCheckApiGetData, UserInfoApiUserIdGetData, UserInfoApiUserIdGetResponse, UserInfoApiUserIdGetError, RemoveImageBackgroundApiImageRemoveBackgroundPostData, RemoveImageBackgroundApiImageRemoveBackgroundPostError, GetUsersMementosApiUserUserIdMementoGetData, GetUsersMementosApiUserUserIdMementoGetResponse, GetUsersMementosApiUserUserIdMementoGetError, CreateNewMementoApiUserUserIdMementoPostData, CreateNewMementoApiUserUserIdMementoPostResponse, CreateNewMementoApiUserUserIdMementoPostError, UpdateMementoAndImagesApiUserUserIdMementoIdPutData, UpdateMementoAndImagesApiUserUserIdMementoIdPutError, GetUsersCollectionsApiUserUserIdCollectionGetData, GetUsersCollectionsApiUserUserIdCollectionGetResponse, GetUsersCollectionsApiUserUserIdCollectionGetError, CreateNewCollectionApiUserUserIdCollectionPostData, CreateNewCollectionApiUserUserIdCollectionPostResponse, CreateNewCollectionApiUserUserIdCollectionPostError, DeleteCollectionApiUserUserIdCollectionIdDeleteData, DeleteCollectionApiUserUserIdCollectionIdDeleteResponse, DeleteCollectionApiUserUserIdCollectionIdDeleteError, UpdateCollectionAndMementosApiUserUserIdCollectionIdPutData, UpdateCollectionAndMementosApiUserUserIdCollectionIdPutResponse, UpdateCollectionAndMementosApiUserUserIdCollectionIdPutError } from './types.gen';
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
 * Remove Image Background
 * Post route that takes an image and removes its background.
 */
export const removeImageBackgroundApiImageRemoveBackgroundPost = <ThrowOnError extends boolean = false>(options: Options<RemoveImageBackgroundApiImageRemoveBackgroundPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<unknown, RemoveImageBackgroundApiImageRemoveBackgroundPostError, ThrowOnError>({
        ...formDataBodySerializer,
        url: '/api/image/remove-background',
        ...options,
        headers: {
            'Content-Type': null,
            ...options?.headers
        }
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
 * Three main steps:
 * 1. Creates a memento DB record
 * 2. Uploads associated images to object storage,
 * 3. Stores a metadata DB record for each image.
 *
 * Uses multipart/form-data to upload JSON/binary payloads simultaneously.
 */
export const createNewMementoApiUserUserIdMementoPost = <ThrowOnError extends boolean = false>(options: Options<CreateNewMementoApiUserUserIdMementoPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<CreateNewMementoApiUserUserIdMementoPostResponse, CreateNewMementoApiUserUserIdMementoPostError, ThrowOnError>({
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
 * Three main steps:
 * 1. Updates the memento DB record
 * 2. For old images, delete entries user removed or update with new re-ordering
 * 3. For new images, uploads files to object storage / creates new DB record
 *
 * Uses multipart/form-data to upload JSON/binary payloads simultaneously.
 */
export const updateMementoAndImagesApiUserUserIdMementoIdPut = <ThrowOnError extends boolean = false>(options: Options<UpdateMementoAndImagesApiUserUserIdMementoIdPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<unknown, UpdateMementoAndImagesApiUserUserIdMementoIdPutError, ThrowOnError>({
        ...formDataBodySerializer,
        url: '/api/user/{user_id}/memento/{id}',
        ...options,
        headers: {
            'Content-Type': null,
            ...options?.headers
        }
    });
};

/**
 * Get Users Collections
 * Gets all the collections belonging to a user.
 */
export const getUsersCollectionsApiUserUserIdCollectionGet = <ThrowOnError extends boolean = false>(options: Options<GetUsersCollectionsApiUserUserIdCollectionGetData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).get<GetUsersCollectionsApiUserUserIdCollectionGetResponse, GetUsersCollectionsApiUserUserIdCollectionGetError, ThrowOnError>({
        url: '/api/user/{user_id}/collection/',
        ...options
    });
};

/**
 * Create New Collection
 * Create a collection.
 */
export const createNewCollectionApiUserUserIdCollectionPost = <ThrowOnError extends boolean = false>(options: Options<CreateNewCollectionApiUserUserIdCollectionPostData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<CreateNewCollectionApiUserUserIdCollectionPostResponse, CreateNewCollectionApiUserUserIdCollectionPostError, ThrowOnError>({
        url: '/api/user/{user_id}/collection/',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Delete Collection
 * Delete a collection.
 */
export const deleteCollectionApiUserUserIdCollectionIdDelete = <ThrowOnError extends boolean = false>(options: Options<DeleteCollectionApiUserUserIdCollectionIdDeleteData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).delete<DeleteCollectionApiUserUserIdCollectionIdDeleteResponse, DeleteCollectionApiUserUserIdCollectionIdDeleteError, ThrowOnError>({
        url: '/api/user/{user_id}/collection/{id}',
        ...options
    });
};

/**
 * Update Collection And Mementos
 * Update a collection.
 */
export const updateCollectionAndMementosApiUserUserIdCollectionIdPut = <ThrowOnError extends boolean = false>(options: Options<UpdateCollectionAndMementosApiUserUserIdCollectionIdPutData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).put<UpdateCollectionAndMementosApiUserUserIdCollectionIdPutResponse, UpdateCollectionAndMementosApiUserUserIdCollectionIdPutError, ThrowOnError>({
        url: '/api/user/{user_id}/collection/{id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};