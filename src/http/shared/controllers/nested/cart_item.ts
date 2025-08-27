import { IsIn, IsNumber, IsString, ValidateNested } from '@loufa/class-validator';
import { LocalizedString } from '@pictaccio/admin-api/http/shared/controllers/nested/localized_string';
import { ProductPhoto } from '@pictaccio/admin-api/http/shared/controllers/nested/product_photo';
import { ProductType, ProductTypes } from '@pictaccio/shared/src/types/product_type';
import { VirtualProduct } from '@pictaccio/shared/src/types/virtual_product';

export class CartItem {
    @IsIn(ProductTypes)
    public productType?: ProductType;

    @IsString({ each: true })
    public customProductSelection?: string[];

    @IsString()
    public comment?: string;

    @IsString({ each: true })
    public photos?: string[];

    @IsNumber()
    public productId?: number;

    @IsNumber()
    public quantity?: number;

    @IsString()
    public productName?: string | VirtualProduct;

    @ValidateNested()
    public productPhoto?: ProductPhoto;

    @IsNumber()
    public subtotal?: number;

    @IsNumber()
    public productPrice?: number;

    @IsString()
    public theme?: string;

    @ValidateNested({ each: true })
    public themeLocale?: LocalizedString;
}
