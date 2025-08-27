import { AdminSalesStatsProduct } from '@pictaccio/admin-api/database/entities/admin_sales_stats_product';
import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { TransactionalSession } from '@pictaccio/admin-api/database/entities/transactional_session';
import {
    AfterLoad,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn
} from 'typeorm';

@Entity({ name: 'sales_stats', schema: 'admin' })
export class AdminSalesStat extends BaseEntity {
    @PrimaryColumn({ type: 'bigint', primaryKeyConstraintName: 'sales_stats_order_id_date_pkey' })
    public date: number;
    public dateJS: Date;

    @PrimaryColumn({ type: 'bigint', primaryKeyConstraintName: 'sales_stats_order_id_date_pkey' })
    public order_id: string;
    @OneToOne(() => TransactionalOrder, { createForeignKeyConstraints: false, nullable: true })
    @JoinColumn({ name: 'order_id' })
    public order?: TransactionalOrder;

    @Column({ type: 'bigint' })
    public session_id: string;
    @ManyToOne(() => TransactionalSession, { createForeignKeyConstraints: false, nullable: true })
    @JoinColumn({ name: 'session_id' })
    public session?: TransactionalSession;

    @Column({ type: 'int' })
    public number_of_subjects: number;

    @Column({ type: 'decimal' })
    public subtotal: string;

    @Column({ type: 'decimal' })
    public shipping: string;

    @Column({ type: 'decimal' })
    public promo_rebate: string;

    @Column({ type: 'decimal' })
    public taxes: string;

    @Column({ type: 'decimal' })
    public returns: string;

    @Column({ type: 'decimal' })
    public return_fees: string;

    @Column({ type: 'decimal' })
    public total: string;

    @OneToMany(() => AdminSalesStatsProduct,
        salesStatsProduct => salesStatsProduct.salesStat,
        { createForeignKeyConstraints: false })
    public products: AdminSalesStatsProduct[];

    @BeforeInsert()
    @BeforeUpdate()
    public toUnixDate(): void {
        if (this.dateJS) {
            this.date = Math.floor(this.dateJS.getTime() / 1000);
        }
    }

    @AfterLoad()
    public fromUnixDate(): void {
        if (this.date) {
            this.dateJS = new Date(this.date * 1000);
        }
    }
}
