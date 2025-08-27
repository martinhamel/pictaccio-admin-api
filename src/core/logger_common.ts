import { Request } from '@pictaccio/admin-api/types/request';

export interface HttpCommonFieldsInterface {
    access_granted: boolean;
    correlation_id: string;
    http_method: string;
    resource_name: string;
    session_id: string;
    src_ip: string;
    src_user_email: string;
    src_user_id: string;
    src_user_roles: string[];
}

export function httpCommonFields(request: Request): HttpCommonFieldsInterface {
    return {
        access_granted: request.permissions?.filter(permission => permission.granted).length !== 0,
        correlation_id: request.correlationId,
        http_method: request.method,
        resource_name: request.url,
        session_id: request.sessionID,
        src_ip: request.ip,
        src_user_email: request.user?.email,
        src_user_id: request.user?.id,
        src_user_roles: request.user?.roles
    };
}
