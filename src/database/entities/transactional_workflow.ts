import {
    DataTableEntityMethods,
    DataTableCreateRequest,
    DataTableUpdateRequest
} from '@pictaccio/admin-api/database/helpers/data_table';
import { InvalidFormatError } from '@pictaccio/admin-api/errors/invalid_format_error';
import { StaticImplements } from '@pictaccio/shared/src/types/static_implements';
import { WorkflowOptions } from '@pictaccio/shared/src/types/workflow_options';
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    InsertQueryBuilder,
    PrimaryGeneratedColumn,
    QueryRunner,
    UpdateQueryBuilder
} from 'typeorm';
import { AllowOnWire } from '../decorators/allow_on_wire';
import { validateInternalNameCharacters } from '@pictaccio/shared/src/utils/internal_name_constraint';

@Entity({ name: 'workflows', schema: 'transactional' })
export class TransactionalWorkflow
    extends BaseEntity
    implements StaticImplements<DataTableEntityMethods<TransactionalWorkflow>, typeof TransactionalWorkflow> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'workflows_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('workflows_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public options: WorkflowOptions;

    /* DATATABLE ENTITY METHODS */
    public static async beforeCreate(request: DataTableCreateRequest<TransactionalWorkflow>,
        runner: QueryRunner,
        query: InsertQueryBuilder<TransactionalWorkflow>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }

    public static async beforeUpdate(request: DataTableUpdateRequest<TransactionalWorkflow>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalWorkflow>): Promise<void> {
        if (!query.expressionMap.valuesSet['internal_name'] ||
            !validateInternalNameCharacters(query.expressionMap.valuesSet['internal_name'])) {
            throw new InvalidFormatError('internal_name');
        }
    }
}
