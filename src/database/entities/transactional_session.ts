import { AllowOnWire } from '../../database/decorators/allow_on_wire';
import {
    TransactionalDeliveryOptionGroup
} from '../../database/entities/transactional_delivery_option_group';
import { TransactionalProductCatalog } from '../../database/entities/transactional_product_catalog';
import { TransactionalProductCrosssell } from '../../database/entities/transactional_product_crosssell';
import { TransactionalWorkflow } from '../../database/entities/transactional_workflow';
import {
    DataTableEntityMethods,
    DataTableReadRequest,
    DataTableUpdateRequest
} from '../../database/helpers/data_table';
import { SessionInfo } from '@pictaccio/shared/types/session_info';
import { SessionOptions } from '@pictaccio/shared/types/session_options';
import { StaticImplements } from '@pictaccio/shared/types/static_implements';
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    LessThan,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    QueryRunner,
    UpdateQueryBuilder,
    UpdateResult
} from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

@Entity({ name: 'sessions', schema: 'transactional' })
export class TransactionalSession
    extends BaseEntity
    implements StaticImplements<DataTableEntityMethods<TransactionalSession>,
        typeof TransactionalSession> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'sessions_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('sessions_internal_name_idx', { unique: true })
    @Column({ type: 'text' })
    public internal_name: string;

    @AllowOnWire
    @Index('sessions_archived_idx')
    @Column({ type: 'boolean', default: false })
    public archived: boolean;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public options: SessionOptions;

    @AllowOnWire
    @Index('sessions_expire_date_idx')
    @Column({ type: 'timestamp' })
    public expire_date: Date;

    @AllowOnWire
    @Index('sessions_publish_date_idx')
    @Column({ type: 'timestamp' })
    public publish_date: Date;

    @AllowOnWire
    @ManyToOne(() => TransactionalProductCrosssell, crosssell => crosssell.id)
    @JoinColumn({ name: 'product_crosssell_id', foreignKeyConstraintName: 'sessions_product_crosssell_fkey' })
    public productCrosssell: TransactionalProductCrosssell;

    @AllowOnWire
    @ManyToMany(() => TransactionalDeliveryOptionGroup, { cascade: true })
    @JoinTable({
        name: 'sessions_delivery_option_groups_map',
        joinColumn: {
            name: 'session_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'session_id_fkey'
        },
        inverseJoinColumn: {
            name: 'delivery_option_group_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'delivery_option_group_id_fkey'
        }
    })
    public deliveryGroups: TransactionalDeliveryOptionGroup[];

    @AllowOnWire
    @ManyToMany(() => TransactionalProductCatalog, { cascade: true })
    @JoinTable({
        name: 'sessions_product_catalogs_map',
        joinColumn: {
            name: 'session_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'session_id_fkey'
        },
        inverseJoinColumn: {
            name: 'product_catalog_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'product_catalog_id_fkey'
        }
    })
    public productCatalogs: TransactionalProductCatalog[];

    @AllowOnWire
    @ManyToOne(() => TransactionalWorkflow, workflow => workflow.id, { nullable: true })
    @JoinColumn({ name: 'workflow_id', foreignKeyConstraintName: 'sessions_workflow_fkey' })
    public workflow: TransactionalWorkflow;

    /* DATATABLE ENTITY METHODS */
    public static async beforeRead(request: DataTableReadRequest<TransactionalSession>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalSession>): Promise<void> {
        query
            .leftJoinAndSelect('TransactionalSession.productCrosssell', 'TransactionalProductCrosssell')
            .leftJoinAndSelect('TransactionalSession.deliveryGroups', 'TransactionalDeliveryOptionGroup')
            .leftJoinAndSelect('TransactionalSession.productCatalogs', 'TransactionalProductCatalog')
            .leftJoinAndSelect('TransactionalSession.workflow', 'TransactionalWorkflow');

        if (request.filters) {
            const workflowIdFilter = request.filters
                .flat().find(filter => filter.column as string === '_workflow_id');

            if (workflowIdFilter) {
                query.andWhere('TransactionalWorkflow.id IN (:...workflowId)', {
                    workflowId: workflowIdFilter.operand[0]
                });
            }
        }
    }

    public static async afterUpdate(request: DataTableUpdateRequest<TransactionalSession>,
        runner: QueryRunner,
        query: UpdateQueryBuilder<TransactionalSession>,
        result: UpdateResult): Promise<void> {
        const catalogColumn = request.values.find(value => value.column === 'productCatalogs');
        const deliveryColumn = request.values.find(value => value.column === 'deliveryGroups');
        const crosssellColumn = request.values.find(value => value.column === 'productCrosssell');
        const workflowColumn = request.values.find(value => value.column === 'workflow');

        if (catalogColumn?.value) {
            const previousProductCatalogs = await query.relation('productCatalogs')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadMany<TransactionalProductCatalog>();
            const addedProductCatalogs = catalogColumn.value
                .filter(id => !previousProductCatalogs
                    .find(catalog => parseInt(catalog.id.toString(), 10) === parseInt(id, 10)))
                .map(id => parseInt(id, 10));
            const removedProductCatalogs = previousProductCatalogs
                .filter(catalog => !catalogColumn.value.includes(catalog.id.toString()))
                .map(catalog => parseInt(catalog.id.toString(), 10));

            await query.relation('productCatalogs')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(addedProductCatalogs, removedProductCatalogs);
        }

        if (deliveryColumn?.value) {
            const previousDeliveryGroups = await query.relation('deliveryGroups')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .loadMany<TransactionalDeliveryOptionGroup>();
            const addedDeliveryGroups = deliveryColumn.value
                .filter(id => !previousDeliveryGroups
                    .find(delivery => parseInt(delivery.id.toString(), 10) === parseInt(id, 10)))
                .map(id => parseInt(id, 10));
            const removedDeliveryGroups = previousDeliveryGroups
                .filter(delivery => !deliveryColumn.value.includes(delivery.id.toString()))
                .map(delivery => parseInt(delivery.id.toString(), 10));

            await query.relation('deliveryGroups')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .addAndRemove(addedDeliveryGroups, removedDeliveryGroups);
        }

        if (crosssellColumn?.value) {
            await query.relation('productCrosssell')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .set(parseInt(crosssellColumn.value[0], 10));
        }

        if (workflowColumn?.value) {
            await query.relation('workflow')
                .of(request.filters.flat().find(filter => filter.column === 'id').operand)
                .set(parseInt(workflowColumn.value[0], 10));
        }
    }

    /* PUBLIC */
    public static async archive(sessionId: string): Promise<void> {
        const session = await TransactionalSession.findOne({ where: { id: sessionId } });

        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        session.archived = true;
        await session.save();
    }

    public static async archiveExpiredSessions(): Promise<void> {
        const sessions = await TransactionalSession.find({ where: { expire_date: LessThan(new Date()) } });

        for (const session of sessions) {
            session.archived = true;
            await session.save();
        }
    }

    public static async createSession(sessionInfo: SessionInfo): Promise<string> {
        const query = TransactionalSession.createQueryBuilder('session')
            .insert()
            .into(TransactionalSession)
            .values({
                internal_name: sessionInfo.internalName,
                options: {
                    color: sessionInfo.options.color,
                    digitalGroupPrice: sessionInfo.options.digitalGroupPrice,
                    digitalGroupPriceIsScaling: sessionInfo.options.digitalGroupPriceIsScaling,
                    digitalPrice: sessionInfo.options.digitalPrice,
                    digitalPriceIsScaling: sessionInfo.options.digitalPriceIsScaling,
                    digitalAutoSendEnable: sessionInfo.options.digitalAutoSendEnable,
                    digitalGroupsEnable: sessionInfo.options.digitalGroupsEnable,
                    digitalEnable: sessionInfo.options.digitalEnable,
                    discountEnable: sessionInfo.options.discountEnable,
                    discountCatalogId: sessionInfo.options.discountCatalogId,
                    discountPrices: sessionInfo.options.discountPrices,
                    discountGroupPrices: sessionInfo.options.discountGroupPrices,
                    touchupsEnable: sessionInfo.options.touchupsEnable,
                    touchupsPrice: sessionInfo.options.touchupsPrice,
                    touchupsPriceIsScaling: sessionInfo.options.touchupsPriceIsScaling
                },
                expire_date: sessionInfo.dateExpire,
                publish_date: sessionInfo.datePublish
            });
        const result = await query.execute();
        const insertId = result.identifiers[0].id;

        await query.relation('productCrosssell').of(insertId).set(sessionInfo.crosssellId);
        await query.relation('deliveryGroups').of(insertId).add(sessionInfo.deliveryGroups);
        await query.relation('productCatalogs').of(insertId).add(sessionInfo.productCatalogs);
        await query.relation('workflow').of(insertId).set(sessionInfo.workflowId);

        return insertId;
    }
}
