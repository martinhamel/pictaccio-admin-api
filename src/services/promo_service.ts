import { randomBytes } from 'crypto';
import { Service } from 'typedi';
import { TransactionalPromoCode } from '../database/entities/transactional_promo_code';
import { TransactionalPromoCodeCampaign } from '../database/entities/transactional_promo_code_campaign';

@Service('promo')
export class PromoService {
    public async createCodes(count: number, campaignId: string): Promise<void> {
        const campaign = await TransactionalPromoCodeCampaign.findOne({ where: { id: campaignId } });

        for (let i = 0; i < count; i++) {
            let newCode;
            do {
                newCode = randomBytes(64).toString('hex', 0, 8);
            } while (await TransactionalPromoCode.findByCode(newCode));
            await TransactionalPromoCode.createPromoCode(newCode, campaign, null);
        }
    }
}
