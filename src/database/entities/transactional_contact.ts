import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'contacts', schema: 'transactional'})
export class TransactionalContact extends BaseEntity {
    @PrimaryGeneratedColumn({type: 'bigint', primaryKeyConstraintName: 'contacts_id_pkey'})
    public id: string;

    @Column({type: 'text'})
    public first_name: string;

    @Column({type: 'text'})
    public last_name: string;

    @Index('contacts_name_idx', {fulltext: true})
    @Column({
        asExpression: 'first_name || \' \' || last_name',
        generatedType: 'STORED',
        generatedIdentity: 'ALWAYS',
        type: 'text'
    })
    public name: string;

    @Index('contacts_email_idx', {fulltext: true})
    @Column({type: 'text'})
    public email: string;

    @Column({type: 'text'})
    public phone: string;

    @Index('contacts_phone_idx', {fulltext: true})
    @Column({
        asExpression: 'regexp_replace(phone, \'[^\\\\d]+\', \'\', \'g\')',
        generatedType: 'STORED',
        generatedIdentity: 'ALWAYS',
        type: 'text'
    })
    public phone_digits: string;

    @Index('contacts_search_name_idx', {fulltext: true})
    @Column({type: 'text', nullable: true})
    public search_name: string;

    @Column({type: 'text'})
    public street_address_1: string;

    @Column({type: 'text', nullable: true})
    public street_address_2: string;

    @Column({type: 'text'})
    public postal_code: string;

    @Column({type: 'text'})
    public city: string;

    @Column({type: 'text'})
    public region: string;

    @Column({type: 'text'})
    public country: string;

    @Column({type: 'boolean'})
    public newsletter: boolean;
}
