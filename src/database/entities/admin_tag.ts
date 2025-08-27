import { AdminTagMap } from '@pictaccio/admin-api/database/entities/admin_tag_map';
import { TagScope, TagScopes } from '@pictaccio/shared/src/types/tags';
import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'tags', schema: 'admin' })
export class AdminTag extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', primaryKeyConstraintName: 'tags_id_pkey' })
    public id: string;

    @Index('tags_scope_idx')
    @Column({ type: 'enum', enum: TagScopes, default: 'global' })
    public scope: TagScope;

    @Index('tags_name_idx', { fulltext: true })
    @Column({ type: 'text' })
    public text: string;

    @OneToMany(() => AdminTagMap, map => map.tag)
    public maps: AdminTagMap[];
}
