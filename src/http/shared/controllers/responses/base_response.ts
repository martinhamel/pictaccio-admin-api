import { IsNotEmpty, IsIn, IsUUID } from '@loufa/class-validator';
import { ApiResponseStatus } from '@pictaccio/shared/src/types/responses/api_response_status';

export class BaseResponse {
    @IsIn(['great-success', 'failed', 'error'])
    public status: ApiResponseStatus;

    @IsNotEmpty()
    public context?: string;

    @IsUUID()
    public correlationId?: string;
}
