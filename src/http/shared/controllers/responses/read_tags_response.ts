import { ValidateNested } from '@loufa/class-validator';
import { Tag } from '@pictaccio/admin-api/http/shared/controllers/nested/tag';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class ReadTagsResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public tags?: Tag[];
}
