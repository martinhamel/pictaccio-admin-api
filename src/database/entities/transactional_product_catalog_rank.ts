import { TransactionalProductCatalog } from '@pictaccio/admin-api/database/entities/transactional_product_catalog';
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'product_catalog_ranks', schema: 'transactional' })
export class TransactionalProductCatalogRank extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'product_catalog_ranks_id_pkey' })
    public id: string;

    @Column({ type: 'int' })
    public rank: number;

    @Column({ type: 'bigint' })
    public product_id: string;

    @ManyToMany(() => TransactionalProductCatalog, catalog => catalog.ranks)
    public catalogs: TransactionalProductCatalog[];
}
