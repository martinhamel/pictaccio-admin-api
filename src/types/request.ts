import { Request as ExpressRequest } from 'express';
import { File } from '@pictaccio/admin-api/types/file';
import { Permission } from '@pictaccio/admin-api/types/permission';
import { UserSession } from '@pictaccio/admin-api/types/user_session';
import { User } from '@pictaccio/shared/src/types/user';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';

export interface Request extends ExpressRequest {
    method: HttpMethod;
    correlationId: string;
    files: File[];
    permissions: Permission[];
    session: UserSession;
    user: User,
    timestamp: Date;
}
