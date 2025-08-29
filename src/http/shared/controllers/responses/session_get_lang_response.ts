import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { IsLocale } from 'class-validator';

export class SessionGetLangResponse extends BaseResponse {
    @IsLocale()
    public lang: string;
}
