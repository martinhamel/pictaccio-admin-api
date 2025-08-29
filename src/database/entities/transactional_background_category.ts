import { AllowOnWire } from '../../database/decorators/allow_on_wire';
import { LocalizedString } from '../../types/localized_string';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'background_categories', schema: 'transactional' })
export class TransactionalBackgroundCategory extends BaseEntity {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'background_categories_id_pkey' })
    public id: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public name_locale: LocalizedString;

    @AllowOnWire
    @Column({ type: 'int', default: 0 })
    public priority: number;
}
