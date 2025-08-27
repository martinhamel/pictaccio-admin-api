import { AdminSalesStat } from '@pictaccio/admin-api/database/entities/admin_sales_stat';
import { TransactionalProduct } from '@pictaccio/admin-api/database/entities/transactional_product';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: 'sales_stats_products', schema: 'admin' })
export class AdminSalesStatsProduct extends BaseEntity {
    @PrimaryColumn({ type: 'bigint', name: 'sales_stats_date', primaryKeyConstraintName: 'sales_stats_products_pkey' })
    public sales_stats_date: number;

    @PrimaryColumn({
        name: 'sales_stats_order_id',
        type: 'bigint',
        primaryKeyConstraintName: 'sales_stats_products_pkey'
    })
    public sales_stats_order_id: string;

    @PrimaryColumn({
        name: 'sales_stats_product_id',
        type: 'text',
        primaryKeyConstraintName: 'sales_stats_products_pkey'
    })
    public sales_stats_product_id: string;

    @Column({ type: 'int' })
    public quantity: number;

    @ManyToOne(() => AdminSalesStat, { createForeignKeyConstraints: false, onDelete: 'CASCADE' })
    @JoinColumn([
        {
            name: 'sales_stats_date',
            referencedColumnName: 'date',
            foreignKeyConstraintName: 'sales_stats_products_date_fkey'
        },
        {
            name: 'sales_stats_order_id',
            referencedColumnName: 'order_id',
            foreignKeyConstraintName: 'sales_stats_products_order_id_fkey'
        }
    ])
    public salesStat: AdminSalesStat;

    @Column({
        type: 'bigint',
        name: 'product_id',
        asExpression: `
        CASE 
            WHEN sales_stats_product_id ~ '^[0-9]+$' THEN sales_stats_product_id::bigint 
            ELSE NULL 
        END
        `,
        generatedType: 'STORED',
        nullable: true
    })
    public product_id: number;

    @ManyToOne(() => TransactionalProduct, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'sales_stats_products_product_id_fkey' })
    public product: TransactionalProduct;
}
