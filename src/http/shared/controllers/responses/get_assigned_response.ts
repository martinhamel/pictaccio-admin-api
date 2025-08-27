import { IsUUID } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class GetAssignedResponse extends BaseResponse {
    @IsUUID()
    public userId?: string;
}
