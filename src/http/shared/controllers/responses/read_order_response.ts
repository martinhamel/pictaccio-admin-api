import { IsNumber, IsString, ValidateNested } from '@loufa/class-validator';
import { CartItem } from '@pictaccio/admin-api/http/shared/controllers/nested/cart_item';
import { ContactInfo } from '@pictaccio/admin-api/http/shared/controllers/nested/contact_info';
import { OrderData } from '@pictaccio/admin-api/http/shared/controllers/nested/order_data';
import { PhotoSelection } from '@pictaccio/admin-api/http/shared/controllers/nested/photo_selection';
import { Shipping } from '@pictaccio/admin-api/http/shared/controllers/nested/shipping';
import { Subject } from '@pictaccio/admin-api/http/shared/controllers/nested/subject';
import { Transaction } from '@pictaccio/admin-api/http/shared/controllers/nested/transaction';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { OrderDescriptor } from '@pictaccio/shared/src/types/order_descriptor';
import { PhotoVersionCollection } from '@pictaccio/shared/src/types/photo_version_collection';
import { PhotoVersions } from '@pictaccio/shared/src/types/photo_versions';

export class ReadOrderResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public orders?: OrderDescriptor[];
}
