import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { CartItem } from '../../../../http/shared/controllers/nested/cart_item';
import { ContactInfo } from '../../../../http/shared/controllers/nested/contact_info';
import { OrderData } from '../../../../http/shared/controllers/nested/order_data';
import { PhotoSelection } from '../../../../http/shared/controllers/nested/photo_selection';
import { Shipping } from '../../../../http/shared/controllers/nested/shipping';
import { Subject } from '../../../../http/shared/controllers/nested/subject';
import { Transaction } from '../../../../http/shared/controllers/nested/transaction';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { OrderDescriptor } from '@pictaccio/shared/types/order_descriptor';
import { PhotoVersionCollection } from '@pictaccio/shared/types/photo_version_collection';
import { PhotoVersions } from '@pictaccio/shared/types/photo_versions';

export class ReadOrderResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public orders?: OrderDescriptor[];
}
