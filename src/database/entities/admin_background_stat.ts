import { TransactionalBackground } from './transactional_background';
import { TransactionalOrder } from './transactional_order';
import { TransactionalProduct } from './transactional_product';
import {
    AfterLoad,
    BaseEntity, BeforeInsert, BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryColumn
} from 'typeorm';

@Entity({ name: 'background_stats', schema: 'admin' })
export class AdminBackgroundStat extends BaseEntity {
    @PrimaryColumn({ type: 'bigint', primaryKeyConstraintName: 'background_stats_id_date_pkey' })
    public date: number;
    public dateJS: Date;

    @PrimaryColumn({ type: 'bigint', primaryKeyConstraintName: 'background_stats_id_date_pkey' })
    background_id: string;

    @Column({ type: 'int' })
    public conversion_count: number;

    @Column({ type: 'int' })
    public usage_count: number;

    @ManyToOne(() => TransactionalBackground, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'background_id', foreignKeyConstraintName: 'background_stats_background_id_fkey' })
    public background: TransactionalBackground;

    @ManyToMany(() => TransactionalOrder, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'background_stats_orders_map',
        schema: 'admin',
        joinColumns: [{
            name: 'date',
            referencedColumnName: 'date',
            foreignKeyConstraintName: 'background_stats_date_fkey'
        }, {
            name: 'background_id',
            referencedColumnName: 'background_id',
            foreignKeyConstraintName: 'background_stats_background_id_fkey'
        }],
        inverseJoinColumns: [{
            name: 'order_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'order_id_fkey'
        }]
    })
    public orders: TransactionalOrder[];

    @ManyToMany(() => TransactionalProduct, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'background_stats_products_map',
        schema: 'admin',
        joinColumns: [{
            name: 'date',
            referencedColumnName: 'date',
            foreignKeyConstraintName: 'background_stats_date_fkey'
        }, {
            name: 'background_id',
            referencedColumnName: 'background_id',
            foreignKeyConstraintName: 'background_stats_background_id_fkey'
        }],
        inverseJoinColumns: [{
            name: 'product_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'product_id_fkey'
        }]
    })
    public products: TransactionalProduct[];

    @BeforeInsert()
    @BeforeUpdate()
    public toUnixDate(): void {
        this.date = Math.floor(this.dateJS.getTime() / 1000);
    }

    @AfterLoad()
    public fromUnixDate(): void {
        this.dateJS = new Date(this.date * 1000);
    }
}
