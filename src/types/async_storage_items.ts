import { Request } from '@pictaccio/admin-api/types/request';
import { User } from '@pictaccio/shared/src/types/user';

export const AsyncStorageItemTypes = [
    'firstBoot',
    'jobContext',
    'pubsubContext',
    'request',
    'requestInternal',
    'socketContext'
] as const;

export type AsyncStorageItemType = typeof AsyncStorageItemTypes[number];

export type JobContext = {
    jobName: string;
    jobId: string;
    startTime: Date;
}

export type PubsubContext = {
    channel: string;
    startTime: Date;
}

export type SocketContext = {
    socketId: string;
    startTime: Date;
    user: User;
}

export type AsyncStorageItemTypeMap = {
    firstBoot: null
    jobContext: JobContext;
    pubsubContext: PubsubContext;
    request: Request;
    requestInternal: Request;
    socketContext: SocketContext;
}

export type AsyncStorageItem<T extends AsyncStorageItemType> = AsyncStorageItemTypeMap[T];
