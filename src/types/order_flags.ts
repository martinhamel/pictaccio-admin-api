import { OrderPromoFlag } from '@pictaccio/admin-api/types/order_promo_flag';
import { Language } from '@pictaccio/shared/src/types/language';
import { OrderSnapshot } from '@pictaccio/shared/src/types/order_snapshot';

export type OrderFlags = {
    customerLocale: Language;
    freeShipping: boolean;
    promo: OrderPromoFlag;
    snapshot: OrderSnapshot;
}
