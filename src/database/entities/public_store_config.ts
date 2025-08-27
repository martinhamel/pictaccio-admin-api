import { BaseEntity, Column, Entity, In, Index, PrimaryColumn } from 'typeorm';

@Entity({name: 'store_config', schema: 'public'})
export class PublicStoreConfig extends BaseEntity {
    @PrimaryColumn({type: 'text', primaryKeyConstraintName: 'store_config_key_pkey'})
    public key: string;

    @Column({type: 'text'})
    public value: string;

    /* PUBLIC */
    public static async get(key: string): Promise<string> {
        return (await PublicStoreConfig.findOne({where: { key }}))?.value;
    }

    public static async getMany(keys: string[]): Promise<Record<string, string>> {
        const configs = await PublicStoreConfig.findBy({key: In(keys)});
        return Object.fromEntries(configs.map(config => [config.key, config.value]));
    }

    public static async set(key: string, value: string): Promise<void> {
        const storeConfig = new PublicStoreConfig();

        storeConfig.key = key;
        storeConfig.value = value;

        await PublicStoreConfig.upsert(storeConfig, ['key']);
    }
}
