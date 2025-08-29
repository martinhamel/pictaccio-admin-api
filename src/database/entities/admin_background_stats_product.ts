import { AdminBackgroundStat } from '../../database/entities/admin_background_stat';
import { TransactionalProduct } from '../../database/entities/transactional_product';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: 'background_stats_products', schema: 'admin' })
export class AdminBackgroundStatsProduct extends BaseEntity {
    @PrimaryColumn({
        type: 'bigint',
        name: 'background_stats_date',
        primaryKeyConstraintName: 'background_stats_products_pkey'
    })
    public background_stats_date: number;

    @PrimaryColumn({
        type: 'bigint',
        name: 'background_stats_background_id',
        primaryKeyConstraintName: 'background_stats_products_pkey'
    })
    public background_stats_background_id: number;

    @PrimaryColumn({
        type: 'text',
        name: 'background_stats_product_id',
        primaryKeyConstraintName: 'background_stats_products_pkey'
    })
    public background_stats_product_id: string;

    @ManyToOne(() => AdminBackgroundStat, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
    @JoinColumn([
        {
            name: 'background_stats_date',
            referencedColumnName: 'date',
            foreignKeyConstraintName: 'background_stats_products_date_fkey'
        },
        {
            name: 'background_stats_background_id',
            referencedColumnName: 'background_id',
            foreignKeyConstraintName: 'background_stats_products_background_id_fkey'
        }
    ])
    public backgroundStat: AdminBackgroundStat;

    @Column({
        type: 'bigint',
        name: 'product_id',
        asExpression: `
        CASE 
            WHEN background_stats_product_id ~ '^[0-9]+$' THEN background_stats_product_id::bigint 
            ELSE NULL 
        END
        `,
        generatedType: 'STORED',
        nullable: true
    })
    public product_id: number;

    @ManyToOne(() => TransactionalProduct, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'background_stats_products_product_id_fkey' })
    public product: TransactionalProduct;
}
