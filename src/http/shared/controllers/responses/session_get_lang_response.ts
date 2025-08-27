import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { IsLocale } from '@loufa/class-validator';

export class SessionGetLangResponse extends BaseResponse {
    @IsLocale()
    public lang: string;
}
