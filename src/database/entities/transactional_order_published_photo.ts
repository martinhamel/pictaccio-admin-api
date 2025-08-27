import { AdminOrderPublishedPhoto } from '@pictaccio/admin-api/database/entities/admin_order_published_photo';
import { OrderUploadImages } from '@pictaccio/admin-api/types/order_upload_images';
import { PublishedPhoto } from '@pictaccio/shared/src/types/published_photo';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'order_published_photos', schema: 'transactional' })
export class TransactionalOrderPublishedPhoto extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'order_published_photos_id_pkey' })
    public id: string;

    @Column({ type: 'jsonb' })
    public images: OrderUploadImages[];

    @Column({ type: 'bigint', nullable: true })
    public order_id: string;

    @Index('order_published_photos_token_idx')
    @Column({ type: 'text' })
    public token: string;

    @CreateDateColumn({ type: 'timestamp' })
    public created_on: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    public modified_on: Date;

    /* PUBLIC */
    public static async getDownloadToken(orderId: string): Promise<string> {
        const orderPublishedPhoto = await TransactionalOrderPublishedPhoto.findOneBy({ order_id: orderId });

        return orderPublishedPhoto?.token;
    }

    public static async updateOrderPublishedPhotos(orderId: string): Promise<void> {
        const orderPublishedPhotos = await AdminOrderPublishedPhoto.getOrderPublishedPhotos(orderId);
        const publishedPhotos: PublishedPhoto[] = [];
        let count = 0;

        if (!orderPublishedPhotos) {
            return;
        }

        for (const photo of orderPublishedPhotos) {
            const path = photo.original
                ? photo.original_path
                : photo.version_path;

            if (!photo.published) {
                continue;
            }

            publishedPhotos.push({
                name: `${orderId}-${count++}${extname(path)}`,
                path
            });
        }

        const transactionalOrderPublishedPhoto = await TransactionalOrderPublishedPhoto.findOneBy({ order_id: orderId });
        if (transactionalOrderPublishedPhoto) {
            await TransactionalOrderPublishedPhoto.update({ id: transactionalOrderPublishedPhoto.id }, {
                images: publishedPhotos
            });
        } else {
            await TransactionalOrderPublishedPhoto.create({
                images: publishedPhotos,
                order_id: orderId,
                token: randomUUID()
            }).save();
        }
    }
}
