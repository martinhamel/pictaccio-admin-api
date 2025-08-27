import { ValidateNested } from '@loufa/class-validator';
import { NamedColors } from '@pictaccio/admin-api/http/shared/controllers/nested/named_colors';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class ColorsReadResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public colors: NamedColors;
}
