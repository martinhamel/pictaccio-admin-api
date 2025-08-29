import { AllowOnWire } from '../../database/decorators/allow_on_wire';
import { TransactionalProductCatalog } from '../../database/entities/transactional_product_catalog';
import { TransactionalSession } from '../../database/entities/transactional_session';
import { TransactionalWorkflow } from '../../database/entities/transactional_workflow';
import {
    DataTableCreateRequest,
    DataTableReadRequest,
    DataTableUpdateRequest
} from '../../database/helpers/data_table';
import { floatTransformer } from '../../database/helpers/transformers/float_transformer';
import { InvalidFormatError } from '../../errors/invalid_format_error';
import { PromoCodeCampaignOptions } from '../../types/promo_code_campaign_options';
import { validateInternalNameCharacters } from '@pictaccio/shared/utils/internal_name_constraint';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    InsertQueryBuilder,
    InsertResult,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    QueryRunner,
    SelectQueryBuilder,
    UpdateDateColumn,
    UpdateQueryBuilder,
    UpdateResult
} from 'typeorm';

@Entity({ name: 'promo_code_campaigns', schema: 'transactional' })
export class TransactionalPromoCodeCampaign extends BaseEntity {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'promo_code_campaigns_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('promo_code_campaigns_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'decimal', precision: 10, scale: 2, transformer: floatTransformer })
    public amount: number;

    @AllowOnWire
    @Column({ type: 'text' })
    public code_prefix: string;

    @AllowOnWire
    @Column({ type: 'jsonb', default: {} })
    public options: PromoCodeCampaignOptions;

    @AllowOnWire
    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    @AllowOnWire
    @UpdateDateColumn({ type: 'timestamp' })
    public modified_on: Date;

    @AllowOnWire
    @ManyToMany(() => TransactionalSession)
    @JoinTable({
        name: 'promo_code_campaigns_sessions_map',
        schema: 'transactional',
        joinColumn: {
            name: 'promo_code_campaign_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'promo_code_campaign_id_fkey'
        },
        inverseJoinColumn: {
            name: 'session_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'session_id_fkey'
        }
    })
    public sessionRestrictions: TransactionalSession[];

    @AllowOnWire
    @ManyToMany(() => TransactionalWorkflow)
    @JoinTable({
        name: 'promo_code_campaigns_workflows_map',
        schema: 'transactional',
        joinColumn: {
            name: 'promo_code_campaign_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'promo_code_campaign_id_fkey'
        },
        inverseJoinColumn: {
            name: 'workflow_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'workflow_id_fkey'
        }
    })
    public workflowRestrictions: TransactionalWorkflow[];

    /* DATATABLE ENTITY METHODS */
    public static async afterCreate(request: DataTableCreateRequest<TransactionalPromoCodeCampaign>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalPromoCodeCampaign>,
        result: InsertResult): Promise<void> {
        const sessionRestrictionsColumn = request.values.find(value => value.column === 'sessionRestrictions');
        const workflowRestrictionsColumn = request.values.find(value => value.column === 'workflowRestrictions');
        const insertId = result.identifiers[0].id;

        if (sessionRestrictionsColumn?.value) {
            await query.relation('sessionRestrictions')
                .of(insertId)
                .add(sessionRestrictionsColumn.value.map(id => ({ id: parseInt(id, 10) })));
        }

        if (workflowRestrictionsColumn?.value) {
            await query.relation('workflowRestrictions')
                .of(insertId)
                .add(workflowRestrictionsColumn.value.map(id => ({ id: parseInt(id, 10) })));
        }
    }

    public static async afterUpdate(request: DataTableUpdateRequest<TransactionalPromoCodeCampaign>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalPromoCodeCampaign>,
        result: UpdateResult): Promise<void> {
        const sessionRestrictionsColumn = request.values.find(value => value.column === 'sessionRestrictions');
        const workflowRestrictionsColumn = request.values.find(value => value.column === 'workflowRestrictions');

        if (sessionRestrictionsColumn?.value) {
            const previousSessionRestrictions = await query.relation('sessionRestrictions')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadMany<TransactionalProductCatalog>();
            const addedSessionRestrictions = sessionRestrictionsColumn.value
                .filter(id => !previousSessionRestrictions
                    .find(catalog => parseInt(catalog.id.toString(), 10) === parseInt(id, 10)))
                .map(id => parseInt(id, 10));
            const removedSessionRestrictions = previousSessionRestrictions
                .filter(catalog => !sessionRestrictionsColumn.value.includes(catalog.id.toString()))
                .map(catalog => parseInt(catalog.id.toString(), 10));

            await query.relation('sessionRestrictions')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(addedSessionRestrictions, removedSessionRestrictions);
        }

        if (workflowRestrictionsColumn?.value) {
            const previousWorkflowRestrictions = await query.relation('workflowRestrictions')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadMany<TransactionalProductCatalog>();
            const addedWorkflowRestrictions = workflowRestrictionsColumn.value
                .filter(id => !previousWorkflowRestrictions
                    .find(catalog => parseInt(catalog.id.toString(), 10) === parseInt(id, 10)))
                .map(id => parseInt(id, 10));
            const removedWorkflowRestrictions = previousWorkflowRestrictions
                .filter(catalog => !workflowRestrictionsColumn.value.includes(catalog.id.toString()))
                .map(catalog => parseInt(catalog.id.toString(), 10));

            await query.relation('workflowRestrictions')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(addedWorkflowRestrictions, removedWorkflowRestrictions);
        }
    }

    public static async beforeRead(request: DataTableReadRequest<TransactionalPromoCodeCampaign>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalPromoCodeCampaign>): Promise<void> {
        query.leftJoinAndSelect('TransactionalPromoCodeCampaign.sessionRestrictions', 'TransactionalSession')
            .leftJoinAndSelect('TransactionalPromoCodeCampaign.workflowRestrictions', 'TransactionalWorkflow');
    }

    public static async beforeCreate(request: DataTableCreateRequest<TransactionalPromoCodeCampaign>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalPromoCodeCampaign>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalPromoCodeCampaign>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalPromoCodeCampaign>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }
}
