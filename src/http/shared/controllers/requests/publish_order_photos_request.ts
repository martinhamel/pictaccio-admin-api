import { ValidateNested } from 'class-validator';
import { PhotoPublish } from '../../../../http/shared/controllers/nested/photo_publish';

export class PublishUnpublishOrderPhotosRequest {
    @ValidateNested({ each: true })
    public photos: PhotoPublish[];
}
