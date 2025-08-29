import { TransactionalProduct } from '../../database/entities/transactional_product';
import { TransactionalProductThemeSet } from '../../database/entities/transactional_product_theme_set';
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation
} from 'typeorm';

@Entity({ name: 'product_type_themes', schema: 'transactional' })
export class TransactionalProductTypeTheme extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'product_type_themes_id_pkey' })
    public id: string;

    @Column({ type: 'text', nullable: true })
    public default_theme: string;

    @Column({ type: 'jsonb' })
    public themes_map: { [key: string]: string };

    @OneToOne(() => TransactionalProduct)
    public product: Relation<TransactionalProduct>;

    @ManyToOne(() => TransactionalProductThemeSet, { cascade: true, nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'theme_set_id', foreignKeyConstraintName: 'product_type_themes_theme_set_id_fkey' })
    public themeSet: TransactionalProductThemeSet;
}
