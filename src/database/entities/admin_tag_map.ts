import { AdminTag } from '@pictaccio/admin-api/database/entities/admin_tag';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tag_map', schema: 'admin' })
export class AdminTagMap extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'tag_map_id_pkey' })
    public id: string;

    @ManyToOne(() => AdminTag, tag => tag.maps)
    @JoinColumn({ name: 'tag_id', foreignKeyConstraintName: 'tag_map_tag_id_fkey' })
    public tag: AdminTag;

    @Column({ type: 'bigint' })
    public foreign_id: string;
}
