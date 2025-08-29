import { Request as ExpressRequest } from 'express';
import { File } from '../types/file';
import { Permission } from '../types/permission';
import { UserSession } from '../types/user_session';
import { User } from '@pictaccio/shared/types/user';

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
