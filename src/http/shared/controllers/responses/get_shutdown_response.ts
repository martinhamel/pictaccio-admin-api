import { IsBoolean } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { IsNullable } from '@pictaccio/admin-api/http/shared/validators/is_nullable';

export class GetStoreShutdownResponse extends BaseResponse {
    @IsBoolean()
    public shutdown: boolean;

    @IsNullable()
    public message: string;
}
