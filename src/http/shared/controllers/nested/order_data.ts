import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { CartItem } from '../../../../http/shared/controllers/nested/cart_item';
import { ContactInfo } from '../../../../http/shared/controllers/nested/contact_info';
import { Shipping } from '../../../../http/shared/controllers/nested/shipping';
import { Subject } from '../../../../http/shared/controllers/nested/subject';
import { Transaction } from '../../../../http/shared/controllers/nested/transaction';
import { PhotoSelections } from '@pictaccio/shared/types/photo_selections';
import { PhotoVersionCollection } from '@pictaccio/shared/types/photo_version_collection';

export class OrderData {
    @IsNumber()
    public sessionId?: number;

    @ValidateNested({ each: true })
    public cartItems?: CartItem[];

    @IsString()
    public comment?: string;

    @ValidateNested()
    public contact?: ContactInfo;

    @IsNumber()
    public id?: number;

    public photos?: PhotoSelections;

    public photoVersions?: PhotoVersionCollection;

    @ValidateNested()
    public shipping?: Shipping;

    @ValidateNested({ each: true })
    public subjects?: Subject[];

    @ValidateNested()
    public transaction?: Transaction;
}
