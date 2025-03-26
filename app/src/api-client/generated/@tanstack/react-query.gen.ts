// This file is auto-generated by @hey-api/openapi-ts

import { type Options, healthCheckApiGet, userInfoApiUserIdGet, postUserInfoApiUserPost, removeImageBackgroundApiImageRemoveBackgroundPost, getUsersMementosApiUserUserIdMementoGet, createNewMementoApiUserUserIdMementoPost, updateMementoAndImagesApiUserUserIdMementoIdPut, getUsersCollectionsApiUserUserIdCollectionGet, createNewCollectionApiUserUserIdCollectionPost, deleteCollectionApiUserUserIdCollectionIdDelete, updateCollectionAndMementosApiUserUserIdCollectionIdPut, generateCollageApiUserUserIdCollectionIdCollageGet, testCollageApiTestingCollageGet } from '../sdk.gen';
import { queryOptions, type UseMutationOptions } from '@tanstack/react-query';
import type { HealthCheckApiGetData, UserInfoApiUserIdGetData, PostUserInfoApiUserPostData, PostUserInfoApiUserPostError, PostUserInfoApiUserPostResponse, RemoveImageBackgroundApiImageRemoveBackgroundPostData, RemoveImageBackgroundApiImageRemoveBackgroundPostError, GetUsersMementosApiUserUserIdMementoGetData, CreateNewMementoApiUserUserIdMementoPostData, CreateNewMementoApiUserUserIdMementoPostError, CreateNewMementoApiUserUserIdMementoPostResponse, UpdateMementoAndImagesApiUserUserIdMementoIdPutData, UpdateMementoAndImagesApiUserUserIdMementoIdPutError, GetUsersCollectionsApiUserUserIdCollectionGetData, CreateNewCollectionApiUserUserIdCollectionPostData, CreateNewCollectionApiUserUserIdCollectionPostError, CreateNewCollectionApiUserUserIdCollectionPostResponse, DeleteCollectionApiUserUserIdCollectionIdDeleteData, DeleteCollectionApiUserUserIdCollectionIdDeleteError, DeleteCollectionApiUserUserIdCollectionIdDeleteResponse, UpdateCollectionAndMementosApiUserUserIdCollectionIdPutData, UpdateCollectionAndMementosApiUserUserIdCollectionIdPutError, UpdateCollectionAndMementosApiUserUserIdCollectionIdPutResponse, GenerateCollageApiUserUserIdCollectionIdCollageGetData, TestCollageApiTestingCollageGetData } from '../types.gen';
import { client as _heyApiClient } from '../client.gen';

export type QueryKey<TOptions extends Options> = [
    Pick<TOptions, 'baseUrl' | 'body' | 'headers' | 'path' | 'query'> & {
        _id: string;
        _infinite?: boolean;
    }
];

const createQueryKey = <TOptions extends Options>(id: string, options?: TOptions, infinite?: boolean): [
    QueryKey<TOptions>[0]
] => {
    const params: QueryKey<TOptions>[0] = { _id: id, baseUrl: (options?.client ?? _heyApiClient).getConfig().baseUrl } as QueryKey<TOptions>[0];
    if (infinite) {
        params._infinite = infinite;
    }
    if (options?.body) {
        params.body = options.body;
    }
    if (options?.headers) {
        params.headers = options.headers;
    }
    if (options?.path) {
        params.path = options.path;
    }
    if (options?.query) {
        params.query = options.query;
    }
    return [
        params
    ];
};

export const healthCheckApiGetQueryKey = (options?: Options<HealthCheckApiGetData>) => createQueryKey('healthCheckApiGet', options);

export const healthCheckApiGetOptions = (options?: Options<HealthCheckApiGetData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await healthCheckApiGet({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: healthCheckApiGetQueryKey(options)
    });
};

export const userInfoApiUserIdGetQueryKey = (options: Options<UserInfoApiUserIdGetData>) => createQueryKey('userInfoApiUserIdGet', options);

export const userInfoApiUserIdGetOptions = (options: Options<UserInfoApiUserIdGetData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await userInfoApiUserIdGet({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: userInfoApiUserIdGetQueryKey(options)
    });
};

export const postUserInfoApiUserPostQueryKey = (options: Options<PostUserInfoApiUserPostData>) => createQueryKey('postUserInfoApiUserPost', options);

export const postUserInfoApiUserPostOptions = (options: Options<PostUserInfoApiUserPostData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await postUserInfoApiUserPost({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: postUserInfoApiUserPostQueryKey(options)
    });
};

export const postUserInfoApiUserPostMutation = (options?: Partial<Options<PostUserInfoApiUserPostData>>) => {
    const mutationOptions: UseMutationOptions<PostUserInfoApiUserPostResponse, PostUserInfoApiUserPostError, Options<PostUserInfoApiUserPostData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await postUserInfoApiUserPost({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const removeImageBackgroundApiImageRemoveBackgroundPostQueryKey = (options: Options<RemoveImageBackgroundApiImageRemoveBackgroundPostData>) => createQueryKey('removeImageBackgroundApiImageRemoveBackgroundPost', options);

export const removeImageBackgroundApiImageRemoveBackgroundPostOptions = (options: Options<RemoveImageBackgroundApiImageRemoveBackgroundPostData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await removeImageBackgroundApiImageRemoveBackgroundPost({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: removeImageBackgroundApiImageRemoveBackgroundPostQueryKey(options)
    });
};

export const removeImageBackgroundApiImageRemoveBackgroundPostMutation = (options?: Partial<Options<RemoveImageBackgroundApiImageRemoveBackgroundPostData>>) => {
    const mutationOptions: UseMutationOptions<unknown, RemoveImageBackgroundApiImageRemoveBackgroundPostError, Options<RemoveImageBackgroundApiImageRemoveBackgroundPostData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await removeImageBackgroundApiImageRemoveBackgroundPost({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const getUsersMementosApiUserUserIdMementoGetQueryKey = (options: Options<GetUsersMementosApiUserUserIdMementoGetData>) => createQueryKey('getUsersMementosApiUserUserIdMementoGet', options);

export const getUsersMementosApiUserUserIdMementoGetOptions = (options: Options<GetUsersMementosApiUserUserIdMementoGetData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await getUsersMementosApiUserUserIdMementoGet({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: getUsersMementosApiUserUserIdMementoGetQueryKey(options)
    });
};

export const createNewMementoApiUserUserIdMementoPostQueryKey = (options: Options<CreateNewMementoApiUserUserIdMementoPostData>) => createQueryKey('createNewMementoApiUserUserIdMementoPost', options);

export const createNewMementoApiUserUserIdMementoPostOptions = (options: Options<CreateNewMementoApiUserUserIdMementoPostData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await createNewMementoApiUserUserIdMementoPost({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: createNewMementoApiUserUserIdMementoPostQueryKey(options)
    });
};

export const createNewMementoApiUserUserIdMementoPostMutation = (options?: Partial<Options<CreateNewMementoApiUserUserIdMementoPostData>>) => {
    const mutationOptions: UseMutationOptions<CreateNewMementoApiUserUserIdMementoPostResponse, CreateNewMementoApiUserUserIdMementoPostError, Options<CreateNewMementoApiUserUserIdMementoPostData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await createNewMementoApiUserUserIdMementoPost({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const updateMementoAndImagesApiUserUserIdMementoIdPutMutation = (options?: Partial<Options<UpdateMementoAndImagesApiUserUserIdMementoIdPutData>>) => {
    const mutationOptions: UseMutationOptions<unknown, UpdateMementoAndImagesApiUserUserIdMementoIdPutError, Options<UpdateMementoAndImagesApiUserUserIdMementoIdPutData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await updateMementoAndImagesApiUserUserIdMementoIdPut({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const getUsersCollectionsApiUserUserIdCollectionGetQueryKey = (options: Options<GetUsersCollectionsApiUserUserIdCollectionGetData>) => createQueryKey('getUsersCollectionsApiUserUserIdCollectionGet', options);

export const getUsersCollectionsApiUserUserIdCollectionGetOptions = (options: Options<GetUsersCollectionsApiUserUserIdCollectionGetData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await getUsersCollectionsApiUserUserIdCollectionGet({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: getUsersCollectionsApiUserUserIdCollectionGetQueryKey(options)
    });
};

export const createNewCollectionApiUserUserIdCollectionPostQueryKey = (options: Options<CreateNewCollectionApiUserUserIdCollectionPostData>) => createQueryKey('createNewCollectionApiUserUserIdCollectionPost', options);

export const createNewCollectionApiUserUserIdCollectionPostOptions = (options: Options<CreateNewCollectionApiUserUserIdCollectionPostData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await createNewCollectionApiUserUserIdCollectionPost({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: createNewCollectionApiUserUserIdCollectionPostQueryKey(options)
    });
};

export const createNewCollectionApiUserUserIdCollectionPostMutation = (options?: Partial<Options<CreateNewCollectionApiUserUserIdCollectionPostData>>) => {
    const mutationOptions: UseMutationOptions<CreateNewCollectionApiUserUserIdCollectionPostResponse, CreateNewCollectionApiUserUserIdCollectionPostError, Options<CreateNewCollectionApiUserUserIdCollectionPostData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await createNewCollectionApiUserUserIdCollectionPost({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const deleteCollectionApiUserUserIdCollectionIdDeleteMutation = (options?: Partial<Options<DeleteCollectionApiUserUserIdCollectionIdDeleteData>>) => {
    const mutationOptions: UseMutationOptions<DeleteCollectionApiUserUserIdCollectionIdDeleteResponse, DeleteCollectionApiUserUserIdCollectionIdDeleteError, Options<DeleteCollectionApiUserUserIdCollectionIdDeleteData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await deleteCollectionApiUserUserIdCollectionIdDelete({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const updateCollectionAndMementosApiUserUserIdCollectionIdPutMutation = (options?: Partial<Options<UpdateCollectionAndMementosApiUserUserIdCollectionIdPutData>>) => {
    const mutationOptions: UseMutationOptions<UpdateCollectionAndMementosApiUserUserIdCollectionIdPutResponse, UpdateCollectionAndMementosApiUserUserIdCollectionIdPutError, Options<UpdateCollectionAndMementosApiUserUserIdCollectionIdPutData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await updateCollectionAndMementosApiUserUserIdCollectionIdPut({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const generateCollageApiUserUserIdCollectionIdCollageGetQueryKey = (options: Options<GenerateCollageApiUserUserIdCollectionIdCollageGetData>) => createQueryKey('generateCollageApiUserUserIdCollectionIdCollageGet', options);

export const generateCollageApiUserUserIdCollectionIdCollageGetOptions = (options: Options<GenerateCollageApiUserUserIdCollectionIdCollageGetData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await generateCollageApiUserUserIdCollectionIdCollageGet({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: generateCollageApiUserUserIdCollectionIdCollageGetQueryKey(options)
    });
};

export const testCollageApiTestingCollageGetQueryKey = (options: Options<TestCollageApiTestingCollageGetData>) => createQueryKey('testCollageApiTestingCollageGet', options);

export const testCollageApiTestingCollageGetOptions = (options: Options<TestCollageApiTestingCollageGetData>) => {
    return queryOptions({
        queryFn: async ({ queryKey, signal }) => {
            const { data } = await testCollageApiTestingCollageGet({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: testCollageApiTestingCollageGetQueryKey(options)
    });
};