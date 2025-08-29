import { Language } from './language';

export type LocalizedString = {
    [Property in Language]?: string
}
