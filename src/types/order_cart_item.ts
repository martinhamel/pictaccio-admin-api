import { LocalizedString } from '@pictaccio/shared/types/localized_string';
import { ProductType } from '@pictaccio/shared/types/product_type';

export type OrderCartItem = {
    comment: string,
    customProductSelection?: string[],
    itemSubtotal: number,
    productId: string,
    productImage: string,
    productName: string,
    productNameLocale: LocalizedString,
    productPrice: number,
    productType: ProductType,
    quantity: number,
    selection: string[],
    theme: string,
    themeId: string,
    themeLocale: LocalizedString
}

export type OrderCartItems = {
    [key: string]: OrderCartItem
}
