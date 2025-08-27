import { IsNumber, IsString, ValidateNested } from '@loufa/class-validator';
import { CartItem } from '@pictaccio/admin-api/http/shared/controllers/nested/cart_item';
import { ContactInfo } from '@pictaccio/admin-api/http/shared/controllers/nested/contact_info';
import { Shipping } from '@pictaccio/admin-api/http/shared/controllers/nested/shipping';
import { Subject } from '@pictaccio/admin-api/http/shared/controllers/nested/subject';
import { Transaction } from '@pictaccio/admin-api/http/shared/controllers/nested/transaction';
import { PhotoSelections } from '@pictaccio/shared/src/types/photo_selections';
import { PhotoVersionCollection } from '@pictaccio/shared/src/types/photo_version_collection';

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
