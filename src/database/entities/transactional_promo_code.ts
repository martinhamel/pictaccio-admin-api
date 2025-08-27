import { AllowOnWire } from '@pictaccio/admin-api/database/decorators/allow_on_wire';
import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import {
    TransactionalPromoCodeCampaign
} from '@pictaccio/admin-api/database/entities/transactional_promo_code_campaign';
import { DataTableReadRequest } from '@pictaccio/admin-api/database/helpers/data_table';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity, Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    QueryRunner,
    SelectQueryBuilder,
    UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'promo_codes', schema: 'transactional' })
export class TransactionalPromoCode extends BaseEntity {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'promo_codes_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('promo_codes_code_idx', { unique: true })
    @Column({ type: 'text' })
    public code: string;

    @AllowOnWire
    @Index('promo_codes_used_idx')
    @Column({ type: 'boolean' })
    public used: boolean;

    @AllowOnWire
    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    @AllowOnWire
    @UpdateDateColumn({ type: 'timestamp' })
    public used_on: Date;

    @AllowOnWire
    @ManyToOne(() => TransactionalPromoCodeCampaign, promoCodeCampaign => promoCodeCampaign.id)
    @JoinColumn({ name: 'campaign_id', foreignKeyConstraintName: 'promo_code_campaign_id_fkey' })
    public campaign: TransactionalPromoCodeCampaign;

    @AllowOnWire
    @OneToOne(() => TransactionalOrder)
    @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'promo_code_order_id_fkey' })
    public order: TransactionalOrder;

    /* DATATABLE ENTITY METHODS */
    public static async beforeRead(request: DataTableReadRequest<TransactionalPromoCode>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalPromoCode>): Promise<void> {
        query.leftJoinAndSelect('TransactionalPromoCode.campaign', 'TransactionalPromoCodeCampaign')
            .leftJoinAndSelect('TransactionalPromoCode.order', 'TransactionalOrder');

        if (request.filters) {
            const campaignIdFilter = request.filters.flat().find(filter => filter.column === 'campaign');

            if (campaignIdFilter) {
                query.andWhere('TransactionalPromoCodeCampaign.id = :campaignId', {
                    campaignId: campaignIdFilter.operand[0][0]
                });
            }
        }
    }

    /* PUBLIC */
    public static async codesExist(codes: string[]): Promise<{ [code: string]: boolean }> {
        const results = await TransactionalPromoCode
            .createQueryBuilder()
            .select('code')
            .where('code IN(:...codes)', { codes })
            .execute();

        return Object.fromEntries(codes.map(code => [code, results.find(result => result.code === code) !== undefined]));
    }

    public static async createPromoCode(
        code: string,
        campaign: TransactionalPromoCodeCampaign,
        order: TransactionalOrder): Promise<void> {
        const promoCode = new TransactionalPromoCode();
        promoCode.used = false;
        promoCode.code = code;
        promoCode.campaign = campaign;
        promoCode.order = order;
        await promoCode.save();
    }

    public static async createPromoCodes(codes: string[], campaignId: string): Promise<void> {
        const promoCodes = codes.map(code => {
            const promoCode = new TransactionalPromoCode();
            promoCode.used = false;
            promoCode.code = code;
            promoCode.campaign = { id: campaignId } as TransactionalPromoCodeCampaign;
            return promoCode;
        });

        await TransactionalPromoCode.save(promoCodes);
    }

    public static async findByCode(code: string): Promise<TransactionalPromoCode> {
        return await TransactionalPromoCode.findOne({ where: { code: code } });
    }
}
