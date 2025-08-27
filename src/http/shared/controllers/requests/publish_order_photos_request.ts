import { ValidateNested } from '@loufa/class-validator';
import { PhotoPublish } from '@pictaccio/admin-api/http/shared/controllers/nested/photo_publish';

export class PublishUnpublishOrderPhotosRequest {
    @ValidateNested({ each: true })
    public photos: PhotoPublish[];
}
