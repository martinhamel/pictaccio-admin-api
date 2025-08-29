import { IsNotEmpty, IsIn, IsUUID } from 'class-validator';
import { ApiResponseStatus } from '@pictaccio/shared/types/responses/api_response_status';

export class BaseResponse {
    @IsIn(['great-success', 'failed', 'error'])
    public status: ApiResponseStatus;

    @IsNotEmpty()
    public context?: string;

    @IsUUID()
    public correlationId?: string;
}
