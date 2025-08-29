import { DanglingAssetType, DanglingAssetTypes } from '@pictaccio/shared/types/dangling_asset_types';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'dangling_assets', schema: 'admin' })
export class AdminDanglingAsset extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'dangling_assets_id_pkey' })
    public id: string;

    @Column({ type: 'text' })
    public path: string;

    @Column({ type: 'enum', enum: DanglingAssetTypes })
    public type: DanglingAssetType;

    @CreateDateColumn()
    public created_on: Date;
}
