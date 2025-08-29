import {
    AppStateKey,
    AppStateKeys,
    AppStateValue,
    AppStateValueType,
    isAppStateValueType
} from '../../types/app_states';
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'app_states', schema: 'public' })
export class PublicAppState extends BaseEntity {
    @PrimaryColumn({ type: 'enum', primaryKeyConstraintName: 'app_states_key_pkey', enum: AppStateKeys })
    public key: AppStateKey;

    @Column({ type: 'jsonb' })
    public value: AppStateValue;

    /* PUBLIC */
    public getValue<K extends AppStateKey>(key: K): AppStateValueType<K> {
        if (!isAppStateValueType(key, this.value)) {
            throw new Error(`App state value for key: ${key} is not of the expected type`);
        }

        return this.value;
    }
}
