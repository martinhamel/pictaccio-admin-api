import { Language } from '@pictaccio/admin-api/types/language';

export type LocalizedString = {
    [Property in Language]?: string
}
