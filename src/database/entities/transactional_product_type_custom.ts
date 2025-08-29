import { TransactionalProduct } from '../../database/entities/transactional_product';
import {
    TransactionalProductCustomTemplate
} from '../../database/entities/transactional_product_custom_template';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

@Entity({ name: 'product_type_customs', schema: 'transactional' })
export class TransactionalProductTypeCustom extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'product_type_customs_id_pkey' })
    public id: string;

    @OneToOne(() => TransactionalProduct)
    public product: Relation<TransactionalProduct>;

    @ManyToOne(() => TransactionalProductCustomTemplate, { cascade: true, nullable: true })
    @JoinColumn({ name: 'custom_template_id', foreignKeyConstraintName: 'product_type_custom_custom_template_id_fkey' })
    public customTemplate: TransactionalProductCustomTemplate;
}
