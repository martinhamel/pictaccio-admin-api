import { ValidateNested } from 'class-validator';
import { NamedColors } from '../../../../http/shared/controllers/nested/named_colors';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class ColorsReadResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public colors: NamedColors;
}
