import { ValidateNested } from 'class-validator';
import { Tag } from '../../../../http/shared/controllers/nested/tag';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class TagObjectResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public tags?: Tag[];
}
