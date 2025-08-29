import { OrderPromoFlag } from '../types/order_promo_flag';
import { Language } from '@pictaccio/shared/types/language';
import { OrderSnapshot } from '@pictaccio/shared/types/order_snapshot';

export type OrderFlags = {
    customerLocale: Language;
    freeShipping: boolean;
    promo: OrderPromoFlag;
    snapshot: OrderSnapshot;
}
