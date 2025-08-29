import { ValidateNested } from 'class-validator';
import { PhotoPublish } from '../../../../http/shared/controllers/nested/photo_publish';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class GetOrderPublishPhotosResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public photos?: PhotoPublish[];
}
