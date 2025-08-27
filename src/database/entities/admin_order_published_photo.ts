import { TransactionalOrder } from '@pictaccio/admin-api/database/entities/transactional_order';
import { TransactionalSubject } from '@pictaccio/admin-api/database/entities/transactional_subject';
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'order_published_photos', schema: 'admin' })
export class AdminOrderPublishedPhoto extends BaseEntity {
    @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'order_published_photos_id_pkey' })
    public id: number;

    @Column({ type: 'boolean' })
    public original: boolean;

    @Index('order_published_photos_original_path_idx')
    @Column({ type: 'text' })
    public original_path: string;

    @Column({ type: 'boolean' })
    public published: boolean;

    @Index('order_published_photos_version_path_idx')
    @Column({ type: 'text', nullable: true })
    public version_path: string;

    @Column({ type: 'boolean' })
    public update_sent: boolean;

    @UpdateDateColumn()
    public updated_on: Date;

    @ManyToOne(() => TransactionalOrder, order => order.publishedPhotos)
    @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'order_published_photo_order_id_fkey' })
    public order: TransactionalOrder;

    @ManyToOne(() => TransactionalSubject, subject => subject.publishedPhotos)
    @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'order_published_photo_subject_id_fkey' })
    public subject: TransactionalSubject;

    /* PUBLIC */
    public static getOrderPublishedPhotos(orderId: string): Promise<AdminOrderPublishedPhoto[]> {
        return AdminOrderPublishedPhoto.find({
            where: { order: { id: orderId } },
            relations: {
                order: true,
                subject: true
            }
        });
    }

    public static async markOrderUpdateSent(orderId: string): Promise<void> {
        const photos = await AdminOrderPublishedPhoto.getOrderPublishedPhotos(orderId);

        for (const photo of photos) {
            photo.update_sent = true;
            await photo.save();
        }
    }

    public static async publishPhoto(orderId: string,
        subjectId: string,
        originalPath: string,
        versionPath: string): Promise<AdminOrderPublishedPhoto> {
        const photoExist = await AdminOrderPublishedPhoto.findOne({
            where: {
                order: { id: orderId },
                subject: { id: subjectId },
                original_path: originalPath,
                version_path: versionPath
            },
            relations: {
                order: true,
                subject: true
            }
        });

        if (photoExist) {
            photoExist.published = true;

            return photoExist.save();
        } else {
            const photo = new AdminOrderPublishedPhoto();
            photo.order = await TransactionalOrder.findOneOrFail({ where: { id: orderId } });
            photo.subject = await TransactionalSubject.findOneOrFail({ where: { id: subjectId } });
            photo.original = versionPath === undefined || versionPath === null;
            photo.original_path = originalPath;
            photo.version_path = versionPath;
            photo.published = true;
            photo.update_sent = false;

            return photo.save();
        }
    }

    public static async unpublishPhoto(orderId: string,
        photoId: string,
        originalPath: string,
        versionPath: string): Promise<AdminOrderPublishedPhoto> {
        const photo = await AdminOrderPublishedPhoto.findOneOrFail({
            where: {
                order: { id: orderId },
                subject: { id: photoId },
                original_path: originalPath,
                version_path: versionPath
            },
            relations: {
                order: true,
                subject: true
            }
        });

        photo.published = false;

        return await photo.save();
    }
}
