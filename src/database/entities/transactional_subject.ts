import { config } from '../../config';
import { AllowOnWire } from '../../database/decorators/allow_on_wire';
import { AdminOrderCheck } from '../../database/entities/admin_order_check';
import { AdminOrderPublishedPhoto } from '../../database/entities/admin_order_published_photo';
import { TransactionalSession } from '../../database/entities/transactional_session';
import { DataTableEntityMethods, DataTableReadRequest } from '../../database/helpers/data_table';
import { NotFoundError } from '../../errors/not_found_error';
import type ImageService from '../../services/image_service';
import { SubjectInfo } from '../../types/subject_info';
import { SubjectMappings } from '../../types/subject_mappings';
import { PhotoVersions } from '@pictaccio/shared/types/photo_versions';
import { StaticImplements } from '@pictaccio/shared/types/static_implements';
import { Container } from 'typedi';
import {
    BaseEntity,
    Column,
    Entity,
    Index, JoinColumn, ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    QueryRunner,
    SelectQueryBuilder
} from 'typeorm';

@Entity({ name: 'subjects', schema: 'transactional' })
export class TransactionalSubject
    extends BaseEntity
    implements StaticImplements<DataTableEntityMethods<TransactionalSubject>, typeof TransactionalSubject> {
    @AllowOnWire
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'subjects_id_pkey' })
    public id: string;

    @AllowOnWire
    @Index('subjects_code_idx', { unique: config.featureFlags.subjectCodeUnique })
    @Column({ type: 'text' })
    public code: string;

    @AllowOnWire
    @Column({
        asExpression:
            'COALESCE(' +
            'NULLIF(COALESCE((info->>\'firstName\')::text, \'\') || ' +
            'CASE ' +
            'WHEN (info->>\'firstName\') IS NOT NULL AND (info->>\'lastName\') IS NOT NULL THEN \' \' ' +
            'ELSE \'\' ' +
            'END || ' +
            'COALESCE((info->>\'lastName\')::text, \'\'), ' +
            '\'\'' +
            '), ' +
            '\'--\'' +
            ')',
        generatedType: 'STORED',
        generatedIdentity: 'ALWAYS',
        type: 'text'
    })
    public display_name: string;

    @Index('subjects_group_idx', { fulltext: true })
    @Column({ type: 'text', nullable: true })
    public group: string;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public info: { [key: string]: string };

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public mappings: SubjectMappings;

    @AllowOnWire
    @Column({ type: 'jsonb' })
    public photos: string[];

    @Index('subjects_search_name_idx', { fulltext: true })
    @Column({ type: 'text', nullable: true })
    public search_name: string;

    @AllowOnWire
    @Index('subjects_unique_id_idx')
    @Column({ type: 'text' })
    public unique_id: string;

    @Column({ type: 'jsonb', nullable: true })
    public versions: PhotoVersions;

    @OneToMany(() => AdminOrderCheck, check => check.subject)
    public checks: AdminOrderCheck[];

    @OneToMany(() => AdminOrderPublishedPhoto, publishedPhoto => publishedPhoto.subject)
    public publishedPhotos: AdminOrderPublishedPhoto[];

    @AllowOnWire
    @ManyToOne(() => TransactionalSession, { nullable: false })
    @JoinColumn({ name: 'session_id', foreignKeyConstraintName: 'subject_session_id_fkey' })
    public session: TransactionalSession;

    /* DATATABLE ENTITY METHODS */
    public static async afterRead(request: DataTableReadRequest<TransactionalSubject>,
        runner: QueryRunner,
        query: SelectQueryBuilder<TransactionalSubject>,
        results: TransactionalSubject[],
        count: number): Promise<TransactionalSubject[]> {
        const imageService = Container.get<ImageService>('image');

        for (const result of results) {
            result.photos = await imageService.getThumbnails(result.photos);
        }

        return null;
    }

    /* PUBLIC */
    public static async addVersion(subjectId: string, original: string, versionPath: string): Promise<void> {
        const subject = await TransactionalSubject.findOne({ where: { id: subjectId } });

        if (!subject || !subject.photos.includes(original)) {
            throw new NotFoundError(`Can't find subject with id ${subjectId} and original ${original}`);
        }

        const versions = subject.versions || {};

        if (!versions[original]) {
            versions[original] = [];
        }

        versions[original].push({
            original,
            version: versionPath,
            createdAt: new Date()
        });

        subject.versions = versions;

        await subject.save();
    }

    public static async createSubject(sessionId: string,
        subjectInfos: SubjectInfo[],
        mappings: SubjectMappings): Promise<void> {
        const subjects: TransactionalSubject[] = [];

        for (const subjectInfo of subjectInfos) {
            const subject = new TransactionalSubject();

            subject.session = { id: sessionId } as TransactionalSession;
            subject.code = subjectInfo.subjectCode;
            subject.unique_id = subjectInfo.uniqueCode;
            subject.group = subjectInfo.group;
            subject.info = subjectInfo.extra;
            subject.mappings = mappings;
            subject.photos = [];

            subjects.push(subject);
        }

        await TransactionalSubject
            .createQueryBuilder()
            .insert()
            .into(TransactionalSubject)
            .values(subjects)
            .execute();
    }

    public static async codeExist(code: string): Promise<boolean> {
        return await TransactionalSubject.count({ where: { code } }) > 0;
    }

    public static async codesExist(codes: string[]): Promise<{ [key: string]: boolean }> {
        const results = await TransactionalSubject
            .createQueryBuilder()
            .select('code')
            .where('code IN(:...codes)', { codes })
            .execute();

        return Object.fromEntries(
            codes.map(code => [code, results.find(item => item.code === code) !== undefined])
        );
    }

    public static async findByCodes(codes: string[], sessionId?: string): Promise<TransactionalSubject[]> {
        if (!codes.length) {
            return [];
        }

        if (sessionId) {
            return await TransactionalSubject
                .createQueryBuilder()
                .select()
                .where('code IN(:...codes) AND session_id = :sessionId', { codes, sessionId })
                .execute();
        }

        return await TransactionalSubject
            .createQueryBuilder()
            .select()
            .where('code IN(:...codes)', { codes })
            .execute();
    }

    public static async getSubjects(id: string): Promise<string[]> {
        const subject = await TransactionalSubject.findOne({ where: { id } });

        if (!subject) {
            throw new NotFoundError(`Can't find subject with id ${id}`);
        }

        return subject.photos;
    }

    public static async removeVersion(subjectId: string, original: string, versionPath: string): Promise<void> {
        const subject = await TransactionalSubject.findOne({ where: { id: subjectId } });

        if (!subject ||
            (subject.versions && !subject.versions[original].some(version => version.version === versionPath))) {

            throw new NotFoundError(`Can't find subject with id ${subjectId} and original ${original}`);
        }

        const versions = subject.versions;

        versions[original] = versions[original].filter(version => version.version !== versionPath);

        subject.versions = versions;

        await subject.save();
    }

    public static async replaceSubjects(id: string, files: string[]): Promise<void> {
        const subject = await TransactionalSubject.findOne({ where: { id } });

        subject.photos = files;

        await subject.save();
    }

    public static async replaceSubjectsFromSessionAndCode(sessionId: string,
        subjectCode: string,
        files: string[]): Promise<void> {
        const subject = await TransactionalSubject.findOne({ where: { session: { id: sessionId }, code: subjectCode } });

        subject.photos = files;

        await subject.save();
    }
}
