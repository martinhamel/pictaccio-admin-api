import { AllowOnWire } from '@pictaccio/admin-api/database/decorators/allow_on_wire';
import { TransactionalSession } from '@pictaccio/admin-api/database/entities/transactional_session';
import { DataTableEntityMethods, DataTableReadRequest } from '@pictaccio/admin-api/database/helpers/data_table';
import { NotFoundError } from '@pictaccio/admin-api/errors/not_found_error';
import type ImageService from '@pictaccio/admin-api/services/image_service';
import { PhotoVersions } from '@pictaccio/shared/src/types/photo_versions';
import { StaticImplements } from '@pictaccio/shared/src/types/static_implements';
import { Container } from 'typedi';
import {
    BaseEntity,
    Column,
    Entity, Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    QueryRunner,
    SelectQueryBuilder
} from 'typeorm';

@Entity({ name: 'subject_groups', schema: 'transactional' })
export class TransactionalSubjectGroup
    extends BaseEntity
    implements StaticImplements<
        DataTableEntityMethods<TransactionalSubjectGroup>, typeof TransactionalSubjectGroup> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'subject_groups_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('subject_groups_group_idx', { fulltext: true })
    @Column({ type: 'text' })
    public group: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public photos: string[];

    @Column({ type: 'jsonb', nullable: true })
    public versions: PhotoVersions;

    @AllowOnWire
    @ManyToOne(() => TransactionalSession)
    @JoinColumn({ name: 'session_id', foreignKeyConstraintName: 'subject_group_session_id_fkey' })
    public session: TransactionalSession;

    /* DATATABLE ENTITY METHODS */
    public static async afterRead(request: DataTableReadRequest<TransactionalSubjectGroup>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalSubjectGroup>,
        results: TransactionalSubjectGroup[],
        count: number): Promise<TransactionalSubjectGroup[]> {
        const imageService = Container.get<ImageService>('image');
        for (const result of results) {
            result.photos = await imageService.getThumbnails(result.photos);
        }

        return null;
    }

    /* PUBLIC */
    public static async addVersion(subjectGroupId: string, original: string, versionPath: string): Promise<void> {
        const subjectGroup = await TransactionalSubjectGroup.findOne({ where: { id: subjectGroupId } });

        if (!subjectGroup || !subjectGroup.photos.includes(original)) {
            throw new NotFoundError(`Can't find group with id ${subjectGroupId} and original ${original}`);
        }

        const versions = subjectGroup.versions || {};

        if (!versions[original]) {
            versions[original] = [];
        }

        versions[original].push({
            original,
            version: versionPath,
            createdAt: new Date()
        });

        subjectGroup.versions = versions;

        await subjectGroup.save();
    }

    public static async createGroup(sessionId: string, groupName: string, files: string[]): Promise<void> {
        const groupPhoto = new TransactionalSubjectGroup();

        groupPhoto.session = { id: sessionId } as TransactionalSession;
        groupPhoto.group = groupName;
        groupPhoto.photos = files;

        await groupPhoto.save();
    }

    public static async removeVersion(subjectGroupId: string, original: string, versionPath: string): Promise<void> {
        const subjectGroup = await TransactionalSubjectGroup.findOne({ where: { id: subjectGroupId } });

        if (!subjectGroup ||
            (subjectGroup.versions &&
                !subjectGroup.versions[original].some(version => version.version === versionPath))) {

            throw new NotFoundError(`Can't find group with id ${subjectGroupId} and original ${original}`);
        }

        const versions = subjectGroup.versions;

        versions[original] = versions[original].filter(version => version.version !== versionPath);

        subjectGroup.versions = versions;

        await subjectGroup.save();
    }

}
