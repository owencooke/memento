// This file is auto-generated by @hey-api/openapi-ts

export type BodyCreateNewCollectionApiUserUserIdCollectionPost = {
    new_collection: NewCollection;
    mementos: Array<number>;
};

export type BodyCreateNewMementoApiUserUserIdMementoPost = {
    memento_str: string;
    image_metadata_str: string;
    images: Array<Blob | File>;
};

export type BodyRemoveImageBackgroundApiImageRemoveBackgroundPost = {
    image_file: Blob | File;
};

export type BodyUpdateCollectionAndMementosApiUserUserIdCollectionIdPut = {
    collection: UpdateCollection;
    mementos: Array<number>;
};

export type BodyUpdateMementoAndImagesApiUserUserIdMementoIdPut = {
    memento_str: string;
    image_metadata_str: string;
    images?: Array<Blob | File> | null;
};

/**
 * Collection Schema for Pydantic.
 *
 * Inherits from CollectionBaseSchema. Add any customization here.
 */
export type Collection = {
    id: number;
    caption?: string | null;
    coordinates?: string | null;
    date?: string | null;
    location?: string | null;
    title: string;
    user_id: string;
    ids?: Array<HasMemento> | null;
};

export type CollectionWithMementos = {
    id: number;
    caption?: string | null;
    coordinates?: Coordinates | null;
    date?: string | null;
    location?: string | null;
    title: string;
    user_id: string;
    mementos: Array<HasMementoBaseSchema>;
};

/**
 * A model that provides methods for converting lat/long
 * coordinates between a variety of formats.
 */
export type Coordinates = {
    lat: number;
    long: number;
};

/**
 * Successful response model for the Create Memento route.
 */
export type CreateMementoSuccessResponse = {
    new_memento_id: number;
    message?: string;
};

export type HttpValidationError = {
    detail?: Array<ValidationError>;
};

/**
 * HasMemento Schema for Pydantic.
 *
 * Inherits from HasMementoBaseSchema. Add any customization here.
 */
export type HasMemento = {
    collection_id: number;
    memento_id: number;
    collection_ids?: Array<Collection> | null;
    memento_ids?: Array<Memento> | null;
};

/**
 * HasMemento Base Schema.
 */
export type HasMementoBaseSchema = {
    collection_id: number;
    memento_id: number;
};

/**
 * Image Schema for Pydantic.
 *
 * Inherits from ImageBaseSchema. Add any customization here.
 */
export type Image = {
    id: number;
    memento_id: number;
    coordinates?: string | null;
    date?: string | null;
    detected_text?: string | null;
    filename: string;
    image_label?: string | null;
    mime_type?: string | null;
    order_index: number;
    memento_ids?: Array<Memento> | null;
};

export type ImageWithUrl = {
    id: number;
    memento_id: number;
    coordinates?: Coordinates | null;
    date?: string | null;
    detected_text?: string | null;
    filename: string;
    image_label?: string | null;
    mime_type?: string | null;
    order_index: number;
    url?: string;
};

/**
 * Memento Schema for Pydantic.
 *
 * Inherits from MementoBaseSchema. Add any customization here.
 */
export type Memento = {
    id: number;
    caption?: string | null;
    coordinates?: string | null;
    date?: string | null;
    location?: string | null;
    user_id: string;
    ids?: Array<Image> | null;
};

export type MementoWithImages = {
    id: number;
    caption?: string | null;
    coordinates?: Coordinates | null;
    date?: string | null;
    location?: string | null;
    user_id: string;
    images: Array<ImageWithUrl>;
};

/**
 * Inserting a new Collection to the DB.
 *
 * Overrides coordinates with proper Pydantic model.
 */
export type NewCollection = {
    title: string;
    caption?: string | null;
    coordinates?: Coordinates | null;
    date?: string | null;
    location?: string | null;
    user_id?: string | null;
};

/**
 * Updating an existing Collection record in the DB.
 */
export type UpdateCollection = {
    caption?: string | null;
    coordinates?: Coordinates | null;
    date?: string | null;
    location?: string | null;
    title?: string | null;
    user_id?: string | null;
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

export type WsMessageType = 'recommendation';

/**
 * The structure of a WebSocket message.
 */
export type WebSocketMessage = {
    type: WsMessageType;
    body: unknown;
};

export type HealthCheckApiGetData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/';
};

export type HealthCheckApiGetResponses = {
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

export type RemoveImageBackgroundApiImageRemoveBackgroundPostData = {
    body: BodyRemoveImageBackgroundApiImageRemoveBackgroundPost;
    path?: never;
    query?: never;
    url: '/api/image/remove-background';
};

export type RemoveImageBackgroundApiImageRemoveBackgroundPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type RemoveImageBackgroundApiImageRemoveBackgroundPostError = RemoveImageBackgroundApiImageRemoveBackgroundPostErrors[keyof RemoveImageBackgroundApiImageRemoveBackgroundPostErrors];

export type RemoveImageBackgroundApiImageRemoveBackgroundPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetUsersMementosApiUserUserIdMementoGetData = {
    body?: never;
    path: {
        user_id: string;
    };
    query?: {
        start_date?: string | null;
        end_date?: string | null;
        min_lat?: number | null;
        min_long?: number | null;
        max_lat?: number | null;
        max_long?: number | null;
        text?: string | null;
    };
    url: '/api/user/{user_id}/memento/';
};

export type GetUsersMementosApiUserUserIdMementoGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetUsersMementosApiUserUserIdMementoGetError = GetUsersMementosApiUserUserIdMementoGetErrors[keyof GetUsersMementosApiUserUserIdMementoGetErrors];

export type GetUsersMementosApiUserUserIdMementoGetResponses = {
    /**
     * Successful Response
     */
    200: Array<MementoWithImages>;
};

export type GetUsersMementosApiUserUserIdMementoGetResponse = GetUsersMementosApiUserUserIdMementoGetResponses[keyof GetUsersMementosApiUserUserIdMementoGetResponses];

export type CreateNewMementoApiUserUserIdMementoPostData = {
    body: BodyCreateNewMementoApiUserUserIdMementoPost;
    path: {
        user_id: string;
    };
    query?: never;
    url: '/api/user/{user_id}/memento/';
};

export type CreateNewMementoApiUserUserIdMementoPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CreateNewMementoApiUserUserIdMementoPostError = CreateNewMementoApiUserUserIdMementoPostErrors[keyof CreateNewMementoApiUserUserIdMementoPostErrors];

export type CreateNewMementoApiUserUserIdMementoPostResponses = {
    /**
     * Successful Response
     */
    200: CreateMementoSuccessResponse;
};

export type CreateNewMementoApiUserUserIdMementoPostResponse = CreateNewMementoApiUserUserIdMementoPostResponses[keyof CreateNewMementoApiUserUserIdMementoPostResponses];

export type UpdateMementoAndImagesApiUserUserIdMementoIdPutData = {
    body: BodyUpdateMementoAndImagesApiUserUserIdMementoIdPut;
    path: {
        id: number;
    };
    query?: never;
    url: '/api/user/{user_id}/memento/{id}';
};

export type UpdateMementoAndImagesApiUserUserIdMementoIdPutErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type UpdateMementoAndImagesApiUserUserIdMementoIdPutError = UpdateMementoAndImagesApiUserUserIdMementoIdPutErrors[keyof UpdateMementoAndImagesApiUserUserIdMementoIdPutErrors];

export type UpdateMementoAndImagesApiUserUserIdMementoIdPutResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetUsersCollectionsApiUserUserIdCollectionGetData = {
    body?: never;
    path: {
        user_id: string;
    };
    query?: never;
    url: '/api/user/{user_id}/collection/';
};

export type GetUsersCollectionsApiUserUserIdCollectionGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetUsersCollectionsApiUserUserIdCollectionGetError = GetUsersCollectionsApiUserUserIdCollectionGetErrors[keyof GetUsersCollectionsApiUserUserIdCollectionGetErrors];

export type GetUsersCollectionsApiUserUserIdCollectionGetResponses = {
    /**
     * Successful Response
     */
    200: Array<CollectionWithMementos>;
};

export type GetUsersCollectionsApiUserUserIdCollectionGetResponse = GetUsersCollectionsApiUserUserIdCollectionGetResponses[keyof GetUsersCollectionsApiUserUserIdCollectionGetResponses];

export type CreateNewCollectionApiUserUserIdCollectionPostData = {
    body: BodyCreateNewCollectionApiUserUserIdCollectionPost;
    path: {
        user_id: string;
    };
    query?: never;
    url: '/api/user/{user_id}/collection/';
};

export type CreateNewCollectionApiUserUserIdCollectionPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CreateNewCollectionApiUserUserIdCollectionPostError = CreateNewCollectionApiUserUserIdCollectionPostErrors[keyof CreateNewCollectionApiUserUserIdCollectionPostErrors];

export type CreateNewCollectionApiUserUserIdCollectionPostResponses = {
    /**
     * Successful Response
     */
    200: Collection;
};

export type CreateNewCollectionApiUserUserIdCollectionPostResponse = CreateNewCollectionApiUserUserIdCollectionPostResponses[keyof CreateNewCollectionApiUserUserIdCollectionPostResponses];

export type DeleteCollectionApiUserUserIdCollectionIdDeleteData = {
    body?: never;
    path: {
        id: number;
    };
    query?: never;
    url: '/api/user/{user_id}/collection/{id}';
};

export type DeleteCollectionApiUserUserIdCollectionIdDeleteErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type DeleteCollectionApiUserUserIdCollectionIdDeleteError = DeleteCollectionApiUserUserIdCollectionIdDeleteErrors[keyof DeleteCollectionApiUserUserIdCollectionIdDeleteErrors];

export type DeleteCollectionApiUserUserIdCollectionIdDeleteResponses = {
    /**
     * Successful Response
     */
    200: Collection;
};

export type DeleteCollectionApiUserUserIdCollectionIdDeleteResponse = DeleteCollectionApiUserUserIdCollectionIdDeleteResponses[keyof DeleteCollectionApiUserUserIdCollectionIdDeleteResponses];

export type UpdateCollectionAndMementosApiUserUserIdCollectionIdPutData = {
    body: BodyUpdateCollectionAndMementosApiUserUserIdCollectionIdPut;
    path: {
        id: number;
    };
    query?: never;
    url: '/api/user/{user_id}/collection/{id}';
};

export type UpdateCollectionAndMementosApiUserUserIdCollectionIdPutErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type UpdateCollectionAndMementosApiUserUserIdCollectionIdPutError = UpdateCollectionAndMementosApiUserUserIdCollectionIdPutErrors[keyof UpdateCollectionAndMementosApiUserUserIdCollectionIdPutErrors];

export type UpdateCollectionAndMementosApiUserUserIdCollectionIdPutResponses = {
    /**
     * Successful Response
     */
    200: Collection;
};

export type UpdateCollectionAndMementosApiUserUserIdCollectionIdPutResponse = UpdateCollectionAndMementosApiUserUserIdCollectionIdPutResponses[keyof UpdateCollectionAndMementosApiUserUserIdCollectionIdPutResponses];

export type GenerateCollageApiUserUserIdCollectionIdCollageGetData = {
    body?: never;
    path: {
        id: number;
    };
    query?: never;
    url: '/api/user/{user_id}/collection/{id}/collage';
};

export type GenerateCollageApiUserUserIdCollectionIdCollageGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GenerateCollageApiUserUserIdCollectionIdCollageGetError = GenerateCollageApiUserUserIdCollectionIdCollageGetErrors[keyof GenerateCollageApiUserUserIdCollectionIdCollageGetErrors];

export type GenerateCollageApiUserUserIdCollectionIdCollageGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type TestCollageApiTestingCollageGetData = {
    body?: never;
    path?: never;
    query: {
        /**
         * Local folder path containing test image files
         */
        folder_path: string;
        /**
         * Collection title
         */
        title?: string;
        /**
         * Collection caption
         */
        caption?: string | null;
        /**
         * Collection location
         */
        location?: string | null;
    };
    url: '/api/testing/collage';
};

export type TestCollageApiTestingCollageGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type TestCollageApiTestingCollageGetError = TestCollageApiTestingCollageGetErrors[keyof TestCollageApiTestingCollageGetErrors];

export type TestCollageApiTestingCollageGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type ClientOptions = {
    baseUrl: `${string}://${string}` | (string & {});
};