import { AllowOnWire } from '@pictaccio/admin-api/database/decorators/allow_on_wire';
import { AdminOrderAssignment } from '@pictaccio/admin-api/database/entities/admin_order_assignment';
import { AdminOrderCheck } from '@pictaccio/admin-api/database/entities/admin_order_check';
import { AdminOrderComment } from '@pictaccio/admin-api/database/entities/admin_order_comment';
import { AdminOrderPublishedPhoto } from '@pictaccio/admin-api/database/entities/admin_order_published_photo';
import { AdminOrderStatus } from '@pictaccio/admin-api/database/entities/admin_order_status';
import { TransactionalContact } from '@pictaccio/admin-api/database/entities/transactional_contact';
import { TransactionalDeliveryOption } from '@pictaccio/admin-api/database/entities/transactional_delivery_option';
import { TransactionalSession } from '@pictaccio/admin-api/database/entities/transactional_session';
import { TransactionalSubject } from '@pictaccio/admin-api/database/entities/transactional_subject';
import { TransactionalSubjectGroup } from '@pictaccio/admin-api/database/entities/transactional_subject_group';
import { TransactionalTransaction } from '@pictaccio/admin-api/database/entities/transactional_transaction';
import { DataTableEntityMethods, DataTableReadRequest } from '@pictaccio/admin-api/database/helpers/data_table';
import { floatTransformer } from '@pictaccio/admin-api/database/helpers/transformers/float_transformer';
import { OrderCartItems } from '@pictaccio/admin-api/types/order_cart_item';
import { OrderFlags } from '@pictaccio/admin-api/types/order_flags';
import { OrderPhotoSelection } from '@pictaccio/shared/src/types/order_photo_selection';
import { SaleTaxes } from '@pictaccio/shared/src/types/sale_taxes';
import { StaticImplements } from '@pictaccio/shared/src/types/static_implements';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    QueryRunner,
    UpdateDateColumn
} from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

export interface Comment {
    name: string;
    text: string;
    to: string;
    time: Date;
}

@Entity({ name: 'orders', schema: 'transactional' })
export class TransactionalOrder
    extends BaseEntity
    implements StaticImplements<DataTableEntityMethods<TransactionalOrder>, typeof TransactionalOrder> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'orders_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('orders_archived_idx')
    @Column({ type: 'boolean', default: false })
    public archived: boolean;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public cart: OrderCartItems;

    @AllowOnWire
    @Column({ type: 'text' })
    public comment: string;

    @AllowOnWire
    @Column({ type: 'jsonb', nullable: true })
    public flags: OrderFlags;

    @AllowOnWire
    @Index('orders_paid_idx')
    @Column({ type: 'boolean', default: false })
    public paid: boolean;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public photo_selection: OrderPhotoSelection;

    @AllowOnWire
    @Column({ type: 'decimal', precision: 10, scale: 2, transformer: floatTransformer })
    public sale_subtotal: string;

    @AllowOnWire
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: floatTransformer })
    public sale_delivery_price: string;

    @AllowOnWire
    @Column({ type: 'jsonb', nullable: true })
    public sale_taxes: SaleTaxes;

    @AllowOnWire
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: floatTransformer })
    public sale_total: string;

    @AllowOnWire
    @Index('orders_created_on_idx')
    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    @AllowOnWire
    @Index('orders_completed_on_idx')
    @UpdateDateColumn({ type: 'timestamp' })
    public completed_on: Date;

    @AllowOnWire
    @OneToOne(() => AdminOrderAssignment, assignment => assignment.order)
    public assignment: AdminOrderAssignment;

    @OneToMany(() => AdminOrderCheck, check => check.order)
    public checks: AdminOrderCheck[];

    @OneToMany(() => AdminOrderComment, comment => comment.order)
    public comments: AdminOrderComment[];

    @AllowOnWire
    @ManyToOne(() => TransactionalContact, { nullable: true })
    @JoinColumn({ name: 'contact_id', foreignKeyConstraintName: 'order_contact_id_fkey' })
    public contact: TransactionalContact;

    @AllowOnWire
    @ManyToOne(() => TransactionalDeliveryOption, { nullable: true })
    @JoinColumn({ name: 'delivery_option_id', foreignKeyConstraintName: 'order_delivery_option_id_fkey' })
    public deliveryOption: TransactionalDeliveryOption;

    @AllowOnWire
    @OneToOne(() => AdminOrderStatus, status => status.order)
    public productionStatus: AdminOrderStatus;

    @OneToMany(() => AdminOrderPublishedPhoto, publishedPhotos => publishedPhotos.order)
    public publishedPhotos: AdminOrderPublishedPhoto[];

    @AllowOnWire
    @ManyToOne(() => TransactionalSession)
    @JoinColumn({ name: 'session_id', foreignKeyConstraintName: 'order_session_id_fkey' })
    public session: TransactionalSession;

    @AllowOnWire
    @ManyToMany(() => TransactionalSubjectGroup)
    @JoinTable({
        name: 'orders_subject_groups_map',
        joinColumn: {
            name: 'order_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'order_id_fkey'
        },
        inverseJoinColumn: {
            name: 'subject_group_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'subject_group_id_fkey'
        }
    })
    public subjectGroups: TransactionalSubjectGroup[];

    @AllowOnWire
    @ManyToMany(() => TransactionalSubject)
    @JoinTable({
        name: 'orders_subjects_map',
        joinColumn: {
            name: 'order_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'order_id_fkey'
        },
        inverseJoinColumn: {
            name: 'subject_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'subject_id_fkey'
        }
    })
    public subjects: TransactionalSubject[];

    @OneToMany(() => TransactionalTransaction, transaction => transaction.order, { eager: true })
    public transactions: TransactionalTransaction[];

    /* DATATABLE ENTITY METHODS */
    public static async beforeRead(request: DataTableReadRequest<TransactionalOrder>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalOrder>): Promise<void> {
        query
            .leftJoinAndSelect('TransactionalOrder.contact', 'TransactionalContact')
            .leftJoinAndSelect('TransactionalOrder.session', 'TransactionalSession')
            .leftJoinAndSelect('TransactionalOrder.subjects', 'TransactionalSubject')
            .leftJoinAndSelect('TransactionalOrder.subjectGroups', 'TransactionalSubjectGroup')
            .leftJoinAndSelect('TransactionalOrder.deliveryOption', 'TransactionalDeliveryOption')
            .leftJoinAndSelect('TransactionalOrder.assignment', 'AdminOrderAssignment')
            .addSelect('AdminUser.id')
            .leftJoin('AdminOrderAssignment.user', 'AdminUser')
            .leftJoinAndSelect('TransactionalOrder.productionStatus', 'AdminOrderStatus');

        if (request.filters) {
            const assigneeFilter = request.filters.flat().find(f => f.column as string === '_admin-assignee');
            const contactNameFilter = request.filters.flat().find(f => f.column as string === '_contact-name');
            const contactEmailFilter = request.filters.flat().find(f => f.column as string === '_contact-email');
            const contactPhoneFilter = request.filters.flat().find(f => f.column as string === '_contact-phone');
            const sessionFilter = request.filters.flat().find(f => f.column as string === '_session-id');
            const subjectGroupFilter = request.filters.flat().find(f => f.column as string === '_subject-group');
            const subjectNameFilter = request.filters.flat().find(f => f.column as string === '_subject-name');
            const deliveryOptionFilter = request.filters.flat().find(f => f.column as string === '_delivery-option-id');

            if (assigneeFilter) {
                const assignees: string[] = assigneeFilter.operand as unknown as string[];

                query.andWhere('"AdminUser"."id" IN (:...assignees)', { assignees });
            }

            if (contactNameFilter) {
                const names: string[] = contactNameFilter.operand as unknown as string[];
                const operator = contactNameFilter.operator === '~~ NOT IN' ? 'NOT ILIKE ANY' : 'ILIKE ANY';

                query.andWhere(`"TransactionalContact"."name" ${operator} (:names)`, { names });
            }

            if (contactEmailFilter) {
                const emails: string[] = contactEmailFilter.operand as unknown as string[];
                const operator = contactEmailFilter.operator === '~~ NOT IN' ? 'NOT ILIKE ANY' : 'ILIKE ANY';

                query.andWhere(`"TransactionalContact"."email" ${operator} (:emails)`, { emails });

            }

            if (contactPhoneFilter && Array.isArray(contactPhoneFilter.operand)) {
                const wildcard = contactPhoneFilter.operand[0]
                    .some(phone => phone.startsWith('%') && phone.endsWith('%'))
                    ? '%'
                    : '';
                const phones: string[] = contactPhoneFilter.operand[0].map(
                    phone => `${wildcard}${phone.replace(/\D/g, '')}${wildcard}`);
                const operator = contactPhoneFilter.operator === '~~ NOT IN' ? 'NOT ILIKE ANY' : 'ILIKE ANY';

                query.andWhere(`"TransactionalContact"."phone_digits" ${operator} (:phones)`, { phones });
            }

            if (sessionFilter) {
                const sessionIds: number[] = sessionFilter.operand[0] as unknown as number[];
                const operator = sessionFilter.operator === 'NOT IN' ? 'NOT IN' : 'IN';

                query.andWhere(`"TransactionalSession"."id" ${operator} (:...sessionIds)`, { sessionIds });
            }

            if (subjectGroupFilter) {
                const subjectGroups: string[] = subjectGroupFilter.operand as unknown as string[];
                const operator = subjectGroupFilter.operator === 'NOT IN' ? 'NOT ILIKE ANY' : 'ILIKE ANY';

                query.andWhere(`"TransactionalSubject"."group" ${operator} (:...subjectGroups)`, { subjectGroups });
            }

            if (subjectNameFilter) {
                const subjectNames: string[] = subjectNameFilter.operand as unknown as string[];
                const operator = subjectNameFilter.operator === '~~ NOT IN' ? 'NOT ILIKE ANY' : 'ILIKE ANY';

                query.andWhere(`"TransactionalSubject"."display_name" ${operator} (:subjectNames)`, { subjectNames });
            }

            if (deliveryOptionFilter) {
                const deliveryOptions: number[] = deliveryOptionFilter.operand[0] as unknown as number[];
                const operator = deliveryOptionFilter.operator === 'NOT IN' ? 'NOT IN' : 'IN';

                query.andWhere(`"TransactionalDeliveryOption"."id" ${operator} (:...deliveryOptions)`,
                    { deliveryOptions });
            }
        }
    }

    /* PUBLIC */
    public static async get(id: string): Promise<TransactionalOrder> {
        return await TransactionalOrder.createQueryBuilder()
            .where({ id })
            .leftJoinAndSelect('TransactionalOrder.contact', 'TransactionalContact')
            .leftJoinAndSelect('TransactionalOrder.session', 'TransactionalSession')
            .leftJoinAndSelect('TransactionalSession.workflow', 'TransactionalWorkflow')
            .leftJoinAndSelect('TransactionalOrder.subjects', 'TransactionalSubject')
            .leftJoinAndSelect('TransactionalOrder.subjectGroups', 'TransactionalSubjectGroups')
            .leftJoinAndSelect('TransactionalOrder.deliveryOption', 'TransactionalDeliveryOption')
            .getOne();
    }

    public static getMany(ids: string[], includeMeta: boolean): Promise<TransactionalOrder[]> {
        const query = TransactionalOrder
            .createQueryBuilder()
            .select()
            .where('TransactionalOrder.id IN (:...ids)', { ids })
            .leftJoinAndSelect('TransactionalOrder.contact', 'TransactionalContact')
            .leftJoinAndSelect('TransactionalOrder.session', 'TransactionalSession')
            .leftJoinAndSelect('TransactionalOrder.subjects', 'TransactionalSubject')
            .leftJoinAndSelect('TransactionalOrder.subjectGroups', 'TransactionalSubjectGroups')
            .leftJoinAndSelect('TransactionalSession.workflow', 'TransactionalWorkflow')
            .leftJoinAndSelect('TransactionalOrder.deliveryOption', 'TransactionalDeliveryOption');

        if (includeMeta) {
            query.leftJoinAndSelect('TransactionalOrder.assignment', 'AdminOrderAssignment');
            query.addSelect('AdminUser.id');
            query.leftJoin('AdminOrderAssignment.user', 'AdminUser');
            query.leftJoinAndSelect('TransactionalOrder.productionStatus', 'AdminOrderStatus');
        }

        return query.getMany();
    }

    public static async getOrderComments(id: string): Promise<AdminOrderComment[]> {
        return await AdminOrderComment.find({
            where: { order: { id } },
            relations: ['user'],
            order: { created_on: 'ASC' }
        });
    }

    public static async hasMultipleOrdersWithSameContact(contactId: string): Promise<boolean> {
        const count = await TransactionalOrder.createQueryBuilder("order")
            .innerJoin("order.contact", "contact")
            .where("contact.id = :contactId", { contactId })
            .getCount();

        return count > 1;
    }
}
