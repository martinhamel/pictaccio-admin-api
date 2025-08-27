import { ValidateNested } from '@loufa/class-validator';
import { PhotoPublish } from '@pictaccio/admin-api/http/shared/controllers/nested/photo_publish';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class GetOrderPublishPhotosResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public photos?: PhotoPublish[];
}
